/**
 * Array Create
 * Cria um array com itens dinâmicos
 */

import { unwrapData } from '../../utils/dataUtils.js'


/**
 * Cria um array com itens dinâmicos
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {Array} Array criado
 */
export function execute({ nodeData, inputs }) {
  const items = nodeData.items || []

  const newArray = []

  for (const item of items) {
    const itemValue = unwrapData(inputs[item.id])

    // Adicionar ao array mesmo se for undefined
    newArray.push(itemValue)
  }


  return newArray
}

/**
 * Valida configuração do Array Create
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

  const items = nodeData.items || []

  // Validar que há pelo menos 1 item
  if (items.length === 0) {
    errors.push('É necessário adicionar pelo menos 1 item')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
