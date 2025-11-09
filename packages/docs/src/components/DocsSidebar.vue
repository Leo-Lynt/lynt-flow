<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from './Icon.vue'

const props = defineProps({
  open: Boolean
})

const emit = defineEmits(['close'])

const route = useRoute()
const router = useRouter()

// Seções expandidas (começam todas fechadas)
const expandedSections = ref([])

// Itens com children expandidos (começam todos fechados)
const expandedItems = ref([])

const menuSections = [
  {
    title: 'Começando',
    icon: 'material-symbols:rocket-launch',
    items: [
      {
        name: 'O que é Lynt Flow',
        route: '/introduction/what-is'
      }
    ]
  },
  {
    title: 'Editor',
    icon: 'material-symbols:edit-square',
    items: [
      {
        name: 'Interface',
        route: '/editor/interface'
      },
      {
        name: 'Adicionar Nodes',
        route: '/editor/adding-nodes'
      },
      {
        name: 'Conectar',
        route: '/editor/connecting'
      },
      {
        name: 'Executar',
        route: '/editor/running'
      }
    ]
  },
  {
    title: 'Nodes',
    icon: 'material-symbols:extension',
    items: [
      {
        name: 'Todos os Nodes',
        route: '/nodes/all'
      },
      {
        name: 'Variable',
        route: '/nodes/variable'
      },
      {
        name: 'Constant',
        route: '/nodes/constant'
      },
      {
        name: 'Input/Output',
        route: '/nodes/input-output',
        children: [
          { name: 'Input: Overview', route: '/nodes/input-output/input-overview' },
          { name: 'Input: Parameters', route: '/nodes/input-output/input-parameters' },
          { name: 'Input: Types', route: '/nodes/input-output/input-types' },
          { name: 'Input: API Usage', route: '/nodes/input-output/input-api' },
          { name: 'Output: Overview', route: '/nodes/input-output/output-overview' },
          { name: 'Output: Dynamic Inputs', route: '/nodes/input-output/output-inputs' },
          { name: 'Output: Destinations', route: '/nodes/input-output/output-destinations' },
          { name: 'Output: Configuration', route: '/nodes/input-output/output-config' }
        ]
      },
      {
        name: 'Data Connector',
        route: '/nodes/data-connector',
        children: [
          { name: 'API (HTTP REST)', route: '/nodes/data-connector/api' },
          { name: 'Google Sheets', route: '/nodes/data-connector/google-sheets' }
        ]
      },
      {
        name: 'Filter',
        route: '/nodes/filter'
      },
      {
        name: 'Sort',
        route: '/nodes/sort'
      },
      {
        name: 'Map',
        route: '/nodes/map'
      },
      {
        name: 'Math',
        route: '/nodes/math',
        children: [
          { name: 'Add (Soma)', route: '/nodes/math/add' },
          { name: 'Subtract (Subtração)', route: '/nodes/math/subtract' },
          { name: 'Multiply (Multiplicação)', route: '/nodes/math/multiply' },
          { name: 'Divide (Divisão)', route: '/nodes/math/divide' },
          { name: 'Round (Arredondamento)', route: '/nodes/math/round' }
        ]
      },
      {
        name: 'Condition',
        route: '/nodes/condition',
        children: [
          { name: 'Compare (Comparação)', route: '/nodes/condition/compare' },
          { name: 'Branch (Ramificação)', route: '/nodes/condition/branch' },
          { name: 'Logic (Lógica)', route: '/nodes/condition/logic' }
        ]
      }
    ]
  },
  {
    title: 'Fluxos',
    icon: 'material-symbols:account-tree',
    items: [
      {
        name: 'Conexões',
        route: '/flows/connections'
      },
      {
        name: 'Fluxo de Dados',
        route: '/flows/data-flow'
      },
      {
        name: 'Debugging',
        route: '/flows/debugging'
      }
    ]
  },
  {
    title: 'CMS',
    icon: 'material-symbols:dashboard-customize',
    items: [
      {
        name: 'Interface do CMS',
        route: '/cms/interface'
      },
      {
        name: 'Criar Conteúdo',
        route: '/cms/creating-content'
      },
      {
        name: 'Gerenciar Conteúdo',
        route: '/cms/managing-content'
      },
      {
        name: 'Funcionalidades Avançadas',
        route: '/cms/advanced-features'
      }
    ]
  },
  {
    title: 'Outros',
    icon: 'material-symbols:more-horiz',
    items: [
      {
        name: 'Casos de Uso',
        route: '/use-cases/google-sheets'
      },
      {
        name: 'FAQ',
        route: '/faq'
      }
    ]
  }
]

function isActive(itemRoute) {
  // Para a rota raiz, verificar exatamente
  if (itemRoute === '/') {
    return route.path === '/'
  }
  return route.path === itemRoute || route.path.startsWith(itemRoute + '/')
}

function toggleSection(sectionTitle) {
  const index = expandedSections.value.indexOf(sectionTitle)
  if (index > -1) {
    expandedSections.value.splice(index, 1)
  } else {
    expandedSections.value.push(sectionTitle)
  }
}

function isSectionExpanded(sectionTitle) {
  return expandedSections.value.includes(sectionTitle)
}

function isSectionActive(section) {
  return section.items.some(item => {
    if (item.children) {
      return isActive(item.route) || item.children.some(child => isActive(child.route))
    }
    return isActive(item.route)
  })
}

function toggleItem(itemRoute) {
  const index = expandedItems.value.indexOf(itemRoute)
  if (index > -1) {
    expandedItems.value.splice(index, 1)
  } else {
    expandedItems.value.push(itemRoute)
  }
}

function isItemExpanded(itemRoute) {
  return expandedItems.value.includes(itemRoute)
}

function navigateTo(routePath) {
  router.push(routePath)
  emit('close')
}
</script>

<template>
  <!-- Mobile sidebar overlay -->
  <div
    v-show="open"
    class="fixed inset-0 bg-gray-900/50 lg:hidden z-40"
    @click="emit('close')"
  ></div>

  <!-- Sidebar -->
  <div
    :class="[
      'glass-sidebar fixed top-20 bottom-4 left-4 w-64 backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl shadow-xl shadow-gray-900/5 z-30 transition-all duration-300 ease-in-out overflow-hidden group',
      'lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- Brilho no hover (sutil) -->
    <div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

    <!-- Corner decoration (canto inferior direito) -->
    <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>

    <!-- Close button for mobile -->
    <div class="flex justify-end p-4 lg:hidden relative z-10">
      <button
        @click="emit('close')"
        class="p-2 rounded text-gray-600 hover:opacity-70 transition-opacity"
      >
        <Icon icon="lucide:x" class="w-5 h-5" />
      </button>
    </div>

    <!-- Sidebar content -->
    <div class="flex flex-col h-full relative z-10 overflow-y-auto">
      <nav class="flex-1 px-4 pb-4 pt-4 space-y-2">
        <!-- Home -->
        <div>
          <button
            @click="navigateTo('/')"
            :class="[
              'group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300',
              isActive('/')
                ? 'bg-blue-500/10 text-blue-600 shadow-md shadow-blue-500/10'
                : 'text-gray-700 hover:bg-white/50 hover:shadow-sm hover:-translate-y-0.5'
            ]"
          >
            <Icon
              icon="material-symbols:home"
              :class="[
                'w-5 h-5 mr-3 flex-shrink-0 transition-all duration-300',
                isActive('/') ? 'text-blue-600 scale-110' : 'text-blue-600 group-hover:scale-110'
              ]"
            />
            Início
          </button>
        </div>

        <!-- Sections (expansíveis) -->
        <div v-for="section in menuSections" :key="section.title" class="space-y-1">
          <!-- Section header (clicável para expandir) -->
          <button
            @click="toggleSection(section.title)"
            :class="[
              'group flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300',
              isSectionActive(section)
                ? 'bg-blue-500/10 text-blue-600 shadow-md shadow-blue-500/10'
                : 'text-gray-700 hover:bg-white/50 hover:shadow-sm hover:-translate-y-0.5'
            ]"
          >
            <div class="flex items-center">
              <Icon
                :icon="section.icon"
                :class="[
                  'w-5 h-5 mr-3 flex-shrink-0 transition-all duration-300',
                  isSectionActive(section) ? 'text-blue-600 scale-110' : 'text-gray-500 group-hover:scale-110'
                ]"
              />
              <span>{{ section.title }}</span>
            </div>
            <Icon
              :icon="isSectionExpanded(section.title) ? 'material-symbols:expand-less' : 'material-symbols:expand-more'"
              class="w-4 h-4 text-gray-400"
            />
          </button>

          <!-- Section items (mostrados apenas quando expandido) -->
          <div v-show="isSectionExpanded(section.title)" class="ml-4 space-y-0.5">
            <div v-for="item in section.items" :key="item.route">
              <!-- Item without children -->
              <button
                v-if="!item.children"
                @click="navigateTo(item.route)"
                :class="[
                  'group flex items-center w-full px-3 py-2 text-sm rounded-lg transition-all duration-200',
                  isActive(item.route)
                    ? 'bg-blue-500/10 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-white/40 hover:text-gray-900'
                ]"
              >
                {{ item.name }}
              </button>

              <!-- Item with children (expandable) -->
              <div v-else>
                <button
                  @click="toggleItem(item.route)"
                  :class="[
                    'group flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg transition-all duration-200',
                    isActive(item.route) || item.children.some(child => isActive(child.route))
                      ? 'bg-blue-500/10 text-blue-600 font-medium'
                      : 'text-gray-600 hover:bg-white/40 hover:text-gray-900'
                  ]"
                >
                  <span>{{ item.name }}</span>
                  <Icon
                    :icon="isItemExpanded(item.route) ? 'material-symbols:expand-less' : 'material-symbols:expand-more'"
                    class="w-4 h-4 text-gray-400"
                  />
                </button>

                <!-- Sub-items -->
                <div v-show="isItemExpanded(item.route)" class="ml-4 mt-1 space-y-0.5">
                  <button
                    v-for="child in item.children"
                    :key="child.route"
                    @click="navigateTo(child.route)"
                    :class="[
                      'group flex items-center w-full px-3 py-1.5 text-xs rounded-lg transition-all duration-200',
                      isActive(child.route)
                        ? 'bg-blue-500/10 text-blue-600 font-medium'
                        : 'text-gray-500 hover:bg-white/40 hover:text-gray-900'
                    ]"
                  >
                    {{ child.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>

<style scoped>
.glass-sidebar {
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

/* Estilização da barra de rolagem - Lynt Flow blue */
.flex-col::-webkit-scrollbar {
  width: 6px;
}

.flex-col::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.flex-col::-webkit-scrollbar-thumb {
  background: rgba(37, 99, 235, 0.3);
  border-radius: 3px;
}

.flex-col::-webkit-scrollbar-thumb:hover {
  background: rgba(37, 99, 235, 0.5);
}
</style>
