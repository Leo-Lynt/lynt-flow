/**
 * Mappings - Centralized Configuration
 * SINGLE SOURCE OF TRUTH para todos os mapeamentos de nomenclatura
 *
 * Para adicionar um novo connector:
 * 1. Adicionar em FRONTEND_TO_CANONICAL (campos do UI)
 * 2. Adicionar em CANONICAL_TO_SERVICE (campos que adapter espera)
 * 3. Adicionar em SOURCE_TYPE_MAPPINGS (nome do sourceType)
 */

/**
 * 1. FRONTEND → CANONICAL
 * Mapeia campos do formato do frontend (nodeData) para formato canônico
 * Exemplo: sheetsUrl → spreadsheetUrl
 */
export const FRONTEND_TO_CANONICAL = {
  google_sheets: {
    sheetsUrl: 'spreadsheetUrl',
    sheetsConnectionId: 'connectionId',
    sheetsSheetName: 'sheetName',
    sheetsRange: 'range',
    sheetsIncludeHeaders: 'includeHeaders'
  },

  google_analytics: {
    gaConnectionId: 'connectionId',
    gaViewId: 'viewId',
    gaPropertyId: 'propertyId',
    gaMetrics: 'metrics',
    gaDimensions: 'dimensions',
    gaFilters: 'filters',
    gaStartDate: 'startDate',
    gaEndDate: 'endDate'
  },

  api: {
    apiUrl: 'url',
    apiMethod: 'method',
    apiHeaders: 'headers',
    apiQueryParams: 'queryParams',
    apiBody: 'body',
    dataPath: 'dataPath'
  },

  database: {
    databaseConnectionId: 'connectionId',
    databaseType: 'dbType',
    databaseQuery: 'query',
    databaseCollection: 'collection',
    queryParameters: 'parameters'
  },

  graphql: {
    graphqlUrl: 'url',
    graphqlQuery: 'query',
    graphqlVariables: 'variables',
    graphqlHeaders: 'headers'
  },

  json: {
    jsonCsvUrl: 'url',
    format: 'format',
    csvDelimiter: 'csvDelimiter',
    dataPath: 'dataPath'
  },

  csv: {
    jsonCsvUrl: 'url',
    format: 'format',
    csvDelimiter: 'csvDelimiter',
    dataPath: 'dataPath'
  },

  mk3d: {
    mk3dUrl: 'baseUrl',
    mk3dProjectId: 'projectId',
    mk3dEndpoint: 'endpoint',
    mk3dFilters: 'filters'
  }
}

/**
 * 2. CANONICAL → SERVICE
 * Mapeia campos canônicos para formato esperado pelos adapters de serviço
 * Exemplo: spreadsheetUrl → url
 */
export const CANONICAL_TO_SERVICE = {
  google_sheets: {
    spreadsheetUrl: 'url',
    connectionId: 'connectionId',
    sheetName: 'sheetName',
    range: 'range',
    includeHeaders: 'includeHeaders'
  },

  google_analytics: {
    connectionId: 'connectionId',
    viewId: 'viewId',
    propertyId: 'propertyId',
    metrics: 'metrics',
    dimensions: 'dimensions',
    filters: 'filters',
    startDate: 'startDate',
    endDate: 'endDate'
  },

  api: {
    url: 'url',
    method: 'method',
    headers: 'headers',
    body: 'body',
    queryParams: 'queryParams',
    dataPath: 'dataPath'
  },

  json: {
    url: 'url',
    format: 'format',
    dataPath: 'dataPath',
    csvDelimiter: 'csvDelimiter'
  },

  csv: {
    url: 'url',
    format: 'format',
    dataPath: 'dataPath',
    csvDelimiter: 'csvDelimiter'
  },

  graphql: {
    url: 'url',
    query: 'query',
    variables: 'variables',
    headers: 'headers'
  },

  database: {
    dbType: 'connectionType',
    connectionId: 'connectionId',
    connectionString: 'connectionString',
    query: 'query',
    collection: 'collection',
    parameters: 'parameters'
  },

  mk3d: {
    baseUrl: 'url',
    projectId: 'projectId',
    endpoint: 'endpoint',
    filters: 'filters'
  }
}

/**
 * 3. SOURCE TYPE MAPPINGS
 * Mapeia nomes de sourceType entre diferentes contextos
 */
export const SOURCE_TYPE_MAPPINGS = {
  /**
   * Canonical/Frontend → API Service Name
   * Usado quando frontend envia request HTTP para API
   */
  toApi: {
    'google_sheets': 'sheets',
    'google_analytics': 'analytics',
    'api': 'api',
    'json': 'json',
    'csv': 'json', // CSV usa o mesmo adapter que JSON
    'graphql': 'graphql',
    'database': 'database',
    'mk3d': 'mk3d'
  },

  /**
   * API Service Name → Canonical/Frontend
   * Usado quando API recebe request e precisa normalizar
   */
  fromApi: {
    'sheets': 'google_sheets',
    'analytics': 'google_analytics',
    'api': 'api',
    'json': 'json',
    'graphql': 'graphql',
    'database': 'database',
    'mk3d': 'mk3d'
  }
}

/**
 * HELPER FUNCTIONS
 */

/**
 * Mapeia sourceType canônico para nome da API
 */
export function mapSourceTypeToApi(canonicalType) {
  return SOURCE_TYPE_MAPPINGS.toApi[canonicalType] || canonicalType
}

/**
 * Mapeia sourceType da API para canônico
 */
export function mapSourceTypeFromApi(apiType) {
  return SOURCE_TYPE_MAPPINGS.fromApi[apiType] || apiType
}

/**
 * Obtém mapeamento frontend→canonical para um sourceType
 */
export function getFrontendToCanonicalMapping(sourceType) {
  return FRONTEND_TO_CANONICAL[sourceType] || {}
}

/**
 * Obtém mapeamento canonical→service para um sourceType
 */
export function getCanonicalToServiceMapping(sourceType) {
  return CANONICAL_TO_SERVICE[sourceType] || {}
}

// Backward compatibility: exportar com nomes antigos também
export const FIELD_MAPPINGS = FRONTEND_TO_CANONICAL
export const SOURCE_TYPE_TO_SERVICE = SOURCE_TYPE_MAPPINGS.toApi
