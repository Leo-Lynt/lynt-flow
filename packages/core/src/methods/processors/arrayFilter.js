/**
 * Array Filter
 * Filtra items de um array baseado em condição
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
 * Compara dois valores baseado no tipo e operador
 * @param {*} itemValue - Valor do item do array
 * @param {*} compareValue - Valor de comparação
 * @param {string} operator - Operador de comparação
 * @param {string} type - Tipo de dados (auto, string, number, date, boolean)
 * @param {string} dateFormat - Formato de data (apenas para type='date')
 * @returns {boolean} Resultado da comparação
 */
function compareValues(itemValue, compareValue, operator, type = 'auto', dateFormat = 'iso') {
  let normalizedItem = itemValue
  let normalizedCompare = compareValue

  // Normalizar valores baseado no tipo
  if (type === 'date') {
    const itemDate = parseDate(itemValue, dateFormat)
    const compareDate = parseDate(compareValue, dateFormat)

    if (!itemDate || !compareDate) {
      return false
    }

    // Converter para timestamp para comparação numérica
    normalizedItem = itemDate.getTime()
    normalizedCompare = compareDate.getTime()

  } else if (type === 'number') {
    normalizedItem = Number(itemValue)
    normalizedCompare = Number(compareValue)

    if (isNaN(normalizedItem) || isNaN(normalizedCompare)) {
      return false
    }

  } else if (type === 'boolean') {
    // Conversão de boolean: true, 'true', 1, 'yes' → true
    const toBool = (val) => {
      if (typeof val === 'boolean') return val
      if (typeof val === 'number') return val !== 0
      if (typeof val === 'string') {
        const lower = val.toLowerCase()
        return lower === 'true' || lower === 'yes' || lower === '1'
      }
      return Boolean(val)
    }

    normalizedItem = toBool(itemValue)
    normalizedCompare = toBool(compareValue)

  } else if (type === 'string') {
    // Forçar conversão para string
    normalizedItem = String(itemValue)
    normalizedCompare = String(compareValue)

  } else if (type === 'auto') {
    // Auto-detect: tentar número primeiro, senão string
    const numItem = Number(itemValue)
    const numCompare = Number(compareValue)

    if (!isNaN(numItem) && !isNaN(numCompare)) {
      normalizedItem = numItem
      normalizedCompare = numCompare
    } else {
      normalizedItem = String(itemValue)
      normalizedCompare = String(compareValue)
    }
  }

  // Aplicar operador de comparação
  switch (operator) {
    case 'equals':
      return normalizedItem === normalizedCompare

    case 'notEquals':
      return normalizedItem !== normalizedCompare

    case 'greaterThan':
      return normalizedItem > normalizedCompare

    case 'lessThan':
      return normalizedItem < normalizedCompare

    case 'greaterOrEqual':
      return normalizedItem >= normalizedCompare

    case 'lessOrEqual':
      return normalizedItem <= normalizedCompare

    case 'contains':
      return String(normalizedItem).toLowerCase().includes(String(normalizedCompare).toLowerCase())

    case 'startsWith':
      return String(normalizedItem).toLowerCase().startsWith(String(normalizedCompare).toLowerCase())

    case 'endsWith':
      return String(normalizedItem).toLowerCase().endsWith(String(normalizedCompare).toLowerCase())

    default:
      return true
  }
}

/**
 * Executa filtro no array
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {Array} Array filtrado
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

  const operator = nodeData.operator || 'equals'
  // Use exposed-value input if provided, otherwise use nodeData.value
  let compareValue = inputs['exposed-value'] !== undefined ? unwrapData(inputs['exposed-value']) : nodeData.value

  // Se exposedFields.value está definido e compareValue é um objeto, extrair o valor correto
  if (nodeData.exposedFields?.value && typeof compareValue === 'object' && compareValue !== null && !Array.isArray(compareValue)) {
    // Estratégia de extração inteligente:
    // 1. Se tem 'value' como propriedade, usar ela
    if ('value' in compareValue) {
      compareValue = compareValue.value
    }
    // 2. Se operador é greaterThan/greaterOrEqual, procurar por StartData, start, from
    else if (operator === 'greaterThan' || operator === 'greaterOrEqual') {
      compareValue = compareValue.StartData || compareValue.start || compareValue.from || Object.values(compareValue)[0]
    }
    // 3. Se operador é lessThan/lessOrEqual, procurar por EndData, end, to
    else if (operator === 'lessThan' || operator === 'lessOrEqual') {
      compareValue = compareValue.EndData || compareValue.end || compareValue.to || Object.values(compareValue)[1] || Object.values(compareValue)[0]
    }
    // 4. Fallback: pegar o primeiro valor disponível
    else {
      const values = Object.values(compareValue)
      if (values.length > 0) {
        compareValue = values[0]
      }
    }
  }

  const comparisonType = nodeData.comparisonType || 'auto'
  const dateFormat = nodeData.dateFormat || 'iso'

  // Operadores que não precisam de valor
  if (operator === 'exists') {
    return inputData.filter(item => {
      const value = getValueByPath(item, field)
      return value !== undefined && value !== null
    })
  }

  if (operator === 'notExists') {
    return inputData.filter(item => {
      const value = getValueByPath(item, field)
      return value === undefined || value === null
    })
  }

  // Filtrar baseado no operador com comparação tipada
  const filtered = inputData.filter(item => {
    const itemValue = getValueByPath(item, field)

    // Se o valor do item não existe, não passa no filtro
    if (itemValue === undefined || itemValue === null) {
      return false
    }

    // Usar função compareValues para comparação tipada
    return compareValues(itemValue, compareValue, operator, comparisonType, dateFormat)
  })

  return filtered
}

/**
 * Valida configuração do Array Filter
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

  if (!nodeData.operator) {
    errors.push('Campo "operator" obrigatório')
  }

  const operatorsNeedingValue = ['equals', 'notEquals', 'greaterThan', 'lessThan', 'greaterOrEqual', 'lessOrEqual', 'contains', 'startsWith', 'endsWith']
  if (operatorsNeedingValue.includes(nodeData.operator) && !nodeData.value) {
    errors.push(`Operador "${nodeData.operator}" requer um valor de comparação`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
