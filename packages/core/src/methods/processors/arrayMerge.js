/**
 * Array Merge
 * Junta múltiplos arrays em um único array
 */

import { unwrapData } from '../../utils/dataUtils.js'


/**
 * Junta múltiplos arrays em um único array
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos (array1, array2, array3, ...)
 * @returns {Array} Array mesclado
 */
export function execute({ nodeData, inputs }) {
  // Get array inputs from nodeData or use defaults
  const arrayInputs = nodeData.arrayInputs || [
    { id: 'array1', label: 'Array 1' },
    { id: 'array2', label: 'Array 2' }
  ]

  // Collect all arrays from inputs
  const arrays = []

  for (const inputDef of arrayInputs) {
    const arrayData = unwrapData(inputs[inputDef.id])

    // Skip undefined/null inputs (they're optional)
    if (arrayData === undefined || arrayData === null) {
      continue
    }

    // Validate that input is an array
    if (!Array.isArray(arrayData)) {
      throw new Error(`Input "${inputDef.label || inputDef.id}" deve ser um array`)
    }

    arrays.push(arrayData)
  }

  // Validate we have at least 2 arrays
  if (arrays.length < 2) {
    throw new Error('É necessário pelo menos 2 arrays para fazer merge')
  }

  // Concatenar todos os arrays
  let mergedArray = []
  for (const arr of arrays) {
    mergedArray = [...mergedArray, ...arr]
  }

  // Remover duplicados se configurado
  const removeDuplicates = nodeData.removeDuplicates || false

  if (removeDuplicates) {
    // Para tipos primitivos: usar Set
    // Para objetos: comparação por JSON.stringify
    const seen = new Set()
    mergedArray = mergedArray.filter(item => {
      // Se for objeto ou array, usar JSON como chave
      const key = typeof item === 'object' && item !== null
        ? JSON.stringify(item)
        : item

      if (seen.has(key)) {
        return false
      }

      seen.add(key)
      return true
    })
  }

  const arraySizes = arrays.map(arr => arr.length).join(' + ')

  return mergedArray
}

/**
 * Valida configuração do Array Merge
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

  // Validar tipo de removeDuplicates
  if (nodeData.removeDuplicates !== undefined && typeof nodeData.removeDuplicates !== 'boolean') {
    errors.push('Campo "removeDuplicates" deve ser boolean')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
