/**
 * Object Pick
 * Mantém apenas propriedades específicas de um objeto
 */

import { unwrapData } from '../../utils/dataUtils.js'
import { getValueByPath } from '../../utils/pathUtils.js'


/**
 * Define valor usando path
 * @param {Object} obj - Objeto alvo
 * @param {string} path - Caminho do campo
 * @param {any} value - Valor a definir
 * @returns {Object}
 */
function setValueByPath(obj, path, value) {
  if (!path) return obj

  const keys = path.split('.')

  if (keys.length === 1) {
    return { ...obj, [keys[0]]: value }
  }

  const result = { ...obj }
  let current = result

  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
      current[keys[i]] = {}
    } else {
      current[keys[i]] = { ...current[keys[i]] }
    }
    current = current[keys[i]]
  }

  current[keys[keys.length - 1]] = value
  return result
}

/**
 * Executa pick no objeto
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {Object} Objeto com campos selecionados
 */
export function execute({ nodeData, inputs }) {
  let inputData = unwrapData(inputs.input)

  if (typeof inputData !== 'object' || inputData === null || Array.isArray(inputData)) {
    throw new Error('Input deve ser um objeto')
  }

  // Determinar quais campos manter baseado no modo
  const fieldMode = nodeData.fieldMode || 'selector'
  let fieldsToPick = []

  if (fieldMode === 'custom') {
    // Parse comma-separated string
    const customFields = nodeData.customFields || ''
    fieldsToPick = customFields.split(',').map(f => f.trim()).filter(f => f.length > 0)
  } else {
    // Modo selector
    fieldsToPick = nodeData.selectedFields || []
  }

  if (fieldsToPick.length === 0) {
    return {}
  }

  // Pick campos
  let result = {}
  fieldsToPick.forEach(field => {
    const value = getValueByPath(inputData, field)
    if (value !== undefined) {
      result = setValueByPath(result, field, value)
    }
  })

  return result
}

/**
 * Valida configuração do Object Pick
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

  const fieldMode = nodeData.fieldMode || 'selector'

  if (fieldMode === 'custom') {
    if (!nodeData.customFields) {
      errors.push('Campo customFields obrigatório no modo custom')
    }
  } else {
    if (!nodeData.selectedFields || nodeData.selectedFields.length === 0) {
      errors.push('Seleção de campos obrigatória')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
