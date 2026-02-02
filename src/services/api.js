import { API_CONFIG } from '../config/api.js';

// API Configuration
const API_BASE_URL = API_CONFIG.BASE_URL;

// Session expiry storage key
const SESSION_EXPIRED_KEY = 'fintrack_session_expired';

/**
 * API Error class for handling HTTP errors
 */
class ApiError extends Error {
    constructor(message, code, status, details = null) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
    }
}

/**
 * Handle session expiry - clears auth and redirects to login
 * Called when a 401 is received (token expired)
 */
function handleSessionExpiry(message = 'Your session has expired. Please log in again.') {
    // Clear all auth data
    localStorage.removeItem('fintrack_access_token');
    localStorage.removeItem('fintrack_user');

    // Set expiry message to show on login page
    sessionStorage.setItem(SESSION_EXPIRED_KEY, message);

    // Redirect to landing/login page
    if (window.location.pathname !== '/') {
        window.location.href = '/';
    }
}

/**
 * Get and clear session expired message
 */
export function getSessionExpiredMessage() {
    const message = sessionStorage.getItem(SESSION_EXPIRED_KEY);
    if (message) {
        sessionStorage.removeItem(SESSION_EXPIRED_KEY);
    }
    return message;
}

/**
 * Make an API request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>}
 */
async function request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include', // Include cookies for refresh token
        ...options,
    };

    // Add auth header if token provided
    const token = localStorage.getItem('fintrack_access_token');
    if (token && !options.skipAuth) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            // Handle 401 Unauthorized - token expired or invalid
            if (response.status === 401 && !options.skipAuth && !options.skipSessionExpiry) {
                // Try to get a more specific message
                const errorMessage = data.error?.message || 'Your session has expired. Please log in again.';
                handleSessionExpiry(errorMessage);
                throw new ApiError(errorMessage, 'SESSION_EXPIRED', 401);
            }

            throw new ApiError(
                data.error?.message || 'An error occurred',
                data.error?.code || 'ERROR',
                response.status,
                data.error?.details
            );
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Network error or other fetch error
        throw new ApiError(
            'Unable to connect to server. Please check your internet connection.',
            'NETWORK_ERROR',
            0
        );
    }
}

/**
 * Auth API Service
 */
export const authApi = {
    /**
     * Register a new user
     * @param {Object} userData - { fullName, email, password, tuitionCenterName? }
     */
    register: async (userData) => {
        const response = await request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
            skipAuth: true,
        });

        // Store access token
        if (response.data?.accessToken) {
            localStorage.setItem('fintrack_access_token', response.data.accessToken);
        }

        return response.data;
    },

    /**
     * Login user
     * @param {Object} credentials - { email, password }
     */
    login: async (credentials) => {
        const response = await request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
            skipAuth: true,
        });

        // Store access token
        if (response.data?.accessToken) {
            localStorage.setItem('fintrack_access_token', response.data.accessToken);
        }

        return response.data;
    },

    /**
     * Refresh access token
     */
    refresh: async () => {
        const response = await request('/auth/refresh', {
            method: 'POST',
            skipAuth: true,
            skipSessionExpiry: true, // Handle in AuthContext instead
        });

        // Store new access token
        if (response.data?.accessToken) {
            localStorage.setItem('fintrack_access_token', response.data.accessToken);
        }

        return response.data;
    },

    /**
     * Logout user
     */
    logout: async () => {
        try {
            await request('/auth/logout', {
                method: 'POST',
                skipSessionExpiry: true, // Don't redirect on logout errors
            });
        } catch (error) {
            // Ignore logout errors
        }

        // Always clear local storage
        localStorage.removeItem('fintrack_access_token');
        localStorage.removeItem('fintrack_user');
    },

    /**
     * Get current user profile
     */
    getMe: async () => {
        const response = await request('/auth/me', {
            method: 'GET',
            skipSessionExpiry: true, // Handle in AuthContext instead
        });
        return response.data;
    },

    /**
     * Check if we have a stored token
     */
    hasToken: () => {
        return !!localStorage.getItem('fintrack_access_token');
    },
};

/**
 * Wallets API Service
 */
export const walletsApi = {
    /**
     * Get all wallets
     * @returns {Promise<{ wallets: Array, totalBalance: number }>}
     */
    getAll: async () => {
        const response = await request('/wallets', { method: 'GET' });
        return response.data;
    },

    /**
     * Get wallet by ID
     * @param {string} walletId
     * @returns {Promise<Object>}
     */
    getById: async (walletId) => {
        const response = await request(`/wallets/${walletId}`, { method: 'GET' });
        return response.data;
    },

    /**
     * Create a new wallet
     * @param {Object} walletData - { name, type?, initialBalance?, color?, icon? }
     * @returns {Promise<Object>}
     */
    create: async (walletData) => {
        const response = await request('/wallets', {
            method: 'POST',
            body: JSON.stringify(walletData),
        });
        return response.data;
    },

    /**
     * Update a wallet
     * @param {string} walletId
     * @param {Object} walletData - { name?, color?, icon?, isDefault? }
     * @returns {Promise<Object>}
     */
    update: async (walletId, walletData) => {
        const response = await request(`/wallets/${walletId}`, {
            method: 'PUT',
            body: JSON.stringify(walletData),
        });
        return response.data;
    },

    /**
     * Delete (archive) a wallet
     * @param {string} walletId
     * @returns {Promise<Object>}
     */
    delete: async (walletId) => {
        const response = await request(`/wallets/${walletId}`, {
            method: 'DELETE',
        });
        return response.data;
    },

    /**
     * Transfer between wallets
     * @param {Object} transferData - { fromWalletId, toWalletId, amount, note? }
     * @returns {Promise<Object>}
     */
    transfer: async (transferData) => {
        const response = await request('/wallets/transfer', {
            method: 'POST',
            body: JSON.stringify(transferData),
        });
        return response.data;
    },
};

/**
 * Users API Service (Profile & Settings)
 */
export const usersApi = {
    /**
     * Get current user profile
     * @returns {Promise<Object>}
     */
    getProfile: async () => {
        const response = await request('/users/profile', { method: 'GET' });
        return response.data;
    },

    /**
     * Update user profile
     * @param {Object} profileData - { fullName?, tuitionCenterName? }
     * @returns {Promise<Object>}
     */
    updateProfile: async (profileData) => {
        const response = await request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
        return response.data;
    },

    /**
     * Update user settings
     * @param {Object} settingsData - { currency?, notificationsEnabled?, darkModeEnabled?, biometricEnabled? }
     * @returns {Promise<Object>}
     */
    updateSettings: async (settingsData) => {
        const response = await request('/users/settings', {
            method: 'PUT',
            body: JSON.stringify(settingsData),
        });
        return response.data;
    },

    /**
     * Change password
     * @param {Object} passwordData - { currentPassword, newPassword, confirmPassword }
     * @returns {Promise<Object>}
     */
    changePassword: async (passwordData) => {
        const response = await request('/users/password', {
            method: 'PUT',
            body: JSON.stringify(passwordData),
        });
        return response.data;
    },

    /**
     * Delete account
     * @param {string} password - Current password for confirmation
     * @returns {Promise<Object>}
     */
    deleteAccount: async (password) => {
        const response = await request('/users/account', {
            method: 'DELETE',
            body: JSON.stringify({ password }),
        });
        return response.data;
    },

    /**
     * Upload avatar
     * @param {File} file - Image file
     * @returns {Promise<Object>}
     */
    uploadAvatar: async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);

        const token = localStorage.getItem('fintrack_access_token');
        const response = await fetch(`${API_BASE_URL}/users/avatar`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            credentials: 'include',
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new ApiError(
                data.error?.message || 'Failed to upload avatar',
                data.error?.code || 'UPLOAD_ERROR',
                response.status
            );
        }
        return data.data;
    },
};

/**
 * Categories API Service
 */
export const categoriesApi = {
    /**
     * Get categories for a specific workspace and type
     * @param {string} workspace - 'personal' or 'tuition'
     * @param {string} type - 'income' or 'expense' (optional)
     * @returns {Promise<Object>}
     */
    get: async (workspace = 'personal', type = null) => {
        let endpoint = `/categories?workspace=${workspace}`;
        if (type) {
            endpoint += `&type=${type}`;
        }
        const response = await request(endpoint, { method: 'GET' });
        return response.data;
    },

    /**
     * Get all categories for all workspaces
     * @returns {Promise<Object>}
     */
    getAll: async () => {
        const response = await request('/categories/all', { method: 'GET' });
        return response.data;
    },
};

/**
 * Transactions API Service
 */
export const transactionsApi = {
    /**
     * Get all transactions with filters
     * @param {Object} filters - { workspace, type, category, walletId, startDate, endDate, page, limit }
     * @returns {Promise<Object>}
     */
    getAll: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });
        const queryString = params.toString();
        const endpoint = queryString ? `/transactions?${queryString}` : '/transactions';
        const response = await request(endpoint, { method: 'GET' });
        return response.data;
    },

    /**
     * Get transaction summary
     * @param {Object} filters - { workspace, startDate, endDate }
     * @returns {Promise<Object>}
     */
    getSummary: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });
        const queryString = params.toString();
        const endpoint = queryString ? `/transactions/summary?${queryString}` : '/transactions/summary';
        const response = await request(endpoint, { method: 'GET' });
        return response.data;
    },

    /**
     * Get a single transaction by ID
     * @param {string} id
     * @returns {Promise<Object>}
     */
    getById: async (id) => {
        const response = await request(`/transactions/${id}`, { method: 'GET' });
        return response.data;
    },

    /**
     * Create a new transaction
     * @param {Object} data - { walletId, type, category, amount, date?, note?, workspace?, isRecurring? }
     * @returns {Promise<Object>}
     */
    create: async (data) => {
        const response = await request('/transactions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.data;
    },

    /**
     * Update a transaction
     * @param {string} id
     * @param {Object} data - { category?, amount?, date?, note? }
     * @returns {Promise<Object>}
     */
    update: async (id, data) => {
        const response = await request(`/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response.data;
    },

    /**
     * Delete a transaction
     * @param {string} id
     * @returns {Promise<Object>}
     */
    delete: async (id) => {
        const response = await request(`/transactions/${id}`, { method: 'DELETE' });
        return response.data;
    },

    /**
     * Clear all transactions for a workspace
     * @param {string} workspace - 'personal' or 'tuition'
     * @returns {Promise<Object>}
     */
    clearAll: async (workspace = 'personal') => {
        const response = await request(`/transactions/clear`, {
            method: 'DELETE',
            body: JSON.stringify({ workspace }),
        });
        return response.data;
    },
};

/**
 * Students API Service (Legacy - for backward compatibility)
 */
export const studentsApi = {
    /**
     * Get all students
     * @param {Object} filters - { status?, search?, page?, limit? }
     * @returns {Promise<Object>}
     */
    getAll: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });
        const queryString = params.toString();
        const endpoint = queryString ? `/tuition/students?${queryString}` : '/tuition/students';
        const response = await request(endpoint, { method: 'GET' });
        return response.data;
    },

    /**
     * Get student by ID
     * @param {string} studentId
     * @returns {Promise<Object>}
     */
    getById: async (studentId) => {
        const response = await request(`/tuition/students/${studentId}`, { method: 'GET' });
        return response.data;
    },

    /**
     * Create a new student
     * @param {Object} studentData - { name, email?, phone?, address?, grade?, monthlyFee, discount?, parentName?, parentPhone?, notes? }
     * @returns {Promise<Object>}
     */
    create: async (studentData) => {
        const response = await request('/tuition/students', {
            method: 'POST',
            body: JSON.stringify(studentData),
        });
        return response.data;
    },

    /**
     * Update a student
     * @param {string} studentId
     * @param {Object} studentData - { name?, email?, phone?, address?, grade?, monthlyFee?, discount?, parentName?, parentPhone?, notes? }
     * @returns {Promise<Object>}
     */
    update: async (studentId, studentData) => {
        const response = await request(`/tuition/students/${studentId}`, {
            method: 'PUT',
            body: JSON.stringify(studentData),
        });
        return response.data;
    },

    /**
     * Delete a student
     * @param {string} studentId
     * @returns {Promise<Object>}
     */
    delete: async (studentId) => {
        const response = await request(`/tuition/students/${studentId}`, {
            method: 'DELETE',
        });
        return response.data;
    },

    /**
     * Record fee payment for a student
     * @param {string} studentId
     * @param {Object} paymentData - { amount, month, method?, note? }
     * @returns {Promise<Object>}
     */
    recordPayment: async (studentId, paymentData) => {
        const response = await request(`/tuition/students/${studentId}/fees`, {
            method: 'POST',
            body: JSON.stringify(paymentData),
        });
        return response.data;
    },

    /**
     * Get fee payment history for a student
     * @param {string} studentId
     * @param {Object} filters - { year?, month? }
     * @returns {Promise<Object>}
     */
    getPayments: async (studentId, filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });
        const queryString = params.toString();
        const endpoint = queryString ? `/tuition/students/${studentId}/fees?${queryString}` : `/tuition/students/${studentId}/fees`;
        const response = await request(endpoint, { method: 'GET' });
        return response.data;
    },

    /**
     * Get all fee payments across all students
     * @param {Object} filters - { month?, studentId?, startDate?, endDate?, limit?, page? }
     * @returns {Promise<Object>}
     */
    getAllFeePayments: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });
        const queryString = params.toString();
        const endpoint = queryString ? `/tuition/students/fees/all?${queryString}` : '/tuition/students/fees/all';
        const response = await request(endpoint, { method: 'GET' });
        return response.data;
    },

    /**
     * Get students summary (total count, active, inactive, etc.)
     * @returns {Promise<Object>}
     */
    getSummary: async () => {
        const response = await request('/tuition/stats', { method: 'GET' });
        return response.data;
    },
};

/**
 * Tuition API Service
 * Additional tuition-specific endpoints
 */
export const tuitionApi = {
    /**
     * Get tuition statistics
     * @param {Object} filters - { month? }
     * @returns {Promise<Object>}
     */
    getStats: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });
        const queryString = params.toString();
        const endpoint = queryString ? `/tuition/stats?${queryString}` : '/tuition/stats';
        const response = await request(endpoint, { method: 'GET' });
        return response.data;
    },

    /**
     * Get collection trends
     * @param {Object} filters - { months? }
     * @returns {Promise<Object>}
     */
    getTrends: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });
        const queryString = params.toString();
        const endpoint = queryString ? `/tuition/stats/trends?${queryString}` : '/tuition/stats/trends';
        const response = await request(endpoint, { method: 'GET' });
        return response.data;
    },

    /**
     * Get students with pending fees
     * @param {Object} filters - { month? }
     * @returns {Promise<Object>}
     */
    getPendingFees: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });
        const queryString = params.toString();
        const endpoint = queryString ? `/tuition/stats/pending-fees?${queryString}` : '/tuition/stats/pending-fees';
        const response = await request(endpoint, { method: 'GET' });
        return response.data;
    },

    /**
     * Get tuition transactions
     * @param {Object} filters - { type?, category?, startDate?, endDate?, limit?, page? }
     * @returns {Promise<Object>}
     */
    getTransactions: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });
        const queryString = params.toString();
        const endpoint = queryString ? `/tuition/transactions?${queryString}` : '/tuition/transactions';
        const response = await request(endpoint, { method: 'GET' });
        return response.data;
    },

    /**
     * Get tuition transaction summary
     * @param {Object} filters - { startDate?, endDate? }
     * @returns {Promise<Object>}
     */
    getTransactionSummary: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });
        const queryString = params.toString();
        const endpoint = queryString ? `/tuition/transactions/summary?${queryString}` : '/tuition/transactions/summary';
        const response = await request(endpoint, { method: 'GET' });
        return response.data;
    },
};

/**
 * Recurring Expenses API
 */
export const recurringApi = {
    /**
     * Get all recurring expenses
     * @param {Object} filters - { workspace?, status? }
     * @returns {Promise<Object>}
     */
    getAll: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.workspace) params.append('workspace', filters.workspace);
        if (filters.status) params.append('status', filters.status);
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await request(`/recurring${query}`);
        return response.data;
    },

    /**
     * Get a single recurring expense
     * @param {string} id
     * @returns {Promise<Object>}
     */
    getById: async (id) => {
        const response = await request(`/recurring/${id}`);
        return response.data;
    },

    /**
     * Create a new recurring expense
     * @param {Object} data - { name, amount, walletId, category, workspace?, frequency?, startMonth, endMonth?, dayOfMonth? }
     * @returns {Promise<Object>}
     */
    create: async (data) => {
        const response = await request('/recurring', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return response.data;
    },

    /**
     * Update a recurring expense
     * @param {string} id
     * @param {Object} data - { name?, amount?, category?, dayOfMonth?, endMonth? }
     * @returns {Promise<Object>}
     */
    update: async (id, data) => {
        const response = await request(`/recurring/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return response.data;
    },

    /**
     * Pause a recurring expense
     * @param {string} id
     * @returns {Promise<Object>}
     */
    pause: async (id) => {
        const response = await request(`/recurring/${id}/pause`, { method: 'PATCH' });
        return response.data;
    },

    /**
     * Resume a recurring expense
     * @param {string} id
     * @returns {Promise<Object>}
     */
    resume: async (id) => {
        const response = await request(`/recurring/${id}/resume`, { method: 'PATCH' });
        return response.data;
    },

    /**
     * Delete a recurring expense
     * @param {string} id
     * @returns {Promise<Object>}
     */
    delete: async (id) => {
        const response = await request(`/recurring/${id}`, { method: 'DELETE' });
        return response.data;
    },
};

export { ApiError };
export default authApi;




