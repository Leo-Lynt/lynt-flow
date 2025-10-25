import { generateId } from './utils'

/**
 * Node operations module for flowStore
 */
export function createNodeOperations(state) {
  const addNode = (node) => {
    if (!node.id) {
      node.id = generateId()
    }

    // Ensure node has required properties
    const newNode = {
      id: node.id,
      type: node.type,
      position: node.position || { x: 0, y: 0 },
      data: node.data || {},
      selected: node.selected || false
    }

    state.nodes.value.push(newNode)

    // Initialize node data
    if (!state.nodeData.value[newNode.id]) {
      state.nodeData.value[newNode.id] = { ...newNode.data }
    }

    return newNode
  }

  const removeNode = (nodeId) => {
    const index = state.nodes.value.findIndex(n => n.id === nodeId)
    if (index !== -1) {
      state.nodes.value.splice(index, 1)
    }

    // Remove node data
    delete state.nodeData.value[nodeId]
    delete state.executionResults.value[nodeId]

    // Remove connected edges
    state.edges.value = state.edges.value.filter(
      edge => edge.source !== nodeId && edge.target !== nodeId
    )
  }

  const updateNode = (nodeId, updates) => {
    const node = state.nodes.value.find(n => n.id === nodeId)
    if (node) {
      Object.assign(node, updates)
    }
  }

  const updateNodeData = (nodeId, data) => {
    if (!state.nodeData.value[nodeId]) {
      state.nodeData.value[nodeId] = {}
    }
    Object.assign(state.nodeData.value[nodeId], data)

    // Also update node.data for consistency
    const node = state.nodes.value.find(n => n.id === nodeId)
    if (node) {
      node.data = { ...node.data, ...data }
    }
  }

  const getNode = (nodeId) => {
    return state.nodes.value.find(n => n.id === nodeId)
  }

  const getNodeData = (nodeId) => {
    return state.nodeData.value[nodeId] || {}
  }

  return {
    addNode,
    removeNode,
    updateNode,
    updateNodeData,
    getNode,
    getNodeData
  }
}
