/**
 * API operations module for flowStore
 */
export function createApiModule(state, serializationModule) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

  const saveFlow = async (flowId = null) => {
    const flowData = serializationModule.serializeFlow()

    try {
      const response = await fetch(`${API_BASE_URL}/api/flows${flowId ? `/${flowId}` : ''}`, {
        method: flowId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(flowData)
      })

      if (!response.ok) {
        throw new Error(`Failed to save flow: ${response.statusText}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error saving flow:', error)
      throw error
    }
  }

  const loadFlow = async (flowId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/flows/${flowId}`)

      if (!response.ok) {
        throw new Error(`Failed to load flow: ${response.statusText}`)
      }

      const flowData = await response.json()
      serializationModule.deserializeFlow(flowData)
      return flowData
    } catch (error) {
      console.error('Error loading flow:', error)
      throw error
    }
  }

  const initializeFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const apiUrl = urlParams.get('apiUrl')

    if (apiUrl) {
      // Store API URL in global variables
      state.globalVariables.value.apiUrl = apiUrl

      // Create a connector node automatically
      const connectorNode = {
        id: `connector_${Date.now()}`,
        type: 'connector',
        position: { x: 100, y: 100 },
        data: {
          label: 'Data Connector',
          sourceType: 'api',
          apiUrl: apiUrl,
          dataPath: ''
        }
      }

      state.nodes.value.push(connectorNode)
      state.nodeData.value[connectorNode.id] = connectorNode.data
    }
  }

  return {
    saveFlow,
    loadFlow,
    initializeFromUrl
  }
}
