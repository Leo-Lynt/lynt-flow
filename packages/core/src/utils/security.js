/**
 * Security utilities for safe data parsing and validation
 * @module utils/security
 */

import { z } from 'zod'

/**
 * Maximum depth for nested objects/arrays to prevent DoS
 */
const MAX_DEPTH = 10

/**
 * Maximum size for JSON strings (1MB)
 */
const MAX_JSON_SIZE = 1024 * 1024

/**
 * Checks if a string is valid JSON without parsing it
 * @param {string} str - String to validate
 * @returns {boolean} True if valid JSON
 */
export function isValidJSON(str) {
  if (typeof str !== 'string') return false
  if (str.length > MAX_JSON_SIZE) return false

  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

/**
 * Gets the depth of a nested object/array
 * @param {any} obj - Object to measure
 * @param {number} currentDepth - Current recursion depth
 * @returns {number} Maximum depth
 */
function getObjectDepth(obj, currentDepth = 0) {
  if (currentDepth > MAX_DEPTH) return currentDepth

  if (obj === null || typeof obj !== 'object') {
    return currentDepth
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return currentDepth + 1
    return Math.max(...obj.map(item => getObjectDepth(item, currentDepth + 1)))
  }

  const values = Object.values(obj)
  if (values.length === 0) return currentDepth + 1

  return Math.max(...values.map(value => getObjectDepth(value, currentDepth + 1)))
}

/**
 * Safely parses JSON with validation
 * @param {string} str - JSON string to parse
 * @param {z.ZodSchema} [schema] - Optional Zod schema for validation
 * @param {Object} [options] - Parsing options
 * @param {number} [options.maxDepth=10] - Maximum nesting depth
 * @param {number} [options.maxSize=1048576] - Maximum string size in bytes
 * @returns {any} Parsed and validated object
 * @throws {Error} If parsing fails or validation fails
 */
export function safeJSONParse(str, schema = null, options = {}) {
  const maxDepth = options.maxDepth || MAX_DEPTH
  const maxSize = options.maxSize || MAX_JSON_SIZE

  // Validate input type
  if (typeof str !== 'string') {
    throw new Error('Input must be a string')
  }

  // Validate size
  if (str.length > maxSize) {
    throw new Error(`JSON string exceeds maximum size of ${maxSize} bytes`)
  }

  // Validate JSON syntax
  if (!isValidJSON(str)) {
    throw new Error('Invalid JSON syntax')
  }

  // Parse JSON
  let parsed
  try {
    parsed = JSON.parse(str)
  } catch (error) {
    throw new Error(`JSON parse error: ${error.message}`)
  }

  // Validate depth
  const depth = getObjectDepth(parsed)
  if (depth > maxDepth) {
    throw new Error(`Object nesting exceeds maximum depth of ${maxDepth}`)
  }

  // Validate against schema if provided
  if (schema) {
    try {
      return schema.parse(parsed)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        throw new Error(`Schema validation failed: ${messages}`)
      }
      throw error
    }
  }

  return parsed
}

/**
 * Escapes special regex characters in a string
 * @param {string} str - String to escape
 * @returns {string} Escaped string safe for use in RegExp
 */
export function escapeRegex(str) {
  if (typeof str !== 'string') {
    throw new Error('Input must be a string')
  }
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Sanitizes HTML string by escaping special characters
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeHTMLString(str) {
  if (typeof str !== 'string') return ''

  const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }

  return str.replace(/[&<>"'/]/g, char => htmlEscapeMap[char])
}

/**
 * Creates a safe timeout wrapper for promises
 * @param {Promise} promise - Promise to wrap
 * @param {number} timeout - Timeout in milliseconds
 * @param {string} [errorMessage] - Custom error message
 * @returns {Promise} Promise that rejects on timeout
 */
export function withTimeout(promise, timeout, errorMessage = null) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(errorMessage || `Operation timed out after ${timeout}ms`)),
        timeout
      )
    )
  ])
}

/**
 * Common Zod schemas for validation
 */
export const schemas = {
  /**
   * Schema for safe object validation
   */
  safeObject: z.record(z.unknown()).refine(
    obj => getObjectDepth(obj) <= MAX_DEPTH,
    { message: `Object depth exceeds ${MAX_DEPTH} levels` }
  ),

  /**
   * Schema for safe array validation
   */
  safeArray: z.array(z.unknown()).refine(
    arr => getObjectDepth(arr) <= MAX_DEPTH,
    { message: `Array depth exceeds ${MAX_DEPTH} levels` }
  ),

  /**
   * Schema for primitive values (string, number, boolean, null)
   */
  primitive: z.union([z.string(), z.number(), z.boolean(), z.null()]),

  /**
   * Schema for any safe value (primitive, object, or array with depth limit)
   */
  safeValue: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.lazy(() => z.record(z.unknown())),
    z.lazy(() => z.array(z.unknown()))
  ]).refine(
    value => getObjectDepth(value) <= MAX_DEPTH,
    { message: `Value depth exceeds ${MAX_DEPTH} levels` }
  )
}

/**
 * Validates that a value is safe for storage/transmission
 * @param {any} value - Value to validate
 * @throws {Error} If value is unsafe
 */
export function validateSafeValue(value) {
  const depth = getObjectDepth(value)
  if (depth > MAX_DEPTH) {
    throw new Error(`Value nesting exceeds maximum depth of ${MAX_DEPTH}`)
  }

  // Check for prototype pollution attempts
  if (typeof value === 'object' && value !== null) {
    const keys = Object.keys(value)
    const dangerousKeys = ['__proto__', 'constructor', 'prototype']

    for (const key of keys) {
      if (dangerousKeys.includes(key)) {
        throw new Error(`Dangerous key detected: ${key}`)
      }
    }
  }
}
