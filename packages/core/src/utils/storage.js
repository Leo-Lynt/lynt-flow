/**
 * Safe localStorage wrapper with validation and versioning
 * @module utils/storage
 */

import { safeJSONParse, validateSafeValue, isValidJSON } from './security.js'

/**
 * Current storage version for migration support
 */
const STORAGE_VERSION = 1

/**
 * Prefix for all FlowForge storage keys
 */
const KEY_PREFIX = 'flowforge_'

/**
 * Maximum size for stored values (1MB)
 */
const MAX_STORAGE_SIZE = 1024 * 1024

/**
 * Wraps a value with metadata for versioning
 * @param {any} value - Value to wrap
 * @returns {Object} Wrapped value with metadata
 */
function wrapValue(value) {
  return {
    version: STORAGE_VERSION,
    timestamp: Date.now(),
    data: value
  }
}

/**
 * Unwraps a stored value, handling migrations if needed
 * @param {Object} wrapped - Wrapped value from storage
 * @returns {any} Original value
 */
function unwrapValue(wrapped) {
  // Handle legacy values without wrapper
  if (!wrapped || typeof wrapped !== 'object' || !('version' in wrapped)) {
    return wrapped
  }

  // Handle version migrations here if needed in the future
  if (wrapped.version !== STORAGE_VERSION) {
    // Migration logic would go here
  }

  return wrapped.data
}

/**
 * Safely stores a value in localStorage with validation
 * @param {string} key - Storage key (will be prefixed)
 * @param {any} value - Value to store
 * @param {Object} [options] - Storage options
 * @param {boolean} [options.skipValidation=false] - Skip safety validation
 * @throws {Error} If value is unsafe or storage fails
 */
export function safeSetItem(key, value, options = {}) {
  const { skipValidation = false } = options

  if (typeof key !== 'string' || !key) {
    throw new Error('Storage key must be a non-empty string')
  }

  // Validate value safety
  if (!skipValidation) {
    validateSafeValue(value)
  }

  // Wrap value with metadata
  const wrapped = wrapValue(value)
  const serialized = JSON.stringify(wrapped)

  // Check size
  if (serialized.length > MAX_STORAGE_SIZE) {
    throw new Error(`Value exceeds maximum storage size of ${MAX_STORAGE_SIZE} bytes`)
  }

  // Store with prefix
  const prefixedKey = `${KEY_PREFIX}${key}`

  try {
    localStorage.setItem(prefixedKey, serialized)
  } catch (error) {
    // Handle quota exceeded errors
    if (error.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please clear some data.')
    }
    throw new Error(`Failed to store value: ${error.message}`)
  }
}

/**
 * Safely retrieves a value from localStorage with validation
 * @param {string} key - Storage key (will be prefixed)
 * @param {any} [defaultValue=null] - Default value if key doesn't exist
 * @param {Object} [options] - Retrieval options
 * @param {boolean} [options.skipValidation=false] - Skip safety validation
 * @returns {any} Stored value or default value
 */
export function safeGetItem(key, defaultValue = null, options = {}) {
  const { skipValidation = false } = options

  if (typeof key !== 'string' || !key) {
    throw new Error('Storage key must be a non-empty string')
  }

  const prefixedKey = `${KEY_PREFIX}${key}`

  try {
    const stored = localStorage.getItem(prefixedKey)

    // Return default if not found
    if (stored === null) {
      return defaultValue
    }

    // Validate JSON before parsing
    if (!isValidJSON(stored)) {
      return defaultValue
    }

    // Parse with safety checks
    let parsed
    try {
      parsed = skipValidation
        ? JSON.parse(stored)
        : safeJSONParse(stored)
    } catch (error) {
      return defaultValue
    }

    // Unwrap and return
    return unwrapValue(parsed)
  } catch (error) {
    return defaultValue
  }
}

/**
 * Removes an item from localStorage
 * @param {string} key - Storage key (will be prefixed)
 */
export function safeRemoveItem(key) {
  if (typeof key !== 'string' || !key) {
    throw new Error('Storage key must be a non-empty string')
  }

  const prefixedKey = `${KEY_PREFIX}${key}`
  localStorage.removeItem(prefixedKey)
}

/**
 * Clears all FlowForge items from localStorage
 */
export function safeClear() {
  const keys = []

  // Collect all FlowForge keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(KEY_PREFIX)) {
      keys.push(key)
    }
  }

  // Remove them
  keys.forEach(key => localStorage.removeItem(key))
}

/**
 * Gets all FlowForge keys in localStorage
 * @returns {string[]} Array of keys (without prefix)
 */
export function getAllKeys() {
  const keys = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(KEY_PREFIX)) {
      keys.push(key.substring(KEY_PREFIX.length))
    }
  }

  return keys
}

/**
 * Checks if a key exists in localStorage
 * @param {string} key - Storage key (will be prefixed)
 * @returns {boolean} True if key exists
 */
export function hasItem(key) {
  if (typeof key !== 'string' || !key) {
    return false
  }

  const prefixedKey = `${KEY_PREFIX}${key}`
  return localStorage.getItem(prefixedKey) !== null
}

/**
 * Gets the size of a stored value in bytes
 * @param {string} key - Storage key (will be prefixed)
 * @returns {number} Size in bytes, or 0 if not found
 */
export function getItemSize(key) {
  if (typeof key !== 'string' || !key) {
    return 0
  }

  const prefixedKey = `${KEY_PREFIX}${key}`
  const stored = localStorage.getItem(prefixedKey)

  return stored ? stored.length : 0
}

/**
 * Gets total size of all FlowForge storage in bytes
 * @returns {number} Total size in bytes
 */
export function getTotalSize() {
  let total = 0

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(KEY_PREFIX)) {
      const value = localStorage.getItem(key)
      if (value) total += value.length
    }
  }

  return total
}

/**
 * Exports all FlowForge data as JSON
 * @returns {Object} All stored data
 */
export function exportData() {
  const data = {}

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(KEY_PREFIX)) {
      const unprefixedKey = key.substring(KEY_PREFIX.length)
      data[unprefixedKey] = safeGetItem(unprefixedKey)
    }
  }

  return data
}

/**
 * Imports data from exported JSON
 * @param {Object} data - Data to import
 * @param {boolean} [clearFirst=false] - Clear existing data first
 */
export function importData(data, clearFirst = false) {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Import data must be an object')
  }

  if (clearFirst) {
    safeClear()
  }

  for (const [key, value] of Object.entries(data)) {
    try {
      safeSetItem(key, value)
    } catch (error) {
    }
  }
}
