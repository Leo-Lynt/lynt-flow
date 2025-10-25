/**
 * Array Group By
 * Agrupa items do array por campo específico
 */

import { unwrapData } from '../../utils/dataUtils.js'
import { getValueByPath } from '../../utils/pathUtils.js'


/**
 * Executa agrupamento no array
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {Object} Objeto agrupado { key: [items] }
 */
export function execute({ nodeData, inputs }) {
  let inputData = unwrapData(inputs['data-input'])

  if (!Array.isArray(inputData)) {
    throw new Error('Input deve ser um array')
  }

  // Determinar qual campo usar baseado no modo
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

  // Agrupar items por valor do campo
  const grouped = {}

  inputData.forEach(item => {
    const groupKey = field ? getValueByPath(item, field) : item

    // Convert key to string for object property
    const key = String(groupKey)

    if (!grouped[key]) {
      grouped[key] = []
    }

    grouped[key].push(item)
  })

  return grouped
}

/**
 * Valida configuração do Array Group By
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

  // Validar campo baseado no modo
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

  return {
    valid: errors.length === 0,
    errors
  }
}
