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
import Admin from '../pages/Admin.vue';

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
          path: 'profile',
          name: 'profile',
          component: Profile,
        },
        {
          path: 'admin',
          name: 'admin',
          component: Admin,
          meta: { requiresAdmin: true },
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
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // If token exists but user object is null, try to retrieve profile
  if (authStore.token && !authStore.user) {
    await authStore.fetchCurrentUser();
  }

  const authenticated = authStore.isAuthenticated;
  const adminUser = authStore.isAdmin;

  if (to.meta.requiresAuth && !authenticated) {
    next({ name: 'login' });
  } else if (to.meta.guestOnly && authenticated) {
    next({ name: 'dashboard' });
  } else if (to.meta.requiresAdmin && !adminUser) {
    // If user is not admin, send back to dashboard
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;
