/**
 * Array Processor
 * Operações de agregação e filtragem em arrays
 */

import { unwrapData } from '../../utils/dataUtils.js'


/**
 * Extrai valor usando path
 * @param {any} obj - Objeto fonte
 * @param {string} path - Caminho do campo
 * @returns {any}
 */
function getValueByPath(obj, path) {
  if (!path) return obj

  const keys = path.split('.')
  let current = obj

  for (const key of keys) {
    if (current === null || current === undefined) return undefined
    current = current[key]
  }

  return current
}

/**
 * Executa operação no array
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos (input)
 * @returns {any} Resultado da operação
 */
export function execute({ nodeData, inputs }) {
  let inputData = unwrapData(inputs['data-input'])

  if (!Array.isArray(inputData)) {
    throw new Error('Input deve ser um array')
  }

  const operation = nodeData.operation || 'extract'
  const fieldPath = nodeData.fieldPath
  const filterValue = nodeData.filterValue

  switch (operation) {
    case 'extract':
      if (!fieldPath) {
        throw new Error('fieldPath obrigatório para operação extract')
      }
      return inputData.map(item => getValueByPath(item, fieldPath))

    case 'sum':
      if (!fieldPath) {
        throw new Error('fieldPath obrigatório para operação sum')
      }
      return inputData.reduce((sum, item) => {
        const value = Number(getValueByPath(item, fieldPath)) || 0
        return sum + value
      }, 0)

    case 'average':
      if (!fieldPath) {
        throw new Error('fieldPath obrigatório para operação average')
      }
      const sum = inputData.reduce((sum, item) => {
        const value = Number(getValueByPath(item, fieldPath)) || 0
        return sum + value
      }, 0)
      return inputData.length > 0 ? sum / inputData.length : 0

    case 'count':
      return inputData.length

    case 'filter':
      if (!filterValue) {
        throw new Error('filterValue obrigatório para operação filter')
      }
      // Parse filter expression (ex: "value > 100")
      return inputData.filter(item => {
        try {
          // Simples avaliação (CUIDADO: não usar em produção com input não confiável)
          const value = getValueByPath(item, fieldPath || 'value')
          return eval(filterValue.replace(/value/g, value))
        } catch {
          return false
        }
      })

    case 'first':
      return inputData.length > 0 ? inputData[0] : null

    case 'last':
      return inputData.length > 0 ? inputData[inputData.length - 1] : null

    default:
      throw new Error(`Operação "${operation}" não suportada`)
  }
}

/**
 * Valida configuração do Array Processor
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []
  const operation = nodeData.operation

  if (!operation) {
    errors.push('Campo "operation" obrigatório')
    return { valid: false, errors }
  }

  // Validar campos específicos por operação
  if (['extract', 'sum', 'average'].includes(operation) && !nodeData.fieldPath) {
    errors.push(`Operação "${operation}" requer campo "fieldPath"`)
  }

  if (operation === 'filter' && !nodeData.filterValue) {
    errors.push('Operação "filter" requer campo "filterValue"')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
