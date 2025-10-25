/**
 * Object Set Property
 * Define ou modifica propriedades de um objeto
 */

import { unwrapData } from '../../utils/dataUtils.js'


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
  const result = JSON.parse(JSON.stringify(obj)) // Deep clone

  let current = result

  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]] || typeof current[keys[i]] !== 'object') {
      current[keys[i]] = {}
    }
    current = current[keys[i]]
  }

  current[keys[keys.length - 1]] = value
  return result
}

/**
 * Executa set property no objeto
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {Object} Objeto modificado
 */
export function execute({ nodeData, inputs }) {
  let inputData = unwrapData(inputs.input)

  if (typeof inputData !== 'object' || inputData === null || Array.isArray(inputData)) {
    throw new Error('Input deve ser um objeto')
  }

  // Determinar qual campo modificar baseado no modo
  const fieldMode = nodeData.fieldMode || 'selector'
  let propertyPath

  if (fieldMode === 'custom') {
    propertyPath = nodeData.customField
  } else {
    // Modo selector - pegar o primeiro campo selecionado (singleSelect)
    const selectedFields = nodeData.selectedField
    if (Array.isArray(selectedFields) && selectedFields.length > 0) {
      propertyPath = selectedFields[0]
    } else if (typeof selectedFields === 'string') {
      propertyPath = selectedFields
    }
  }

  if (!propertyPath) {
    throw new Error('Propriedade não selecionada')
  }

  const valueMode = nodeData.valueMode || 'static'

  let value

  if (valueMode === 'input') {
    // Usar valor do handle de input
    value = unwrapData(inputs['value-input'])
  } else {
    // Usar valor estático
    value = nodeData.staticValue
  }

  return setValueByPath(inputData, propertyPath, value)
}

/**
 * Valida configuração do Object Set Property
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

  // Validar seleção de campo
  const fieldMode = nodeData.fieldMode || 'selector'

  if (fieldMode === 'custom') {
    if (!nodeData.customField) {
      errors.push('Campo customField obrigatório no modo custom')
    }
  } else {
    if (!nodeData.selectedField || (Array.isArray(nodeData.selectedField) && nodeData.selectedField.length === 0)) {
      errors.push('Seleção de propriedade obrigatória')
    }
  }

  // valueMode tem default 'static', então não precisa validar
  if (nodeData.valueMode === 'static' && nodeData.staticValue === undefined) {
    errors.push('Campo "staticValue" obrigatório quando valueMode é "static"')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
