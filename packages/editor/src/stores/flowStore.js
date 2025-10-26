/**
 * Flow Store - Refactored to use Core Engines
 * This is the Vue/Pinia orchestration layer
 * All business logic is delegated to core engines
 */

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { FlowEngine, TypeEngine, AutoExecutionEngine, deepClone } from '@leo-lynt/lynt-flow-core'
import { executeNode as frontendExecuteNode, extractOutputs } from '../engine/executor'
import { loadDataTypes, detectValueType } from '@leo-lynt/lynt-flow-core/engine/dataTypes.js'
import { logConnection } from '../utils/connectionLogger'
import { getAllNodes, getAllCategories } from '../engine/registry'
import api from '../utils/api'

export const useFlowStore = defineStore('flow', () => {
  // ========================================
  // CORE ENGINES
  // ========================================
  const flowEngine = new FlowEngine(frontendExecuteNode, extractOutputs)
  const typeEngine = new TypeEngine()
  const autoExecEngine = new AutoExecutionEngine()

  // ========================================
  // VUE STATE (UI/Presentation Layer)
  // ========================================
  const nodes = ref([])
  const edges = ref([])
  const nodeData = ref({})
  const globalVariables = ref({})
  const dataTypes = ref(null)
  const isDragging = ref(false)

  // Execution state (synced from engines)
  const executionResults = ref({})
  const executingNodes = ref(new Set())
  const executedNodes = ref(new Set())
  const errorNodes = ref(new Set())
  const savedDetectedTypes = ref({})

  // Reactivity state
  const executionDebounce = ref(new Map())
  const scheduledExecutions = ref(new Set())
  let executionTimer = null
  const isLoadingFlow = ref(false)

  // Undo/Redo
  const history = ref([])
  const historyIndex = ref(-1)
  const MAX_HISTORY = 50
  const isPerformingUndoRedo = ref(false)

  // API Configuration
  const apiConfig = ref({
    token: null,
    flowId: null,
    flowDataId: null,
    baseUrl: import.meta.env.VITE_API_URL,
  })

  // Sync Status
  const syncStatus = ref('offline')
  const lastSyncError = ref(null)

  // 🚀 NOVO: Sistema de detecção de mudanças para auto-save inteligente
  const hasUnsavedChanges = ref(false)
  const lastSavedState = ref(null)
  let autoSaveIntervalId = null
  const AUTO_SAVE_INTERVAL = 120000 // 2 minutos em ms

  // ========================================
  // COMPUTED
  // ========================================
  const flowEdges = computed(() =>
    edges.value.filter(e => e.edgeType === 'flow' || e.sourceHandle?.startsWith('exec-'))
  )

  const dataEdges = computed(() =>
    edges.value.filter(e => e.edgeType === 'data' || !e.sourceHandle?.startsWith('exec-'))
  )

  const nodeCatalog = computed(() => ({
    nodes: getAllNodes(),
    categories: getAllCategories()
  }))

  // 🚀 NOVO: Validação de Input/Output nodes obrigatórios
  const flowValidation = computed(() => {
    const inputNodes = nodes.value.filter(n => n.type === 'input')
    const outputNodes = nodes.value.filter(n => n.type === 'output')

    return {
      hasInput: inputNodes.length > 0,
      hasOutput: outputNodes.length > 0,
      hasMultipleInputs: inputNodes.length > 1,
      hasMultipleOutputs: outputNodes.length > 1,
      isValid: inputNodes.length === 1 && outputNodes.length === 1,
      inputNodeId: inputNodes[0]?.id || null,
      outputNodeId: outputNodes[0]?.id || null
    }
  })

  // ========================================
  // ENGINE INTEGRATION
  // ========================================

  // Setup engine state change callback
  flowEngine.onStateChange = (state) => {
    executionResults.value = state.executionResults
    executingNodes.value = new Set(state.executingNodes)
    executedNodes.value = new Set(state.executedNodes)
    errorNodes.value = new Set(state.errorNodes)
  }

  // Sync nodeData to engine whenever it changes
  watch(nodeData, (newNodeData) => {
    for (const nodeId in newNodeData) {
      flowEngine.setNodeData(nodeId, newNodeData[nodeId])
    }
  }, { deep: true })

  // Sync config to engine
  watch([apiConfig, globalVariables], () => {
    flowEngine.setConfig(apiConfig.value, globalVariables.value)
  }, { deep: true })

  // Watch globalVariables changes to re-execute GET mode Variable nodes
  // Use a cache to track previous values since Vue's watch with deep passes same reference
  const globalVariablesCache = ref({})

  watch(globalVariables, (newVars) => {
    // Find which variables changed by comparing with cache
    const changedVars = new Set()
    for (const varName in newVars) {
      if (newVars[varName] !== globalVariablesCache.value[varName]) {
        changedVars.add(varName)
      }
    }

    // Update cache with current values
    globalVariablesCache.value = { ...newVars }

    // Re-execute GET mode Variable nodes that use changed variables
    if (changedVars.size > 0) {
      nodes.value.forEach(node => {
        if (node.type === 'variable') {
          const data = nodeData.value[node.id]
          if (data?.mode === 'get' && data?.variableName && changedVars.has(data.variableName)) {
            executeNodeById(node.id)
          }
        }
      })
    }
  }, { deep: true })

  // Fix legacy edges without edgeType (run once on initialization)
  const fixLegacyEdges = () => {
    let fixed = 0
    edges.value.forEach(edge => {
      if (!edge.edgeType) {
        const isExecEdge = edge.sourceHandle?.startsWith('exec-') || edge.targetHandle?.startsWith('exec-')
        edge.edgeType = isExecEdge ? 'flow' : 'data'
        fixed++
      }
    })
    if (fixed > 0) {
    }
  }

  // Run fix on edges when they change
  watch(edges, fixLegacyEdges, { immediate: true })

  // ========================================
  // UNDO/REDO
  // ========================================
  const saveSnapshot = () => {
    if (isPerformingUndoRedo.value) return

    const snapshot = {
      nodes: JSON.parse(JSON.stringify(nodes.value)),
      edges: JSON.parse(JSON.stringify(edges.value)),
      nodeData: JSON.parse(JSON.stringify(nodeData.value))
    }

    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }

    history.value.push(snapshot)
    historyIndex.value = history.value.length - 1

    if (history.value.length > MAX_HISTORY) {
      history.value.shift()
      historyIndex.value--
    }
  }

  const undo = () => {
    if (historyIndex.value <= 0) return false

    isPerformingUndoRedo.value = true
    historyIndex.value--

    const snapshot = history.value[historyIndex.value]
    nodes.value = JSON.parse(JSON.stringify(snapshot.nodes))
    edges.value = JSON.parse(JSON.stringify(snapshot.edges))
    nodeData.value = JSON.parse(JSON.stringify(snapshot.nodeData))

    isPerformingUndoRedo.value = false
    return true
  }

  const redo = () => {
    if (historyIndex.value >= history.value.length - 1) return false

    isPerformingUndoRedo.value = true
    historyIndex.value++

    const snapshot = history.value[historyIndex.value]
    nodes.value = JSON.parse(JSON.stringify(snapshot.nodes))
    edges.value = JSON.parse(JSON.stringify(snapshot.edges))
    nodeData.value = JSON.parse(JSON.stringify(snapshot.nodeData))

    isPerformingUndoRedo.value = false
    return true
  }

  // ========================================
  // NODE OPERATIONS
  // ========================================
  const addNode = (node) => {
    // 🚀 VALIDAÇÃO: Bloquear adição de Input/Output duplicado
    if (node.type === 'input' && flowValidation.value.hasInput) {
      console.warn('❌ Cannot add Input node: Flow already has an Input node')
      return false
    }
    if (node.type === 'output' && flowValidation.value.hasOutput) {
      console.warn('❌ Cannot add Output node: Flow already has an Output node')
      return false
    }

    nodes.value = [...nodes.value, node]

    // Garantir reatividade ao adicionar nodeData
    nodeData.value = {
      ...nodeData.value,
      [node.id]: {}
    }

    saveSnapshot()

    // Auto-execute if needed
    // Exception: Don't auto-execute Variable GET mode if variableName is empty
    const shouldAutoExec = autoExecEngine.shouldAutoExecuteOnCreate(node.type)
    const isVariableWithoutName = node.type === 'variable' && !node.data?.variableName

    if (shouldAutoExec && !isVariableWithoutName) {
      setTimeout(() => executeNodeById(node.id), autoExecEngine.getDelay())
    }

    return true
  }

  const removeNode = (nodeId) => {
    // 🚀 VALIDAÇÃO: Bloquear remoção de Input/Output nodes
    const node = nodes.value.find(n => n.id === nodeId)
    if (node && (node.type === 'input' || node.type === 'output')) {
      console.warn(`❌ Cannot remove ${node.type} node: It is required for the flow`)
      return false
    }

    nodes.value = nodes.value.filter(n => n.id !== nodeId)

    // Garantir reatividade ao remover nodeData
    const { [nodeId]: removed, ...rest } = nodeData.value
    nodeData.value = rest

    edges.value = edges.value.filter(e => e.source !== nodeId && e.target !== nodeId)

    // Remover resultado usando action
    removeExecutionResult(nodeId)

    saveSnapshot()
  }

  const updateNodePosition = (id, position) => {
    const nodeIndex = nodes.value.findIndex(n => n.id === id)
    if (nodeIndex !== -1) {
      nodes.value[nodeIndex].position = position
    }
  }

  const setDragging = (dragging) => {
    isDragging.value = dragging
  }

  const updateNodeData = (nodeId, data) => {
    // Garantir reatividade ao atualizar nodeData
    const updatedData = { ...nodeData.value[nodeId], ...data }
    nodeData.value = {
      ...nodeData.value,
      [nodeId]: updatedData
    }

    // Sync to FlowEngine immediately (garante que o engine tem os dados atualizados)
    flowEngine.setNodeData(nodeId, updatedData)

    // Auto-execute if needed
    const node = nodes.value.find(n => n.id === nodeId)
    if (node && autoExecEngine.shouldAutoExecuteOnConfigChange(node.type)) {
      setTimeout(() => executeNodeById(nodeId), autoExecEngine.getDelay())
    }
  }

  // ========================================
  // EDGE OPERATIONS
  // ========================================
  const addEdge = (edge) => {
    // Definir edgeType baseado nos handles
    const isExecEdge = edge.sourceHandle?.startsWith('exec-') || edge.targetHandle?.startsWith('exec-')
    edge.edgeType = isExecEdge ? 'flow' : 'data'

    edges.value = [...edges.value, edge]
    logConnection(edge, nodes.value)
    saveSnapshot()

    // Auto-execute target node (se o source já foi executado)
    const targetNode = nodes.value.find(n => n.id === edge.target)
    if (targetNode && edge.edgeType === 'data') {
      const sourceHasResult = executionResults.value[edge.source] !== undefined

      // Só executar se o source já tem resultado (evita execução dupla)
      if (sourceHasResult) {
        setTimeout(() => executeNodeById(edge.target), autoExecEngine.getDelay())
      }
    }
  }

  const removeEdge = (edgeId) => {
    edges.value = edges.value.filter(e => e.id !== edgeId)
    saveSnapshot()
  }

  // ========================================
  // EXECUTION
  // ========================================
  const getNodeDataInputs = (nodeId) => {
    const inputs = {}

    // Buscar apenas edges de DADOS conectadas a este nó
    const incomingDataEdges = dataEdges.value.filter(e => e.target === nodeId)

    for (const edge of incomingDataEdges) {
      const sourceOutputs = executionResults.value[edge.source]

      if (sourceOutputs !== undefined) {
        // Pegar o valor do handle específico do source
        const sourceValue = (typeof sourceOutputs === 'object' && sourceOutputs !== null && edge.sourceHandle in sourceOutputs)
          ? sourceOutputs[edge.sourceHandle]
          : sourceOutputs

        // Usar targetHandle como está (não remover prefixos)
        // Os métodos dos nodes esperam as chaves completas (data-input, exposed-value, etc)
        const inputKey = edge.targetHandle || 'data-input'
        inputs[inputKey] = sourceValue
      }
    }

    return inputs
  }

  /**
   * Define resultado de execução de um node
   * IMPORTANTE: Sempre usar esta função ao invés de mutação direta
   * para garantir reatividade do Vue
   */
  const setExecutionResult = (nodeId, result) => {
    // Capturar resultado anterior para detectar mudança
    const oldResult = executionResults.value[nodeId]

    // Forçar reatividade recriando o objeto inteiro
    executionResults.value = {
      ...executionResults.value,
      [nodeId]: result
    }

    flowEngine.executionResults.set(nodeId, result)

    // 🚀 OTIMIZAÇÃO: Propagar apenas se resultado mudou de fato
    // Isso evita re-execuções desnecessárias quando nodes são movidos
    if (!isLoadingFlow.value && oldResult !== result) {
      // Comparação por referência é suficiente pois result é sempre um novo objeto
      propagateToDownstream(nodeId)
    }
  }

  /**
   * Remove resultado de execução de um node
   * IMPORTANTE: Usar ao invés de delete direto
   */
  const removeExecutionResult = (nodeId) => {
    const { [nodeId]: removed, ...rest } = executionResults.value
    executionResults.value = rest
    flowEngine.executionResults.delete(nodeId)
  }

  /**
   * Atualiza múltiplos resultados de execução de uma vez
   * Útil para batch updates
   */
  const updateExecutionResults = (updates) => {
    executionResults.value = {
      ...executionResults.value,
      ...updates
    }

    // Sync to FlowEngine
    Object.entries(updates).forEach(([nodeId, result]) => {
      flowEngine.executionResults.set(nodeId, result)
    })
  }

  /**
   * Limpa todos os resultados de execução
   */
  const clearAllExecutionResults = () => {
    executionResults.value = {}
    flowEngine.clearExecutionResults()
  }

  const executeNodeById = async (nodeId) => {
    const node = nodes.value.find(n => n.id === nodeId)
    if (!node) return

    // Gather inputs from connected edges using helper
    const inputs = getNodeDataInputs(nodeId)

    // Verificar se o node tem inputs obrigatórios conectados mas ainda não executados
    const requiredInputs = dataEdges.value.filter(e => e.target === nodeId)
    const hasAllRequiredInputs = requiredInputs.every(edge => {
      return executionResults.value[edge.source] !== undefined
    })

    if (requiredInputs.length > 0 && !hasAllRequiredInputs) {
      return
    }

    try {
      const result = await flowEngine.executeNode(node, inputs)

      // Update node.data with nodeData before extracting outputs
      const nodeWithData = {
        ...node,
        data: nodeData.value[nodeId]
      }

      // Extract outputs mapeados para handles
      const outputs = extractOutputs(nodeWithData, result)

      // Salvar outputs (não o resultado raw) usando setExecutionResult para garantir reatividade
      setExecutionResult(nodeId, outputs)

      // Detect types for dynamic handles
      if (outputs && typeof outputs === 'object') {
        for (const handleId in outputs) {
          if (!handleId.startsWith('exec-')) {
            typeEngine.detectType(nodeId, handleId, outputs[handleId])
          }
        }
        // Export detected types to savedDetectedTypes for reactivity
        savedDetectedTypes.value = typeEngine.exportDetectedTypes()
      }

      // Auto-execute downstream nodes
      // FlowEngine now handles execution flow (including Conditional Branch)
      // This is only for individual node execution, not full flow
      const plan = autoExecEngine.getExecutionPlan(
        nodeId,
        nodes.value,
        edges.value,
        'upstream-execution'
      )

      for (const downstreamNodeId of plan) {
        setTimeout(() => executeNodeById(downstreamNodeId), 100)
      }

      return outputs
    } catch (error) {
      throw error
    }
  }

  const executeFlow = async () => {
    const startTime = Date.now()
    let executionStatus = 'failed'
    let nodesExecutedCount = 0
    let outputData = null

    // 🚀 Helper: Coletar inputData dos Input nodes
    const collectInputData = () => {
      const inputData = {}
      const inputNodes = nodes.value.filter(n => n.type === 'input')

      inputNodes.forEach(node => {
        const data = nodeData.value[node.id] || {}
        const parameters = data.parameters || []

        parameters.forEach(param => {
          // Pegar valor do parâmetro (value ou defaultValue)
          inputData[param.name] = param.value ?? param.defaultValue
        })
      })

      return inputData
    }

    // 🚀 Helper: Coletar outputData do Output node
    const collectOutputData = (allResults) => {
      const outputNodes = nodes.value.filter(n => n.type === 'output')

      if (outputNodes.length === 0) {
        console.warn('⚠️ No Output node found in flow')
        // Fallback: último node executado
        const lastNodeId = Object.keys(allResults)[Object.keys(allResults).length - 1]
        return allResults[lastNodeId]
      }

      const outputNode = outputNodes[0]
      const result = allResults[outputNode.id]

      // Se Output node não foi executado ou não tem resultado,
      // encontrar o último node executado antes dele
      if (!result) {
        // Estratégia 1: Tentar coletar de data edges conectadas ao Output
        const incomingDataEdges = edges.value.filter(e => e.target === outputNode.id && e.edgeType === 'data')
        const collectedData = {}

        incomingDataEdges.forEach(edge => {
          const sourceResult = allResults[edge.source]
          if (sourceResult && edge.sourceHandle) {
            const value = sourceResult[edge.sourceHandle]
            if (value !== undefined) {
              const fieldName = edge.targetHandle || edge.sourceHandle
              collectedData[fieldName] = value
            }
          }
        })

        if (Object.keys(collectedData).length > 0) {
          return collectedData
        }

        // Estratégia 2: Pegar resultado do node conectado via exec edge
        const incomingExecEdges = edges.value.filter(e =>
          e.target === outputNode.id &&
          (e.edgeType === 'flow' || e.sourceHandle?.startsWith('exec-'))
        )

        if (incomingExecEdges.length > 0) {
          const sourceNodeId = incomingExecEdges[0].source
          const sourceResult = allResults[sourceNodeId]
          return sourceResult || null
        }

        return null
      }

      // OutputProcessor retorna { data-out: { /* campos processados */ } }
      // Extrair o objeto processado
      if (result && result['data-out']) {
        return result['data-out']
      }

      return result || null
    }

    // Desabilitar reatividade durante execução completa
    isLoadingFlow.value = true

    try {
      await flowEngine.executeFlow(nodes.value, edges.value)

      // Sync results to Vue state (already processed by extractOutputs in engine)
      const allResults = flowEngine.getAllResults()
      nodesExecutedCount = Object.keys(allResults).length

      // Assign all results at once
      executionResults.value = { ...allResults }

      // Sync execution status (which nodes actually executed)
      executedNodes.value = new Set(flowEngine.getAllExecutedNodes())
      executingNodes.value = new Set(flowEngine.getAllExecutingNodes())
      errorNodes.value = new Set(flowEngine.getAllErrorNodes())

      // Sync globalVariables from FlowEngine (after execution)
      globalVariables.value = { ...flowEngine.globalVariables }

      // Detect all types from execution results
      typeEngine.detectAllTypes(executionResults.value)

      // Export to savedDetectedTypes for file persistence and reactivity
      savedDetectedTypes.value = typeEngine.exportDetectedTypes()

      // 🚀 Coletar outputData corretamente do Output node
      outputData = collectOutputData(allResults)

      executionStatus = 'success'

    } catch (error) {
      console.error('Flow execution error:', error)
      executionStatus = 'failed'
      throw error
    } finally {
      // Re-habilitar reatividade
      isLoadingFlow.value = false

      // Salvar no histórico (somente se conectado à API)
      const executionTime = Date.now() - startTime

      if (apiConfig.value.token && apiConfig.value.flowId) {
        try {
          // 🚀 Coletar inputData dos Input nodes
          const inputData = collectInputData()

          await saveExecutionToHistory({
            flowId: apiConfig.value.flowId,
            status: executionStatus,
            executionTime,
            nodesExecuted: nodesExecutedCount,
            inputData,     // ✅ Dados reais dos Input nodes
            outputData,    // ✅ Dados processados do Output node
            flowSnapshot: {
              totalNodes: nodes.value.length,
              nodes: nodes.value.map(n => ({
                nodeId: n.id,
                type: n.type,
                name: nodeData.value[n.id]?.label || n.type
              }))
            }
          })
          console.log('✅ Execution saved to history')
        } catch (saveError) {
          console.warn('⚠️ Failed to save execution to history:', saveError)
          // Não bloquear execução se falhar ao salvar
        }
      }
    }
  }

  /**
   * Salvar execução do frontend no histórico da API
   * @param {Object} executionData - Dados da execução
   * @returns {Promise<Object>} Resposta da API
   */
  const saveExecutionToHistory = async (executionData) => {
    try {
      const response = await api.post('/executions/save', executionData)
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || error.message || 'Failed to save execution'
      throw new Error(errorMessage)
    }
  }

  /**
   * Executa flow no backend via API
   * @param {String} flowId - ID do flow (opcional, usa apiConfig.flowId se não fornecido)
   * @param {Object} inputData - Dados de entrada
   * @param {Object} options - Opções de execução
   * @returns {Promise<Object>} Resultado da execução
   */
  const executeFlowOnBackend = async (flowId = null, inputData = {}, options = {}) => {
    const targetFlowId = flowId || apiConfig.value.flowId

    if (!targetFlowId) {
      throw new Error('Flow ID não fornecido. Forneça flowId como parâmetro ou configure apiConfig.flowId')
    }

    try {
      const response = await api.post(`/flows/${targetFlowId}/execute`, {
        inputData,
        options: {
          saveResult: options.saveResult || false,
          includeNodeResults: options.includeNodeResults || false,
          timeout: options.timeout || 60000
        }
      })

      if (response.data.success) {
        return response.data.data
      } else {
        throw new Error(response.data.message || 'Erro desconhecido na execução')
      }

    } catch (error) {
      console.error('❌ Erro ao executar flow no backend:', error)
      const errorMessage = error.response?.data?.message || error.message
      throw new Error(errorMessage)
    }
  }

  const executeConnectedNodes = async (sourceNodeId, branchPath = null) => {
    await flowEngine.executeConnectedNodes(
      sourceNodeId,
      nodes.value,
      edges.value,
      branchPath
    )
    executionResults.value = flowEngine.getAllResults()
  }

  const executeNode = async (node, inputs = {}) => {
    try {
      const result = await flowEngine.executeNode(node, inputs)
      setExecutionResult(node.id, result)

      // Detect types for dynamic handles
      if (result && typeof result === 'object') {
        for (const handleId in result) {
          if (!handleId.startsWith('exec-')) {
            typeEngine.detectType(node.id, handleId, result[handleId])
          }
        }
      }

      return result
    } catch (error) {
      throw error
    }
  }

  const propagateDataToTarget = async (edge) => {

    const targetNode = nodes.value.find(n => n.id === edge.target)
    if (!targetNode) {
      return
    }


    // Collect all inputs for the target node
    const targetInputs = getNodeDataInputs(edge.target)

    // Nodes that auto-execute when receiving data
    const autoExecuteTypes = [
      'add', 'subtract', 'multiply', 'divide',
      'variable', 'field-extractor', 'connector', 'input',
      'array-filter', 'array-aggregate', 'array-slice', 'array-sort', 'array-map', 'array-groupby', 'array-distinct', 'array-merge', 'array-create',
      'object-merge', 'object-pick', 'object-keys-values', 'object-rename', 'object-set-property', 'object-to-array', 'object-transform', 'object-create',
      'constant', 'compare', 'type-conversion', 'logic', 'string-ops',
      'debug-viewer'
    ]

    if (autoExecuteTypes.includes(targetNode.type)) {
      try {
        const result = await executeNode(targetNode, targetInputs)

        // Update node.data with nodeData before extracting outputs
        const nodeWithData = {
          ...targetNode,
          data: nodeData.value[targetNode.id]
        }

        const outputs = extractOutputs(nodeWithData, result)

        // Use setExecutionResult to trigger auto-update of Variable GET
        setExecutionResult(edge.target, outputs)

        // Propagate recursively to connected nodes
        const outgoingDataEdges = dataEdges.value.filter(e => e.source === edge.target)

        for (const outEdge of outgoingDataEdges) {
          await propagateDataToTarget(outEdge)
        }
      } catch (error) {
      }
    } else {
    }
  }

  const clearExecutionResults = () => {
    clearAllExecutionResults()
    typeEngine.clearDetectedTypes()
    executingNodes.value = new Set()
    executedNodes.value = new Set()
    errorNodes.value = new Set()
    executionDebounce.value.clear()
    scheduledExecutions.value.clear()
    if (executionTimer) {
      clearTimeout(executionTimer)
      executionTimer = null
    }
  }

  // ========================================
  // REACTIVITY SYSTEM
  // ========================================

  /**
   * Propaga mudanças para nodes downstream automaticamente
   * @param {string} sourceNodeId - Node que teve resultado atualizado
   */
  const propagateToDownstream = async (sourceNodeId) => {
    // Não propagar durante carregamento inicial
    if (isLoadingFlow.value) return

    // Debounce para evitar múltiplas execuções
    if (executionDebounce.value.has(sourceNodeId)) {
      clearTimeout(executionDebounce.value.get(sourceNodeId))
    }

    const timer = setTimeout(async () => {
      const plan = autoExecEngine.getExecutionPlan(
        sourceNodeId,
        nodes.value,
        edges.value,
        'upstream-execution'
      )

      for (const nodeId of plan) {
        await executeNodeById(nodeId)
      }

      executionDebounce.value.delete(sourceNodeId)
    }, autoExecEngine.getDelay())

    executionDebounce.value.set(sourceNodeId, timer)
  }

  /**
   * Agenda execução de um node com debounce inteligente
   * @param {string} nodeId - Node a executar
   */
  const scheduleExecution = (nodeId) => {
    scheduledExecutions.value.add(nodeId)

    if (executionTimer) clearTimeout(executionTimer)

    executionTimer = setTimeout(async () => {
      const toExecute = Array.from(scheduledExecutions.value)
      scheduledExecutions.value.clear()

      // Executar em ordem (sem propagação automática para evitar duplicação)
      for (const id of toExecute) {
        await executeNodeById(id)
      }

      executionTimer = null
    }, 300)
  }

  /**
   * Executa nodes fonte (sem data inputs) automaticamente
   * Chamado após loadFlow para inicializar valores
   */
  const executeSourceNodes = async () => {
    // Encontrar nodes sem data inputs que devem auto-executar
    const sourceNodes = nodes.value.filter(node => {
      const hasDataInput = dataEdges.value.some(e => e.target === node.id)
      const shouldAutoExec = autoExecEngine.shouldAutoExecuteOnCreate(node.type)

      // Só executar se NÃO tem data input E deve auto-executar
      return !hasDataInput && shouldAutoExec
    })

    // Executar cada source node
    for (const node of sourceNodes) {
      try {
        await executeNodeById(node.id)
      } catch (error) {
        console.error(`Error executing source node ${node.id}:`, error)
      }
    }
  }

  // 🚀 OTIMIZAÇÃO REMOVIDA: Watch de executionResults movido para setExecutionResult()
  // Isso evita falsos positivos e melhora performance ao mover nodes
  // A propagação agora é explícita e controlada em setExecutionResult()

  // ========================================
  // FILE OPERATIONS
  // ========================================
  const saveFlow = () => {
    const detectedTypes = typeEngine.exportDetectedTypes()

    const flowData = {
      nodes: nodes.value,
      edges: edges.value,
      nodeData: nodeData.value,
      detectedTypes,
      timestamp: new Date().toISOString(),
      version: '2.0' // Incremented version
    }

    const dataStr = JSON.stringify(flowData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = `flow-forge-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return flowData
  }

  const loadFlow = (flowData) => {
    try {
      if (!flowData.nodes || !flowData.edges) {
        throw new Error('Invalid flow data format')
      }

      // Marcar que estamos carregando (desabilita reatividade temporariamente)
      isLoadingFlow.value = true

      clearExecutionResults()
      nodes.value = []
      edges.value = []
      nodeData.value = {}
      globalVariables.value = {}

      nodeData.value = { ...flowData.nodeData || {} }

      // Load detected types into TypeEngine
      if (flowData.detectedTypes) {
        typeEngine.loadDetectedTypes(flowData.detectedTypes)
        savedDetectedTypes.value = flowData.detectedTypes
      }

      setTimeout(() => {
        nodes.value = flowData.nodes.map(node => ({ ...node }))
        edges.value = flowData.edges.map(edge => ({ ...edge }))

        // 🚀 NOVO: Inicializar lastSavedState após carregar flow
        lastSavedState.value = {
          nodes: nodes.value.map(n => ({
            id: n.id,
            type: n.type,
            position: { x: n.position.x, y: n.position.y }
          })),
          edges: edges.value.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle,
            targetHandle: e.targetHandle
          })),
          nodeData: deepClone(nodeData.value)
        }

        // Auto-executar nodes fonte após carregar
        setTimeout(async () => {
          isLoadingFlow.value = false
          await executeSourceNodes()
        }, 200)
      }, 100)

    } catch (error) {
      isLoadingFlow.value = false
      throw error
    }
  }

  // ========================================
  // API SYNC (Simplified)
  // ========================================
  const syncToAPI = async () => {
    if (!apiConfig.value.flowDataId) return

    try {
      syncStatus.value = 'syncing'

      const flowData = {
        nodes: nodes.value,
        edges: edges.value,
        nodeData: nodeData.value,
        detectedTypes: typeEngine.exportDetectedTypes()
      }

      await api.put(`/flow-data/${apiConfig.value.flowDataId}`, {
        data: flowData
      })

      syncStatus.value = 'synced'
      lastSyncError.value = null

      // 🚀 Marcar como salvo e atualizar estado de referência
      hasUnsavedChanges.value = false
      lastSavedState.value = {
        nodes: nodes.value.map(n => ({
          id: n.id,
          type: n.type,
          position: { x: n.position.x, y: n.position.y }
        })),
        edges: edges.value.map(e => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle
        })),
        nodeData: deepClone(nodeData.value)
      }
    } catch (error) {
      syncStatus.value = 'error'
      lastSyncError.value = error.response?.data?.message || error.message
    }
  }

  const loadFromAPI = async (flowDataId) => {
    try {
      const response = await api.get(`/flow-data/${flowDataId}`)
      loadFlow(response.data.flowData)

      apiConfig.value.flowDataId = flowDataId
      syncStatus.value = 'synced'
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Load failed'
      throw new Error(errorMessage)
    }
  }

  // ========================================
  // INITIALIZATION
  // ========================================

  // 🚀 NOVO: Criar Input e Output nodes iniciais conectados
  const createInitialNodes = () => {
    const inputId = `input_${Date.now()}`
    const outputId = `output_${Date.now() + 1}`

    const inputNode = {
      id: inputId,
      type: 'input',
      position: { x: 100, y: 200 },
      data: { label: 'Input' }
    }

    const outputNode = {
      id: outputId,
      type: 'output',
      position: { x: 500, y: 200 },
      data: { label: 'Output' }
    }

    // Adicionar nodes
    nodes.value = [inputNode, outputNode]
    nodeData.value = {
      [inputId]: {},
      [outputId]: {}
    }

    // Conectar exec-out do Input com exec-in do Output
    const edge = {
      id: `${inputId}-${outputId}`,
      source: inputId,
      target: outputId,
      sourceHandle: 'exec-out',
      targetHandle: 'exec-in',
      edgeType: 'flow'
    }

    edges.value = [edge]

    saveSnapshot()
  }

  const initialize = async () => {
    const types = await loadDataTypes()
    dataTypes.value = types
    flowEngine.setConfig(apiConfig.value, globalVariables.value)

    // Input e Output iniciais agora vêm da API ao criar flow
    // createInitialNodes() mantido como fallback para modo offline
  }

  const initializeFromUrl = () => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const urlFlowId = urlParams.get('flowId')

    // Get token from localStorage (compartilhado com CMS)
    const token = localStorage.getItem('accessToken')

    // FlowId sempre vem da URL
    const flowId = urlFlowId

    // Use credentials if available
    if (token && flowId) {
      apiConfig.value.token = token
      apiConfig.value.flowId = flowId

      // Automatically load the flow data
      fetchFlowData()
    } else {
      syncStatus.value = 'offline'
    }
  }

  const fetchFlowData = async () => {
    if (!apiConfig.value.token || !apiConfig.value.flowId) {
      syncStatus.value = 'offline'
      return false
    }

    syncStatus.value = 'syncing'

    try {
      const response = await api.get(`/flow-data/by-flow/${apiConfig.value.flowId}`)

      if (response.data.success && response.data.data) {
        const result = response.data
        apiConfig.value.flowDataId = result.data._id

        // Load the flow data if it exists
        if (result.data.data && result.data.data.nodes && result.data.data.edges) {
          const flowData = {
            nodes: result.data.data.nodes,
            edges: result.data.data.edges,
            nodeData: result.data.data.nodeData || {},
            detectedTypes: result.data.data.detectedTypes || {},
            variables: result.data.data.variables || {}
          }

          // Load the flow
          loadFlow(flowData)

          // Load global variables if they exist
          if (result.data.data.variables) {
            Object.assign(globalVariables.value, result.data.data.variables)
          }
        } else {
          // Flow exists but has no data yet (empty flow)
          clearExecutionResults()
        }

        syncStatus.value = 'synced'

        // Setup auto-save
        enableAutoSave()

        return true
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      // Handle 401/403 errors (authentication issues)
      if (error.response?.status === 401 || error.response?.status === 403) {
        syncStatus.value = 'error'
        lastSyncError.value = 'Authentication failed'
        return false
      }

      syncStatus.value = 'error'
      lastSyncError.value = error.response?.data?.message || error.message
      return false
    }
  }

  const enableAutoSave = () => {
    // 🚀 NOVO SISTEMA: Auto-save a cada 2 minutos apenas se houver mudanças

    // Intervalo fixo de 2 minutos que verifica e salva se necessário
    autoSaveIntervalId = setInterval(async () => {
      // Só salvar se houver mudanças pendentes E estiver conectado
      if (hasUnsavedChanges.value && apiConfig.value.flowDataId && syncStatus.value !== 'syncing') {
        console.log('🔄 Auto-save: salvando mudanças pendentes...')
        await syncToAPI()
      }
    }, AUTO_SAVE_INTERVAL)

    // Watch simples para MARCAR mudanças (sem salvar automaticamente)
    // Isso apenas sinaliza que há mudanças pendentes
    let changeDetectionTimeout = null

    watch([nodes, edges, nodeData], () => {
      // 🚀 OTIMIZAÇÃO: Debounce para evitar falsos positivos (ex: ao clicar em node)
      if (changeDetectionTimeout) clearTimeout(changeDetectionTimeout)

      changeDetectionTimeout = setTimeout(() => {
        // Só marcar se ainda não foi marcado
        if (!isLoadingFlow.value &&
            lastSavedState.value !== null &&
            !hasUnsavedChanges.value) {

          // 🔍 VALIDAÇÃO EXTRA: Comparar se realmente mudou algo
          // Normalizar nodeData para comparação (ordenar chaves, remover undefined)
          const normalizeNodeData = (data) => {
            const normalized = {}
            Object.keys(data).sort().forEach(key => {
              const value = data[key]
              if (value !== undefined && value !== null) {
                // Se for objeto, ordenar recursivamente
                if (typeof value === 'object' && !Array.isArray(value)) {
                  normalized[key] = normalizeNodeData(value)
                } else {
                  normalized[key] = value
                }
              }
            })
            return normalized
          }

          const currentState = {
            nodes: nodes.value.map(n => ({ id: n.id, type: n.type, x: Math.round(n.position.x), y: Math.round(n.position.y) })),
            edges: edges.value.map(e => ({ id: e.id, s: e.source, t: e.target, sh: e.sourceHandle, th: e.targetHandle })),
            nodeData: normalizeNodeData(nodeData.value)
          }

          const savedState = {
            nodes: lastSavedState.value.nodes.map(n => ({ id: n.id, type: n.type, x: Math.round(n.position.x), y: Math.round(n.position.y) })),
            edges: lastSavedState.value.edges.map(e => ({ id: e.id, s: e.source, t: e.target, sh: e.sourceHandle, th: e.targetHandle })),
            nodeData: normalizeNodeData(lastSavedState.value.nodeData)
          }

          const currentHash = JSON.stringify(currentState)
          const savedHash = JSON.stringify(savedState)

          if (currentHash !== savedHash) {
            hasUnsavedChanges.value = true
          }
        }
      }, 300) // 300ms de debounce
    }, { deep: true })
  }

  // ========================================
  // EXPORTS
  // ========================================
  return {
    // Engines (for advanced usage)
    flowEngine,
    typeEngine,
    autoExecEngine,

    // State
    nodes,
    edges,
    nodeData,
    executionResults,
    executingNodes,
    executedNodes,
    errorNodes,
    savedDetectedTypes,
    globalVariables,
    dataTypes,
    isDragging,
    apiConfig,
    syncStatus,
    lastSyncError,
    hasUnsavedChanges,

    // Computed
    flowEdges,
    dataEdges,
    nodeCatalog,
    flowValidation,

    // Node Operations
    addNode,
    removeNode,
    updateNodePosition,
    setDragging,
    updateNodeData,

    // Edge Operations
    addEdge,
    removeEdge,

    // Execution
    executeNode,
    executeNodeById,
    executeFlow,
    executeFlowOnBackend,
    saveExecutionToHistory,
    executeConnectedNodes,
    propagateDataToTarget,
    clearExecutionResults,
    getNodeDataInputs,

    // Execution Results Management (reactive)
    setExecutionResult,
    removeExecutionResult,
    updateExecutionResults,
    clearAllExecutionResults,

    // Reactivity
    propagateToDownstream,
    scheduleExecution,
    executeSourceNodes,
    isLoadingFlow,

    // File Operations
    saveFlow,
    loadFlow,

    // API Sync
    syncToAPI,
    loadFromAPI,

    // Undo/Redo
    undo,
    redo,
    saveSnapshot,

    // Initialization
    initialize,
    initializeFromUrl,
    fetchFlowData
  }
})
