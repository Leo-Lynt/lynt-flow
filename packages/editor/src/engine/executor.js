/**
 * Frontend Executor Wrapper
 *
 * Este wrapper injeta o registry do frontend no core executor.
 * Toda a lógica de execução vem do @leo-lynt/lynt-flow-core/engine/nodeExecutor
 *
 * Dependency Injection Pattern:
 * - Core define a lógica pura
 * - Frontend injeta registry específico via context
 */

import { getNodeDefinition, getNodeFunction } from './registry.js'
import * as coreExecutor from '@leo-lynt/lynt-flow-core/engine/nodeExecutor.js'

/**
 * Registry wrapper para injeção no core
 */
const frontendRegistry = {
  getNodeDefinition,
  getNodeFunction
}

/**
 * Executa um node individual usando o core executor
 * Injeta o registry do frontend via context
 *
 * @param {Object} node - Instância do node
 * @param {Object} nodeData - Dados de configuração
 * @param {Object} inputs - Inputs de dados
 * @param {Object} context - Contexto de execução
 * @returns {Promise<any>} Resultado da execução
 */
export async function executeNode(node, nodeData, inputs, context = {}) {
  // Injetar registry do frontend no context
  const contextWithRegistry = {
    ...context,
    registry: frontendRegistry
  }

  // Delegar para core executor
  return coreExecutor.executeNode(node, nodeData, inputs, contextWithRegistry)
}

/**
 * Verifica se um node tem todos os inputs obrigatórios
 * Delega para core executor
 */
export function hasRequiredInputs(node, inputs) {
  return coreExecutor.hasRequiredInputs(node, inputs, { registry: frontendRegistry })
}

/**
 * Valida a configuração de um node antes da execução
 * Delega para core executor
 */
export async function validateNodeExecution(node, nodeData) {
  return coreExecutor.validateNodeExecution(node, nodeData, { registry: frontendRegistry })
}

/**
 * Determina o modo de execução de um node
 * Delega para core executor
 */
export function getExecutionMode(nodeType) {
  return coreExecutor.getExecutionMode(nodeType, { registry: frontendRegistry })
}

/**
 * Verifica se um node deve auto-executar quando inputs mudam
 * Delega para core executor
 */
export function shouldAutoExecute(nodeType) {
  return coreExecutor.shouldAutoExecute(nodeType, { registry: frontendRegistry })
}

/**
 * Extrai os outputs de um node após execução
 * Delega para core executor
 */
export function extractOutputs(node, result) {
  return coreExecutor.extractOutputs(node, result, { registry: frontendRegistry })
}


/**
 * Exporta utilitários do core para compatibilidade
 */
export const utils = coreExecutor.utils
export const extractNumericValue = coreExecutor.extractNumericValue
export const getValueByPath = coreExecutor.getValueByPath
export const topologicalSort = coreExecutor.topologicalSort

// Default export
export default {
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
}
