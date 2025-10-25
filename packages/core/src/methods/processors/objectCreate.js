/**
 * Object Create
 * Cria um objeto com propriedades dinâmicas
 */

import { unwrapData } from '../../utils/dataUtils.js'


/**
 * Cria um objeto com propriedades dinâmicas
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {Object} Objeto criado
 */
export function execute({ nodeData, inputs }) {
  const properties = nodeData.properties || []

  const newObject = {}

  for (const prop of properties) {
    const propKey = prop.key
    const inputId = `data-${prop.id}`
    const propValue = unwrapData(inputs[inputId])

    if (propKey) {
      // Se não houver input conectado, usar undefined
      newObject[propKey] = propValue
    }
  }


  return newObject
}

/**
 * Valida configuração do Object Create
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

  const properties = nodeData.properties || []

  // Validar que há pelo menos 1 propriedade
  if (properties.length === 0) {
    errors.push('É necessário adicionar pelo menos 1 propriedade')
  }

  // Validar que todas as propriedades têm key
  const emptyKeys = properties.filter(prop => !prop.key || prop.key.trim() === '')
  if (emptyKeys.length > 0) {
    errors.push(`${emptyKeys.length} propriedade(s) sem nome de chave`)
  }

  // Validar keys duplicadas
  const keys = properties.map(prop => prop.key).filter(Boolean)
  const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index)
  if (duplicates.length > 0) {
    errors.push(`Chaves duplicadas: ${[...new Set(duplicates)].join(', ')}`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
