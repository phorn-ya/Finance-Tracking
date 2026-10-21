import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

// Layouts
import AuthLayout from '../layouts/AuthLayout.vue';
import MainLayout from '../layouts/MainLayout.vue';

// Pages
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import Dashboard from '../pages/Dashboard.vue';
import Reports from '../pages/Reports.vue';
import Profile from '../pages/Profile.vue';
import Budgets from '../pages/Budgets.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        {
          path: 'login',
          name: 'login',
          component: Login,
          meta: { guestOnly: true },
        },
        {
          path: 'register',
          name: 'register',
          component: Register,
          meta: { guestOnly: true },
        },
      ],
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboard',
          component: Dashboard,
        },
        {
          path: 'reports',
          name: 'reports',
          component: Reports,
        },
        {
          path: 'budgets',
          name: 'budgets',
          component: Budgets,
        },
        {
          path: 'profile',
          name: 'profile',
          component: Profile,
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
});

// Navigation Guards
router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  await authStore.ready

  const authenticated = authStore.isAuthenticated;

  if (to.meta.requiresAuth && !authenticated) {
    return { name: 'login' };
  } else if (to.meta.guestOnly && authenticated) {
    return { name: 'dashboard' };
  }
});

export default router;
