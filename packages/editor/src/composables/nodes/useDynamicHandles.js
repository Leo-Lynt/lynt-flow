import { computed } from 'vue'
import { useFlowStore } from '../../stores/flowStore'

/**
 * Sanitize handle ID to ensure it's valid for VueFlow
 * Removes/replaces special characters that could break CSS selectors or HTML attributes
 */
function sanitizeHandleId(id) {
  if (!id) return id

  return id
    .replace(/\s+/g, '_')        // Replace spaces with underscores
    .replace(/[+\-*/=<>!@#$%^&*()[\]{}|\\;:'",<>?`~]/g, '_')  // Replace special chars with underscores
    .replace(/_{2,}/g, '_')      // Replace multiple underscores with single
    .replace(/^_|_$/g, '')       // Remove leading/trailing underscores
}

/**
 * Composable for dynamic handle generation
 */
export function useDynamicHandles(nodeId, nodeType) {
  const flowStore = useFlowStore()

  const dynamicHandles = computed(() => {
    const node = flowStore.nodes.find(n => n.id === nodeId)
    if (!node) return []

    const nodeData = flowStore.nodeData[nodeId]
    if (!nodeData) return []

    const handles = []
    const type = nodeType.value || nodeType

    // Field Extractor: Create handles for each selected field
    if (type === 'field-extractor') {
      const selectedFields = nodeData.selectedFields || []
      const fieldOutputsEnabled = nodeData.fieldOutputsEnabled || {}
      const fieldTypes = nodeData.fieldTypes || {}

      // IMPORTANTE: Adicionar data-out como handle principal
      // Detectar tipo baseado no input conectado
      let dataOutType = 'any'

      // Tentar detectar tipo do input
      const inputEdges = flowStore.edges.filter(e =>
        e.target === nodeId &&
        e.targetHandle === 'data-input' &&
        e.edgeType !== 'flow'
      )

      if (inputEdges.length > 0) {
        const sourceOutputs = flowStore.executionResults[inputEdges[0].source]
        if (sourceOutputs && inputEdges[0].sourceHandle in sourceOutputs) {
          const inputData = sourceOutputs[inputEdges[0].sourceHandle]
          if (Array.isArray(inputData)) {
            dataOutType = 'array'
          } else if (typeof inputData === 'object' && inputData !== null) {
            dataOutType = 'object'
          }
        }
      }

      // Handle principal data-out
      handles.push({
        id: 'data-out',
        label: 'Extracted Data',
        type: dataOutType,
        position: 'right'
      })

      // If multiple fields selected, add "all extracted data" handle at the top
      if (selectedFields.length > 1) {
        handles.push({
          id: 'all-data',
          label: 'All Extracted Data',
          type: 'object',
          position: 'right'
        })
      }

      // Add individual handles for each selected field (only if enabled)
      selectedFields.forEach(field => {
        const handleId = `field-${sanitizeHandleId(field)}`
        const isEnabled = fieldOutputsEnabled[field] !== false // Default to true if not set
        const fieldType = fieldTypes[field] || 'any'

        if (isEnabled) {
          handles.push({
            id: handleId,
            label: field,
            type: fieldType,
            position: 'right'
          })
        }
      })
    }

    // Output Node: Create handles for dynamic inputs
    if (type === 'output') {
      // Use dynamicHandles if defined in nodeData
      const dynamicInputs = nodeData.dynamicInputs || []
      const dynamicHandlesData = nodeData.dynamicHandles?.inputs || []
      // Add dependency on _updated to ensure reactivity
      const _updated = nodeData.dynamicHandles?._updated

      // Prefer dynamicHandles.inputs (updated by OutputProperties)
      if (dynamicHandlesData.length > 0) {
        dynamicHandlesData.forEach(handle => {
          handles.push({
            ...handle,
            position: 'left'
          })
        })
      } else if (dynamicInputs.length > 0) {
        // Fallback to dynamicInputs
        dynamicInputs.forEach((input) => {
          if (input.key) { // Only add handles with valid keys
            handles.push({
              id: `data-${sanitizeHandleId(input.key)}`,
              label: input.key,
              type: input.type || 'any',
              position: 'left'
            })
          }
        })
      }
    }

    // Array Merge Node: Create handles for dynamic array inputs
    if (type === 'array-merge') {
      const dynamicHandlesData = nodeData.dynamicHandles?.inputs || []

      // Use dynamicHandles.inputs (updated by ArrayMergeProperties)
      if (dynamicHandlesData.length > 0) {
        dynamicHandlesData.forEach(handle => {
          handles.push({
            ...handle,
            position: 'left'
          })
        })
      } else {
        // Fallback to arrayInputs
        const arrayInputs = nodeData.arrayInputs || [
          { id: 'array1', label: 'Array 1' },
          { id: 'array2', label: 'Array 2' }
        ]

        arrayInputs.forEach((input) => {
          handles.push({
            id: `data-${input.id}`,
            label: input.label || input.id,
            type: 'array',
            position: 'left',
            required: false
          })
        })
      }
    }

    // Object Create Node: Create handles for dynamic properties
    if (type === 'object-create') {
      const dynamicHandlesData = nodeData.dynamicHandles?.inputs || []

      if (dynamicHandlesData.length > 0) {
        dynamicHandlesData.forEach(handle => {
          handles.push({
            ...handle,
            position: 'left'
          })
        })
      } else {
        // Fallback to properties
        const properties = nodeData.properties || [
          { id: 'prop1', key: 'key1' }
        ]

        properties.forEach((prop) => {
          handles.push({
            id: `data-${prop.id}`,
            label: prop.key || prop.id,
            type: 'any',
            position: 'left',
            required: false
          })
        })
      }
    }

    // Array Create Node: Create handles for dynamic items
    if (type === 'array-create') {
      const dynamicHandlesData = nodeData.dynamicHandles?.inputs || []

      if (dynamicHandlesData.length > 0) {
        dynamicHandlesData.forEach(handle => {
          handles.push({
            ...handle,
            position: 'left'
          })
        })
      } else {
        // Fallback to items
        const items = nodeData.items || [
          { id: 'item1', label: 'Item 1' }
        ]

        items.forEach((item) => {
          handles.push({
            id: `data-${item.id}`,
            label: item.label || item.id,
            type: 'any',
            position: 'left',
            required: false
          })
        })
      }
    }

    // Input Node: Create handles for parameters
    if (type === 'input') {
      const parameters = nodeData.parameters || []

      parameters.forEach((param, index) => {
        handles.push({
          id: `param-output-${index}`,
          label: param.name || `Parameter ${index + 1}`,
          type: param.type || 'any',
          position: 'right',
          required: param.required || false
        })
      })
    }

    // String Operations (Template mode): Create handles for template placeholders
    if (type === 'string-ops' && nodeData.operation === 'template') {
      const templateString = nodeData.templateString || ''

      // Parse placeholders: {name}, {age}, etc.
      const placeholderRegex = /\{([^}]+)\}/g
      const placeholders = new Set()
      let match

      while ((match = placeholderRegex.exec(templateString)) !== null) {
        placeholders.add(match[1]) // Extract placeholder name without braces
      }

      // Create input handle for each unique placeholder
      placeholders.forEach(placeholder => {
        handles.push({
          id: placeholder, // Use placeholder name as handle ID (without "data-" prefix)
          label: placeholder,
          type: 'any', // Accept any type, will be converted to string
          position: 'left',
          required: false
        })
      })
    }

    // Exposed Fields: Create input handles for exposed config fields (all nodes except Input)
    if (type !== 'input' && nodeData.exposedFields) {
      Object.entries(nodeData.exposedFields).forEach(([fieldKey, fieldMeta]) => {
        handles.push({
          id: `exposed-${fieldKey}`,
          label: fieldMeta.label || fieldKey,
          type: fieldMeta.type || 'any',
          position: 'left',
          required: fieldMeta.required || false
        })
      })
    }

    return handles
  })

  return {
    dynamicHandles
  }
}
