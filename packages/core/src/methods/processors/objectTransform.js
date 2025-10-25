/**
 * Object Transform
 * Transforma valores de propriedades aplicando operações
 */

import { unwrapData } from '../../utils/dataUtils.js'
import { getValueByPath, setValueByPath } from '../../utils/pathUtils.js'


/**
 * Aplica transformação ao valor
 * @param {any} value - Valor a transformar
 * @param {string} operation - Operação de transformação
 * @returns {any}
 */
function transformValue(value, operation) {
  switch (operation) {
    case 'uppercase':
      return String(value).toUpperCase()

    case 'lowercase':
      return String(value).toLowerCase()

    case 'trim':
      return String(value).trim()

    case 'number':
      return Number(value)

    case 'string':
      return String(value)

    case 'boolean':
      return Boolean(value)

    default:
      return value
  }
}

/**
 * Executa transformação no objeto
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {Object} Objeto transformado
 */
export function execute({ nodeData, inputs }) {
  let inputData = unwrapData(inputs.input)

  if (typeof inputData !== 'object' || inputData === null || Array.isArray(inputData)) {
    throw new Error('Input deve ser um objeto')
  }

  // Determinar qual campo transformar baseado no modo
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

  const operation = nodeData.operation || 'uppercase'

  // Extrair valor atual
  const currentValue = getValueByPath(inputData, field)

  if (currentValue === undefined) {
    throw new Error(`Campo "${field}" não encontrado no objeto`)
  }

  // Transformar valor
  const transformedValue = transformValue(currentValue, operation)

  // Retornar objeto com valor transformado
  return setValueByPath(inputData, field, transformedValue)
}

/**
 * Valida configuração do Object Transform
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

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

  if (!nodeData.operation) {
    errors.push('Campo "operation" obrigatório')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
