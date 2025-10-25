/**
 * TypeEngine - Pure JavaScript Type System
 * Manages type detection, validation, and dynamic types
 * Safe for Node.js and browser environments
 */

import { detectValueType } from './dataTypes.js'
import { getHandleType } from './typeSystem.js'

/**
 * TypeEngine handles all type-related operations
 */
export class TypeEngine {
  constructor() {
    // Stored detected types: nodeId -> handleId -> type
    this.detectedTypes = new Map()
  }

  /**
   * Detect type from execution result
   * @param {string} nodeId - Node ID
   * @param {string} handleId - Handle ID
   * @param {any} value - Value to detect type from
   * @returns {string} Detected type
   */
  detectType(nodeId, handleId, value) {
    const type = detectValueType(value)

    // Store detected type
    if (!this.detectedTypes.has(nodeId)) {
      this.detectedTypes.set(nodeId, new Map())
    }
    this.detectedTypes.get(nodeId).set(handleId, type)

    return type
  }

  /**
   * Detect all types from execution results
   * @param {Object} executionResults - Map of nodeId -> results
   * @returns {Object} Detected types
   */
  detectAllTypes(executionResults) {
    const allTypes = {}

    for (const [nodeId, nodeResults] of Object.entries(executionResults)) {
      if (!nodeResults || typeof nodeResults !== 'object') continue

      allTypes[nodeId] = {}

      for (const handleId in nodeResults) {
        // Skip exec handles
        if (handleId.startsWith('exec-')) continue

        const value = nodeResults[handleId]
        const type = this.detectType(nodeId, handleId, value)
        allTypes[nodeId][handleId] = type
      }
    }

    return allTypes
  }

  /**
   * Get detected type for a specific handle
   * @param {string} nodeId - Node ID
   * @param {string} handleId - Handle ID
   * @returns {string|null} Detected type or null
   */
  getDetectedType(nodeId, handleId) {
    const nodeTypes = this.detectedTypes.get(nodeId)
    if (!nodeTypes) return null
    return nodeTypes.get(handleId) || null
  }

  /**
   * Get all detected types for a node
   * @param {string} nodeId - Node ID
   * @returns {Object} Detected types for all handles
   */
  getNodeDetectedTypes(nodeId) {
    const nodeTypes = this.detectedTypes.get(nodeId)
    if (!nodeTypes) return {}
    return Object.fromEntries(nodeTypes)
  }

  /**
   * Load saved detected types
   * @param {Object} savedTypes - Saved types object
   */
  loadDetectedTypes(savedTypes) {
    this.detectedTypes.clear()

    for (const nodeId in savedTypes) {
      const nodeTypes = new Map()
      for (const handleId in savedTypes[nodeId]) {
        nodeTypes.set(handleId, savedTypes[nodeId][handleId])
      }
      this.detectedTypes.set(nodeId, nodeTypes)
    }

  }

  /**
   * Export detected types for saving
   * @returns {Object} Detected types as plain object
   */
  exportDetectedTypes() {
    const exported = {}

    for (const [nodeId, nodeTypes] of this.detectedTypes) {
      exported[nodeId] = Object.fromEntries(nodeTypes)
    }

    return exported
  }

  /**
   * Clear all detected types
   */
  clearDetectedTypes() {
    this.detectedTypes.clear()
  }

  /**
   * Get handle type (with dynamic type support)
   * @param {Object} node - Node instance
   * @param {Object} handle - Handle definition
   * @param {Object} nodeData - Node configuration data
   * @returns {string} Handle type
   */
  getHandleType(node, handle, nodeData = {}) {
    // Check if there's a detected type for this handle
    const detectedType = this.getDetectedType(node.id, handle.id)

    if (detectedType) {
      return detectedType
    }

    // Fall back to static type from definition
    return getHandleType(node, handle, nodeData)
  }

  /**
   * Validate type compatibility
   * @param {string} sourceType - Source handle type
   * @param {string} targetType - Target handle type
   * @returns {boolean} True if compatible
   */
  isTypeCompatible(sourceType, targetType) {
    // 'any' is compatible with everything
    if (sourceType === 'any' || targetType === 'any') return true

    // Exact match
    if (sourceType === targetType) return true

    // Check if both are numeric types
    const numericTypes = ['number', 'integer', 'float']
    if (numericTypes.includes(sourceType) && numericTypes.includes(targetType)) {
      return true
    }

    // Array type compatibility
    if (sourceType.startsWith('array') && targetType === 'array') return true
    if (sourceType === 'array' && targetType.startsWith('array')) return true

    // Object type compatibility
    if (sourceType.startsWith('object') && targetType === 'object') return true
    if (sourceType === 'object' && targetType.startsWith('object')) return true

    return false
  }

  /**
   * Get type color for visual representation
   * @param {string} type - Type name
   * @returns {string} Color hex code
   */
  getTypeColor(type) {
    const typeColors = {
      string: '#10b981',    // green
      number: '#3b82f6',    // blue
      integer: '#3b82f6',   // blue
      float: '#3b82f6',     // blue
      boolean: '#f59e0b',   // amber
      array: '#8b5cf6',     // purple
      object: '#ec4899',    // pink
      date: '#14b8a6',      // teal
      any: '#6b7280',       // gray
      exec: '#ef4444',      // red
      null: '#6b7280'       // gray
    }

    // Handle array<type> and object<type> patterns
    if (type.startsWith('array')) return typeColors.array
    if (type.startsWith('object')) return typeColors.object

    return typeColors[type] || typeColors.any
  }

  /**
   * Infer type from input values
   * @param {Object} inputs - Input values
   * @returns {string} Inferred type
   */
  inferTypeFromInputs(inputs) {
    if (!inputs || Object.keys(inputs).length === 0) {
      return 'any'
    }

    // Get first input value
    const firstInput = Object.values(inputs)[0]
    return detectValueType(firstInput)
  }

  /**
   * Get type statistics for debugging
   * @returns {Object} Type statistics
   */
  getTypeStats() {
    const stats = {
      totalNodes: this.detectedTypes.size,
      totalHandles: 0,
      typeDistribution: {}
    }

    for (const nodeTypes of this.detectedTypes.values()) {
      stats.totalHandles += nodeTypes.size

      for (const type of nodeTypes.values()) {
        stats.typeDistribution[type] = (stats.typeDistribution[type] || 0) + 1
      }
    }

    return stats
  }
}
