/**
 * Node Factory
 * Creates nodes with default configuration based on node type
 */
import { useFlowStore } from '../stores/flowStore'

export function createNodeFromType(type, position) {
  const flowStore = useFlowStore()

  const baseNode = {
    id: `${type}_${Date.now()}`,
    type,
    position,
    data: {}
  }

  switch (type) {
    case 'input':
      baseNode.data = {
        label: 'API Input',
        parameters: []
      }
      break
    case 'connector':
      baseNode.data = {
        label: 'Data Connector',
        sourceType: 'analytics',
        analyticsType: 'sales',
        selectedApi: 'custom',
        apiUrl: '',
        dataPath: '',
        mockData: Math.floor(Math.random() * 100)
      }
      break
    case 'field-extractor':
      baseNode.data = {
        label: 'Field Extractor',
        selectionMode: 'single',
        selectedFields: [],
        manualPath: ''
      }
      break
    case 'array-processor':
      baseNode.data = {
        label: 'Array Processor',
        operation: 'extract',
        fieldPath: '',
        filterValue: ''
      }
      break
    case 'add':
    case 'subtract':
    case 'multiply':
    case 'divide':
      baseNode.data = {
        label: type.charAt(0).toUpperCase() + type.slice(1),
        operation: type
      }
      break
    case 'output':
      baseNode.data = {
        label: 'Output',
        customInputs: []
      }
      break
    case 'variable':
      baseNode.data = {
        label: 'Variable',
        mode: 'set',
        variableName: 'myVariable'
      }
      break
    default:
      baseNode.data = {
        label: type.charAt(0).toUpperCase() + type.slice(1)
      }
  }

  flowStore.addNode(baseNode)
  return baseNode
}