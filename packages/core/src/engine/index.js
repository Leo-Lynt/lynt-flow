/**
 * LyntFlow Engine - Main Entry Point
 * Exporta todas as funcionalidades do engine
 */

// Core Engines (New Architecture)
export { FlowEngine } from './FlowEngine.js'
export { TypeEngine } from './TypeEngine.js'
export { AutoExecutionEngine } from './AutoExecutionEngine.js'

// Registry
export {
  default as registry,
  registerNode,
  registerCategory,
  getNodeDefinition,
  getAllNodes,
  getNodesByCategory,
  getAllCategories,
  hasNode,
  getNodeFunction,
  validateNodeConfig,
  getNodeHandles,
  clearRegistry,
  getRegistryStats
} from './registry.js'

// Loader
export {
  default as loader,
  loadNodeCatalog,
  reloadNodeCatalog,
  getCatalog,
  isCatalogLoaded,
  initializeEngine,
  validateCatalogMethods
} from './loader.js'

// Node Executor (NEW - Unified Implementation)
export {
  default as nodeExecutor,
  executeNode,
  hasRequiredInputs,
  validateNodeExecution,
  getExecutionMode,
  shouldAutoExecute,
  extractOutputs,
  extractNumericValue,
  getValueByPath,
  topologicalSort,
  utils
} from './nodeExecutor.js'

// Legacy Executor (DEPRECATED - use nodeExecutor instead)
export {
  default as executor
} from './executor.js'

// Flow Executor (Orchestration)
export {
  executeFlow
} from './flowExecutor.js'

// Storage & Cache Management (NEW)
// Nota: RedisAdapter removido dos exports para evitar erro no frontend
// Para usar cache na API, importe diretamente de '@flow-forge/core/storage/*'
export {
  CacheManager,
  StorageAdapter,
  MemoryStorageAdapter
} from '../storage/CacheManager.js'

export {
  ExecutionStateManager
} from '../storage/ExecutionStateManager.js'

export {
  LocalStorageAdapter
} from '../storage/adapters/LocalStorageAdapter.js'

/**
 * Inicialização completa do engine
 * Deve ser chamado no bootstrap da aplicação (main.js)
 */
export async function bootstrap() {

  try {
    const { initializeEngine } = await import('./loader.js')
    const result = await initializeEngine()

    if (result.success) {
      return result
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    throw error
  }
}

export default {
  bootstrap
}
