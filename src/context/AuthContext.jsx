import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi, { ApiError } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Clear error after a delay
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    /**
     * Check auth status on mount
     */
    useEffect(() => {
        const checkAuth = async () => {
            if (!authApi.hasToken()) {
                setIsLoading(false);
                return;
            }

            try {
                // Try to get current user
                const data = await authApi.getMe();
                setUser(data.user);
                setIsAuthenticated(true);

                // Cache user in localStorage for quick access
                localStorage.setItem('fintrack_user', JSON.stringify(data.user));
            } catch (err) {
                // Token might be expired, try to refresh
                try {
                    await authApi.refresh();
                    const data = await authApi.getMe();
                    setUser(data.user);
                    setIsAuthenticated(true);
                    localStorage.setItem('fintrack_user', JSON.stringify(data.user));
                } catch (refreshErr) {
                    // Refresh failed, clear everything
                    await authApi.logout();
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } finally {
                setIsLoading(false);
            }
        };

        // First, try to load cached user for faster UI
        const cachedUser = localStorage.getItem('fintrack_user');
        if (cachedUser) {
            try {
                setUser(JSON.parse(cachedUser));
                setIsAuthenticated(true);
            } catch (e) {
                localStorage.removeItem('fintrack_user');
            }
        }

        checkAuth();
    }, []);

    /**
     * Register a new user
     * @param {Object} userData - { fullName, email, password, tuitionCenterName? }
     * @returns {Promise<{ success: boolean, error?: string }>}
     */
    const register = async (userData) => {
        setError(null);

        try {
            const data = await authApi.register({
                fullName: userData.name,
                email: userData.email,
                password: userData.password,
                tuitionCenterName: userData.tuitionCenterName || null,
            });

            setUser(data.user);
            setIsAuthenticated(true);
            localStorage.setItem('fintrack_user', JSON.stringify(data.user));

            return { success: true };
        } catch (err) {
            const message = err instanceof ApiError
                ? err.message
                : 'Registration failed. Please try again.';

            setError(message);
            return { success: false, error: message };
        }
    };

    /**
     * Login user
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{ success: boolean, error?: string }>}
     */
    const login = async (email, password) => {
        setError(null);

        try {
            const data = await authApi.login({ email, password });

            setUser(data.user);
            setIsAuthenticated(true);
            localStorage.setItem('fintrack_user', JSON.stringify(data.user));

            return { success: true };
        } catch (err) {
            const message = err instanceof ApiError
                ? err.message
                : 'Login failed. Please try again.';

            setError(message);
            return { success: false, error: message };
        }
    };

    /**
     * Logout user
     */
    const logout = async () => {
        try {
            await authApi.logout();
        } catch (err) {
            // Ignore logout errors
        }

        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('fintrack_user');
    };

    /**
     * Refresh user data from server
     */
    const refreshUser = async () => {
        try {
            const data = await authApi.getMe();
            setUser(data.user);
            localStorage.setItem('fintrack_user', JSON.stringify(data.user));
        } catch (err) {
            // Ignore refresh errors
        }
    };

    const value = {
        isAuthenticated,
        isLoading,
        user,
        error,
        clearError,
        login,
        register,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
