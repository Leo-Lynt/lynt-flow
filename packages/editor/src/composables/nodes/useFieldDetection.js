import { computed } from 'vue'
import { useFlowStore } from '../../stores/flowStore'
import { detectValueType } from '@leo-lynt/lynt-flow-core/engine/dataTypes.js'
import { getFieldValue } from '@leo-lynt/lynt-flow-core/utils'

/**
 * Composable for field detection and type inference
 */
export function useFieldDetection(nodeId) {
  const flowStore = useFlowStore()

  /**
   * Get available fields from connected input data
   */
  const availableFields = computed(() => {
    const node = flowStore.nodes.find(n => n.id === nodeId.value)
    if (!node) return []

    // Find incoming data edges
    const incomingEdges = flowStore.edges.filter(e =>
      e.target === nodeId.value &&
      e.targetHandle === 'data-input' &&
      e.edgeType !== 'flow'
    )

    if (incomingEdges.length === 0) return []

    // Get data from source node
    const sourceEdge = incomingEdges[0]
    const sourceResult = flowStore.executionResults[sourceEdge.source]

    if (!sourceResult) return []

    // Extract field names from the result
    return extractFieldNames(sourceResult)
  })

  /**
   * Extract field names and types from data object
   */
  const extractFieldNames = (data, prefix = '') => {
    const fields = []

    if (!data || typeof data !== 'object') return fields

    // If it's an array, use first item as template
    if (Array.isArray(data)) {
      if (data.length > 0) {
        return extractFieldNames(data[0], prefix)
      }
      return fields
    }

    // Extract all keys
    for (const key in data) {
      const fullPath = prefix ? `${prefix}.${key}` : key
      fields.push(fullPath)

      // Recursively extract nested fields (one level deep only)
      if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
        const nestedFields = extractFieldNames(data[key], fullPath)
        fields.push(...nestedFields)
      }
    }

    return fields
  }

  /**
   * Detect type of a field from source data
   */
  const detectFieldType = (fieldPath) => {
    const node = flowStore.nodes.find(n => n.id === nodeId.value)
    if (!node) return 'any'

    // Find incoming data edges
    const incomingEdges = flowStore.edges.filter(e =>
      e.target === nodeId.value &&
      e.targetHandle === 'data-input' &&
      e.edgeType !== 'flow'
    )

    if (incomingEdges.length === 0) return 'any'

    // Get data from source node
    const sourceEdge = incomingEdges[0]
    const sourceResult = flowStore.executionResults[sourceEdge.source]

    if (!sourceResult) return 'any'

    // Get field value
    const fieldValue = getFieldValue(sourceResult, fieldPath)

    // Detect and return type
    return detectValueType(fieldValue)
  }


  return {
    availableFields,
    detectFieldType,
    getFieldValue, // Re-exported from fieldUtils
  }
}
