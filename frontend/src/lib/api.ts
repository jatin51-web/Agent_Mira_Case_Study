import axios from 'axios';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const api = axios.create({ baseURL: API_BASE });

// Add response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Create a plain object (not Error instance) to avoid Next.js error overlay
    const cleanError: any = {
      message: error.message || 'An error occurred',
      name: 'ApiError',
      isAxiosError: false, // Important: mark as not axios error
    };
    
    // Preserve important error information
    if (error.response) {
      cleanError.response = {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      };
      cleanError.message = error.response.data?.detail || error.response.data?.message || error.message;
    } else if (error.request) {
      cleanError.request = true;
      cleanError.message = 'No response from server';
    }
    
    // Return rejected promise with plain object (not Error instance)
    return Promise.reject(cleanError);
  }
);

export const sendMessage = (data: { 
  message?: string; 
  filters?: { location?: string; budget?: string; bedrooms?: string } 
}) => 
  api.post('/chat/message', data);

export const getProperties = (params: { location?: string; budget?: string; bedrooms?: string }) => 
  api.get('/properties', { params });

export const saveProperty = (property_id: string, property_data?: any) => 
  api.post('/user/save', { property_id, property_data });

export const getSavedProperties = () => 
  api.get('/user/saved');

export const unsaveProperty = (property_id: string) => 
  api.delete(`/user/saved/${property_id}`);

