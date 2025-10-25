/**
 * Clone utilities for safe deep copying of objects
 * @module utils/cloneUtils
 */

import { validateSafeValue } from './security.js'

/**
 * Maximum depth for cloning to prevent stack overflow
 */
const MAX_CLONE_DEPTH = 10

/**
 * Safely deep clones an object with depth validation
 * Uses structuredClone when available (modern browsers), falls back to manual clone
 * @param {any} obj - Object to clone
 * @param {Object} [options] - Clone options
 * @param {number} [options.maxDepth=10] - Maximum nesting depth
 * @param {boolean} [options.preserveFunctions=false] - Preserve functions (not recommended)
 * @returns {any} Deep cloned object
 * @throws {Error} If object is too deeply nested or contains unsafe values
 */
export function deepClone(obj, options = {}) {
  const maxDepth = options.maxDepth || MAX_CLONE_DEPTH
  const preserveFunctions = options.preserveFunctions || false

  // Validate safety before cloning
  try {
    validateSafeValue(obj)
  } catch (error) {
    throw new Error(`Cannot clone unsafe value: ${error.message}`)
  }

  // Use structuredClone if available (most efficient and safe)
  if (typeof structuredClone === 'function' && !preserveFunctions) {
    try {
      return structuredClone(obj)
    } catch (error) {
      // Fall through to manual clone if structuredClone fails
      console.warn('structuredClone failed, falling back to manual clone:', error.message)
    }
  }

  // Manual deep clone with depth tracking
  return deepCloneManual(obj, maxDepth, 0, new WeakMap(), preserveFunctions)
}

/**
 * Manual deep clone implementation with circular reference detection
 * @private
 * @param {any} obj - Object to clone
 * @param {number} maxDepth - Maximum allowed depth
 * @param {number} currentDepth - Current recursion depth
 * @param {WeakMap} visited - Tracks visited objects to detect circular references
 * @param {boolean} preserveFunctions - Whether to preserve functions
 * @returns {any} Cloned object
 */
function deepCloneManual(obj, maxDepth, currentDepth, visited, preserveFunctions) {
  // Check depth limit
  if (currentDepth > maxDepth) {
    throw new Error(`Clone depth exceeds maximum of ${maxDepth} levels`)
  }

  // Handle primitives and null
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'function' && !preserveFunctions) {
      return undefined // Skip functions by default
    }
    return obj
  }

  // Check for circular references
  if (visited.has(obj)) {
    throw new Error('Circular reference detected during clone')
  }

  // Mark as visited
  visited.set(obj, true)

  try {
    // Handle Date
    if (obj instanceof Date) {
      return new Date(obj.getTime())
    }

    // Handle RegExp
    if (obj instanceof RegExp) {
      return new RegExp(obj.source, obj.flags)
    }

    // Handle Array
    if (Array.isArray(obj)) {
      return obj.map(item =>
        deepCloneManual(item, maxDepth, currentDepth + 1, visited, preserveFunctions)
      )
    }

    // Handle Map
    if (obj instanceof Map) {
      const clonedMap = new Map()
      obj.forEach((value, key) => {
        clonedMap.set(
          key,
          deepCloneManual(value, maxDepth, currentDepth + 1, visited, preserveFunctions)
        )
      })
      return clonedMap
    }

    // Handle Set
    if (obj instanceof Set) {
      const clonedSet = new Set()
      obj.forEach(value => {
        clonedSet.add(
          deepCloneManual(value, maxDepth, currentDepth + 1, visited, preserveFunctions)
        )
      })
      return clonedSet
    }

    // Handle plain objects
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Skip __proto__ and other dangerous keys
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          continue
        }

        clonedObj[key] = deepCloneManual(
          obj[key],
          maxDepth,
          currentDepth + 1,
          visited,
          preserveFunctions
        )
      }
    }

    return clonedObj
  } finally {
    // Remove from visited when done to allow cloning same object in different branches
    visited.delete(obj)
  }
}

/**
 * Shallow clone (only top level)
 * @param {any} obj - Object to clone
 * @returns {any} Shallow cloned object
 */
export function shallowClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return [...obj]
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags)
  }

  if (obj instanceof Map) {
    return new Map(obj)
  }

  if (obj instanceof Set) {
    return new Set(obj)
  }

  return { ...obj }
}

/**
 * Checks if two values are deeply equal
 * @param {any} a - First value
 * @param {any} b - Second value
 * @param {number} [maxDepth=10] - Maximum depth to check
 * @returns {boolean} True if deeply equal
 */
export function deepEqual(a, b, maxDepth = 10) {
  return deepEqualInternal(a, b, 0, maxDepth, new WeakMap())
}

/**
 * Internal deep equality check
 * @private
 */
function deepEqualInternal(a, b, currentDepth, maxDepth, visited) {
  if (currentDepth > maxDepth) {
    throw new Error(`Equality check depth exceeds maximum of ${maxDepth} levels`)
  }

  // Same reference
  if (a === b) return true

  // Different types or null
  if (typeof a !== typeof b || a === null || b === null) return false

  // Not objects
  if (typeof a !== 'object') return a === b

  // Check for circular references
  if (visited.has(a)) {
    return visited.get(a) === b
  }
  visited.set(a, b)

  // Arrays
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false
    return a.every((item, i) =>
      deepEqualInternal(item, b[i], currentDepth + 1, maxDepth, visited)
    )
  }

  // Objects
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  return keysA.every(key =>
    keysB.includes(key) &&
    deepEqualInternal(a[key], b[key], currentDepth + 1, maxDepth, visited)
  )
}
