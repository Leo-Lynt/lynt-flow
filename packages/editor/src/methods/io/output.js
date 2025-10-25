/**
 * Output Node (Frontend - Simplificado)
 * No frontend, output é apenas para display
 */

import { unwrapData } from '@leo-lynt/lynt-flow-core/utils'

/**
 * Executa Output node
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @param {Object} params.context - Contexto
 * @returns {Object} Resultado formatado
 */
export async function execute({ nodeData, inputs, context }) {

  // Coletar dados dos inputs dinâmicos
  const outputData = {}

  // Se tem inputs dinâmicos definidos, coletar apenas eles
  if (nodeData.dynamicInputs && nodeData.dynamicInputs.length > 0) {
    nodeData.dynamicInputs.forEach(inputDef => {
      const key = inputDef.key

      // Os inputs vêm com o formato "data-{key}" do handle
      // Precisamos tentar ambas as formas: com e sem prefixo
      const inputKey = `data-${key}`
      const value = inputs[inputKey] !== undefined ? inputs[inputKey] : inputs[key]

      if (value !== undefined) {
        outputData[key] = unwrapData(value)
      }
    })
  } else {
    // Fallback: coletar todos os inputs (removendo prefixo 'data-' se existir)
    Object.keys(inputs).forEach(handleKey => {
      const key = handleKey.startsWith('data-') ? handleKey.substring(5) : handleKey
      outputData[key] = unwrapData(inputs[handleKey])
    })
  }

  // No frontend, output é apenas para display
  // Destinations (webhook, email, etc) são executados na API
  return outputData
}

/**
 * Valida configuração do Output
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  // Output no frontend não tem requisitos
  return {
    valid: true,
    errors: []
  }
}
