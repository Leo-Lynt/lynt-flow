<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import nodeRegistry from '../../engine/registry'
import Icon from '../../components/Icon.vue'

const route = useRoute()
const router = useRouter()

const node = ref(null)
const category = ref(null)
const activeTab = ref('overview')

onMounted(() => {
  loadNodeData()
})

watch(() => route.params.nodeType, () => {
  loadNodeData()
})

function loadNodeData() {
  const nodeType = route.params.nodeType
  node.value = nodeRegistry.getNodeDefinition(nodeType)

  if (!node.value) {
    // Node não encontrado, redirecionar para lista
    router.push('/docs/nodes')
    return
  }

  // Buscar categoria
  const categories = nodeRegistry.getAllCategories()
  category.value = categories.find(cat => cat.id === node.value.category)
}

function getCategoryColor(categoryId) {
  const colorMap = {
    'data-input': 'bg-emerald-500',
    'logic-control': 'bg-blue-500',
    'operations': 'bg-purple-500',
    'data-processing': 'bg-amber-500',
    'debug': 'bg-red-500',
    'organization': 'bg-gray-500'
  }
  return colorMap[categoryId] || 'bg-gray-500'
}

function goBack() {
  router.push('/docs/nodes')
}

// Extrair handles de input e output
const inputHandles = computed(() => {
  if (!node.value?.handles?.inputs) return { execution: [], data: [] }
  return node.value.handles.inputs
})

const outputHandles = computed(() => {
  if (!node.value?.handles?.outputs) return { execution: [], data: [] }
  return node.value.handles.outputs
})

// Extrair campos de configuração
const configFields = computed(() => {
  if (!node.value?.config) return []
  return Object.entries(node.value.config).map(([key, field]) => ({
    key,
    ...field
  }))
})
</script>

<template>
  <div v-if="node" class="node-detail">
    <!-- Back Button -->
    <button
      @click="goBack"
      class="flex items-center gap-2 text-flow-text-secondary dark:text-flow-text-secondary-dark hover:text-primary transition-colors mb-6"
    >
      <Icon icon="material-symbols:arrow-back" class="w-5 h-5" />
      <span>Voltar para Nodes</span>
    </button>

    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-start gap-4 mb-4">
        <div :class="['p-4 rounded-xl', getCategoryColor(node.category)]">
          <Icon :icon="node.icon" class="w-8 h-8 text-white" />
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-4xl font-bold text-flow-text dark:text-flow-text-dark">
              {{ node.label }}
            </h1>
            <span
              v-if="category"
              class="px-3 py-1 rounded-full text-xs font-medium bg-flow-surface dark:bg-flow-surface-dark border border-flow-border dark:border-flow-border-dark"
            >
              {{ category.label }}
            </span>
          </div>
          <code class="text-sm text-flow-text-secondary dark:text-flow-text-secondary-dark">
            {{ node.type }}
          </code>
        </div>
      </div>
      <p class="text-lg text-flow-text-secondary dark:text-flow-text-secondary-dark">
        {{ node.description || 'Sem descrição disponível' }}
      </p>
    </div>

    <!-- Tabs -->
    <div class="border-b border-flow-border dark:border-flow-border-dark mb-8">
      <div class="flex gap-6">
        <button
          @click="activeTab = 'overview'"
          :class="[
            'pb-3 px-2 font-medium transition-colors relative',
            activeTab === 'overview'
              ? 'text-primary'
              : 'text-flow-text-secondary dark:text-flow-text-secondary-dark hover:text-flow-text dark:hover:text-flow-text-dark'
          ]"
        >
          Visão Geral
          <div
            v-if="activeTab === 'overview'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          ></div>
        </button>
        <button
          @click="activeTab = 'config'"
          :class="[
            'pb-3 px-2 font-medium transition-colors relative',
            activeTab === 'config'
              ? 'text-primary'
              : 'text-flow-text-secondary dark:text-flow-text-secondary-dark hover:text-flow-text dark:hover:text-flow-text-dark'
          ]"
        >
          Configuração
          <div
            v-if="activeTab === 'config'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          ></div>
        </button>
        <button
          @click="activeTab = 'examples'"
          :class="[
            'pb-3 px-2 font-medium transition-colors relative',
            activeTab === 'examples'
              ? 'text-primary'
              : 'text-flow-text-secondary dark:text-flow-text-secondary-dark hover:text-flow-text dark:hover:text-flow-text-dark'
          ]"
        >
          Exemplos
          <div
            v-if="activeTab === 'examples'"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
          ></div>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="space-y-8">
        <!-- Inputs -->
        <section>
          <h2 class="text-2xl font-semibold text-flow-text dark:text-flow-text-dark mb-4">
            Inputs
          </h2>

          <!-- Execution Inputs -->
          <div v-if="inputHandles.execution.length > 0" class="mb-6">
            <h3 class="text-lg font-medium text-flow-text dark:text-flow-text-dark mb-3">
              Execução
            </h3>
            <div class="space-y-3">
              <div
                v-for="handle in inputHandles.execution"
                :key="handle.id"
                class="p-4 rounded-lg bg-flow-surface dark:bg-flow-surface-dark border border-flow-border dark:border-flow-border-dark"
              >
                <div class="flex items-center gap-2 mb-1">
                  <div class="w-3 h-3 rounded-full bg-gray-400"></div>
                  <code class="text-sm font-medium text-flow-text dark:text-flow-text-dark">
                    {{ handle.label || handle.id }}
                  </code>
                </div>
                <p class="text-sm text-flow-text-secondary dark:text-flow-text-secondary-dark ml-5">
                  {{ handle.description || 'Trigger de execução' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Data Inputs -->
          <div v-if="inputHandles.data.length > 0">
            <h3 class="text-lg font-medium text-flow-text dark:text-flow-text-dark mb-3">
              Dados
            </h3>
            <div class="space-y-3">
              <div
                v-for="handle in inputHandles.data"
                :key="handle.id"
                class="p-4 rounded-lg bg-flow-surface dark:bg-flow-surface-dark border border-flow-border dark:border-flow-border-dark"
              >
                <div class="flex items-center gap-2 mb-1">
                  <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                  <code class="text-sm font-medium text-flow-text dark:text-flow-text-dark">
                    {{ handle.label || handle.id }}
                  </code>
                  <span
                    v-if="handle.type"
                    class="px-2 py-0.5 rounded text-xs bg-flow-bg dark:bg-flow-bg-dark text-flow-text-secondary dark:text-flow-text-secondary-dark"
                  >
                    {{ handle.type }}
                  </span>
                </div>
                <p class="text-sm text-flow-text-secondary dark:text-flow-text-secondary-dark ml-5">
                  {{ handle.description || 'Entrada de dados' }}
                </p>
              </div>
            </div>
          </div>

          <p v-if="inputHandles.execution.length === 0 && inputHandles.data.length === 0" class="text-flow-text-secondary dark:text-flow-text-secondary-dark">
            Este node não possui inputs.
          </p>
        </section>

        <!-- Outputs -->
        <section>
          <h2 class="text-2xl font-semibold text-flow-text dark:text-flow-text-dark mb-4">
            Outputs
          </h2>

          <!-- Execution Outputs -->
          <div v-if="outputHandles.execution.length > 0" class="mb-6">
            <h3 class="text-lg font-medium text-flow-text dark:text-flow-text-dark mb-3">
              Execução
            </h3>
            <div class="space-y-3">
              <div
                v-for="handle in outputHandles.execution"
                :key="handle.id"
                class="p-4 rounded-lg bg-flow-surface dark:bg-flow-surface-dark border border-flow-border dark:border-flow-border-dark"
              >
                <div class="flex items-center gap-2 mb-1">
                  <div class="w-3 h-3 rounded-full bg-gray-400"></div>
                  <code class="text-sm font-medium text-flow-text dark:text-flow-text-dark">
                    {{ handle.label || handle.id }}
                  </code>
                </div>
                <p class="text-sm text-flow-text-secondary dark:text-flow-text-secondary-dark ml-5">
                  {{ handle.description || 'Continua execução' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Data Outputs -->
          <div v-if="outputHandles.data.length > 0">
            <h3 class="text-lg font-medium text-flow-text dark:text-flow-text-dark mb-3">
              Dados
            </h3>
            <div class="space-y-3">
              <div
                v-for="handle in outputHandles.data"
                :key="handle.id"
                class="p-4 rounded-lg bg-flow-surface dark:bg-flow-surface-dark border border-flow-border dark:border-flow-border-dark"
              >
                <div class="flex items-center gap-2 mb-1">
                  <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                  <code class="text-sm font-medium text-flow-text dark:text-flow-text-dark">
                    {{ handle.label || handle.id }}
                  </code>
                  <span
                    v-if="handle.type"
                    class="px-2 py-0.5 rounded text-xs bg-flow-bg dark:bg-flow-bg-dark text-flow-text-secondary dark:text-flow-text-secondary-dark"
                  >
                    {{ handle.type }}
                  </span>
                </div>
                <p class="text-sm text-flow-text-secondary dark:text-flow-text-secondary-dark ml-5">
                  {{ handle.description || 'Saída de dados' }}
                </p>
              </div>
            </div>
          </div>

          <p v-if="outputHandles.execution.length === 0 && outputHandles.data.length === 0" class="text-flow-text-secondary dark:text-flow-text-secondary-dark">
            Este node não possui outputs.
          </p>
        </section>
      </div>

      <!-- Configuration Tab -->
      <div v-if="activeTab === 'config'" class="space-y-6">
        <h2 class="text-2xl font-semibold text-flow-text dark:text-flow-text-dark mb-4">
          Campos de Configuração
        </h2>

        <div v-if="configFields.length > 0" class="space-y-4">
          <div
            v-for="field in configFields"
            :key="field.key"
            class="p-6 rounded-lg bg-flow-surface dark:bg-flow-surface-dark border border-flow-border dark:border-flow-border-dark"
          >
            <div class="flex items-start justify-between mb-2">
              <div>
                <code class="text-lg font-medium text-flow-text dark:text-flow-text-dark">
                  {{ field.label || field.key }}
                </code>
                <span
                  v-if="field.required"
                  class="ml-2 px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-500 font-medium"
                >
                  Obrigatório
                </span>
              </div>
              <span class="px-2 py-1 rounded text-xs bg-flow-bg dark:bg-flow-bg-dark text-flow-text-secondary dark:text-flow-text-secondary-dark">
                {{ field.type }}
              </span>
            </div>
            <p v-if="field.description" class="text-sm text-flow-text-secondary dark:text-flow-text-secondary-dark mb-2">
              {{ field.description }}
            </p>
            <div v-if="field.default !== undefined" class="text-sm text-flow-text-secondary dark:text-flow-text-secondary-dark">
              <strong>Padrão:</strong> <code class="px-2 py-0.5 rounded bg-flow-bg dark:bg-flow-bg-dark">{{ field.default }}</code>
            </div>
            <div v-if="field.options" class="mt-2 text-sm text-flow-text-secondary dark:text-flow-text-secondary-dark">
              <strong>Opções:</strong>
              <div class="flex flex-wrap gap-2 mt-1">
                <code
                  v-for="option in field.options"
                  :key="option.value"
                  class="px-2 py-0.5 rounded bg-flow-bg dark:bg-flow-bg-dark"
                >
                  {{ option.label }}
                </code>
              </div>
            </div>
          </div>
        </div>

        <p v-else class="text-flow-text-secondary dark:text-flow-text-secondary-dark">
          Este node não possui campos de configuração.
        </p>
      </div>

      <!-- Examples Tab -->
      <div v-if="activeTab === 'examples'">
        <div class="p-8 rounded-xl bg-flow-surface dark:bg-flow-surface-dark border-2 border-dashed border-flow-border dark:border-flow-border-dark text-center">
          <Icon icon="material-symbols:science" class="w-16 h-16 mx-auto mb-4 text-flow-text-secondary dark:text-flow-text-secondary-dark opacity-50" />
          <h3 class="text-xl font-semibold text-flow-text dark:text-flow-text-dark mb-2">
            Exemplos em Breve
          </h3>
          <p class="text-flow-text-secondary dark:text-flow-text-secondary-dark mb-6">
            Estamos trabalhando em exemplos interativos para este node. Em breve você poderá testar o node diretamente na documentação!
          </p>
          <button
            @click="router.push('/')"
            class="px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors"
          >
            Testar no Editor
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth transitions */
button {
  @apply transition-all duration-200;
}
</style>
