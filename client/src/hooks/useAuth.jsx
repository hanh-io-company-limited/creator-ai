import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Create Auth Context
const AuthContext = createContext();

// Auth actions
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_TOKEN: 'SET_TOKEN',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case AUTH_ACTIONS.SET_USER:
      return { ...state, user: action.payload, loading: false, error: null };
    case AUTH_ACTIONS.SET_TOKEN:
      return { ...state, token: action.payload };
    case AUTH_ACTIONS.LOGOUT:
      return { ...state, user: null, token: null, loading: false, error: null };
    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('creator-ai-token'),
  loading: true,
  error: null,
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set axios default headers
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Check auth status on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('creator-ai-token');
      
      if (!token) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      try {
        const response = await axios.get('/api/auth/me');
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data });
        dispatch({ type: AUTH_ACTIONS.SET_TOKEN, payload: token });
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('creator-ai-token');
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await axios.post('/api/auth/login', credentials);
      const { token, user } = response.data;

      localStorage.setItem('creator-ai-token', token);
      dispatch({ type: AUTH_ACTIONS.SET_TOKEN, payload: token });
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
      
      toast.success(`Chào mừng ${user.username}! 🎉`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Đăng nhập thất bại';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const response = await axios.post('/api/auth/register', userData);
      const { token, user } = response.data;

      localStorage.setItem('creator-ai-token', token);
      dispatch({ type: AUTH_ACTIONS.SET_TOKEN, payload: token });
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
      
      toast.success(`Đăng ký thành công! Chào mừng ${user.username}! 🎉`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Đăng ký thất bại';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('creator-ai-token');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success('Đã đăng xuất thành công');
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    try {
      const response = await axios.patch('/api/auth/preferences', preferences);
      
      dispatch({ 
        type: AUTH_ACTIONS.SET_USER, 
        payload: { ...state.user, preferences: response.data.preferences }
      });
      
      toast.success('Cập nhật preferences thành công');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Cập nhật thất bại';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updatePreferences,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};