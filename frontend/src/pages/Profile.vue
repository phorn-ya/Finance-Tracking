<template>
  <div class="space-y-8 max-w-4xl mx-auto">
    <!-- Success or Error feedback banners -->
    <div 
      v-if="statusMessage" 
      class="bg-emerald-500/15 border border-emerald-500/35 text-emerald-600 text-xs p-3.5 rounded-2xl flex items-center gap-2 font-semibold"
    >
      <span>✓</span>
      <span>{{ statusMessage }}</span>
    </div>
    <div 
      v-if="errorMessage" 
      class="bg-rose-500/15 border border-rose-500/35 text-rose-500 text-xs p-3.5 rounded-2xl flex items-center gap-2 font-semibold"
    >
      <span>⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Personal profile and password changes -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Edit Profile Details -->
      <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <h3 class="text-base font-bold text-slate-800 mb-5">Personal Information</h3>
        
        <form @submit.prevent="handleUpdateProfile" class="space-y-4">
          <div>
            <label for="name" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
            <input
              id="name"
              v-model="name"
              type="text"
              required
              class="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label for="email" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            Update Details
          </button>
        </form>
      </div>

      <!-- Change Password -->
      <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <h3 class="text-base font-bold text-slate-800 mb-5">Security & Password</h3>
        
        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <div>
            <label for="current-pwd" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Current Password</label>
            <input
              id="current-pwd"
              v-model="currentPassword"
              type="password"
              required
              placeholder="••••••••"
              class="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label for="new-pwd" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">New Password</label>
            <input
              id="new-pwd"
              v-model="newPassword"
              type="password"
              required
              placeholder="••••••••"
              class="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label for="confirm-pwd" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Confirm New Password</label>
            <input
              id="confirm-pwd"
              v-model="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              class="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>

    <!-- Category budgets limit management -->
    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
      <div class="mb-6">
        <h3 class="text-base font-bold text-slate-800">Budget Limit Configuration</h3>
        <p class="text-slate-400 text-xs mt-1">Setup warning triggers and maximum spending caps per category</p>
      </div>

      <!-- Add/Edit category budget form -->
      <form @submit.prevent="handleSaveBudget" class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end bg-slate-50 p-4 rounded-2xl mb-6">
        <div>
          <label for="budget-category" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
          <select
            id="budget-category"
            v-model="budgetForm.category"
            class="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
          >
            <option v-for="cat in categoriesList" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>

        <div>
          <label for="budget-limit" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Limit ($)</label>
          <input
            id="budget-limit"
            v-model.number="budgetForm.limit"
            type="number"
            min="1"
            required
            placeholder="e.g. 500"
            class="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          :disabled="budgetStore.loading"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
        >
          Save Limit
        </button>
      </form>

      <!-- Active Budgets List Table -->
      <div v-if="budgets.length === 0" class="py-6 text-center text-slate-400 text-xs font-medium">
        No budget rules set. All categories currently have unlimited thresholds.
      </div>
      <div v-else class="overflow-x-auto -mx-6">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-y border-slate-100">
              <th class="px-6 py-3">Category</th>
              <th class="px-6 py-3 text-right">Limit Limit ($)</th>
              <th class="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs">
            <tr v-for="item in budgets" :key="item.id" class="hover:bg-slate-50/60 transition font-medium">
              <td class="px-6 py-3.5 text-slate-700 capitalize font-bold">{{ item.category }}</td>
              <td class="px-6 py-3.5 text-right text-slate-800 font-extrabold">${{ item.amount_limit.toFixed(2) }}</td>
              <td class="px-6 py-3.5 text-center">
                <button 
                  @click="handleDeleteBudget(item.category)"
                  class="text-rose-500 hover:text-rose-700 font-bold hover:bg-rose-50 px-2.5 py-1 rounded-lg transition"
                >
                  Remove Limit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useBudgetStore } from '../stores/budgetStore';

const authStore = useAuthStore();
const budgetStore = useBudgetStore();

const user = computed(() => authStore.user);
const budgets = computed(() => budgetStore.budgets);

// Form States
const name = ref(user.value?.name || '');
const email = ref(user.value?.email || '');

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const budgetForm = ref({
  category: 'food',
  limit: '' as number | '',
});

const statusMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

const categoriesList = [
  'food',
  'rent',
  'utilities',
  'salaries',
  'investments',
  'leisure',
  'shopping',
  'transport',
  'other',
];

onMounted(() => {
  budgetStore.fetchBudgets();
});

function flashStatus(msg: string) {
  statusMessage.value = msg;
  setTimeout(() => {
    statusMessage.value = null;
  }, 4000);
}

function flashError(msg: string) {
  errorMessage.value = msg;
  setTimeout(() => {
    errorMessage.value = null;
  }, 4000);
}

async function handleUpdateProfile() {
  errorMessage.value = null;
  const ok = await authStore.updateProfile(name.value, email.value);
  if (ok) {
    flashStatus('Personal information updated successfully');
  } else {
    flashError(authStore.error || 'Failed to update details');
  }
}

async function handleChangePassword() {
  errorMessage.value = null;
  if (newPassword.value !== confirmPassword.value) {
    flashError('Passwords do not match');
    return;
  }
  if (newPassword.value.length < 6) {
    flashError('Password must be at least 6 characters long');
    return;
  }

  const ok = await authStore.changePassword(currentPassword.value, newPassword.value);
  if (ok) {
    flashStatus('Password changed successfully');
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } else {
    flashError(authStore.error || 'Password change failed');
  }
}

async function handleSaveBudget() {
  errorMessage.value = null;
  if (!budgetForm.value.limit || budgetForm.value.limit <= 0) {
    flashError('Limit must be a positive amount');
    return;
  }

  const ok = await budgetStore.saveBudget(budgetForm.value.category, Number(budgetForm.value.limit));
  if (ok) {
    flashStatus(`Budget limit for '${budgetForm.value.category}' saved successfully`);
    budgetForm.value.limit = '';
  } else {
    flashError(budgetStore.error || 'Failed to save budget limit');
  }
}

async function handleDeleteBudget(category: string) {
  if (window.confirm(`Are you sure you want to remove the budget limit for '${category}'?`)) {
    const ok = await budgetStore.deleteBudget(category);
    if (ok) {
      flashStatus(`Budget limit for '${category}' removed successfully`);
    } else {
      flashError(budgetStore.error || 'Failed to delete budget limit');
    }
  }
}
</script>
