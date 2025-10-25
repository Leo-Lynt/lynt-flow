/**
 * Object Merge
 * Combina múltiplos objetos em um único objeto
 */

import { unwrapData } from '../../utils/dataUtils.js'


/**
 * Deep merge de objetos (recursivo)
 * @param {Object} target - Objeto alvo
 * @param {Object} source - Objeto fonte
 * @returns {Object}
 */
function deepMerge(target, source) {
  const result = { ...target }

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        target[key] &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        result[key] = deepMerge(target[key], source[key])
      } else {
        result[key] = source[key]
      }
    }
  }

  return result
}

/**
 * Numbered merge - renomeia propriedades conflitantes com _1, _2
 * @param {Object} obj1 - Primeiro objeto
 * @param {Object} obj2 - Segundo objeto
 * @returns {Object}
 */
function numberedMerge(obj1, obj2) {
  const result = {}

  // Adicionar todas as propriedades do obj1 com sufixo _1
  for (const key in obj1) {
    if (obj1.hasOwnProperty(key)) {
      result[`${key}_1`] = obj1[key]
    }
  }

  // Adicionar todas as propriedades do obj2 com sufixo _2
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      result[`${key}_2`] = obj2[key]
    }
  }

  return result
}

/**
 * Executa merge de objetos
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {Object} Objeto combinado
 */
export function execute({ nodeData, inputs }) {
  let input1 = unwrapData(inputs['input-1'])
  let input2 = unwrapData(inputs['input-2'])

  if (typeof input1 !== 'object' || input1 === null || Array.isArray(input1)) {
    throw new Error('Input 1 deve ser um objeto')
  }

  if (typeof input2 !== 'object' || input2 === null || Array.isArray(input2)) {
    throw new Error('Input 2 deve ser um objeto')
  }

  const mergeMode = nodeData.mergeMode || 'shallow'

  if (mergeMode === 'deep') {
    return deepMerge(input1, input2)
  }

  if (mergeMode === 'numbered') {
    return numberedMerge(input1, input2)
  }

  // Shallow merge (default)
  return { ...input1, ...input2 }
}

/**
 * Valida configuração do Object Merge
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

  // mergeMode tem default 'shallow', então não é obrigatório validar

  return {
    valid: errors.length === 0,
    errors
  }
}
