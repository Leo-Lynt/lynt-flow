/**
 * Type Conversion
 * Converte valores entre tipos (number, string, boolean)
 */

import { unwrapData } from '../../utils/dataUtils.js'


/**
 * Execute type conversion
 */
export function execute({ nodeData, inputs }) {
  const value = unwrapData(inputs.value)
  const targetType = nodeData.targetType || 'string'

  switch (targetType) {
    case 'number':
      // Convert to number
      if (typeof value === 'number') return value
      if (typeof value === 'boolean') return value ? 1 : 0
      if (typeof value === 'string') {
        const num = Number(value)
        if (isNaN(num)) {
          throw new Error(`Cannot convert "${value}" to number`)
        }
        return num
      }
      if (value === null || value === undefined) return 0
      throw new Error(`Cannot convert ${typeof value} to number`)

    case 'string':
      // Convert to string
      if (typeof value === 'string') return value
      if (value === null) return 'null'
      if (value === undefined) return 'undefined'
      if (typeof value === 'object') return JSON.stringify(value)
      return String(value)

    case 'boolean':
      // Convert to boolean (truthy/falsy)
      return Boolean(value)

    default:
      throw new Error(`Unknown target type: ${targetType}`)
  }
}

/**
 * Validate configuration
 */
export function validate(nodeData) {
  const validTypes = ['number', 'string', 'boolean']

  if (!nodeData.targetType || !validTypes.includes(nodeData.targetType)) {
    return {
      valid: false,
      errors: ['Invalid target type']
    }
  }

  return {
    valid: true,
    errors: []
  }
}
