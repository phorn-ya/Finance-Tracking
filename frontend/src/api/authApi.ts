import apiClient from './index';

export const authApi = {
  register(name: string, email: string, passwordPlain: string) {
    return apiClient.post('/auth/register', { name, email, password: passwordPlain });
  },

  login(email: string, passwordPlain: string) {
    return apiClient.post('/auth/login', { email, password: passwordPlain });
  },

  getMe() {
    return apiClient.get('/auth/me');
  },

  updateProfile(name: string, email: string) {
    return apiClient.put('/auth/profile', { name, email });
  },

  changePassword(currentPasswordPlain: string, newPasswordPlain: string) {
    return apiClient.put('/auth/password', {
      currentPassword: currentPasswordPlain,
      newPassword: newPasswordPlain,
    });
  },

  // Admin APIs
  adminGetUsers() {
    return apiClient.get('/auth/admin/users');
  },

  adminDeleteUser(userId: number) {
    return apiClient.delete(`/auth/admin/users/${userId}`);
  },

  adminGetMetrics() {
    return apiClient.get('/auth/admin/metrics');
  },

  adminGetLogs() {
    return apiClient.get('/auth/admin/logs');
  },
};
export default authApi;
