/**
 * String Operations
 * Operações com strings (concat, split, replace, template) com proteção ReDoS
 */

import { unwrapData } from '../../utils/dataUtils.js'
import { escapeRegex, withTimeout } from '../../utils/security.js'


/**
 * Maximum length for string operations to prevent DoS
 */
const MAX_STRING_LENGTH = 10 * 1024 * 1024 // 10MB

/**
 * Timeout for regex operations in milliseconds
 */
const REGEX_TIMEOUT = 5000 // 5 seconds

/**
 * Validates string length
 * @private
 */
function validateStringLength(str, operationName) {
  const strValue = String(str)
  if (strValue.length > MAX_STRING_LENGTH) {
    throw new Error(`String too large for ${operationName} operation (max ${MAX_STRING_LENGTH} bytes)`)
  }
  return strValue
}

/**
 * Concat - concatena duas strings
 */
export function stringConcat({ nodeData, inputs }) {
  const a = validateStringLength(unwrapData(inputs.a), 'concat')
  const b = validateStringLength(unwrapData(inputs.b), 'concat')

  const result = a + b
  if (result.length > MAX_STRING_LENGTH) {
    throw new Error('Concatenated string exceeds maximum length')
  }

  return result
}

/**
 * Split - divide string em array
 */
export function stringSplit({ nodeData, inputs }) {
  const input = validateStringLength(unwrapData(inputs.input), 'split')
  const separator = validateStringLength(unwrapData(inputs.separator), 'split')

  // Use literal split (no regex) for safety
  const result = input.split(separator)

  // Limit number of resulting parts to prevent memory exhaustion
  const MAX_PARTS = 100000
  if (result.length > MAX_PARTS) {
    throw new Error(`Split would create too many parts (max ${MAX_PARTS})`)
  }

  return result
}

/**
 * Replace - substitui texto (literal, não regex por padrão para evitar ReDoS)
 */
export function stringReplace({ nodeData, inputs }) {
  const input = validateStringLength(unwrapData(inputs.input), 'replace')
  const search = validateStringLength(unwrapData(inputs.search), 'replace')
  const replaceWith = validateStringLength(unwrapData(inputs.replace), 'replace')

  // Use literal replace with escaped regex for safety (prevents ReDoS)
  const escapedSearch = escapeRegex(search)

  // Wrap regex operation with timeout
  const replaceOperation = () => {
    return input.replace(new RegExp(escapedSearch, 'g'), replaceWith)
  }

  try {
    // For now, execute directly (timeout wrapper is complex for sync operations)
    // In production, consider using a Worker for true timeout
    return replaceOperation()
  } catch (error) {
    throw new Error(`Replace operation failed: ${error.message}`)
  }
}

/**
 * Template - substitui placeholders {name} com valores
 */
export function stringTemplate({ nodeData, inputs }) {
  const template = nodeData.templateString || ''

  // Encontrar todos os placeholders {name}
  const placeholderRegex = /\{([^}]+)\}/g
  let result = template
  let match

  while ((match = placeholderRegex.exec(template)) !== null) {
    const placeholder = match[1] // ex: "name"
    const value = unwrapData(inputs[placeholder])

    if (value !== undefined && value !== null) {
      result = result.replace(`{${placeholder}}`, String(value))
    }
  }

  return result
}

/**
 * Execute (unified string ops node)
 */
export function execute({ nodeData, inputs }) {
  const operation = nodeData.operation || 'concat'

  switch (operation) {
    case 'concat':
      return stringConcat({ nodeData, inputs })
    case 'split':
      return stringSplit({ nodeData, inputs })
    case 'replace':
      return stringReplace({ nodeData, inputs })
    case 'template':
      return stringTemplate({ nodeData, inputs })
    default:
      throw new Error(`Unknown string operation: ${operation}`)
  }
}

/**
 * Validate configuration
 */
export function validate(nodeData) {
  const validOperations = ['concat', 'split', 'replace', 'template']

  if (!nodeData.operation || !validOperations.includes(nodeData.operation)) {
    return {
      valid: false,
      errors: ['Invalid operation']
    }
  }

  if (nodeData.operation === 'template' && !nodeData.templateString) {
    return {
      valid: false,
      errors: ['Template string is required']
    }
  }

  return {
    valid: true,
    errors: []
  }
}
