import { ref, computed } from 'vue'

/**
 * Estado reativo do flow
 */
export function createFlowState() {
  // Core data
  const nodes = ref([])
  const edges = ref([])
  const nodeData = ref({})
  const executionResults = ref({})
  const savedDetectedTypes = ref({}) // ⭐ Tipos detectados salvos do arquivo
  const globalVariables = ref({})
  const dataTypes = ref(null)

  // Feature flags
  const USE_ENGINE = ref(true)

  // API Configuration
  const apiConfig = ref({
    token: null,
    flowId: null,
    flowDataId: null,
    baseUrl: 'http://localhost:3001',
  })

  // Sync Status
  const syncStatus = ref('offline')
  const lastSyncError = ref(null)

  // Computed properties
  const flowEdges = computed(() =>
    edges.value.filter(e => e.edgeType === 'flow' || e.sourceHandle?.startsWith('exec-'))
  )

  const dataEdges = computed(() =>
    edges.value.filter(e => e.edgeType === 'data' || !e.sourceHandle?.startsWith('exec-'))
  )

  return {
    // State
    nodes,
    edges,
    nodeData,
    executionResults,
    savedDetectedTypes, // ⭐ Expor tipos salvos
    globalVariables,
    dataTypes,
    USE_ENGINE,
    apiConfig,
    syncStatus,
    lastSyncError,
    // Computed
    flowEdges,
    dataEdges,
  }
}
