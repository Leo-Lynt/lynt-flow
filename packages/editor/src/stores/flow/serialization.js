/**
 * Flow serialization module for flowStore
 */
import { detectValueType } from '@leo-lynt/lynt-flow-core/engine/dataTypes.js'

export function createSerializationModule(state) {
  const serializeFlow = () => {
    // Detectar e salvar tipos dinâmicos de outputs
    const detectedTypes = {}
    for (const nodeId in state.executionResults.value) {
      const nodeResults = state.executionResults.value[nodeId]
      detectedTypes[nodeId] = {}

      // Para cada output, detectar o tipo
      for (const handleId in nodeResults) {
        if (handleId.startsWith('exec-')) continue // Ignorar exec handles

        const value = nodeResults[handleId]
        const type = detectValueType(value)
        detectedTypes[nodeId][handleId] = type
      }
    }

    return {
      nodes: state.nodes.value.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: state.nodeData.value[node.id] || {}
      })),
      edges: state.edges.value.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        edgeType: edge.edgeType
      })),
      globalVariables: state.globalVariables.value,
      detectedTypes, // ⭐ Salvar tipos detectados
      version: '1.1' // ⭐ Versão do formato
    }
  }

  const deserializeFlow = (flowData) => {
    if (!flowData) return

    // Clear current state
    state.nodes.value = []
    state.edges.value = []
    state.nodeData.value = {}
    state.executionResults.value = {}
    state.savedDetectedTypes.value = {} // ⭐ Limpar tipos salvos

    // Load nodes
    if (flowData.nodes) {
      flowData.nodes.forEach(node => {
        state.nodes.value.push({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data || {},
          selected: false
        })

        // Initialize node data
        state.nodeData.value[node.id] = node.data || {}
      })
    }

    // Load edges
    if (flowData.edges) {
      flowData.edges.forEach(edge => {
        const isFlowConnection = edge.edgeType === 'flow'

        state.edges.value.push({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          edgeType: edge.edgeType || 'data',
          animated: isFlowConnection,
          style: {
            stroke: isFlowConnection ? '#9ca3af' : '#3b82f6',
            strokeWidth: isFlowConnection ? 3 : 2.5
          },
          markerEnd: {
            type: 'arrowclosed',
            width: isFlowConnection ? 10 : 8,
            height: isFlowConnection ? 10 : 8,
            color: isFlowConnection ? '#9ca3af' : '#3b82f6'
          }
        })
      })
    }

    // Load global variables
    if (flowData.globalVariables) {
      state.globalVariables.value = flowData.globalVariables
    }

    // ⭐ Carregar tipos detectados salvos (se disponível)
    if (flowData.detectedTypes) {
      state.savedDetectedTypes.value = { ...flowData.detectedTypes }
      console.log('📦 Loaded saved detected types:', state.savedDetectedTypes.value)
    }
  }

  const exportFlow = () => {
    const flowData = serializeFlow()
    const jsonString = JSON.stringify(flowData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `flow-${Date.now()}.json`
    link.click()

    URL.revokeObjectURL(url)
  }

  const importFlow = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const flowData = JSON.parse(e.target.result)
          deserializeFlow(flowData)
          resolve(flowData)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }

  return {
    serializeFlow,
    deserializeFlow,
    exportFlow,
    importFlow
  }
}
