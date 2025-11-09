/**
 * Output Node (Frontend)
 * Coleta dados e envia para destinations (display, email, webhook, etc)
 */

import { unwrapData } from '@leo-lynt/lynt-flow-core/utils'
import { executeOutput } from '../../services/outputService'

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

  // Determinar destination (default: display)
  const destination = nodeData.destination || 'display'
  const config = nodeData.destinationConfig || {}

  // Se destination é display, apenas retornar os dados
  if (destination === 'display') {
    return outputData
  }

  // Para outras destinations (email, webhook, googleSheets, download, apiResponse)
  // chamar outputService que faz requisição para a API
  try {
    const apiConfig = context?.apiConfig || {}

    // Verificar se temos token de autenticação
    if (!apiConfig.token) {
      console.warn('⚠️ Output: No authentication token found. Cannot send to destination:', destination)
      return {
        success: false,
        error: 'Authentication required',
        data: outputData
      }
    }

    console.log(`📤 Output: Sending to ${destination}`, {
      config,
      dataKeys: Object.keys(outputData)
    })

    // Executar output via service (chama API backend)
    const result = await executeOutput(outputData, { type: destination, config }, apiConfig)

    console.log(`✅ Output: Successfully sent to ${destination}`, result)

    // Retornar resultado + dados originais
    return {
      success: true,
      destination,
      result,
      data: outputData
    }
  } catch (error) {
    console.error(`❌ Output: Error sending to ${destination}:`, error)

    // Retornar erro mas manter dados
    return {
      success: false,
      destination,
      error: error.message,
      data: outputData
    }
  }
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
