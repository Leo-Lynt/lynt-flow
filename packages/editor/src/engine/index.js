/**
 * LyntFlow Engine - Main Entry Point (Frontend)
 *
 * NOTA: Frontend mantém apenas registry.js e loader.js locais (com lógica browser-specific)
 * Todo o resto (executor, typeSystem) é importado do @leo-lynt/lynt-flow-core
 */

// Registry (local - browser-specific module loading)
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

// Loader (local - usa fetch API)
export {
  default as loader,
  loadNodeCatalog,
  reloadNodeCatalog,
  getCatalog,
  isCatalogLoaded,
  initializeEngine,
  validateCatalogMethods
} from './loader.js'

// Executor (local wrapper - usa registry do frontend)
// NOTA: Não podemos usar o executor do core diretamente porque ele importa
// o registry do core (vazio). Precisamos do wrapper local que usa o registry do frontend.
export {
  default as executor,
  executeNode,
  hasRequiredInputs,
  validateNodeExecution,
  getExecutionMode,
  shouldAutoExecute,
  extractOutputs,
  topologicalSort,
  utils
} from './executor.js'

// TypeSystem (importado do core - código idêntico)
export {
  getHandleType,
  getAcceptedTypes,
  areTypesCompatible,
  isConnectionValid,
  validateConnection
} from '@leo-lynt/lynt-flow-core/engine/typeSystem.js'

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
