import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { TOKEN_KEY, USER_KEY, ROLES, ROUTES } from '../utils/constants';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]         = useState(null);
  const [token, setToken]       = useState(null);
  const [loading, setLoading]   = useState(true);  // true while checking stored session
  const navigate                = useNavigate();

  // On mount: restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser  = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch {
        // Corrupted storage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  /**
   * Called after Google OAuth returns id_token.
   * Sends it to our backend for verification and JWT generation.
   */
  const handleGoogleSuccess = useCallback(async (googleCredential) => {
    setLoading(true);
    try {
      const response = await authAPI.googleLogin(googleCredential);
      const { token: jwt, user: userData } = response.data;

      // Persist to localStorage
      localStorage.setItem(TOKEN_KEY, jwt);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));

      setToken(jwt);
      setUser(userData);

      toast.success(`Welcome, ${userData.name}!`);

      // Role-based redirect
      if (userData.role === ROLES.ADMIN) {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else {
        navigate(ROUTES.STUDENT_DASHBOARD);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleGoogleError = useCallback(() => {
    toast.error('Google Sign-In was cancelled or failed. Please try again.');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
    navigate(ROUTES.LOGIN);
    toast.success('Logged out successfully');
  }, [navigate]);

  const isAdmin   = user?.role === ROLES.ADMIN;
  const isStudent = user?.role === ROLES.STUDENT;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAdmin,
      isStudent,
      isAuthenticated: !!user,
      handleGoogleSuccess,
      handleGoogleError,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
