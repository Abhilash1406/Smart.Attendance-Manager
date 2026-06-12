import api from './axios';

export const authAPI = {
  /**
   * Exchange Google id_token for our JWT
   */
  googleLogin: (idToken) =>
    api.post('/auth/google', { idToken }),

  /**
   * Get current user profile
   */
  getMe: () =>
    api.get('/auth/me'),
};
