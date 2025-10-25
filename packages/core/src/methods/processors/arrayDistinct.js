/**
 * Array Distinct
 * Remove valores duplicados do array
 */

import { unwrapData } from '../../utils/dataUtils.js'
import { getValueByPath } from '../../utils/pathUtils.js'


/**
 * Executa distinct no array
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {Array} Array com valores únicos
 */
export function execute({ nodeData, inputs }) {
  let inputData = unwrapData(inputs['data-input'])

  if (!Array.isArray(inputData)) {
    throw new Error('Input deve ser um array')
  }

  const mode = nodeData.mode || 'values'

  if (mode === 'values') {
    // Distinct de valores primitivos
    return [...new Set(inputData)]
  }

  // Mode = 'field' - Distinct por campo específico
  const fieldMode = nodeData.fieldMode || 'selector'
  let field

  if (fieldMode === 'custom') {
    field = nodeData.customField
  } else {
    // Modo selector - pegar o primeiro campo selecionado (singleSelect)
    const selectedFields = nodeData.selectedField
    if (Array.isArray(selectedFields) && selectedFields.length > 0) {
      field = selectedFields[0]
    } else if (typeof selectedFields === 'string') {
      field = selectedFields
    }
  }

  // Usar Map para manter apenas o primeiro item de cada valor único do campo
  const seen = new Map()

  inputData.forEach(item => {
    const value = field ? getValueByPath(item, field) : item
    const key = JSON.stringify(value)

    if (!seen.has(key)) {
      seen.set(key, item)
    }
  })

  return Array.from(seen.values())
}

/**
 * Valida configuração do Array Distinct
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

  if (!nodeData.mode) {
    errors.push('Campo "mode" obrigatório')
  }

  // Se modo é 'field', validar campo
  if (nodeData.mode === 'field') {
    const fieldMode = nodeData.fieldMode || 'selector'

    if (fieldMode === 'custom') {
      if (!nodeData.customField) {
        errors.push('Campo customField obrigatório no modo custom')
      }
    } else {
      if (!nodeData.selectedField || (Array.isArray(nodeData.selectedField) && nodeData.selectedField.length === 0)) {
        errors.push('Seleção de campo obrigatória')
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
