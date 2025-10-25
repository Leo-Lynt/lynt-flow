/**
 * Object Filter
 * Remove propriedades específicas de um objeto
 */

import { unwrapData } from '../../utils/dataUtils.js'


/**
 * Remove valor usando path
 * @param {Object} obj - Objeto alvo
 * @param {string} path - Caminho do campo
 * @returns {Object}
 */
function deleteByPath(obj, path) {
  if (!path) return obj

  const keys = path.split('.')
  const result = { ...obj }

  if (keys.length === 1) {
    delete result[keys[0]]
    return result
  }

  // Para nested paths, precisamos clonar profundamente até o parent
  let current = result
  for (let i = 0; i < keys.length - 1; i++) {
    if (current[keys[i]] === null || current[keys[i]] === undefined) {
      return result
    }
    current[keys[i]] = { ...current[keys[i]] }
    current = current[keys[i]]
  }

  delete current[keys[keys.length - 1]]
  return result
}

/**
 * Executa filtro no objeto
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {Object} Objeto filtrado
 */
export function execute({ nodeData, inputs }) {
  let inputData = unwrapData(inputs.input)

  if (typeof inputData !== 'object' || inputData === null || Array.isArray(inputData)) {
    throw new Error('Input deve ser um objeto')
  }

  // Determinar quais campos remover baseado no modo
  const fieldMode = nodeData.fieldMode || 'selector'
  let fieldsToRemove = []

  if (fieldMode === 'custom') {
    // Parse comma-separated string
    const customFields = nodeData.customFields || ''
    fieldsToRemove = customFields.split(',').map(f => f.trim()).filter(f => f.length > 0)
  } else {
    // Modo selector
    fieldsToRemove = nodeData.selectedFields || []
  }

  if (fieldsToRemove.length === 0) {
    return inputData
  }

  // Remove campos
  let result = { ...inputData }
  fieldsToRemove.forEach(field => {
    result = deleteByPath(result, field)
  })

  return result
}

/**
 * Valida configuração do Object Filter
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
