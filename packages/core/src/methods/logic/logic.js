/**
 * Logic Operations
 * Operações lógicas (AND, OR, NOT)
 */

import { unwrapData } from '../../utils/dataUtils.js'


/**
 * AND (&&)
 */
export function logicAnd({ nodeData, inputs }) {
  const a = unwrapData(inputs.a)
  const b = unwrapData(inputs.b)

  return Boolean(a) && Boolean(b)
}

/**
 * OR (||)
 */
export function logicOr({ nodeData, inputs }) {
  const a = unwrapData(inputs.a)
  const b = unwrapData(inputs.b)

  return Boolean(a) || Boolean(b)
}

/**
 * NOT (!)
 */
export function logicNot({ nodeData, inputs }) {
  const value = unwrapData(inputs.value)

  return !Boolean(value)
}

/**
 * Execute (unified logic node)
 * Usa a operação selecionada no config
 */
export function execute({ nodeData, inputs }) {
  const operation = nodeData.operation || 'and'

  switch (operation) {
    case 'and':
      return logicAnd({ nodeData, inputs })
    case 'or':
      return logicOr({ nodeData, inputs })
    case 'not':
      return logicNot({ nodeData, inputs })
    default:
      throw new Error(`Unknown logic operation: ${operation}`)
  }
}

/**
 * Validate configuration
 */
export function validate(nodeData) {
  const validOperations = ['and', 'or', 'not']

  if (!nodeData.operation || !validOperations.includes(nodeData.operation)) {
    return {
      valid: false,
      errors: ['Invalid operation']
    }
  }

  return {
    valid: true,
    errors: []
  }
}
