/**
 * Object To Array
 * Converte objeto em array de objetos {key, value}
 */

import { unwrapData } from '../../utils/dataUtils.js'


/**
 * Executa conversão de objeto para array
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {Array} Array de objetos {key, value}
 */
export function execute({ nodeData, inputs }) {
  let inputData = unwrapData(inputs.input)

  if (typeof inputData !== 'object' || inputData === null || Array.isArray(inputData)) {
    throw new Error('Input deve ser um objeto')
  }

  const keyName = nodeData.keyName || 'key'
  const valueName = nodeData.valueName || 'value'

  const result = []

  for (const key in inputData) {
    if (inputData.hasOwnProperty(key)) {
      result.push({
        [keyName]: key,
        [valueName]: inputData[key]
      })
    }
  }

  return result
}

/**
 * Valida configuração do Object To Array
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

  // keyName e valueName têm defaults, então não são obrigatórios
  // Mas se fornecidos, devem ser strings válidas
  if (nodeData.keyName && typeof nodeData.keyName !== 'string') {
    errors.push('Campo "keyName" deve ser uma string')
  }

  if (nodeData.valueName && typeof nodeData.valueName !== 'string') {
    errors.push('Campo "valueName" deve ser uma string')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
