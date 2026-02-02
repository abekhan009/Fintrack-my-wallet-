/**
 * API Configuration Utility
 * Handles environment-aware backend URL selection
 */

/**
 * Get the appropriate API base URL based on environment
 * @returns {string} API base URL
 */
export const getApiBaseUrl = () => {
  // Check if we're in development mode
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  // Check if we're running locally (localhost or 127.0.0.1)
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' || 
                     window.location.hostname === '0.0.0.0';

  // Priority order:
  // 1. Environment variable (if explicitly set)
  // 2. Local development detection
  // 3. Production backend
  
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (isDevelopment || isLocalhost) {
    return 'http://localhost:5000/api/v1';
  }
  
  // Production backend on Render
  return 'https://fintrack-backend-twti.onrender.com/api/v1';
};

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

/**
 * Environment Information
 */
export const ENV_INFO = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  baseUrl: import.meta.env.BASE_URL,
  apiUrl: getApiBaseUrl(),
};

// Log environment info in development
if (import.meta.env.DEV) {
  console.group('🔧 Environment Configuration');
  console.log('Mode:', ENV_INFO.mode);
  console.log('API URL:', ENV_INFO.apiUrl);
  console.log('Base URL:', ENV_INFO.baseUrl);
  console.log('Is Development:', ENV_INFO.isDevelopment);
  console.groupEnd();
}

export default API_CONFIG;