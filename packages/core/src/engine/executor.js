/**
 * Flow Executor
 * Motor de execução que orquestra a execução de nodes baseado no catálogo
 */

import { getNodeDefinition, getNodeFunction } from './registry.js'
import { topologicalSort } from '../utils/graphUtils.js'
import { unwrapData } from '../utils/dataUtils.js'

/**
 * Extrai valor numérico de objetos aninhados ou wrapped data
 * @param {any} value - Valor a extrair
 * @returns {number}
 */
function extractNumericValue(value) {
  if (typeof value === 'number') return value

  if (typeof value === 'object' && value !== null) {
    // Wrapped data pattern: { value: X, __wrapped: true }
    if (value.__wrapped && value.value !== undefined) {
      return extractNumericValue(value.value)
    }

    // Buscar primeiro campo numérico
    const firstNumericValue = Object.values(value).find(v => typeof v === 'number')
    if (firstNumericValue !== undefined) return firstNumericValue

    // Tentar extrair de campos comuns
    if (value.result !== undefined) return extractNumericValue(value.result)
    if (value.data !== undefined) return extractNumericValue(value.data)
    if (value.value !== undefined) return extractNumericValue(value.value)
  }

  // Tentar converter string para número
  const num = Number(value)
  return isNaN(num) ? 0 : num
}


/**
 * Executa um node individual baseado na sua definição do catálogo
 * @param {Object} node - Instância do node (do flow do usuário)
 * @param {Object} nodeData - Dados de configuração do node
 * @param {Object} inputs - Inputs de dados recebidos
 * @param {Object} context - Contexto de execução (apiConfig, globalVariables, etc)
 * @returns {Promise<any>} Resultado da execução
 */
export async function executeNode(node, nodeData, inputs, context = {}) {
  const { type, id } = node

  // Buscar definição do node no catálogo
  const definition = getNodeDefinition(type)
  if (!definition) {
    throw new Error(`Node type "${type}" não encontrado no catálogo`)
  }

  // Verificar se é execução async ou sync
  const isAsync = definition.execution?.async !== false

  // Buscar função de execução
  const executeFunc = await getNodeFunction(type, 'method')
  if (!executeFunc) {
    throw new Error(`Método de execução não encontrado para node type "${type}"`)
  }

  try {
    // Mesclar valores dos inputs expostos com nodeData
    const mergedNodeData = { ...nodeData }


    // Se houver campos expostos, sobrescrever com valores dos inputs
    if (nodeData.exposedFields && inputs) {
      Object.keys(nodeData.exposedFields).forEach(fieldKey => {
        const inputKey = `exposed-${fieldKey}`.replace('data-', '')
        if (inputs[inputKey] !== undefined) {
          mergedNodeData[fieldKey] = inputs[inputKey]
        } else {
        }
      })
    }


    // Preparar argumentos para a função
    const args = {
      nodeData: mergedNodeData,
      inputs,
      context,
      nodeId: id
    }

    // Executar função (com timeout se definido)
    const timeout = definition.execution?.timeout || 30000
    const result = isAsync
      ? await executeWithTimeout(executeFunc(args), timeout)
      : executeFunc(args)

    return result
  } catch (error) {
    throw error
  }
}

/**
 * Executa uma função com timeout
 * @param {Promise} promise - Promise a executar
 * @param {number} timeout - Timeout em ms
 * @returns {Promise<any>}
 */
function executeWithTimeout(promise, timeout) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout após ${timeout}ms`)), timeout)
    )
  ])
}

/**
 * Verifica se um node tem todos os inputs obrigatórios
 * @param {Object} node - Instância do node
 * @param {Object} inputs - Inputs disponíveis
 * @returns {boolean}
 */
export function hasRequiredInputs(node, inputs) {
  const definition = getNodeDefinition(node.type)
  if (!definition) return false

  const dataInputs = definition.handles?.inputs?.data || []
  const requiredInputs = dataInputs.filter(input => input.required)

  if (requiredInputs.length === 0) {
    // Não há inputs obrigatórios, ok para executar
    return true
  }

  // Verificar se todos os inputs obrigatórios estão presentes
  for (const requiredInput of requiredInputs) {
    const inputKey = requiredInput.id.replace('data-', '')
    if (inputs[inputKey] === undefined) {
      return false
    }
  }

  return true
}

/**
 * Valida a configuração de um node antes da execução
 * @param {Object} node - Instância do node
 * @param {Object} nodeData - Dados de configuração
 * @returns {Object} { valid: boolean, errors: Array }
 */
export async function validateNodeExecution(node, nodeData) {
  const definition = getNodeDefinition(node.type)
  if (!definition) {
    return { valid: false, errors: [`Node type "${node.type}" não existe`] }
  }

  const errors = []

  // Validar campos obrigatórios da configuração
  const config = definition.config || {}
  for (const [fieldName, fieldDef] of Object.entries(config)) {
    if (fieldDef.required) {
      const value = nodeData[fieldName]
      if (value === undefined || value === null || value === '') {
        errors.push(`Campo obrigatório "${fieldName}" não preenchido`)
      }
    }
  }

  // Se houver validador customizado, executar
  if (definition.validator) {
    try {
      const validatorFunc = await getNodeFunction(node.type, 'validator')
      if (validatorFunc) {
        const customValidation = validatorFunc(nodeData)
        if (!customValidation.valid) {
          errors.push(...(customValidation.errors || ['Validação customizada falhou']))
        }
      }
    } catch (error) {
      // Error handled silently
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Determina o modo de execução de um node
 * @param {string} nodeType - Tipo do node
 * @returns {string} 'auto' ou 'manual'
 */
export function getExecutionMode(nodeType) {
  const definition = getNodeDefinition(nodeType)
  return definition?.execution?.mode || 'auto'
}

/**
 * Verifica se um node deve auto-executar quando inputs mudam
 * @param {string} nodeType - Tipo do node
 * @returns {boolean}
 */
export function shouldAutoExecute(nodeType) {
  return getExecutionMode(nodeType) === 'auto'
}

/**
 * Extrai os outputs de um node após execução
 * @param {Object} node - Instância do node
 * @param {any} result - Resultado da execução
 * @returns {Object} Mapa de outputs { handleId: value }
 */
export function extractOutputs(node, result) {
  const definition = getNodeDefinition(node.type)
  if (!definition) return {}

  const outputs = {}


  // Lógica para array processors (simples - um único output)
  if (['array-filter', 'array-aggregate', 'array-slice', 'array-merge', 'array-create'].includes(node.type)) {
    outputs['data-out'] = result
    return outputs
  }

  // Lógica para object processors (simples - um único output)
  if (['object-create'].includes(node.type)) {
    outputs['data-out'] = result
    return outputs
  }

  // Lógica especial para Input node
  if (node.type === 'input') {
    const parameters = node.data?.parameters || []

    // Mapear cada parâmetro para seu handle de output
    parameters.forEach((param, index) => {
      const handleId = `param-output-${index}`
      const paramName = param.name
      const paramValue = result[paramName]

      outputs[handleId] = paramValue
    })

    return outputs
  }

  // Lógica especial para Field Extractor
  // Field Extractor usa handles dinâmicos, mas para salvar/carregar
  // precisamos mapear para data-out também
  if (node.type === 'field-extractor') {
    const selectedFields = node.data?.selectedFields || []
    const unwrappedResult = result?.__wrapped ? result.__originalData : result

    // Mapear para data-out (output principal) - usar o valor extraído (value), não o wrapped
    outputs['data-out'] = result?.__wrapped ? result.value : result

    // Adicionar "all-data" se houver múltiplos campos
    if (selectedFields.length > 1) {
      outputs['all-data'] = result
    }

    // Mapear cada campo selecionado para seu handle dinâmico
    selectedFields.forEach(field => {
      const handleId = `field-${field.replace(/\./g, '-')}`

      // Extrair valor do campo do originalData
      let fieldValue
      if (Array.isArray(unwrappedResult)) {
        fieldValue = unwrappedResult.map(item => {
          const keys = field.split('.')
          let value = item
          for (const key of keys) {
            value = value?.[key]
          }
          return value
        })
      } else if (typeof unwrappedResult === 'object' && unwrappedResult !== null) {
        const keys = field.split('.')
        let value = unwrappedResult
        for (const key of keys) {
          value = value?.[key]
        }
        fieldValue = value
      }

      outputs[handleId] = fieldValue
    })

    return outputs
  }

  // Para Variable node, verificar dynamicHandles baseado no modo
  let dataOutputs = definition.handles?.outputs?.data || []

  if (definition.dynamicHandles && node.data) {
    // Obter a chave do modo (ex: "mode" para Variable, "valueType" para Constant)
    const modeKey = definition.dynamicHandles.mode
    const mode = node.data[modeKey] || modeKey

    if (definition.dynamicHandles[mode]) {
      dataOutputs = definition.dynamicHandles[mode].outputs?.data || []
    }
  }


  // Para nodes simples, mapear o resultado direto
  if (dataOutputs.length === 1) {
    const outputHandle = dataOutputs[0].id
    outputs[outputHandle] = result
  } else if (dataOutputs.length > 1) {
    // Para nodes com múltiplos outputs, resultado deve ser objeto
    if (typeof result === 'object' && result !== null) {
      dataOutputs.forEach(output => {
        const key = output.id.replace('data-', '')
        if (result[key] !== undefined) {
          outputs[output.id] = result[key]
        }
      })
    }
  }

  return outputs
}


/**
 * Exporta utilitários para compatibilidade com lógica existente
 */
export const utils = {
  extractNumericValue,
  unwrapData
}

// Re-export topologicalSort for backward compatibility
export { topologicalSort }

export default {
  executeNode,
  hasRequiredInputs,
  validateNodeExecution,
  getExecutionMode,
  shouldAutoExecute,
  extractOutputs,
  topologicalSort,
  utils
}
