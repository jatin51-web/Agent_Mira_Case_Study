import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user if token exists
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/me');
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to load user', error);
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // ✅ Helper to extract error messages safely
  const extractError = (err: any, fallback = 'An error occurred') => {
    if (!err) return fallback;
    if (err instanceof Error) return err.message;
    if (err?.response?.data?.detail) return err.response.data.detail;
    if (err?.response?.data?.message) return err.response.data.message;
    if (err?.message) return err.message;
    return fallback;
  };

  // ✅ LOGIN
  const login = async (email: string, password: string): Promise<void> => {
    if (!email || !password) {
      return Promise.reject({ message: 'Email and password are required', name: 'ValidationError' });
    }

    try {
      const response = await api.post('/auth/login', { email, password });

      if (!response?.data?.access_token) {
        return Promise.reject({ message: 'Invalid server response', name: 'ServerError' });
      }

      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // Fetch user info
      try {
        const userResponse = await api.get('/auth/me');
        setUser(userResponse.data);
      } catch {
        setUser({
          id: '',
          email,
          name: email.split('@')[0],
        });
      }

      router.push('/');
      return Promise.resolve();
    } catch (err: any) {
      console.error('Login failed:', err);

      let message = 'Failed to log in. Please try again.';
      if (err?.response) {
        const status = err.response.status;
        const backendMsg = err.response.data?.detail || err.response.data?.message;
        if (status === 401) message = backendMsg || 'Incorrect email or password.';
        else if (status === 400) message = backendMsg || 'Invalid input data.';
        else if (status >= 500) message = backendMsg || 'Server error. Please try again later.';
        else message = backendMsg || message;
      } else if (err?.request) {
        message = 'No response from server. Please check your connection.';
      } else if (err?.message) {
        message = err.message;
      }

      // Return plain object instead of Error to avoid Next.js overlay
      return Promise.reject({ message, name: 'LoginError' });
    }
  };

  // ✅ REGISTER
  const register = async (name: string, email: string, password: string): Promise<void> => {
    if (!name || !email || !password) {
      return Promise.reject({ message: 'Name, email, and password are required', name: 'ValidationError' });
    }
    if (password.length < 6) {
      return Promise.reject({ message: 'Password must be at least 6 characters long', name: 'ValidationError' });
    }

    try {
      const response = await api.post('/auth/register', { name, email, password });

      if (response?.status === 201 || response?.data) {
        try {
          await login(email, password); // auto-login
          return Promise.resolve();
        } catch {
          return Promise.reject({
            message: 'Account created successfully, but auto-login failed. Please log in manually.',
            name: 'LoginError'
          });
        }
      } else {
        return Promise.reject({ message: 'Registration failed. Please try again.', name: 'RegistrationError' });
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      let message = 'Failed to create account. Please try again.';

      if (err?.response) {
        const status = err.response.status;
        const backendMsg = err.response.data?.detail || err.response.data?.message;

        if (status === 400) {
          const lower = (backendMsg || '').toLowerCase();
          if (lower.includes('email already') || lower.includes('already registered')) {
            message = 'This email is already registered. Please log in instead.';
          } else {
            message = backendMsg || message;
          }
        } else if (status >= 500) {
          message = backendMsg || 'Server error. Please try again later.';
        } else {
          message = backendMsg || message;
        }
      } else if (err?.request) {
        message = 'No response from server. Please check your connection.';
      } else if (err?.message) {
        message = err.message;
      }

      return Promise.reject({ message, name: 'RegistrationError' });
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
