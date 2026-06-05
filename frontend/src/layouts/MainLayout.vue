<template>
  <div class="min-h-screen bg-slate-50 flex font-sans">
    <!-- Sidebar for Desktop -->
    <aside 
      class="bg-slate-900 border-r border-slate-800 text-slate-300 w-64 fixed inset-y-0 left-0 transform -translate-x-full lg:translate-x-0 lg:static transition-all duration-300 z-30 flex flex-col"
      :class="{ 'translate-x-0': isSidebarOpen }"
    >
      <!-- Logo Header -->
      <div class="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950/40">
        <div class="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/10">
          A
        </div>
        <span class="font-bold text-white text-lg tracking-tight">Dashboard Pay</span>
      </div>

      <!-- User Profile Widget (Sidebar) -->
      <div class="p-4 border-b border-slate-800/60 bg-slate-950/10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-inner">
            {{ userInitial }}
          </div>
          <div class="overflow-hidden">
            <h4 class="font-semibold text-white text-sm truncate leading-tight">{{ user?.name }}</h4>
            <span class="text-xs text-indigo-400 capitalize font-medium">{{ user?.role }}</span>
          </div>
        </div>
      </div>

      <!-- Navigation links -->
      <nav class="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        <router-link
          v-for="link in navLinks"
          :key="link.name"
          :to="link.to"
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200"
          :class="isActiveRoute(link.to) 
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
            : 'hover:bg-slate-800/80 hover:text-slate-100 text-slate-400'"
          @click="closeSidebarOnMobile"
        >
          <component :is="link.icon" class="w-5 h-5 flex-shrink-0" />
          <span>{{ link.label }}</span>
        </router-link>

        <!-- Admin specific link -->
        <router-link
          v-if="isAdmin"
          to="/admin"
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 mt-6 pt-4 border-t border-slate-800/60"
          :class="isActiveRoute('/admin') 
            ? 'bg-violet-600 text-white shadow-md shadow-violet-600/10' 
            : 'hover:bg-slate-800/80 hover:text-slate-100 text-slate-400'"
          @click="closeSidebarOnMobile"
        >
          <component :is="adminLink.icon" class="w-5 h-5 flex-shrink-0" />
          <span>{{ adminLink.label }}</span>
        </router-link>
      </nav>

      <!-- Logout Button (Sidebar) -->
      <div class="p-4 border-t border-slate-800">
        <button
          @click="handleLogout"
          class="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 font-medium text-sm transition duration-200 text-left"
        >
          <LogOut class="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Container -->
    <div class="flex-1 flex flex-col min-w-0 relative">
      <!-- Navbar Header -->
      <header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <!-- Toggle button on Mobile -->
        <button 
          @click="toggleSidebar" 
          class="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 focus:outline-none"
        >
          <Menu class="w-6 h-6" />
        </button>

        <h2 class="text-lg font-bold text-slate-800 capitalize hidden sm:block">
          {{ currentRouteName }}
        </h2>

        <!-- Right Side Widgets -->
        <div class="flex items-center gap-4 ml-auto">
          <!-- Notifications Bell dropdown -->
          <div class="relative">
            <button 
              @click="toggleNotifications"
              class="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition relative"
            >
              <Bell class="w-5 h-5" />
              <span 
                v-if="notifications.length > 0"
                class="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white"
              ></span>
            </button>

            <!-- Notifications Dropdown panel -->
            <div 
              v-if="isNotificationsOpen" 
              class="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-2 overflow-hidden transform origin-top-right transition-all"
            >
              <div class="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span class="font-bold text-slate-800 text-sm">Notifications</span>
                <span class="text-xs font-semibold bg-rose-50/80 text-rose-500 px-2 py-0.5 rounded-full" v-if="notifications.length > 0">
                  {{ notifications.length }} New
                </span>
              </div>
              
              <div class="max-h-60 overflow-y-auto">
                <div v-if="notifications.length === 0" class="py-6 px-4 text-center text-slate-400 text-xs font-medium">
                  All budgets are in order! No warnings.
                </div>
                <div 
                  v-else
                  v-for="(notif, idx) in notifications"
                  :key="idx"
                  class="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-none text-xs text-slate-700 leading-relaxed font-medium"
                >
                  {{ notif }}
                </div>
              </div>
            </div>
          </div>

          <!-- Vertical Separator -->
          <div class="w-px h-6 bg-slate-200"></div>

          <!-- User Quick Menu -->
          <router-link to="/profile" class="flex items-center gap-2 group">
            <div class="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:scale-105 transition-all">
              {{ userInitial }}
            </div>
            <span class="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition hidden md:inline-block">
              {{ user?.name }}
            </span>
          </router-link>
        </div>
      </header>

      <!-- Sidebar Backdrop on Mobile -->
      <div 
        v-if="isSidebarOpen" 
        @click="toggleSidebar" 
        class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-20 lg:hidden"
      ></div>

      <!-- Main Workspace -->
      <main class="flex-1 p-6 overflow-y-auto">
        <router-view v-slot="{ Component }">
          <transition name="fade-page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useBudgetStore } from '../stores/budgetStore';
import { 
  LayoutDashboard, 
  BarChart3, 
  User, 
  ShieldAlert, 
  LogOut, 
  Menu, 
  Bell 
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const budgetStore = useBudgetStore();

const user = computed(() => authStore.user);
const isAdmin = computed(() => authStore.isAdmin);

const userInitial = computed(() => {
  if (!user.value?.name) return 'U';
  return user.value.name.charAt(0).toUpperCase();
});

const isSidebarOpen = ref(false);
const isNotificationsOpen = ref(false);

const notifications = computed(() => budgetStore.notifications);

onMounted(() => {
  // Load budget statuses to trigger notifications
  budgetStore.fetchBudgetStatus();
});

const currentRouteName = computed(() => {
  return String(route.name || 'Dashboard');
});

const navLinks = [
  { name: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'reports', label: 'Reports', to: '/reports', icon: BarChart3 },
  { name: 'profile', label: 'Profile', to: '/profile', icon: User },
];

const adminLink = { name: 'admin', label: 'Admin Panel', to: '/admin', icon: ShieldAlert };

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

function closeSidebarOnMobile() {
  isSidebarOpen.value = false;
}

function toggleNotifications() {
  isNotificationsOpen.value = !isNotificationsOpen.value;
}

function isActiveRoute(path: string) {
  return route.path.startsWith(path);
}

function handleLogout() {
  authStore.logout();
  router.push('/auth/login');
}
</script>

<style scoped>
.fade-page-enter-active,
.fade-page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-page-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.fade-page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
