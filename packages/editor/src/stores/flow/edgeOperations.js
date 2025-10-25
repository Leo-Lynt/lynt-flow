import { generateId } from './utils'

/**
 * Edge operations module for flowStore
 */
export function createEdgeOperations(state) {
  const addEdge = (edge) => {
    if (!edge.id) {
      edge.id = generateId()
    }

    // Ensure edge has required properties
    const newEdge = {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      edgeType: edge.edgeType || 'data',
      animated: edge.animated || false,
      style: edge.style || {},
      markerEnd: edge.markerEnd || {}
    }

    // Prevent duplicate connections
    const exists = state.edges.value.some(
      e =>
        e.source === newEdge.source &&
        e.target === newEdge.target &&
        e.sourceHandle === newEdge.sourceHandle &&
        e.targetHandle === newEdge.targetHandle
    )

    if (!exists) {
      state.edges.value.push(newEdge)
    }

    return newEdge
  }

  const removeEdge = (edgeId) => {
    const index = state.edges.value.findIndex(e => e.id === edgeId)
    if (index !== -1) {
      state.edges.value.splice(index, 1)
    }
  }

  const updateEdge = (edgeId, updates) => {
    const edge = state.edges.value.find(e => e.id === edgeId)
    if (edge) {
      Object.assign(edge, updates)
    }
  }

  const getEdge = (edgeId) => {
    return state.edges.value.find(e => e.id === edgeId)
  }

  const getIncomingEdges = (nodeId, handleId = null) => {
    return state.edges.value.filter(e => {
      if (handleId) {
        return e.target === nodeId && e.targetHandle === handleId
      }
      return e.target === nodeId
    })
  }

  const getOutgoingEdges = (nodeId, handleId = null) => {
    return state.edges.value.filter(e => {
      if (handleId) {
        return e.source === nodeId && e.sourceHandle === handleId
      }
      return e.source === nodeId
    })
  }

  return {
    addEdge,
    removeEdge,
    updateEdge,
    getEdge,
    getIncomingEdges,
    getOutgoingEdges
  }
}
