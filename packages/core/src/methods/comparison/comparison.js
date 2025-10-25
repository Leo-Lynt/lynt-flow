/**
 * Comparison Operations
 * Funções de comparação entre valores
 */

import { unwrapData } from '../../utils/dataUtils.js'


/**
 * Equals (==)
 */
export function equals({ nodeData, inputs }) {
  const a = unwrapData(inputs.a)
  const b = unwrapData(inputs.b)

  return a === b
}

/**
 * Not Equals (!=)
 */
export function notEquals({ nodeData, inputs }) {
  const a = unwrapData(inputs.a)
  const b = unwrapData(inputs.b)

  return a !== b
}

/**
 * Greater Than (>)
 */
export function greaterThan({ nodeData, inputs }) {
  const a = unwrapData(inputs.a)
  const b = unwrapData(inputs.b)

  return a > b
}

/**
 * Less Than (<)
 */
export function lessThan({ nodeData, inputs }) {
  const a = unwrapData(inputs.a)
  const b = unwrapData(inputs.b)

  return a < b
}

/**
 * Greater or Equal (>=)
 */
export function greaterOrEqual({ nodeData, inputs }) {
  const a = unwrapData(inputs.a)
  const b = unwrapData(inputs.b)

  return a >= b
}

/**
 * Less or Equal (<=)
 */
export function lessOrEqual({ nodeData, inputs }) {
  const a = unwrapData(inputs.a)
  const b = unwrapData(inputs.b)

  return a <= b
}

/**
 * Compare (unified comparison node)
 * Usa a operação selecionada no config
 */
export function compare({ nodeData, inputs }) {
  const operation = nodeData.operation || 'equals'

  switch (operation) {
    case 'equals':
      return equals({ nodeData, inputs })
    case 'not-equals':
      return notEquals({ nodeData, inputs })
    case 'greater-than':
      return greaterThan({ nodeData, inputs })
    case 'less-than':
      return lessThan({ nodeData, inputs })
    case 'greater-or-equal':
      return greaterOrEqual({ nodeData, inputs })
    case 'less-or-equal':
      return lessOrEqual({ nodeData, inputs })
    default:
      throw new Error(`Unknown comparison operation: ${operation}`)
  }
}

/**
 * Valida configuração (mesma para todos)
 */
export function validate(nodeData) {
  // Comparison nodes não têm configuração
  return {
    valid: true,
    errors: []
  }
}
