/**
 * Object Keys/Values
 * Extrai as chaves ou valores de um objeto como array
 */

import { unwrapData } from '../../utils/dataUtils.js'


/**
 * Executa extração de keys/values do objeto
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {Array} Array de chaves ou valores
 */
export function execute({ nodeData, inputs }) {
  let inputData = unwrapData(inputs.input)

  if (typeof inputData !== 'object' || inputData === null || Array.isArray(inputData)) {
    throw new Error('Input deve ser um objeto')
  }

  const operation = nodeData.operation || 'keys'

  switch (operation) {
    case 'keys':
      return Object.keys(inputData)

    case 'values':
      return Object.values(inputData)

    case 'entries':
      return Object.entries(inputData)

    default:
      throw new Error(`Operação "${operation}" não suportada`)
  }
}

/**
 * Valida configuração do Object Keys/Values
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

  if (!nodeData.operation) {
    errors.push('Campo "operation" obrigatório')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
