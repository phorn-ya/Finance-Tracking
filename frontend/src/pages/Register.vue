<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h3 class="text-xl font-bold text-white text-center">Create Account</h3>
      <p class="text-slate-400 text-xs text-center">Sign up to begin your budget optimization journey</p>
    </div>

    <!-- Error message banner -->
    <div 
      v-if="error || clientError" 
      class="bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs p-3.5 rounded-xl flex items-center gap-2.5"
    >
      <span class="text-base">⚠️</span>
      <span>{{ error || clientError }}</span>
    </div>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <!-- Full Name -->
      <div>
        <label for="name" class="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
        <input
          id="name"
          v-model="name"
          type="text"
          required
          placeholder="John Doe"
          class="w-full bg-slate-950/40 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
        />
      </div>

      <!-- Email Address -->
      <div>
        <label for="email" class="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          placeholder="name@example.com"
          class="w-full bg-slate-950/40 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
        />
      </div>

      <!-- Password -->
      <div>
        <label for="password" class="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          placeholder="••••••••"
          class="w-full bg-slate-950/40 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
        />
      </div>

      <!-- Confirm Password -->
      <div>
        <label for="confirmPassword" class="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          required
          placeholder="••••••••"
          class="w-full bg-slate-950/40 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
        />
      </div>

      <!-- Submit -->
      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-semibold text-sm rounded-xl py-2.5 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/25 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <svg v-if="loading" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{{ loading ? 'Creating Account...' : 'Sign Up' }}</span>
      </button>
    </form>

    <!-- Footer -->
    <div class="text-center text-xs text-slate-400 font-medium">
      Already have an account? 
      <router-link to="/auth/login" class="text-indigo-400 hover:underline font-bold">Sign in</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const clientError = ref<string | null>(null);

const loading = computed(() => authStore.loading);
const error = computed(() => authStore.error);

async function handleRegister() {
  clientError.value = null;
  
  if (password.value !== confirmPassword.value) {
    clientError.value = 'Passwords do not match';
    return;
  }
  
  if (password.value.length < 6) {
    clientError.value = 'Password must be at least 6 characters long';
    return;
  }

  const success = await authStore.register(name.value, email.value, password.value);
  if (success) {
    router.push('/dashboard');
  }
}
</script>
