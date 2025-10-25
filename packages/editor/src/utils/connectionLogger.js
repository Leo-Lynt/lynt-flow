/**
 * Connection Logger
 * Sistema centralizado de logging para debug de conexões entre nodes
 */

import { getNodeDefinition } from '../engine/registry'

export function logConnection(edge, nodes) {
  const sourceNode = nodes.find(n => n.id === edge.source)
  const targetNode = nodes.find(n => n.id === edge.target)

  if (!sourceNode || !targetNode) return

  // Pegar definições dos nodes
  const sourceDef = getNodeDefinition(sourceNode.type)
  const targetDef = getNodeDefinition(targetNode.type)

  // Buscar tipo do handle de saída
  const sourceHandleType = getHandleType(sourceNode, sourceDef, edge.sourceHandle, 'output')

  // Buscar tipo do handle de entrada
  const targetHandleType = getHandleType(targetNode, targetDef, edge.targetHandle, 'input')

  console.log('🔗 Edge connected:', {
    source: { node: sourceNode.type, handle: edge.sourceHandle, type: sourceHandleType },
    target: { node: targetNode.type, handle: edge.targetHandle, type: targetHandleType }
  })
}

function getHandleType(node, definition, handleId, direction) {
  if (!definition || !handleId) return 'unknown'

  // Para Input node, buscar tipo dos parâmetros
  if (node.type === 'input' && direction === 'output') {
    const paramIndex = parseInt(handleId.replace('param-output-', ''))
    const params = node.data?.parameters || []
    return params[paramIndex]?.type || 'any'
  }

  // Para outros nodes, buscar nos handles da definição
  const handles = direction === 'output'
    ? definition.handles?.outputs?.data
    : definition.handles?.inputs?.data

  if (!handles) return 'unknown'

  const handle = handles.find(h => h.id === handleId)
  return handle?.type || 'unknown'
}

function getValueType(value) {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (Array.isArray(value)) return 'array'
  // Detectar se é data no formato DD/MM/YYYY
  if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    return 'date'
  }
  return typeof value
}

function formatValue(value) {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'object') {
    return JSON.stringify(value).substring(0, 50) + '...'
  }
  return String(value).substring(0, 50)
}
