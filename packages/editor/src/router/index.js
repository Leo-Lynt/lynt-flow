import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import IntegrationsView from '../views/IntegrationsView.vue'
import ConnectionsView from '../views/ConnectionsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/integrations',
      name: 'integrations',
      component: IntegrationsView,
    },
    {
      path: '/connections',
      name: 'connections',
      component: ConnectionsView,
    },
    {
      path: '/docs',
      component: () => import('../views/docs/DocsLayout.vue'),
      children: [
        {
          path: '',
          name: 'docs-home',
          component: () => import('../views/docs/DocsHome.vue'),
        },
        {
          path: 'getting-started',
          name: 'docs-getting-started',
          component: () => import('../views/docs/GettingStarted.vue'),
        },
        {
          path: 'nodes',
          name: 'docs-nodes',
          component: () => import('../views/docs/NodesList.vue'),
        },
        {
          path: 'nodes/:nodeType',
          name: 'docs-node-detail',
          component: () => import('../views/docs/NodeDetail.vue'),
        }
      ]
    }
  ],
})

export default router
