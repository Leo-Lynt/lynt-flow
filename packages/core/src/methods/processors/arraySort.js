/**
 * Array Sort
 * Ordena array por campo específico (crescente/decrescente)
 */

import { unwrapData } from '../../utils/dataUtils.js'
import { getValueByPath } from '../../utils/pathUtils.js'


/**
 * Parse uma string de data para Date object baseado no formato
 * @param {string|number} dateValue - Valor da data
 * @param {string} format - Formato da data (iso, br, us, timestamp, iso-datetime)
 * @returns {Date|null} Date object ou null se conversão falhar
 */
function parseDate(dateValue, format = 'iso') {
  if (!dateValue) return null

  try {
    switch (format) {
      case 'iso':
      case 'iso-datetime':
        // ISO 8601: 2025-01-15 ou 2025-01-15T14:30:00
        const isoDate = new Date(dateValue)
        return isNaN(isoDate.getTime()) ? null : isoDate

      case 'br':
        // Brazilian: DD/MM/YYYY
        if (typeof dateValue !== 'string') return null
        const brParts = dateValue.split('/')
        if (brParts.length !== 3) return null
        const [day, month, year] = brParts
        const brDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
        return isNaN(brDate.getTime()) ? null : brDate

      case 'us':
        // US: MM/DD/YYYY
        if (typeof dateValue !== 'string') return null
        const usParts = dateValue.split('/')
        if (usParts.length !== 3) return null
        const [usMonth, usDay, usYear] = usParts
        const usDate = new Date(`${usYear}-${usMonth.padStart(2, '0')}-${usDay.padStart(2, '0')}`)
        return isNaN(usDate.getTime()) ? null : usDate

      case 'timestamp':
        // Unix timestamp (milliseconds)
        const timestamp = Number(dateValue)
        if (isNaN(timestamp)) return null
        const tsDate = new Date(timestamp)
        return isNaN(tsDate.getTime()) ? null : tsDate

      default:
        // Fallback: tentar criar Date diretamente
        const defaultDate = new Date(dateValue)
        return isNaN(defaultDate.getTime()) ? null : defaultDate
    }
  } catch (error) {
    return null
  }
}

/**
 * Natural sort comparison
 * Ordena strings com números embutidos de forma natural (file1, file2, file10)
 * @param {string} a - First string
 * @param {string} b - Second string
 * @param {boolean} caseSensitive - Case sensitive comparison
 * @returns {number} Comparison result
 */
function naturalCompare(a, b, caseSensitive = false) {
  const strA = caseSensitive ? String(a) : String(a).toLowerCase()
  const strB = caseSensitive ? String(b) : String(b).toLowerCase()

  // Split strings into chunks of text and numbers
  const regexChunks = /(\d+)|(\D+)/g
  const chunksA = strA.match(regexChunks) || []
  const chunksB = strB.match(regexChunks) || []

  const maxLength = Math.max(chunksA.length, chunksB.length)

  for (let i = 0; i < maxLength; i++) {
    const chunkA = chunksA[i] || ''
    const chunkB = chunksB[i] || ''

    // If one chunk is missing, shorter comes first
    if (!chunkA) return -1
    if (!chunkB) return 1

    // Check if both chunks are numeric
    const numA = Number(chunkA)
    const numB = Number(chunkB)

    if (!isNaN(numA) && !isNaN(numB)) {
      // Both are numbers - compare numerically
      if (numA !== numB) {
        return numA - numB
      }
    } else {
      // At least one is text - compare alphabetically
      if (chunkA !== chunkB) {
        return chunkA.localeCompare(chunkB)
      }
    }
  }

  return 0
}

/**
 * Compara dois valores baseado no tipo
 * @param {*} valueA - Primeiro valor
 * @param {*} valueB - Segundo valor
 * @param {string} sortType - Tipo de ordenação
 * @param {Object} options - Opções adicionais
 * @returns {number} Resultado da comparação (-1, 0, 1)
 */
function compareValues(valueA, valueB, sortType, options = {}) {
  const { dateFormat = 'iso', caseSensitive = false, locale = 'pt-BR' } = options

  // Handle null/undefined - sempre vai pro final
  if (valueA === null || valueA === undefined) return 1
  if (valueB === null || valueB === undefined) return -1

  switch (sortType) {
    case 'date': {
      const dateA = parseDate(valueA, dateFormat)
      const dateB = parseDate(valueB, dateFormat)

      if (!dateA && !dateB) return 0
      if (!dateA) return 1
      if (!dateB) return -1

      return dateA.getTime() - dateB.getTime()
    }

    case 'number': {
      const numA = Number(valueA)
      const numB = Number(valueB)

      if (isNaN(numA) && isNaN(numB)) return 0
      if (isNaN(numA)) return 1
      if (isNaN(numB)) return -1

      return numA - numB
    }

    case 'boolean': {
      const boolA = Boolean(valueA)
      const boolB = Boolean(valueB)

      // false < true
      if (boolA === boolB) return 0
      return boolA ? 1 : -1
    }

    case 'natural': {
      return naturalCompare(valueA, valueB, caseSensitive)
    }

    case 'string': {
      const strA = caseSensitive ? String(valueA) : String(valueA).toLowerCase()
      const strB = caseSensitive ? String(valueB) : String(valueB).toLowerCase()
      return strA.localeCompare(strB, locale)
    }

    case 'auto':
    default: {
      // Auto-detect: tentar número primeiro, senão string
      const numA = Number(valueA)
      const numB = Number(valueB)

      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB
      } else {
        const strA = String(valueA).toLowerCase()
        const strB = String(valueB).toLowerCase()
        return strA.localeCompare(strB, locale)
      }
    }
  }
}

/**
 * Executa ordenação no array
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {Array} Array ordenado
 */
export function execute({ nodeData, inputs }) {
  let inputData = unwrapData(inputs['data-input'])

  if (!Array.isArray(inputData)) {
    throw new Error('Input deve ser um array')
  }

  // Determinar qual campo usar baseado no modo
  const fieldMode = nodeData.fieldMode || 'selector'
  let field

  if (fieldMode === 'custom') {
    field = nodeData.customField
  } else {
    // Modo selector - pegar o primeiro campo selecionado (singleSelect)
    const selectedFields = nodeData.selectedField
    if (Array.isArray(selectedFields) && selectedFields.length > 0) {
      field = selectedFields[0]
    } else if (typeof selectedFields === 'string') {
      field = selectedFields
    }
  }

  const order = nodeData.order || 'asc'
  const sortType = nodeData.sortType || 'auto'
  const dateFormat = nodeData.dateFormat || 'iso'
  const caseSensitive = nodeData.caseSensitive || false
  const locale = nodeData.locale || 'pt-BR'

  // Criar cópia do array para não modificar o original
  const sortedArray = [...inputData]

  // Ordenar array
  sortedArray.sort((a, b) => {
    const valueA = field ? getValueByPath(a, field) : a
    const valueB = field ? getValueByPath(b, field) : b

    const comparison = compareValues(valueA, valueB, sortType, {
      dateFormat,
      caseSensitive,
      locale
    })

    return order === 'asc' ? comparison : -comparison
  })


  return sortedArray
}

/**
 * Valida configuração do Array Sort
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

  // Validar campo baseado no modo
  const fieldMode = nodeData.fieldMode || 'selector'

  if (fieldMode === 'custom') {
    if (!nodeData.customField) {
      errors.push('Campo customField obrigatório no modo custom')
    }
  } else {
    if (!nodeData.selectedField || (Array.isArray(nodeData.selectedField) && nodeData.selectedField.length === 0)) {
      errors.push('Seleção de campo obrigatória')
    }
  }

  if (!nodeData.order) {
    errors.push('Campo "order" obrigatório')
  }

  // Validar sortType
  const validSortTypes = ['auto', 'string', 'number', 'date', 'boolean', 'natural']
  if (nodeData.sortType && !validSortTypes.includes(nodeData.sortType)) {
    errors.push(`sortType inválido: "${nodeData.sortType}". Deve ser um de: ${validSortTypes.join(', ')}`)
  }

  // Validar dateFormat se sortType for date
  if (nodeData.sortType === 'date') {
    const validDateFormats = ['iso', 'iso-datetime', 'br', 'us', 'timestamp']
    if (nodeData.dateFormat && !validDateFormats.includes(nodeData.dateFormat)) {
      errors.push(`dateFormat inválido: "${nodeData.dateFormat}". Deve ser um de: ${validDateFormats.join(', ')}`)
    }
  }

  // Validar caseSensitive
  if (nodeData.caseSensitive !== undefined && typeof nodeData.caseSensitive !== 'boolean') {
    errors.push('Campo "caseSensitive" deve ser boolean')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
