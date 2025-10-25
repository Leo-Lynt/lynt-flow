/**
 * Utilitários compartilhados
 */

/**
 * Generate unique ID
 */
export function generateId() {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get unique edge ID
 */
export function getEdgeId(source, sourceHandle, target, targetHandle) {
  return `e${source}-${sourceHandle}-${target}-${targetHandle}`
}
