/**
 * Field Mapper
 * Normaliza nomenclatura de campos entre diferentes contextos
 * Frontend/NodeData → Core/Canonical → Backend/Service
 */

// Importar mapeamentos centralizados
import {
  FRONTEND_TO_CANONICAL,
  CANONICAL_TO_SERVICE,
  SOURCE_TYPE_TO_SERVICE,
  mapSourceTypeToApi
} from '../config/mappings.js'

// Re-exportar para backward compatibility
export const FIELD_MAPPINGS = FRONTEND_TO_CANONICAL
export { CANONICAL_TO_SERVICE, SOURCE_TYPE_TO_SERVICE }

/**
 * Normaliza nodeData do frontend para formato canônico
 * @param {string} sourceType - Tipo do connector
 * @param {Object} nodeData - Dados do node (formato frontend)
 * @returns {Object} Configuração normalizada (formato canônico)
 */
export function normalizeNodeData(sourceType, nodeData) {
  const mapping = FIELD_MAPPINGS[sourceType] || {}
  const normalized = { sourceType }

  // Aplicar mapeamento
  for (const [frontendKey, canonicalKey] of Object.entries(mapping)) {
    if (nodeData[frontendKey] !== undefined) {
      normalized[canonicalKey] = nodeData[frontendKey]
    }
  }

  // Copiar campos que não precisam de mapeamento
  for (const [key, value] of Object.entries(nodeData)) {
    if (!mapping[key] && key !== 'sourceType') {
      // Se não está no mapeamento, verificar se é um campo canônico
      const canonicalFields = Object.values(mapping)
      if (!canonicalFields.includes(key)) {
        normalized[key] = value
      }
    }
  }

  return normalized
}

/**
 * Converte configuração canônica para formato do service backend
 * @param {string} sourceType - Tipo do connector
 * @param {Object} canonicalConfig - Configuração canônica
 * @returns {Object} Configuração para o service
 */
export function canonicalToServiceFormat(sourceType, canonicalConfig) {
  const serviceMapping = CANONICAL_TO_SERVICE[sourceType]

  if (!serviceMapping) {
    // Se não tem mapeamento específico, retorna como está
    return canonicalConfig
  }

  const serviceConfig = {}

  for (const [canonicalKey, serviceKey] of Object.entries(serviceMapping)) {
    if (canonicalConfig[canonicalKey] !== undefined) {
      serviceConfig[serviceKey] = canonicalConfig[canonicalKey]
    }
  }

  // Copiar campos não mapeados
  for (const [key, value] of Object.entries(canonicalConfig)) {
    if (key !== 'sourceType' && !serviceConfig[key]) {
      serviceConfig[key] = value
    }
  }

  return serviceConfig
}

/**
 * Converte sourceType canônico para formato do service
 * (importado de mappings.js)
 */
export function mapSourceTypeToService(canonicalType) {
  return mapSourceTypeToApi(canonicalType)
}

/**
 * Pipeline completa de transformação: Frontend → Canonical → Service
 */
export function transformForService(sourceType, nodeData) {
  // 1. Normalizar nodeData para canonical
  const canonical = normalizeNodeData(sourceType, nodeData)

  // 2. Converter canonical para service format
  const serviceConfig = canonicalToServiceFormat(sourceType, canonical)

  // 3. Mapear sourceType
  const serviceType = mapSourceTypeToService(sourceType)

  return {
    sourceType: serviceType,
    config: serviceConfig
  }
}
