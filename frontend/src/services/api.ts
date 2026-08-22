import axios, { AxiosError } from 'axios';

const API_BASE_URL = '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000, // 12 seconds network timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Event listener for Auth Expiration
type AuthExpiredListener = () => void;
const authExpiredListeners: Set<AuthExpiredListener> = new Set();

export const onAuthExpired = (listener: AuthExpiredListener) => {
  authExpiredListeners.add(listener);
  return () => {
    authExpiredListeners.delete(listener);
  };
};

const triggerAuthExpired = () => {
  authExpiredListeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error in auth expired listener:', e);
    }
  });
};

// Request interceptor injecting JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor handling 401 unauthorized & timeouts
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      triggerAuthExpired();
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Normalizes error responses from FastAPI, network timeouts, and server errors
 * into clean, user-facing error messages.
 */
export const parseApiError = (error: any, fallbackMessage: string = 'An error occurred. Please try again.'): string => {
  if (!error) return fallbackMessage;

  // Network Timeout / Abort
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Request timed out. Please check your internet connection and retry.';
  }

  // Network Offline / Network Error
  if (error.message === 'Network Error' || !error.response) {
    return 'Unable to connect to server. Please verify your connection.';
  }

  const status = error.response?.status;
  const data = error.response?.data;

  if (status === 404) {
    if (typeof data?.detail === 'string') return data.detail;
    return 'The requested habit or resource was not found.';
  }

  if (status === 401) {
    return 'Session expired. Please log in again to continue.';
  }

  if (status === 403) {
    return 'You do not have permission to perform this action.';
  }

  if (status === 422 && Array.isArray(data?.detail)) {
    // Handle FastAPI validation error array [{ loc: [...], msg: "..." }]
    const firstErr = data.detail[0];
    if (firstErr?.msg) {
      const field = firstErr.loc ? firstErr.loc[firstErr.loc.length - 1] : 'field';
      return `Invalid input for ${field}: ${firstErr.msg}`;
    }
  }

  if (data && typeof data.detail === 'string') {
    return data.detail;
  }

  if (status >= 500) {
    return 'Server error encountered. Our team is investigating, please try again shortly.';
  }

  return error.message || fallbackMessage;
};
