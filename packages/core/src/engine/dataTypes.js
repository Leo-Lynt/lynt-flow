/**
 * Data Types System
 * Gerencia tipos de dados, cores e compatibilidade entre conexões
 */

let dataTypesConfig = null

/**
 * Carrega a configuração de tipos de dados
 */
export async function loadDataTypes() {
  if (dataTypesConfig) return dataTypesConfig

  try {
    const response = await fetch('/config/dataTypes.json')
    dataTypesConfig = await response.json()
    return dataTypesConfig
  } catch (error) {
    return getDefaultDataTypes()
  }
}

/**
 * Retorna a configuração padrão se o arquivo não carregar
 */
function getDefaultDataTypes() {
  return {
    types: {
      any: { label: 'Any', color: '#3b82f6' },
      string: { label: 'String', color: '#10b981' },
      number: { label: 'Number', color: '#f59e0b' },
      integer: { label: 'Integer', color: '#f97316' },
      float: { label: 'Float', color: '#fb923c' },
      boolean: { label: 'Boolean', color: '#8b5cf6' },
      array: { label: 'Array', color: '#ec4899' },
      object: { label: 'Object', color: '#06b6d4' },
      date: { label: 'Date', color: '#14b8a6' },
      null: { label: 'Null', color: '#6b7280' }
    },
    compatibility: {
      any: ['any', 'string', 'number', 'integer', 'float', 'boolean', 'array', 'object', 'date', 'null'],
      string: ['any', 'string'],
      number: ['any', 'number', 'integer', 'float'],
      integer: ['any', 'number', 'integer'],
      float: ['any', 'number', 'float'],
      boolean: ['any', 'boolean'],
      array: ['any', 'array'],
      object: ['any', 'object'],
      date: ['any', 'date', 'string'],
      null: ['any', 'null']
    }
  }
}

/**
 * Obtém a cor de um tipo de dado
 * @param {string} type - Tipo de dado
 * @returns {string} Cor hexadecimal
 */
export function getTypeColor(type) {
  const config = dataTypesConfig || getDefaultDataTypes()
  return config.types[type]?.color || '#3b82f6' // Default blue
}

/**
 * Obtém o label de um tipo de dado
 * @param {string} type - Tipo de dado
 * @returns {string} Label do tipo
 */
export function getTypeLabel(type) {
  const config = dataTypesConfig || getDefaultDataTypes()
  return config.types[type]?.label || type
}

/**
 * Verifica se dois tipos são compatíveis para conexão
 * @param {string} sourceType - Tipo do output (origem)
 * @param {string} targetType - Tipo do input (destino)
 * @returns {boolean} True se são compatíveis
 */
export function areTypesCompatible(sourceType, targetType) {
  const config = dataTypesConfig || getDefaultDataTypes()

  // Se algum dos tipos for 'any', sempre compatível
  if (sourceType === 'any' || targetType === 'any') {
    return true
  }

  // Verifica na tabela de compatibilidade
  const compatibleTypes = config.compatibility[sourceType]
  if (!compatibleTypes) {
    // Se não tem compatibilidade definida, assume que só conecta com 'any' ou com o mesmo tipo
    return targetType === 'any' || sourceType === targetType
  }

  return compatibleTypes.includes(targetType)
}

/**
 * Detecta o tipo de um valor JavaScript
 * @param {*} value - Valor para detectar o tipo
 * @returns {string} Tipo detectado
 */
export function detectValueType(value) {
  if (value === null) return 'null'
  if (value === undefined) return 'null'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'boolean') return 'boolean'
  if (Array.isArray(value)) return 'array'
  if (value instanceof Date) return 'date'
  if (typeof value === 'object') return 'object'
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'integer' : 'float'
  }
  return 'any'
}

/**
 * Obtém todos os tipos disponíveis
 * @returns {Array} Array de objetos com informações dos tipos
 */
export function getAllTypes() {
  const config = dataTypesConfig || getDefaultDataTypes()
  return Object.entries(config.types).map(([key, value]) => ({
    key,
    ...value
  }))
}

/**
 * Valida se um valor é do tipo esperado
 * @param {*} value - Valor para validar
 * @param {string} expectedType - Tipo esperado
 * @returns {boolean} True se o valor é do tipo esperado
 */
export function validateValueType(value, expectedType) {
  const actualType = detectValueType(value)
  return areTypesCompatible(actualType, expectedType)
}
