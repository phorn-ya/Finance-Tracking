<template>
  <div class="space-y-8">
    <!-- Top System Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[120px]">
        <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Users</span>
        <h3 class="text-3xl font-extrabold text-slate-800 mt-2">{{ metrics.totalUsers }}</h3>
        <p class="text-[10px] text-slate-400 font-semibold mt-2">Active registered accounts</p>
      </div>

      <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[120px]">
        <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">System Admins</span>
        <h3 class="text-3xl font-extrabold text-slate-800 mt-2">{{ metrics.adminCount }}</h3>
        <p class="text-[10px] text-slate-400 font-semibold mt-2">Accounts with admin rights</p>
      </div>

      <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[120px]">
        <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">Transactions Logged</span>
        <h3 class="text-3xl font-extrabold text-indigo-600 mt-2">{{ metrics.totalTransactions }}</h3>
        <p class="text-[10px] text-slate-400 font-semibold mt-2">Global transaction count</p>
      </div>

      <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[120px]">
        <span class="text-slate-400 text-xs font-bold uppercase tracking-wider">Recent Registrations</span>
        <h3 class="text-3xl font-extrabold text-slate-800 mt-2">{{ metrics.recentSignups }}</h3>
        <p class="text-[10px] text-slate-400 font-semibold mt-2">Signups in the last 7 days</p>
      </div>
    </div>

    <!-- Main Admin Split -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left 2 Cols: User Management -->
      <div class="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <h3 class="text-base font-bold text-slate-800 mb-5">User Account Directory</h3>

        <div v-if="usersList.length === 0" class="py-8 text-center text-slate-400 text-xs font-medium">
          No users registered in system.
        </div>
        <div v-else class="overflow-x-auto -mx-6">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-y border-slate-100">
                <th class="px-6 py-3">Name</th>
                <th class="px-6 py-3">Email</th>
                <th class="px-6 py-3">Role</th>
                <th class="px-6 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-xs font-semibold">
              <tr v-for="usr in usersList" :key="usr.id" class="hover:bg-slate-50/60 transition">
                <td class="px-6 py-4 text-slate-800 font-bold">{{ usr.name }}</td>
                <td class="px-6 py-4 text-slate-500">{{ usr.email }}</td>
                <td class="px-6 py-4">
                  <span 
                    class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase"
                    :class="usr.role === 'admin' 
                      ? 'bg-violet-50 text-violet-600' 
                      : 'bg-indigo-50 text-indigo-600'"
                  >
                    {{ usr.role }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center whitespace-nowrap">
                  <button 
                    @click="handleDeleteUser(usr.id, usr.name)"
                    :disabled="usr.id === currentUser?.id"
                    class="text-rose-500 hover:text-rose-700 font-bold hover:bg-rose-50 px-2.5 py-1 rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    Delete Account
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right 1 Col: Audit Trails Logs -->
      <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <h3 class="text-base font-bold text-slate-800 mb-4">Audit Action Trail</h3>
        
        <div v-if="auditLogs.length === 0" class="py-8 text-center text-slate-400 text-xs font-semibold">
          No audit logs recorded yet.
        </div>
        <div v-else class="space-y-4 max-h-[500px] overflow-y-auto pr-1">
          <div 
            v-for="log in auditLogs" 
            :key="log.id" 
            class="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px]"
          >
            <div class="flex justify-between items-center text-slate-400 font-semibold mb-1">
              <span class="text-indigo-600 font-bold">{{ log.user_name }}</span>
              <span>{{ formatTime(log.timestamp) }}</span>
            </div>
            <p class="text-slate-600 leading-relaxed font-semibold">{{ log.action }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/authStore';
import authApi from '../api/authApi';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

interface AuditLog {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  action: string;
  timestamp: string;
}

const authStore = useAuthStore();
const currentUser = computed(() => authStore.user);

const metrics = ref({
  totalUsers: 0,
  adminCount: 0,
  recentSignups: 0,
  totalLogs: 0,
  totalTransactions: 0,
});

const usersList = ref<UserItem[]>([]);
const auditLogs = ref<AuditLog[]>([]);

onMounted(() => {
  fetchMetrics();
  fetchUsers();
  fetchLogs();
});

async function fetchMetrics() {
  try {
    const res = await authApi.adminGetMetrics();
    metrics.value = res.data;
  } catch (err) {
    console.error('Failed to load admin metrics:', err);
  }
}

async function fetchUsers() {
  try {
    const res = await authApi.adminGetUsers();
    usersList.value = res.data;
  } catch (err) {
    console.error('Failed to load admin users:', err);
  }
}

async function fetchLogs() {
  try {
    const res = await authApi.adminGetLogs();
    auditLogs.value = res.data;
  } catch (err) {
    console.error('Failed to load admin logs:', err);
  }
}

async function handleDeleteUser(id: number, name: string) {
  if (window.confirm(`WARNING: Are you sure you want to permanently delete user "${name}" and all their transactions?`)) {
    try {
      await authApi.adminDeleteUser(id);
      fetchUsers();
      fetchMetrics();
      fetchLogs();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  }
}

function formatTime(timeStr: string) {
  try {
    const date = new Date(timeStr);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    return timeStr;
  }
}
</script>
