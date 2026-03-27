import { API_URL } from '@/config/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface RequestOptions extends RequestInit {
  data?: any;
}

/**
 * Global API Client for Delivray
 * Handles unified error states, 401 redirects, and network failures.
 */
export const apiClient = async (endpoint: string, options: RequestOptions = {}) => {
  const state = useAuthStore.getState();
  const token = state.token;
  const logout = state.logout;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config: RequestInit = {
    ...options,
    headers,
    body: options.data ? JSON.stringify(options.data) : options.body,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    // 1. Handle Unauthorized (401)
    if (response.status === 401) {
      toast.error('Session expired. Please login again.');
      logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }

    // 2. Parse Data
    const data = await response.json();

    // 3. Handle Other Errors
    if (!response.ok) {
      const errorMsg = data.message || 'An unexpected error occurred';
      toast.error(`Error: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    return data;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      toast.error('Network Error: Please check your internet connection.');
    }
    console.error(`[API Client Error] ${error.message}`);
    throw error;
  }
};
