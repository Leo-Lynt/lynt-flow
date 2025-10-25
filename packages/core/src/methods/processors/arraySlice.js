/**
 * Array Slice
 * Extrai porções de um array
 */

import { unwrapData } from '../../utils/dataUtils.js'


/**
 * Executa slice no array
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {any} Resultado do slice
 */
export function execute({ nodeData, inputs }) {
  let inputData = unwrapData(inputs['data-input'])

  if (!Array.isArray(inputData)) {
    throw new Error('Input deve ser um array')
  }

  const operation = nodeData.operation || 'first'

  switch (operation) {
    case 'first':
      return inputData.length > 0 ? inputData[0] : null

    case 'last':
      return inputData.length > 0 ? inputData[inputData.length - 1] : null

    case 'take': {
      const count = Math.max(0, parseInt(nodeData.count) || 1)
      return inputData.slice(0, count)
    }

    case 'skip': {
      const count = Math.max(0, parseInt(nodeData.count) || 1)
      return inputData.slice(count)
    }

    case 'slice': {
      const start = parseInt(nodeData.start) || 0
      const end = nodeData.end !== undefined ? parseInt(nodeData.end) : undefined
      return inputData.slice(start, end)
    }

    default:
      throw new Error(`Operação "${operation}" não suportada`)
  }
}

/**
 * Valida configuração do Array Slice
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

  if (!nodeData.operation) {
    errors.push('Campo "operation" obrigatório')
  }

  if (['take', 'skip'].includes(nodeData.operation) && !nodeData.count) {
    errors.push(`Operação "${nodeData.operation}" requer campo "count"`)
  }

  if (nodeData.operation === 'slice' && nodeData.start === undefined) {
    errors.push('Operação "slice" requer campo "start"')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
