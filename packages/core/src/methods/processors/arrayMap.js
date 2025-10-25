/**
 * Array Map
 * Transforma cada item do array extraindo campos específicos
 */

import { unwrapData } from '../../utils/dataUtils.js'
import { getValueByPath } from '../../utils/pathUtils.js'


/**
 * Executa mapeamento no array
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {Array} Array mapeado
 */
export function execute({ nodeData, inputs }) {
  let inputData = unwrapData(inputs['data-input'])

  if (!Array.isArray(inputData)) {
    throw new Error('Input deve ser um array')
  }

  // Determinar campos a extrair baseado no modo
  const fieldMode = nodeData.fieldMode || 'selector'
  let fields = []

  if (fieldMode === 'custom') {
    // Modo custom - um único campo
    const customField = nodeData.customField
    if (customField) {
      fields = [customField]
    }
  } else {
    // Modo selector - pode ter múltiplos campos
    const selectedFields = nodeData.selectedField
    if (Array.isArray(selectedFields) && selectedFields.length > 0) {
      fields = selectedFields
    } else if (typeof selectedFields === 'string') {
      fields = [selectedFields]
    }
  }

  // Se não há campos selecionados, retornar array original
  if (fields.length === 0) {
    return inputData
  }

  // Se apenas 1 campo: retornar array de valores (comportamento simples)
  if (fields.length === 1) {
    const field = fields[0]
    return inputData.map(item => getValueByPath(item, field))
  }

  // Se múltiplos campos: retornar array de objetos
  return inputData.map(item => {
    const mappedItem = {}
    fields.forEach(field => {
      // Usar o nome do campo como chave (sem path completo)
      const fieldName = field.split('.').pop() // Pegar última parte do path
      mappedItem[fieldName] = getValueByPath(item, field)
    })
    return mappedItem
  })
}

/**
 * Valida configuração do Array Map
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
