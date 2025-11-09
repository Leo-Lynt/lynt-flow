<template>
  <div v-if="loading" class="h-screen flex items-center justify-center bg-flow-bg dark:bg-flow-bg-dark">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto mb-4"></div>
      <p class="text-gray-600 dark:text-gray-400">Carregando tutorial...</p>
    </div>
  </div>

  <div v-else-if="error" class="h-screen flex items-center justify-center bg-flow-bg dark:bg-flow-bg-dark">
    <div class="text-center max-w-md">
      <div class="text-red-500 mb-4">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Erro ao Carregar Tutorial</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-4">{{ error }}</p>
      <button @click="retry" class="px-4 py-2 bg-brand-purple text-white rounded-lg hover:brightness-110 transition-all">
        Tentar Novamente
      </button>
    </div>
  </div>

  <FlowCanvas
    v-else
    :demo-mode="true"
    :hide-sidebar="true"
    :hide-save-button="true"
    :hide-minimap="true"
    :hide-controls="true"
    :allow-delete="false"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFlowStore } from '../stores/flowStore'
import FlowCanvas from '../components/FlowCanvas.vue'

const route = useRoute()
const flowStore = useFlowStore()

const loading = ref(false)
const error = ref(null)

// Carregar tutorial
onMounted(async () => {
  // Inicializar token do localStorage para o playground (mesmo nome usado pelo CMS)
  const token = localStorage.getItem('accessToken')
  if (token) {
    flowStore.apiConfig.token = token
    console.log('✅ Token do localStorage configurado no playground')
  } else {
    console.warn('⚠️ Nenhum token encontrado no localStorage. Data Connectors podem não funcionar.')
  }

  const tutorialId = route.query.tutorialId || route.query.tutorial

  if (tutorialId) {
    await loadTutorial(tutorialId)
  } else {
    // Se não houver tutorial, carregar exemplo padrão
    loadDefaultExample()
  }
})

async function loadTutorial(tutorialId) {
  loading.value = true
  error.value = null

  try {
    // Importar dinamicamente o tutorial
    // Path relativo: de src/views/ para src/data/tutorials/
    const tutorial = await import(`../data/tutorials/${tutorialId}.json`)

    const tutorialData = tutorial.default || tutorial

    if (!tutorialData || !tutorialData.flow) {
      throw new Error(`Tutorial "${tutorialId}" tem formato inválido`)
    }

    // Carregar dados do tutorial no flowStore
    flowStore.nodes = tutorialData.flow.nodes || []
    flowStore.edges = tutorialData.flow.edges || []

    // Carregar dados adicionais se existirem
    if (tutorialData.flow.nodeData) {
      Object.keys(tutorialData.flow.nodeData).forEach(key => {
        flowStore.nodeData[key] = tutorialData.flow.nodeData[key]
      })
    }

    if (tutorialData.flow.detectedTypes) {
      Object.keys(tutorialData.flow.detectedTypes).forEach(key => {
        flowStore.savedDetectedTypes[key] = tutorialData.flow.detectedTypes[key]
      })
    }

    if (tutorialData.flow.variables) {
      Object.keys(tutorialData.flow.variables).forEach(key => {
        flowStore.globalVariables[key] = tutorialData.flow.variables[key]
      })
    }

    console.log(`✅ Tutorial "${tutorialData.title}" carregado com sucesso!`)

  } catch (err) {
    console.error('Erro ao carregar tutorial:', err)
    error.value = `Tutorial "${tutorialId}" não encontrado. Certifique-se de que o arquivo existe em packages/docs/src/data/tutorials/${tutorialId}.json`

    // Carregar exemplo padrão como fallback
    setTimeout(() => {
      console.warn('Carregando exemplo padrão...')
      loadDefaultExample()
      error.value = null
    }, 3000)
  } finally {
    loading.value = false
  }
}

function loadDefaultExample() {
  // Exemplo simples: somar dois números
  flowStore.nodes = [
    {
      id: '1',
      type: 'input',
      position: { x: 100, y: 150 },
      data: { label: 'Número 1', value: 5, config: { value: 5 } }
    },
    {
      id: '2',
      type: 'input',
      position: { x: 100, y: 300 },
      data: { label: 'Número 2', value: 3, config: { value: 3 } }
    },
    {
      id: '3',
      type: 'math-operation',
      position: { x: 350, y: 200 },
      data: { label: 'Somar', operation: 'add', config: { operation: 'add' } }
    },
    {
      id: '4',
      type: 'output',
      position: { x: 600, y: 200 },
      data: { label: 'Resultado' }
    }
  ]

  flowStore.edges = [
    { id: 'e1-3', source: '1', target: '3', sourceHandle: 'value', targetHandle: 'a' },
    { id: 'e2-3', source: '2', target: '3', sourceHandle: 'value', targetHandle: 'b' },
    { id: 'e3-4', source: '3', target: '4', sourceHandle: 'result', targetHandle: 'data' }
  ]
}

function retry() {
  const tutorialId = route.query.tutorialId || route.query.tutorial
  if (tutorialId) {
    loadTutorial(tutorialId)
  } else {
    loadDefaultExample()
  }
}
</script>
