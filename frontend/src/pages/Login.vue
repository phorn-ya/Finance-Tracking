<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h3 class="text-xl font-bold text-white text-center">Welcome Back</h3>
      <p class="text-slate-400 text-xs text-center">Log in to manage your budget and track expenses</p>
    </div>

    <!-- Error message banner -->
    <div 
      v-if="error" 
      class="bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs p-3.5 rounded-xl flex items-center gap-2.5"
    >
      <span class="text-base">⚠️</span>
      <span>{{ error }}</span>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <!-- Email input -->
      <div>
        <label for="email" class="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          placeholder="Your Email"
          class="w-full bg-slate-950/40 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
        />
      </div>

      <!-- Password input -->
      <div>
        <div class="flex justify-between items-center mb-1.5">
          <label for="password" class="block text-xs font-semibold text-slate-300">Password</label>
        </div>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          placeholder="Your Password"
          class="w-full bg-slate-950/40 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
        />
      </div>

      <!-- Submit button -->
      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold text-sm rounded-xl py-2.5 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/25 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg v-if="loading" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ loading ? 'Signing In...' : 'Sign In' }}</span>
      </button>
    </form>

    <div class="flex items-center gap-3 text-xs text-slate-500">
      <span class="h-px flex-1 bg-slate-800"></span>
      <span>OR</span>
      <span class="h-px flex-1 bg-slate-800"></span>
    </div>

    <button
      type="button"
      :disabled="loading"
      @click="handleGoogleLogin"
      class="w-full rounded-xl border border-slate-700 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg class="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.73 7.18l7.64 5.93c4.46-4.12 7.13-10.2 7.13-17.58Z"/>
        <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.87l-7.64-5.93c-2.13 1.43-4.86 2.3-8.26 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/>
      </svg>
      <span>{{ loading ? 'Signing In...' : 'Continue with Google' }}</span>
    </button>

    <!-- Navigation footer -->
    <div class="text-center text-xs text-slate-400 font-medium">
      Don't have an account? 
      <router-link to="/auth/register" class="text-indigo-400 hover:underline font-bold">Sign up</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);

async function handleLogin() {
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push('/dashboard');
  }
}

async function handleGoogleLogin() {
  await authStore.loginWithGoogle();
}
</script>
