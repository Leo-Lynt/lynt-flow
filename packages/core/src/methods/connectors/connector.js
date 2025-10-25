/**
 * Data Connector (Core - Refactored)
 * Lógica pura de execução de connectors usando Dependency Injection
 */

import { normalizeNodeData } from '../../utils/fieldMapper.js'
import { validateConnectorConfig, applyDefaults } from '../../contracts/ConnectorConfig.js'

/**
 * Executa connector usando adapter injetado
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node (formato frontend)
 * @param {Object} params.inputs - Inputs recebidos
 * @param {Object} params.context - Contexto com adapters injetados
 * @returns {Promise<any>} Dados obtidos
 */
export async function execute({ nodeData, inputs, context }) {
  const sourceType = nodeData.sourceType

  if (!sourceType) {
    throw new Error('sourceType is required')
  }

  // 1. Normalizar nodeData (frontend → canonical)
  const canonicalConfig = normalizeNodeData(sourceType, nodeData)

  // 2. Aplicar defaults
  const configWithDefaults = applyDefaults(sourceType, canonicalConfig)

  // 3. Validar configuração canônica
  const validation = validateConnectorConfig(sourceType, configWithDefaults)
  if (!validation.valid) {
    throw new Error(`Invalid connector configuration: ${validation.errors.join(', ')}`)
  }

  // 4. Obter adapter do registry
  const adapters = context.adapters
  if (!adapters) {
    throw new Error('No adapters registry found in context. Please inject AdapterRegistry.')
  }

  const dataSource = adapters.getDataSource(sourceType)
  if (!dataSource) {
    throw new Error(`No adapter registered for source type: ${sourceType}`)
  }

  // 5. Executar via adapter
  try {
    const result = await dataSource.fetch(configWithDefaults, context)
    return result
  } catch (error) {
    console.error(`❌ Connector error (${sourceType}):`, error.message)
    throw error
  }
}

/**
 * Valida configuração do connector
 * Usa validação básica do frontend (para compatibilidade)
 * A validação canônica é feita em execute()
 */
export function validate(nodeData) {
  const errors = []
  const sourceType = nodeData.sourceType

  if (!sourceType) {
    errors.push('Campo "sourceType" obrigatório')
    return { valid: false, errors }
  }

  // Validação básica por tipo (frontend format)
  switch (sourceType) {
    case 'api':
      if (!nodeData.apiUrl) {
        errors.push('Campo "apiUrl" obrigatório para sourceType=api')
      }
      break
    case 'google_analytics':
      if (!nodeData.gaConnectionId && !nodeData.gaPropertyId) {
        errors.push('Campo "gaConnectionId" ou "gaPropertyId" obrigatório para Google Analytics')
      }
      break
    case 'google_sheets':
      if (!nodeData.sheetsUrl) {
        errors.push('Campo "sheetsUrl" obrigatório para sourceType=google_sheets')
      }
      break
    case 'mk3d':
      if (!nodeData.mk3dUrl || !nodeData.mk3dProjectId) {
        errors.push('Campos "mk3dUrl" e "mk3dProjectId" obrigatórios para sourceType=mk3d')
      }
      break
    case 'json':
    case 'csv':
      if (!nodeData.jsonCsvUrl) {
        errors.push('Campo "jsonCsvUrl" obrigatório para JSON/CSV')
      }
      break
    case 'graphql':
      if (!nodeData.graphqlUrl || !nodeData.graphqlQuery) {
        errors.push('Campos "graphqlUrl" e "graphqlQuery" obrigatórios para GraphQL')
      }
      break
    case 'database':
      if (!nodeData.databaseType) {
        errors.push('Campo "databaseType" obrigatório para Database')
      }
      break
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
