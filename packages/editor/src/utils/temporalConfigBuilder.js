/**
 * Temporal Configuration Builder
 * Shared utility for building temporal config across all connectors
 */

export function buildTemporalConfig(data, options = {}) {
  const {
    enabledField = 'temporalEnabled',
    rangeTypeField = 'temporalRangeType',
    relativeRangeField = 'temporalRelativeRange',
    startDateField = 'temporalStartDate',
    endDateField = 'temporalEndDate',
    dateFieldName = 'dateField',
    prefix = ''
  } = options

  // Build field names with optional prefix
  const getFieldName = (field) => prefix ? `${prefix}${field.charAt(0).toUpperCase()}${field.slice(1)}` : field

  const enabled = data[getFieldName(enabledField)]

  if (!enabled) {
    return null
  }

  const rangeType = data[getFieldName(rangeTypeField)] || 'relative'

  const config = {
    enabled: true,
    rangeType
  }

  if (rangeType === 'relative') {
    config.relativeRange = data[getFieldName(relativeRangeField)] || 'last_30_days'
  } else if (rangeType === 'absolute') {
    config.absoluteRange = {
      startDate: data[getFieldName(startDateField)],
      endDate: data[getFieldName(endDateField)]
    }
  }

  return config
}

/**
 * Build temporal config for connectors that use a dateField parameter
 * (JSON/CSV, Database)
 */
export function buildTemporalConfigWithDateField(data, prefix = '') {
  const getFieldName = (field) => prefix ? `${prefix}${field.charAt(0).toUpperCase()}${field.slice(1)}` : field

  const enabled = data[getFieldName('temporalEnabled')]
  const dateField = data[getFieldName('dateField')]

  if (!enabled || !dateField) {
    return { config: null, dateField: null }
  }

  const rangeType = data[getFieldName('temporalRangeType')] || 'relative'

  const temporalConfig = {
    enabled: true,
    rangeType
  }

  if (rangeType === 'relative') {
    temporalConfig.relativeRange = data[getFieldName('temporalRelativeRange')] || 'last_30_days'
  } else if (rangeType === 'absolute') {
    temporalConfig.absoluteRange = {
      startDate: data[getFieldName('temporalStartDate')],
      endDate: data[getFieldName('temporalEndDate')]
    }
  }

  return { config: temporalConfig, dateField }
}

/**
 * Get default database port by database type
 */
export function getDefaultDatabasePort(dbType) {
  const ports = {
    'postgresql': 5432,
    'mysql': 3306,
    'sqlserver': 1433
  }
  return ports[dbType] || 5432
}