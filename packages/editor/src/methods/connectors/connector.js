/**
 * Data Connector (Frontend - Wrapper para Core)
 * Delega para lógica pura do Core que usa adapters injetados
 */

/**
 * Executa connector usando lógica do Core
 * O Core recebe adapters via context e executa usando DI
 *
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @param {Object} params.context - Contexto com adapters injetados
 * @returns {Promise<any>} Dados obtidos
 */
export async function execute({ nodeData, inputs, context }) {
  // Importar Core e adapters
  const coreConnector = await import('@leo-lynt/lynt-flow-core/methods/connectors/connector.js')
  const { AdapterRegistry } = await import('@leo-lynt/lynt-flow-core/engine/AdapterRegistry.js')
  const { HttpDataSourceFactory } = await import('../../adapters/HttpDataSource.js')

  // Criar registry e registrar adapters HTTP
  const registry = new AdapterRegistry()
  const httpAdapters = HttpDataSourceFactory.createAll()
  httpAdapters.forEach(({ type, adapter }) => {
    registry.registerDataSource(type, adapter)
  })

  // Injetar registry no context
  const contextWithAdapters = {
    ...context,
    adapters: registry
  }

  // Executar usando a lógica pura do Core
  // Core vai:
  // 1. Normalizar (sheetsUrl → spreadsheetUrl)
  // 2. Validar (schemas canônicos)
  // 3. Obter adapter do context.adapters (DI)
  // 4. Executar via adapter (HttpDataSource no caso do frontend)
  const result = await coreConnector.execute({ nodeData, inputs, context: contextWithAdapters })

  return result
}

/**
 * Valida configuração do connector
 */
export async function validate(nodeData) {
  // Importar validação do Core
  // Nota: @leo-lynt/lynt-flow-core já aponta para ../core/src (ver vite.config.js)
  const coreConnector = await import('@leo-lynt/lynt-flow-core/methods/connectors/connector.js')
  return coreConnector.validate(nodeData)
}
