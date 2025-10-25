/**
 * Round Operation
 * Arredonda um valor numérico para um número específico de casas decimais
 */

import { unwrapData } from '../../utils/dataUtils.js'

/**
 * Arredonda um valor numérico
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos (value)
 * @param {Object} params.context - Contexto de execução
 * @returns {number} Valor arredondado
 */
export function execute({ nodeData, inputs, context }) {
  // Extrair valor do input
  const valueInput = inputs['data-value']
  const unwrapped = unwrapData(valueInput)
  const value = parseFloat(unwrapped)

  if (isNaN(value)) {
    throw new Error(`Valor não é um número válido: ${unwrapped}`)
  }

  // Obter casas decimais da configuração
  const decimalPlaces = nodeData?.decimalPlaces

  // Se não configurado, retornar valor original
  if (decimalPlaces === null || decimalPlaces === undefined || decimalPlaces === '') {
    return value
  }

  const places = parseInt(decimalPlaces)
  if (isNaN(places) || places < 0) {
    return value
  }

  // Aplicar arredondamento
  return Number(value.toFixed(places))
}

/**
 * Valida configuração do Round node
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

  if (nodeData.decimalPlaces !== null && nodeData.decimalPlaces !== undefined && nodeData.decimalPlaces !== '') {
    const places = parseInt(nodeData.decimalPlaces)
    if (isNaN(places) || places < 0 || places > 10) {
      errors.push('Casas decimais deve ser um número entre 0 e 10')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
