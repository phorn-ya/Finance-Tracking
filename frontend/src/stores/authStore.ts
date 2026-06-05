import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '../api/authApi';

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'));
  const user = ref<UserInfo | null>(
    localStorage.getItem('auth_user') ? JSON.parse(localStorage.getItem('auth_user')!) : null
  );
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  async function login(email: string, passwordPlain: string) {
    loading.value = true;
    error.value = null;
    try {
      const res = await authApi.login(email, passwordPlain);
      token.value = res.data.token;
      user.value = res.data.user;

      localStorage.setItem('auth_token', res.data.token);
      localStorage.setItem('auth_user', JSON.stringify(res.data.user));
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Login failed. Verify credentials.';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function register(name: string, email: string, passwordPlain: string) {
    loading.value = true;
    error.value = null;
    try {
      const res = await authApi.register(name, email, passwordPlain);
      token.value = res.data.token;
      user.value = res.data.user;

      localStorage.setItem('auth_token', res.data.token);
      localStorage.setItem('auth_user', JSON.stringify(res.data.user));
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Registration failed.';
      return false;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  async function fetchCurrentUser() {
    if (!token.value) return;
    try {
      const res = await authApi.getMe();
      user.value = res.data.user;
      localStorage.setItem('auth_user', JSON.stringify(res.data.user));
    } catch (err) {
      logout();
    }
  }

  async function updateProfile(name: string, email: string) {
    loading.value = true;
    error.value = null;
    try {
      const res = await authApi.updateProfile(name, email);
      user.value = res.data.user;
      localStorage.setItem('auth_user', JSON.stringify(res.data.user));
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Profile update failed.';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function changePassword(currentPlain: string, newPlain: string) {
    loading.value = true;
    error.value = null;
    try {
      await authApi.changePassword(currentPlain, newPlain);
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to change password.';
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchCurrentUser,
    updateProfile,
    changePassword,
  };
});
