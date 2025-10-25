/**
 * Node Executor - Core Implementation
 * Executa nodes individuais de forma pura e independente de ambiente
 *
 * Este módulo contém TODA a lógica de execução de nodes e deve ser usado
 * tanto no frontend quanto na API através de Dependency Injection.
 */

import { topologicalSort } from '../utils/graphUtils.js'
import { unwrapData } from '../utils/dataUtils.js'

/**
 * Extrai valor numérico de objetos aninhados ou wrapped data
 * @param {any} value - Valor a extrair
 * @returns {number}
 */
export function extractNumericValue(value) {
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
 * Navega em objeto usando dot notation (ex: "user.address.city")
 * @param {Object} obj - Objeto a navegar
 * @param {string} path - Caminho em dot notation
 * @returns {any} Valor encontrado
 */
export function getValueByPath(obj, path) {
  if (!obj || !path) return undefined

  const keys = path.split('.')
  let value = obj

  for (const key of keys) {
    if (value === null || value === undefined) return undefined
    value = value[key]
  }

  return value
}

/**
 * Executa um node individual baseado na sua definição do catálogo
 *
 * IMPORTANTE: Esta função é PURA - não depende de registry global.
 * O registry é injetado via context.registry.
 *
 * @param {Object} node - Instância do node (do flow do usuário)
 * @param {Object} nodeData - Dados de configuração do node
 * @param {Object} inputs - Inputs de dados recebidos
 * @param {Object} context - Contexto de execução
 * @param {Object} context.registry - Registry com getNodeDefinition e getNodeFunction
 * @param {Object} [context.apiConfig] - Configuração de API
 * @param {Object} [context.globalVariables] - Variáveis globais
 * @param {Object} [context.adapters] - Adapters de data sources
 * @returns {Promise<any>} Resultado da execução
 */
export async function executeNode(node, nodeData, inputs, context = {}) {
  const { type, id } = node

  // Registry DEVE ser injetado via context
  if (!context.registry) {
    throw new Error('context.registry is required for executeNode')
  }

  const { getNodeDefinition, getNodeFunction } = context.registry

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
 * @param {Object} context - Contexto com registry
 * @returns {boolean}
 */
export function hasRequiredInputs(node, inputs, context = {}) {
  if (!context.registry) {
    throw new Error('context.registry is required')
  }

  const definition = context.registry.getNodeDefinition(node.type)
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
 * @param {Object} context - Contexto com registry
 * @returns {Promise<Object>} { valid: boolean, errors: Array }
 */
export async function validateNodeExecution(node, nodeData, context = {}) {
  if (!context.registry) {
    throw new Error('context.registry is required')
  }

  const { getNodeDefinition, getNodeFunction } = context.registry
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
      // Validador falhou, mas não bloqueia
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
 * @param {Object} context - Contexto com registry
 * @returns {string} 'auto' ou 'manual'
 */
export function getExecutionMode(nodeType, context = {}) {
  if (!context.registry) {
    throw new Error('context.registry is required')
  }

  const definition = context.registry.getNodeDefinition(nodeType)
  return definition?.execution?.mode || 'auto'
}

/**
 * Verifica se um node deve auto-executar quando inputs mudam
 * @param {string} nodeType - Tipo do node
 * @param {Object} context - Contexto com registry
 * @returns {boolean}
 */
export function shouldAutoExecute(nodeType, context = {}) {
  return getExecutionMode(nodeType, context) === 'auto'
}

/**
 * Extrai os outputs de um node após execução
 *
 * REFATORADO: Usa definições do nodes.json ao invés de hardcoded logic
 *
 * @param {Object} node - Instância do node
 * @param {any} result - Resultado da execução
 * @param {Object} context - Contexto com registry
 * @returns {Object} Mapa de outputs { handleId: value }
 */
export function extractOutputs(node, result, context = {}) {
  if (!context.registry) {
    throw new Error('context.registry is required')
  }

  const definition = context.registry.getNodeDefinition(node.type)
  if (!definition) return {}

  const outputs = {}

  // 1. Verificar se node tem outputMapping especial (NOVO)
  if (definition.outputMapping) {
    return extractDynamicOutputs(node, result, definition, outputs)
  }

  // 2. Lógica especial para nodes específicos (TEMPORÁRIO - migrar para outputMapping)
  // TODO: Migrar estes para outputMapping em nodes.json

  // Connector - simples, único output
  if (node.type === 'connector') {
    outputs['data-out'] = result
    return outputs
  }

  // Array/Object processors - único output
  if (['constant', 'array-filter', 'array-aggregate', 'array-slice', 'array-merge',
       'array-create', 'object-create'].includes(node.type)) {
    outputs['data-out'] = result
    return outputs
  }

  // Input node - múltiplos outputs dinâmicos
  if (node.type === 'input') {
    const parameters = node.data?.parameters || []
    parameters.forEach((param, index) => {
      const handleId = `param-output-${index}`
      outputs[handleId] = result[param.name]
    })
    return outputs
  }

  // Output node - retorna dados coletados em data-out
  if (node.type === 'output') {
    outputs['data-out'] = result
    return outputs
  }

  // Field Extractor - outputs dinâmicos por campo
  if (node.type === 'field-extractor') {
    const selectedFields = node.data?.selectedFields || []
    const unwrappedResult = result?.__wrapped ? result.__originalData : result

    // Output principal
    outputs['data-out'] = result?.__wrapped ? result.value : result

    // All-data se múltiplos campos
    if (selectedFields.length > 1) {
      outputs['all-data'] = result
    }

    // Outputs dinâmicos por campo
    selectedFields.forEach(field => {
      const handleId = `field-${field.replace(/\./g, '-')}`
      outputs[handleId] = extractFieldValue(unwrappedResult, field)
    })

    return outputs
  }

  // 3. Lógica padrão baseada em handles da definição
  let dataOutputs = definition.handles?.outputs?.data || []

  // Dynamic handles baseado em modo (ex: Variable node)
  if (definition.dynamicHandles && node.data) {
    const modeKey = definition.dynamicHandles.mode
    const mode = node.data[modeKey] || modeKey

    if (definition.dynamicHandles[mode]) {
      dataOutputs = definition.dynamicHandles[mode].outputs?.data || []
    }
  }

  // Mapear outputs
  if (dataOutputs.length === 1) {
    outputs[dataOutputs[0].id] = result
  } else if (dataOutputs.length > 1) {
    // Múltiplos outputs: resultado deve ser objeto
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
 * Extrai outputs dinâmicos baseado em outputMapping (NOVO)
 * @private
 */
function extractDynamicOutputs(node, result, definition, outputs) {
  const mapping = definition.outputMapping

  if (mapping.mode === 'dynamic') {
    // Ex: Field Extractor, Input
    const fields = node.data?.[mapping.fieldSource] || []

    if (Array.isArray(fields)) {
      fields.forEach((field, index) => {
        const handleId = mapping.template
          .replace('{fieldName}', typeof field === 'string' ? field : field.name)
          .replace('{index}', index)

        const value = typeof field === 'string'
          ? getValueByPath(result, field)
          : result[field.name]

        outputs[handleId] = value
      })
    }
  }

  // Sempre adicionar output principal se definido
  if (mapping.mainOutput) {
    outputs[mapping.mainOutput] = result
  }

  return outputs
}

/**
 * Extrai valor de campo de objeto/array
 * @private
 */
function extractFieldValue(data, field) {
  if (Array.isArray(data)) {
    return data.map(item => getValueByPath(item, field))
  } else if (typeof data === 'object' && data !== null) {
    return getValueByPath(data, field)
  }
  return undefined
}

/**
 * Exporta utilitários para compatibilidade
 */
export const utils = {
  extractNumericValue,
  unwrapData,
  getValueByPath
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
