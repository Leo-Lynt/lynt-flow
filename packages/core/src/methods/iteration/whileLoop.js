/**
 * While Loop
 * Executa loop enquanto condição for verdadeira
 */

import { unwrapData } from '../../utils/dataUtils.js'


/**
 * Execute While Loop
 *
 * Este nó é especial - não executa diretamente o loop aqui.
 * Apenas prepara os dados e retorna informações para o flowStore
 * executar a iteração.
 *
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {Object} Dados para iniciar o loop
 */
export function execute({ nodeData, inputs }) {
  const condition = unwrapData(inputs.condition)
  const maxIterations = nodeData.maxIterations || 1000

  // Retornar dados para iteração
  // O flowStore vai detectar este formato especial e executar o loop
  return {
    __whileLoop: true, // Flag especial para flowStore detectar
    initialCondition: Boolean(condition),
    maxIterations: maxIterations
  }
}

/**
 * Validate configuration
 */
export function validate(nodeData) {
  const maxIterations = nodeData.maxIterations || 1000

  if (maxIterations < 1 || maxIterations > 10000) {
    return {
      valid: false,
      errors: ['Max iterations must be between 1 and 10000']
    }
  }

  return {
    valid: true,
    errors: []
  }
}
