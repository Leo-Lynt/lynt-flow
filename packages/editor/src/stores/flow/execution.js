import { executeFlow as coreExecuteFlow } from '@leo-lynt/lynt-flow-core/engine/flowExecutor.js'
import { AdapterRegistry } from '@leo-lynt/lynt-flow-core/engine/AdapterRegistry.js'
import { HttpDataSourceFactory } from '../../adapters/HttpDataSource.js'

/**
 * Flow execution module for flowStore
 * Agora usa o executor do Core
 */
export function createExecutionModule(state, nodeOps, edgeOps) {
  // Initialize adapter registry with HTTP adapters
  const adapters = new AdapterRegistry()
  const httpAdapters = HttpDataSourceFactory.createAll()
  httpAdapters.forEach(({ type, adapter }) => {
    adapters.registerDataSource(type, adapter)
  })

  const executeFlow = async () => {
    console.log('🚀 Starting flow execution (using Core executor)...')

    // Clear previous results
    state.executionResults.value = {}

    // Preparar dados para o executor do Core
    const nodes = state.nodes.value
    const edges = state.edges.value

    // Construir nodeDataMap a partir do state
    const nodeDataMap = {}
    nodes.forEach(node => {
      nodeDataMap[node.id] = nodeOps.getNodeData(node.id)
    })

    // Input data (vazio para execução manual, ou pode vir de outra fonte)
    const inputData = {}

    // Context com adapters e globalVariables
    const context = {
      adapters,
      globalVariables: state.globalVariables.value
    }

    try {
      // Executar usando o Core
      const result = await coreExecuteFlow({
        nodes,
        edges,
        nodeDataMap,
        inputData,
        context
      })

      // Atualizar state com resultados
      state.executionResults.value = result.results
      state.globalVariables.value = result.globalVariables

      console.log('✅ Flow execution completed')
      console.log(`📊 Executed ${result.executedNodes.length} nodes`)

      return result

    } catch (error) {
      console.error('❌ Error executing flow:', error)
      throw error
    }
  }

  // Manter executeNodeById para compatibilidade (pode ser usado em outros lugares)
  const executeNodeById = async (nodeId) => {
    console.warn('⚠️  executeNodeById is deprecated, use executeFlow instead')
    // Pode implementar uma versão simplificada se necessário
    throw new Error('executeNodeById não implementado - use executeFlow')
  }

  return {
    executeFlow,
    executeNodeById
  }
}
