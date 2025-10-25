/**
 * Path utilities for safe object/array navigation
 * @module core/utils/pathUtils
 */

import { deepClone } from './deepClone.js'

/**
 * Gets a value from an object using a dot-notation path
 * @param {any} obj - Source object or array
 * @param {string} path - Dot-notation path (e.g., "user.address.city")
 * @param {any} [defaultValue=undefined] - Default value if path not found
 * @returns {any} Value at path or default value
 * @example
 * getValueByPath({ user: { name: 'John' } }, 'user.name') // 'John'
 * getValueByPath({ items: [1, 2, 3] }, 'items.0') // 1
 */
export function getValueByPath(obj, path, defaultValue = undefined) {
  // Handle empty or invalid path
  if (!path || typeof path !== 'string') {
    return obj !== undefined ? obj : defaultValue
  }

  // Handle null or undefined source
  if (obj === null || obj === undefined) {
    return defaultValue
  }

  // Split path and navigate
  const keys = path.split('.')
  let current = obj

  for (const key of keys) {
    // Check if current is null/undefined
    if (current === null || current === undefined) {
      return defaultValue
    }

    // Handle array index access
    if (Array.isArray(current)) {
      const index = parseInt(key, 10)
      if (isNaN(index) || index < 0 || index >= current.length) {
        return defaultValue
      }
      current = current[index]
    } else if (typeof current === 'object') {
      // Handle object property access
      if (!(key in current)) {
        return defaultValue
      }
      current = current[key]
    } else {
      // Can't navigate further into primitive
      return defaultValue
    }
  }

  return current
}

/**
 * Sets a value in an object using a dot-notation path (immutable)
 * Creates a deep clone and modifies the clone
 * @param {Object} obj - Source object
 * @param {string} path - Dot-notation path
 * @param {any} value - Value to set
 * @returns {Object} New object with value set
 * @throws {Error} If path is invalid or object is not cloneable
 * @example
 * setValueByPath({ user: { name: 'John' } }, 'user.age', 30)
 * // { user: { name: 'John', age: 30 } }
 */
export function setValueByPath(obj, path, value) {
  // Validate inputs
  if (typeof path !== 'string' || !path) {
    throw new Error('Path must be a non-empty string')
  }

  if (obj === null || obj === undefined) {
    throw new Error('Cannot set value on null or undefined object')
  }

  // Deep clone to maintain immutability
  const result = deepClone(obj)

  // Split path
  const keys = path.split('.')
  let current = result

  // Navigate to parent of target
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]

    // Create nested object if it doesn't exist or is not an object
    if (!current[key] || typeof current[key] !== 'object' || Array.isArray(current[key])) {
      current[key] = {}
    }

    current = current[key]
  }

  // Set the value at the final key
  const finalKey = keys[keys.length - 1]
  current[finalKey] = value

  return result
}

/**
 * Checks if a path exists in an object
 * @param {any} obj - Source object
 * @param {string} path - Dot-notation path
 * @returns {boolean} True if path exists
 * @example
 * hasPath({ user: { name: 'John' } }, 'user.name') // true
 * hasPath({ user: { name: 'John' } }, 'user.age') // false
 */
export function hasPath(obj, path) {
  if (!path || typeof path !== 'string') {
    return false
  }

  if (obj === null || obj === undefined) {
    return false
  }

  const keys = path.split('.')
  let current = obj

  for (const key of keys) {
    if (current === null || current === undefined) {
      return false
    }

    if (Array.isArray(current)) {
      const index = parseInt(key, 10)
      if (isNaN(index) || index < 0 || index >= current.length) {
        return false
      }
      current = current[index]
    } else if (typeof current === 'object') {
      if (!(key in current)) {
        return false
      }
      current = current[key]
    } else {
      return false
    }
  }

  return true
}

/**
 * Deletes a value at a path in an object (immutable)
 * @param {Object} obj - Source object
 * @param {string} path - Dot-notation path
 * @returns {Object} New object with value deleted
 * @example
 * deleteByPath({ user: { name: 'John', age: 30 } }, 'user.age')
 * // { user: { name: 'John' } }
 */
export function deleteByPath(obj, path) {
  if (typeof path !== 'string' || !path) {
    throw new Error('Path must be a non-empty string')
  }

  if (obj === null || obj === undefined) {
    return obj
  }

  // Deep clone to maintain immutability
  const result = deepClone(obj)

  // Split path
  const keys = path.split('.')
  let current = result

  // Navigate to parent
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]

    if (current === null || current === undefined || typeof current !== 'object') {
      return result // Path doesn't exist, return unchanged
    }

    if (Array.isArray(current)) {
      const index = parseInt(key, 10)
      if (isNaN(index) || index < 0 || index >= current.length) {
        return result // Path doesn't exist
      }
      current = current[index]
    } else {
      if (!(key in current)) {
        return result // Path doesn't exist
      }
      current = current[key]
    }
  }

  // Delete at final key
  const finalKey = keys[keys.length - 1]

  if (typeof current === 'object' && current !== null) {
    if (Array.isArray(current)) {
      const index = parseInt(finalKey, 10)
      if (!isNaN(index) && index >= 0 && index < current.length) {
        current.splice(index, 1)
      }
    } else {
      delete current[finalKey]
    }
  }

  return result
}

/**
 * Gets all paths in an object
 * @param {any} obj - Source object
 * @param {string} [prefix=''] - Path prefix for recursion
 * @param {number} [maxDepth=10] - Maximum depth to traverse
 * @returns {string[]} Array of all paths
 * @example
 * getAllPaths({ user: { name: 'John', address: { city: 'NYC' } } })
 * // ['user', 'user.name', 'user.address', 'user.address.city']
 */
export function getAllPaths(obj, prefix = '', maxDepth = 10) {
  const paths = []

  function traverse(current, currentPath, depth) {
    if (depth > maxDepth) {
      return
    }

    if (current === null || typeof current !== 'object') {
      return
    }

    if (currentPath) {
      paths.push(currentPath)
    }

    if (Array.isArray(current)) {
      current.forEach((item, index) => {
        const newPath = currentPath ? `${currentPath}.${index}` : String(index)
        traverse(item, newPath, depth + 1)
      })
    } else {
      Object.keys(current).forEach(key => {
        const newPath = currentPath ? `${currentPath}.${key}` : key
        traverse(current[key], newPath, depth + 1)
      })
    }
  }

  traverse(obj, prefix, 0)
  return paths
}

/**
 * Maps values in an object by applying a function to each leaf value
 * @param {any} obj - Source object
 * @param {Function} fn - Function to apply to each leaf value
 * @param {Object} [options] - Map options
 * @param {number} [options.maxDepth=10] - Maximum depth
 * @returns {any} New object with mapped values
 * @example
 * mapValues({ a: 1, b: { c: 2 } }, x => x * 2)
 * // { a: 2, b: { c: 4 } }
 */
export function mapValues(obj, fn, options = {}) {
  const maxDepth = options.maxDepth || 10

  function mapInternal(current, depth) {
    if (depth > maxDepth) {
      throw new Error(`Map depth exceeds maximum of ${maxDepth}`)
    }

    if (current === null || typeof current !== 'object') {
      return fn(current)
    }

    if (Array.isArray(current)) {
      return current.map(item => mapInternal(item, depth + 1))
    }

    const result = {}
    for (const key in current) {
      if (current.hasOwnProperty(key)) {
        result[key] = mapInternal(current[key], depth + 1)
      }
    }
    return result
  }

  return mapInternal(obj, 0)
}
