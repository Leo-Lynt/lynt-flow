/**
 * Constant
 * Define um valor constante de qualquer tipo com validação de segurança
 */

import { safeJSONParse, schemas } from '../../utils/security.js'

/**
 * Executa o constant node
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos (vazio para constant)
 * @returns {any} Valor constante definido
 */
export function execute({ nodeData, inputs }) {
  const valueType = nodeData.valueType || 'number'

  switch (valueType) {
    case 'number':
      return nodeData.numberValue !== undefined ? nodeData.numberValue : 0

    case 'string':
      return nodeData.stringValue !== undefined ? nodeData.stringValue : ''

    case 'boolean':
      return nodeData.booleanValue !== undefined ? nodeData.booleanValue : false

    case 'object':
      try {
        const objValue = nodeData.objectValue || '{}'
        return safeJSONParse(objValue, schemas.safeObject)
      } catch (e) {
        throw new Error(`Invalid JSON for object: ${e.message}`)
      }

    case 'array':
      try {
        const arrValue = nodeData.arrayValue || '[]'
        return safeJSONParse(arrValue, schemas.safeArray)
      } catch (e) {
        throw new Error(`Invalid JSON for array: ${e.message}`)
      }

    case 'null':
      return null

    default:
      throw new Error(`Unknown value type: ${valueType}`)
  }
}

/**
 * Valida configuração do Constant
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

  if (!nodeData.valueType) {
    errors.push('Campo "valueType" obrigatório')
  }

  // Validar JSON se for object ou array (com validação segura)
  if (nodeData.valueType === 'object' && nodeData.objectValue) {
    try {
      safeJSONParse(nodeData.objectValue, schemas.safeObject)
    } catch (e) {
      errors.push(`Object value inválido: ${e.message}`)
    }
  }

  if (nodeData.valueType === 'array' && nodeData.arrayValue) {
    try {
      safeJSONParse(nodeData.arrayValue, schemas.safeArray)
    } catch (e) {
      errors.push(`Array value inválido: ${e.message}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
