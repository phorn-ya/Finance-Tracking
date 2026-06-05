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
</script>
