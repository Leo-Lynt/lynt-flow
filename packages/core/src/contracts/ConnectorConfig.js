/**
 * Connector Configuration Schemas
 * Define a estrutura canônica para cada tipo de connector
 */

/**
 * Google Sheets Configuration (canonical)
 */
export const GoogleSheetsConfig = {
  type: 'google_sheets',
  fields: {
    spreadsheetUrl: { type: 'string', required: true },
    sheetName: { type: 'string', required: false },
    range: { type: 'string', required: false },
    includeHeaders: { type: 'boolean', required: false, default: true },
    connectionId: { type: 'string', required: false }
  }
}

/**
 * Google Analytics Configuration (canonical)
 */
export const GoogleAnalyticsConfig = {
  type: 'google_analytics',
  fields: {
    connectionId: { type: 'string', required: true },
    propertyId: { type: 'string', required: false },
    viewId: { type: 'string', required: false },
    metrics: { type: 'array', required: false, default: [] },
    dimensions: { type: 'array', required: false, default: [] },
    filters: { type: 'object', required: false }
  }
}

/**
 * API Configuration (canonical)
 */
export const APIConfig = {
  type: 'api',
  fields: {
    url: { type: 'string', required: true },
    method: { type: 'string', required: false, default: 'GET' },
    headers: { type: 'object', required: false, default: {} },
    queryParams: { type: 'object', required: false, default: {} },
    body: { type: 'any', required: false },
    dataPath: { type: 'string', required: false }
  }
}

/**
 * Database Configuration (canonical)
 */
export const DatabaseConfig = {
  type: 'database',
  fields: {
    connectionId: { type: 'string', required: false },
    dbType: { type: 'string', required: true }, // mysql, postgres, mssql, mongodb
    query: { type: 'string', required: false },
    collection: { type: 'string', required: false },
    parameters: { type: 'object', required: false, default: {} }
  }
}

/**
 * GraphQL Configuration (canonical)
 */
export const GraphQLConfig = {
  type: 'graphql',
  fields: {
    url: { type: 'string', required: true },
    query: { type: 'string', required: true },
    variables: { type: 'object', required: false, default: {} },
    headers: { type: 'object', required: false, default: {} }
  }
}

/**
 * JSON/CSV Configuration (canonical)
 */
export const JSONConfig = {
  type: 'json',
  fields: {
    url: { type: 'string', required: true },
    format: { type: 'string', required: false, default: 'json' },
    csvDelimiter: { type: 'string', required: false, default: ',' },
    dataPath: { type: 'string', required: false }
  }
}

/**
 * MK3D Configuration (canonical)
 */
export const MK3DConfig = {
  type: 'mk3d',
  fields: {
    baseUrl: { type: 'string', required: true },
    projectId: { type: 'string', required: true },
    endpoint: { type: 'string', required: false },
    filters: { type: 'object', required: false }
  }
}

/**
 * Todos os schemas de connector
 */
export const ConnectorSchemas = {
  google_sheets: GoogleSheetsConfig,
  google_analytics: GoogleAnalyticsConfig,
  api: APIConfig,
  database: DatabaseConfig,
  graphql: GraphQLConfig,
  json: JSONConfig,
  csv: JSONConfig, // CSV usa o mesmo schema de JSON
  mk3d: MK3DConfig
}

/**
 * Valida configuração de connector contra schema
 */
export function validateConnectorConfig(sourceType, config) {
  const schema = ConnectorSchemas[sourceType]

  if (!schema) {
    return {
      valid: false,
      errors: [`Unknown source type: ${sourceType}`]
    }
  }

  const errors = []

  // Validar campos obrigatórios
  for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
    if (fieldDef.required && (config[fieldName] === undefined || config[fieldName] === null)) {
      errors.push(`Field "${fieldName}" is required for ${sourceType}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Aplica valores default para campos não definidos
 */
export function applyDefaults(sourceType, config) {
  const schema = ConnectorSchemas[sourceType]

  if (!schema) {
    return config
  }

  const result = { ...config }

  for (const [fieldName, fieldDef] of Object.entries(schema.fields)) {
    if (fieldDef.default !== undefined && result[fieldName] === undefined) {
      result[fieldName] = fieldDef.default
    }
  }

  return result
}
