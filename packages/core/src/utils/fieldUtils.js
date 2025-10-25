/**
 * Field utilities
 * Pure JavaScript utilities for field operations (safe for Node.js and browser)
 */

/**
 * Get value of a field from nested object using path
 * @param {any} data - Data object or array
 * @param {string} path - Dot-notation path (e.g., 'user.name')
 * @returns {any} Value at path or undefined
 */
export function getFieldValue(data, path) {
  // If it's an array, use first item
  if (Array.isArray(data) && data.length > 0) {
    data = data[0]
  }

  const parts = path.split('.')
  let value = data

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part]
    } else {
      return undefined
    }
  }

  return value
}
