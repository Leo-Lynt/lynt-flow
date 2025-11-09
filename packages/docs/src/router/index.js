import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import api from '../utils/api'

const router = createRouter({
  history: createWebHistory('/docs/'),
  routes: [
    {
      path: '/',
      component: () => import('../views/DocsLayout.vue'),
      children: [
        // Home
        {
          path: '',
          name: 'home',
          component: () => import('../views/DocsHome.vue'),
        },

        // Introduction
        {
          path: 'introduction/what-is',
          name: 'what-is',
          component: () => import('../views/introduction/WhatIs.vue'),
        },

        // Editor
        {
          path: 'editor/interface',
          name: 'editor-interface',
          component: () => import('../views/editor/Interface.vue'),
        },
        {
          path: 'editor/adding-nodes',
          name: 'editor-adding-nodes',
          component: () => import('../views/editor/AddingNodes.vue'),
        },
        {
          path: 'editor/connecting',
          name: 'editor-connecting',
          component: () => import('../views/editor/Connecting.vue'),
        },
        {
          path: 'editor/running',
          name: 'editor-running',
          component: () => import('../views/editor/Running.vue'),
        },

        // Nodes
        {
          path: 'nodes/all',
          name: 'nodes-all',
          component: () => import('../views/nodes/AllNodes.vue'),
        },
        {
          path: 'nodes/input-output',
          name: 'nodes-input-output',
          component: () => import('../views/nodes/InputOutputIndex.vue'),
        },
        {
          path: 'nodes/input-output/:topic',
          name: 'nodes-input-output-topic',
          component: () => import('../views/nodes/InputOutputTopic.vue'),
        },
        {
          path: 'nodes/data-connector',
          name: 'nodes-data-connector',
          component: () => import('../views/nodes/DataConnectorIndex.vue'),
        },
        {
          path: 'nodes/data-connector/:source',
          name: 'nodes-data-connector-source',
          component: () => import('../views/nodes/DataConnectorSource.vue'),
        },
        {
          path: 'nodes/filter',
          name: 'nodes-filter',
          component: () => import('../views/nodes/Filter.vue'),
        },
        {
          path: 'nodes/sort',
          name: 'nodes-sort',
          component: () => import('../views/nodes/Sort.vue'),
        },
        {
          path: 'nodes/map',
          name: 'nodes-map',
          component: () => import('../views/nodes/Map.vue'),
        },
        {
          path: 'nodes/math',
          name: 'nodes-math',
          component: () => import('../views/nodes/MathIndex.vue'),
        },
        {
          path: 'nodes/math/:operation',
          name: 'nodes-math-operation',
          component: () => import('../views/nodes/MathOperation.vue'),
        },
        {
          path: 'nodes/condition',
          name: 'nodes-condition',
          component: () => import('../views/nodes/ConditionIndex.vue'),
        },
        {
          path: 'nodes/condition/:type',
          name: 'nodes-condition-type',
          component: () => import('../views/nodes/ConditionType.vue'),
        },
        {
          path: 'nodes/variable',
          name: 'nodes-variable',
          component: () => import('../views/nodes/Variable.vue'),
        },
        {
          path: 'nodes/constant',
          name: 'nodes-constant',
          component: () => import('../views/nodes/Constant.vue'),
        },

        // Flows
        {
          path: 'flows/connections',
          name: 'flows-connections',
          component: () => import('../views/flows/Connections.vue'),
        },
        {
          path: 'flows/data-flow',
          name: 'flows-data-flow',
          component: () => import('../views/flows/DataFlow.vue'),
        },
        {
          path: 'flows/debugging',
          name: 'flows-debugging',
          component: () => import('../views/flows/Debugging.vue'),
        },

        // Use Cases
        {
          path: 'use-cases/google-sheets',
          name: 'use-cases-google-sheets',
          component: () => import('../views/use-cases/GoogleSheets.vue'),
        },
        {
          path: 'use-cases/filtering',
          name: 'use-cases-filtering',
          component: () => import('../views/use-cases/Filtering.vue'),
        },
        {
          path: 'use-cases/calculations',
          name: 'use-cases-calculations',
          component: () => import('../views/use-cases/Calculations.vue'),
        },

        // CMS
        {
          path: 'cms/interface',
          name: 'cms-interface',
          component: () => import('../views/cms/Interface.vue'),
        },
        {
          path: 'cms/creating-content',
          name: 'cms-creating-content',
          component: () => import('../views/cms/CreatingContent.vue'),
        },
        {
          path: 'cms/managing-content',
          name: 'cms-managing-content',
          component: () => import('../views/cms/ManagingContent.vue'),
        },
        {
          path: 'cms/advanced-features',
          name: 'cms-advanced-features',
          component: () => import('../views/cms/AdvancedFeatures.vue'),
        },

        // FAQ
        {
          path: 'faq',
          name: 'faq',
          component: () => import('../views/FAQ.vue'),
        }
      ]
    }
  ]
})

// Navigation guard para verificar autenticação a cada mudança de página
router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, checkTokenValidity, redirectToLogin } = useAuth()

  // Se não há tokens, redireciona imediatamente
  if (!isAuthenticated.value) {
    console.warn('User is not authenticated, redirecting to login')
    redirectToLogin()
    return
  }

  // Se o token está válido, permite navegação
  if (checkTokenValidity()) {
    next()
    return
  }

  // Token expirado, tentar refresh fazendo uma chamada de API
  // O interceptor vai automaticamente tentar fazer refresh
  console.log('🔄 Token expired, attempting refresh via API call...')

  try {
    // Tenta fazer uma chamada de API leve (o interceptor vai cuidar do refresh)
    await api.get('/auth/profile')
    console.log('✅ Token refreshed successfully, allowing navigation')
    next()
  } catch (error) {
    console.warn('❌ Token refresh failed, redirecting to login')
    redirectToLogin()
  }
})

export default router
