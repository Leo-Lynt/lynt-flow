import { createRouter, createWebHistory } from 'vue-router'
import { jwtDecode } from 'jwt-decode'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPasswordView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/verify-2fa',
      name: 'verify-2fa',
      component: () => import('../views/TwoFactorVerifyView.vue')
      // Sem meta - não verificar autenticação, é parte do fluxo de login
    },
    {
      path: '/verify-email',
      name: 'verify-email',
      component: () => import('../views/VerifyEmailView.vue')
      // Sem meta - não verificar autenticação, é parte do fluxo de verificação
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('../views/AuthCallbackView.vue')
      // Sem meta - não verificar autenticação, é parte do fluxo OAuth
    },
    {
      path: '/privacy-policy',
      name: 'privacy-policy',
      component: () => import('../views/PrivacyPolicyView.vue')
      // Sem meta - rota pública para Google OAuth verification
    },
    {
      path: '/terms-of-service',
      name: 'terms-of-service',
      component: () => import('../views/TermsOfServiceView.vue')
      // Sem meta - rota pública para Google OAuth verification
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/flows',
      name: 'flows',
      component: () => import('../views/FlowsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/flows/create',
      name: 'flow-create',
      component: () => import('../views/FlowCreateView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/flows/:id/edit',
      name: 'flow-edit',
      component: () => import('../views/FlowEditView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/flows/:id',
      name: 'flow-view',
      component: () => import('../views/FlowDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/executions',
      name: 'executions',
      component: () => import('../views/ExecutionsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/executions/:id',
      name: 'execution-detail',
      component: () => import('../views/ExecutionDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/schedules',
      name: 'schedules',
      component: () => import('../views/SchedulesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('../views/LibraryView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/library/:flowId',
      name: 'library-detail',
      component: () => import('../views/PublicFlowDetailView.vue'),
      meta: { requiresAuth: true }
    },
    // {
    //   path: '/docs',
    //   name: 'docs',
    //   component: () => import('../views/DocsView.vue'),
    //   meta: { requiresAuth: true }
    // },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/billing/success',
      name: 'billing-success',
      component: () => import('../views/BillingSuccessView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/billing/cancel',
      name: 'billing-cancel',
      component: () => import('../views/BillingCancelView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('../views/AdminUsersView.vue'),
      meta: { requiresAuth: true, requiresRole: 'administrator' }
    },
    {
      path: '/admin/moderation',
      name: 'admin-moderation',
      component: () => import('../views/AdminModerationView.vue'),
      meta: { requiresAuth: true, requiresRole: 'moderator' }
    }
  ],
})

// Navigation guard for authentication and roles
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('accessToken')
  const isAuthenticated = !!token

  // Check authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
    return
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }

  // Check role requirements
  if (to.meta.requiresRole && isAuthenticated) {
    try {
      const decoded = jwtDecode(token)
      const userRole = decoded.role || 'user'
      const requiredRole = to.meta.requiresRole

      // Role hierarchy: administrator > moderator > user
      const roleHierarchy = { user: 1, moderator: 2, administrator: 3 }
      const userLevel = roleHierarchy[userRole] || 0
      const requiredLevel = roleHierarchy[requiredRole] || 0

      if (userLevel < requiredLevel) {
        // Insufficient permissions - redirect to dashboard
        next({ name: 'dashboard' })
        return
      }
    } catch (error) {
      next({ name: 'login' })
      return
    }
  }

  next()
})

export default router
