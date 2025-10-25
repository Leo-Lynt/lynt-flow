/**
 * For Each Loop
 * Itera sobre cada item de um array
 */

import { unwrapData } from '../../utils/dataUtils.js'


/**
 * Execute For Each
 *
 * Este nó é especial - não executa diretamente o loop aqui.
 * Apenas prepara os dados e retorna informações para o flowStore
 * executar a iteração.
 *
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {Object} Array e metadata para iteração
 */
export function execute({ nodeData, inputs }) {
  const array = unwrapData(inputs.array)

  // Validar que é array
  if (!Array.isArray(array)) {
    throw new Error('Input must be an array')
  }

  // Retornar dados para iteração
  // O flowStore vai detectar este formato especial e executar o loop
  return {
    __forEachLoop: true, // Flag especial para flowStore detectar
    array: array,
    totalCount: array.length
  }
}

/**
 * Validate configuration
 */
export function validate(nodeData) {
  // For Each não tem configuração, apenas inputs
  return {
    valid: true,
    errors: []
  }
}
