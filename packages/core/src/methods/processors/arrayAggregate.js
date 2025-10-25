/**
 * Array Aggregate
 * Agrega valores de um array (sum, average, count, min, max)
 */

import { unwrapData } from '../../utils/dataUtils.js'
import { getValueByPath } from '../../utils/pathUtils.js'


/**
 * Executa agregação no array
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {number} Resultado da agregação
 */
export function execute({ nodeData, inputs }) {
  let inputData = unwrapData(inputs['data-input'])

  if (!Array.isArray(inputData)) {
    throw new Error('Input deve ser um array')
  }

  const operation = nodeData.operation || 'sum'

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

  switch (operation) {
    case 'count':
      return inputData.length

    case 'sum': {
      return inputData.reduce((sum, item) => {
        const value = field ? getValueByPath(item, field) : item
        const numValue = Number(value) || 0
        return sum + numValue
      }, 0)
    }

    case 'average': {
      if (inputData.length === 0) return 0
      const sum = inputData.reduce((sum, item) => {
        const value = field ? getValueByPath(item, field) : item
        const numValue = Number(value) || 0
        return sum + numValue
      }, 0)
      return sum / inputData.length
    }

    case 'min': {
      if (inputData.length === 0) return null
      let min = Infinity
      inputData.forEach(item => {
        const value = field ? getValueByPath(item, field) : item
        const numValue = Number(value)
        if (!isNaN(numValue) && numValue < min) {
          min = numValue
        }
      })
      return min === Infinity ? null : min
    }

    case 'max': {
      if (inputData.length === 0) return null
      let max = -Infinity
      inputData.forEach(item => {
        const value = field ? getValueByPath(item, field) : item
        const numValue = Number(value)
        if (!isNaN(numValue) && numValue > max) {
          max = numValue
        }
      })
      return max === -Infinity ? null : max
    }

    default:
      throw new Error(`Operação "${operation}" não suportada`)
  }
}

/**
 * Valida configuração do Array Aggregate
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

  if (!nodeData.operation) {
    errors.push('Campo "operation" obrigatório')
  }

  const operationsNeedingField = ['sum', 'average', 'min', 'max']
  if (operationsNeedingField.includes(nodeData.operation)) {
    const fieldMode = nodeData.fieldMode || 'selector'

    if (fieldMode === 'custom') {
      if (!nodeData.customField) {
        errors.push(`Operação "${nodeData.operation}" requer campo customField`)
      }
    } else {
      if (!nodeData.selectedField || (Array.isArray(nodeData.selectedField) && nodeData.selectedField.length === 0)) {
        errors.push(`Operação "${nodeData.operation}" requer seleção de campo`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
