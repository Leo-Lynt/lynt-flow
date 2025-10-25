/**
 * Data Utilities
 * Funções utilitárias para manipulação de dados
 */

/**
 * Unwrap data recursively
 * Remove wrappers { type, value } retornando apenas value
 */
export function unwrapData(data) {
  if (data === null || data === undefined) {
    return data
  }

  // Se é um wrapper { type, value }, extrair value
  if (data && typeof data === 'object' && 'type' in data && 'value' in data) {
    return unwrapData(data.value)
  }

  // Se é array, unwrap cada item
  if (Array.isArray(data)) {
    return data.map(item => unwrapData(item))
  }

  // Se é objeto, unwrap cada propriedade
  if (typeof data === 'object') {
    const unwrapped = {}
    for (const [key, value] of Object.entries(data)) {
      unwrapped[key] = unwrapData(value)
    }
    return unwrapped
  }

  return data
}

/**
 * Wrap data with type information
 */
export function wrapData(value, type) {
  return { type, value }
}
