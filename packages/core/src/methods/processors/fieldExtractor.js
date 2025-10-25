/**
 * Field Extractor
 * Extrai campos específicos de objetos ou arrays
 */

import { unwrapData } from '../../utils/dataUtils.js'
import { getValueByPath } from '../../utils/pathUtils.js'
import { detectValueType } from '../../engine/dataTypes.js'


/**
 * Wrap data para manter compatibilidade com chaining
 * @param {any} extractedValue - Valor extraído
 * @param {any} originalData - Dados originais
 * @returns {Object}
 */
function wrapExtractedData(extractedValue, originalData) {
  return {
    value: extractedValue,
    __wrapped: true,
    __originalData: originalData
  }
}

/**
 * Executa extração de campos
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos (input)
 * @param {Object} params.context - Contexto de execução (para atualizar nodeData)
 * @returns {any} Dados extraídos
 */
export function execute({ nodeData, inputs, context }) {
  const inputData = unwrapData(inputs['data-input'])


  const selectionMode = nodeData.selectionMode || 'single'
  const selectedFields = nodeData.selectedFields || []
  const manualPath = nodeData.manualPath

  // Se houver manual path, usar ele
  const fieldsToExtract = manualPath ? [manualPath] : selectedFields

  if (fieldsToExtract.length === 0) {
    return inputData
  }

  // ⭐ Detectar tipos dos campos extraídos
  const fieldTypes = {}
  const sampleData = Array.isArray(inputData) ? inputData[0] : inputData

  if (sampleData && typeof sampleData === 'object') {
    fieldsToExtract.forEach(field => {
      const fieldValue = getValueByPath(sampleData, field)
      fieldTypes[field] = detectValueType(fieldValue)
    })

    // ⭐ Atualizar nodeData com tipos detectados (se context disponível)
    if (context?.updateNodeData) {
      context.updateNodeData({ fieldTypes })
    }

  }

  // Processar arrays
  if (Array.isArray(inputData)) {
    if (selectionMode === 'single' && fieldsToExtract.length === 1) {
      // Extrair único campo de cada item
      const fieldPath = fieldsToExtract[0]
      const extracted = inputData.map(item => getValueByPath(item, fieldPath))
      return wrapExtractedData(extracted, inputData)
    } else {
      // Extrair múltiplos campos de cada item
      const extracted = inputData.map(item => {
        const result = {}
        fieldsToExtract.forEach(field => {
          result[field] = getValueByPath(item, field)
        })
        return result
      })
      return wrapExtractedData(extracted, inputData)
    }
  }

  // Processar objetos
  if (typeof inputData === 'object' && inputData !== null) {
    if (selectionMode === 'single' && fieldsToExtract.length === 1) {
      // Extrair único campo
      const fieldPath = fieldsToExtract[0]
      const extracted = getValueByPath(inputData, fieldPath)
      return wrapExtractedData(extracted, inputData)
    } else {
      // Extrair múltiplos campos
      const result = {}
      fieldsToExtract.forEach(field => {
        result[field] = getValueByPath(inputData, field)
      })
      return wrapExtractedData(result, inputData)
    }
  }

  // Dados primitivos, retornar sem alteração
  return inputData
}

/**
 * Valida configuração do Field Extractor
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

  const selectedFields = nodeData.selectedFields || []
  const manualPath = nodeData.manualPath

  if (selectedFields.length === 0 && !manualPath) {
    errors.push('Nenhum campo selecionado ou path manual definido')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
