/**
 * Type System
 * Sistema centralizado de tipos que lê de nodes.json (via registry)
 * FONTE ÚNICA DE VERDADE: nodes.json
 *
 * Suporta tipos dinâmicos através da propriedade 'dynamic' nos handles
 */

import { getNodeDefinition } from './registry'
import { areTypesCompatible as dataTypesCompatible, loadDataTypes, detectValueType } from '@leo-lynt/lynt-flow-core/engine/dataTypes.js'

/**
 * Detecta tipo de um valor nos resultados de execução
 * @param {string} nodeId - ID do node
 * @param {string} handleId - ID do handle
 * @param {Object} flowStore - Store do flow
 * @returns {string} Tipo detectado ou 'any'
 */
function detectTypeFromExecution(nodeId, handleId, flowStore) {
  // 1. Tentar obter tipo dos resultados de execução atual
  if (flowStore?.executionResults?.[nodeId]) {
    const result = flowStore.executionResults[nodeId][handleId]
    if (result !== undefined) {
      return detectValueType(result)
    }
  }

  // 2. Se não houver execução, usar tipos salvos do arquivo (fallback)
  if (flowStore?.savedDetectedTypes?.[nodeId]?.[handleId]) {
    return flowStore.savedDetectedTypes[nodeId][handleId]
  }

  // 3. Se não houver nada, retornar 'any' (permite conexão flexível)
  return 'any'
}

/**
 * Infere tipo a partir de um input conectado
 * @param {string} nodeId - ID do node
 * @param {string} inputHandleId - ID do handle de input para inferir
 * @param {Object} flowStore - Store do flow
 * @returns {string} Tipo inferido ou 'any'
 */
function inferTypeFromInput(nodeId, inputHandleId, flowStore) {
  if (!flowStore?.edges || !flowStore?.nodes) {
    return 'any'
  }

  // Encontrar edge conectada ao input
  const inputEdge = flowStore.edges.find(e =>
    e.target === nodeId &&
    e.targetHandle === inputHandleId &&
    !e.sourceHandle?.startsWith('exec-')
  )

  if (!inputEdge) {
    return 'any'
  }

  // Obter tipo do source handle
  const sourceNode = flowStore.nodes.find(n => n.id === inputEdge.source)
  if (!sourceNode) {
    return 'any'
  }

  const sourceNodeData = flowStore.nodeData?.[sourceNode.id] || {}
  return getHandleType(sourceNode.type, sourceNodeData, inputEdge.sourceHandle, 'source', flowStore)
}

/**
 * Obtém tipo baseado em configuração do node
 * @param {Object} nodeData - Data do node
 * @param {string} configField - Campo de configuração
 * @returns {string} Tipo baseado na configuração
 */
function getTypeFromConfig(nodeData, configField) {
  const configValue = nodeData?.[configField]
  if (!configValue) {
    return 'any'
  }

  // Mapeamento direto de valores de config para tipos
  const typeMap = {
    'number': 'number',
    'string': 'string',
    'boolean': 'boolean',
    'object': 'object',
    'array': 'array',
    'null': 'any',
    'integer': 'integer',
    'float': 'float',
    'date': 'date'
  }

  return typeMap[configValue] || 'any'
}

/**
 * Detecta tipo wildcard (propaga tipo da conexão)
 * @param {Object} nodeData - Data do node
 * @param {string} position - 'source' ou 'target'
 * @param {Object} flowStore - Store do flow
 * @returns {string} Tipo detectado ou 'any'
 */
function detectWildcardType(nodeData, handleId, position, flowStore) {
  // Lógica específica para Variable node (já existente)
  const nodeId = nodeData?._nodeId
  const variableName = nodeData?.variableName
  const mode = nodeData?.mode || 'get'

  if (!flowStore || !nodeId) {
    return 'any'
  }

  if (position === 'source' && handleId === 'data-out') {
    // Se é SET mode, verifica input direto
    if (mode === 'set') {
      const inputEdges = flowStore.edges.filter(e =>
        e.target === nodeId &&
        e.targetHandle === 'data-input' &&
        !e.sourceHandle?.startsWith('exec-')
      )

      if (inputEdges.length > 0) {
        const sourceNode = flowStore.nodes.find(n => n.id === inputEdges[0].source)
        if (sourceNode) {
          const sourceNodeData = flowStore.nodeData[sourceNode.id]
          return getHandleType(sourceNode.type, sourceNodeData, inputEdges[0].sourceHandle, 'source', flowStore)
        }
      }
    }

    // Se é GET mode, procura SET com mesmo nome
    if (mode === 'get' && variableName) {
      const setVariables = flowStore.nodes.filter(n =>
        n.type === 'variable' &&
        n.id !== nodeId &&
        flowStore.nodeData[n.id]?.mode === 'set' &&
        flowStore.nodeData[n.id]?.variableName === variableName
      )

      for (const setVar of setVariables) {
        const inputEdges = flowStore.edges.filter(e =>
          e.target === setVar.id &&
          e.targetHandle === 'data-input' &&
          !e.sourceHandle?.startsWith('exec-')
        )

        if (inputEdges.length > 0) {
          const sourceNode = flowStore.nodes.find(n => n.id === inputEdges[0].source)
          if (sourceNode) {
            const sourceNodeData = flowStore.nodeData[sourceNode.id]
            return getHandleType(sourceNode.type, sourceNodeData, inputEdges[0].sourceHandle, 'source', flowStore)
          }
        }
      }
    }
  }

  return 'any'
}

/**
 * Obtém tipo dinâmico de um handle
 * @param {string} nodeType - Tipo do node
 * @param {Object} nodeData - Data do node
 * @param {string} handleId - ID do handle
 * @param {string} position - 'source' ou 'target'
 * @param {Object} handleDef - Definição do handle do nodes.json
 * @param {Object} flowStore - Store do flow
 * @returns {string} Tipo dinâmico detectado
 */
function getDynamicHandleType(nodeType, nodeData, handleId, position, handleDef, flowStore) {
  const dynamicConfig = handleDef?.dynamic

  if (!dynamicConfig) {
    return handleDef?.type || 'any'
  }

  const nodeId = nodeData?._nodeId

  switch (dynamicConfig.mode) {
    case 'runtime-detection':
      return detectTypeFromExecution(nodeId, handleId, flowStore)

    case 'input-inference':
      return inferTypeFromInput(nodeId, dynamicConfig.inferFrom || handleId, flowStore)

    case 'config-based':
      return getTypeFromConfig(nodeData, dynamicConfig.configField)

    case 'wildcard':
      return detectWildcardType(nodeData, handleId, position, flowStore)

    default:
      return handleDef?.type || 'any'
  }
}

/**
 * Obtém o tipo de um handle específico
 * @param {string} nodeType - Tipo do node (ex: 'add', 'connector')
 * @param {Object} nodeData - Data do node (para handles dinâmicos)
 * @param {string} handleId - ID do handle (ex: 'data-out', 'data-a')
 * @param {string} position - 'source' (output) ou 'target' (input)
 * @param {Object} flowStore - Store do flow (para casos dinâmicos)
 * @returns {string} Tipo do handle (ex: 'array', 'number', 'string', 'any')
 */
export function getHandleType(nodeType, nodeData, handleId, position, flowStore = null) {
  // Field Extractor - outputs dinâmicos baseados em campos extraídos (LEGADO - manter por enquanto)
  if (nodeType === 'field-extractor') {
    if (handleId === 'all-data') {
      return 'object'
    }
    // Outputs dinâmicos de campos
    const fieldTypes = nodeData?.fieldTypes || {}
    const fieldName = handleId.replace('field-', '').replace(/-/g, '.')
    return fieldTypes[fieldName] || 'any'
  }

  // Output node - inputs dinâmicos baseados em configuração do usuário (LEGADO - manter por enquanto)
  if (nodeType === 'output') {
    const customInputs = nodeData?.customInputs || []
    const inputIndex = parseInt(handleId.replace('data-input-', ''))
    return customInputs[inputIndex]?.type || 'any'
  }

  // Input node - outputs dinâmicos baseados em parameters (LEGADO - manter por enquanto)
  if (nodeType === 'input') {
    const parameters = nodeData?.parameters || []
    const paramIndex = parseInt(handleId.replace('param-output-', ''))
    return parameters[paramIndex]?.type || 'any'
  }

  // 2. Lógica principal - ler de nodes.json via registry
  const definition = getNodeDefinition(nodeType)
  if (!definition || !definition.handles) {
    return 'any'
  }

  // Determinar se é input ou output
  let handleGroup = position === 'source' ? definition.handles.outputs : definition.handles.inputs
  if (definition.dynamicHandles && nodeData) {
    const modeKey = definition.dynamicHandles.mode
    let dynamicKey = 'mode'
    if (!definition.dynamicHandles[modeKey]) {
      dynamicKey = modeKey
    }
    const selectedValue = nodeData[dynamicKey] || modeKey
    const dynamicHandleSet = definition.dynamicHandles[selectedValue]
    if (dynamicHandleSet) {
      handleGroup = position === 'source' ? dynamicHandleSet.outputs : dynamicHandleSet.inputs
    }
  }

  if (!handleGroup || !handleGroup.data) {
    return 'any'
  }

  // Buscar o handle específico
  const handle = handleGroup.data.find(h => h.id === handleId)

  if (!handle) {
    return 'any'
  }

  // Se o handle tem configuração de tipo dinâmico, usar getDynamicHandleType
  if (handle.dynamic) {
    return getDynamicHandleType(nodeType, nodeData, handleId, position, handle, flowStore)
  }

  // Caso padrão: retornar tipo estático
  return handle.type || 'any'
}

/**
 * Obtém os tipos aceitos por um handle de input
 * @param {string} nodeType - Tipo do node
 * @param {string} handleId - ID do handle
 * @returns {Array<string>} Array de tipos aceitos (ex: ['array'], ['number', 'integer', 'float'])
 */
export function getAcceptedTypes(nodeType, handleId) {
  // Para handles de execução, qualquer tipo exec é compatível
  if (handleId.startsWith('exec-')) {
    return ['exec']
  }

  // Ler de nodes.json via registry
  const definition = getNodeDefinition(nodeType)
  if (!definition || !definition.handles || !definition.handles.inputs || !definition.handles.inputs.data) {
    return ['any'] // Se não tem definição, aceita qualquer tipo
  }

  // Buscar o handle específico
  const handle = definition.handles.inputs.data.find(h => h.id === handleId)

  if (!handle || !handle.type) {
    return ['any']
  }

  // Se o tipo é um array de tipos aceitos
  if (Array.isArray(handle.type)) {
    return handle.type
  }

  // Se é string única, retornar como array
  return [handle.type]
}

/**
 * Verifica se dois tipos são compatíveis
 * Usa a tabela de compatibilidade de dataTypes.json
 * @param {string} sourceType - Tipo do output (origem)
 * @param {string} targetType - Tipo do input (destino)
 * @returns {boolean} True se são compatíveis
 */
export async function areTypesCompatible(sourceType, targetType) {
  // Garantir que dataTypes esteja carregado
  await loadDataTypes()

  // Usar função do dataTypes.js
  return dataTypesCompatible(sourceType, targetType)
}

/**
 * Verifica se uma conexão é válida baseada nos tipos aceitos
 * @param {string} sourceType - Tipo do output (origem)
 * @param {Array<string>} acceptedTypes - Tipos aceitos pelo input
 * @returns {boolean} True se é válido
 */
export function isConnectionValid(sourceType, acceptedTypes) {
  // Handles de execução
  if (sourceType === 'exec' || acceptedTypes.includes('exec')) {
    return sourceType === 'exec' && acceptedTypes.includes('exec')
  }

  // Se aceita 'any', sempre válido
  if (acceptedTypes.includes('any')) {
    return true
  }

  // Se o source é 'any', permite conectar com qualquer tipo (outputs dinâmicos não executados)
  if (sourceType === 'any') {
    return true
  }

  // Verifica se o tipo de origem está na lista de aceitos
  if (acceptedTypes.includes(sourceType)) {
    return true
  }

  // Compatibilidade especial: number, integer e float são compatíveis entre si
  const numericTypes = ['number', 'integer', 'float']
  if (numericTypes.includes(sourceType)) {
    return acceptedTypes.some(t => numericTypes.includes(t))
  }

  return false
}

/**
 * Valida uma conexão completa entre dois nodes
 * @param {Object} sourceNode - Node de origem
 * @param {string} sourceHandle - Handle de origem
 * @param {Object} targetNode - Node de destino
 * @param {string} targetHandle - Handle de destino
 * @param {Object} flowStore - Store do flow
 * @returns {boolean} True se a conexão é válida
 */
export function validateConnection(sourceNode, sourceHandle, targetNode, targetHandle, flowStore) {
  // Obter nodeData e adicionar _nodeId para detecção de tipos dinâmicos
  const sourceNodeData = { ...(flowStore.nodeData[sourceNode.id] || {}), _nodeId: sourceNode.id }
  const targetNodeData = { ...(flowStore.nodeData[targetNode.id] || {}), _nodeId: targetNode.id }

  // Handles de execução sempre são válidos
  if (sourceHandle.startsWith('exec-')) {
    return true
  }

  // Obter tipo do handle de origem (pode ser dinâmico)
  const sourceType = getHandleType(sourceNode.type, sourceNodeData, sourceHandle, 'source', flowStore)

  // Obter tipos aceitos pelo handle de destino
  const acceptedTypes = getAcceptedTypes(targetNode.type, targetHandle)


  // Validar
  const isValid = isConnectionValid(sourceType, acceptedTypes)

  return isValid
}
