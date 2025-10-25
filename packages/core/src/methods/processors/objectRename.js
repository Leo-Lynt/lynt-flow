/**
 * Object Rename
 * Renomeia propriedades de um objeto
 */

import { unwrapData } from '../../utils/dataUtils.js'


/**
 * Executa rename de propriedades
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {Object} Objeto com propriedades renomeadas
 */
export function execute({ nodeData, inputs }) {
  let inputData = unwrapData(inputs.input)

  if (typeof inputData !== 'object' || inputData === null || Array.isArray(inputData)) {
    throw new Error('Input deve ser um objeto')
  }

  // Determinar qual campo renomear baseado no modo
  const fieldMode = nodeData.fieldMode || 'selector'
  let oldFieldName

  if (fieldMode === 'custom') {
    oldFieldName = nodeData.customField
  } else {
    // Modo selector - pegar o primeiro campo selecionado (singleSelect)
    const selectedFields = nodeData.selectedField
    if (Array.isArray(selectedFields) && selectedFields.length > 0) {
      oldFieldName = selectedFields[0]
    } else if (typeof selectedFields === 'string') {
      oldFieldName = selectedFields
    }
  }

  const newFieldName = nodeData.newName

  if (!oldFieldName) {
    throw new Error('Campo para renomear não selecionado')
  }

  if (!newFieldName) {
    throw new Error('Novo nome não definido')
  }

  const result = {}

  // Iterar sobre todas as propriedades do objeto de entrada
  for (const key in inputData) {
    if (inputData.hasOwnProperty(key)) {
      // Se for o campo a renomear, usar o novo nome
      const finalKey = key === oldFieldName ? newFieldName : key
      result[finalKey] = inputData[key]
    }
  }

  return result
}

/**
 * Valida configuração do Object Rename
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
      errors.push('Seleção de campo obrigatória')
    }
  }

  if (!nodeData.newName) {
    errors.push('Campo "newName" obrigatório')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
