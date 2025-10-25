/**
 * Math Operations
 * Operações matemáticas básicas (Add, Subtract, Multiply, Divide)
 */

import { unwrapData } from '../../utils/dataUtils.js'

/**
 * Extrai valor numérico de um input (pode estar wrapped)
 */
function extractNumericValue(input) {
  const unwrapped = unwrapData(input)
  const value = parseFloat(unwrapped)

  if (isNaN(value)) {
    throw new Error(`Valor não é um número válido: ${unwrapped}`)
  }

  return value
}

/**
 * Adiciona dois valores
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos (a, b)
 * @param {Object} params.context - Contexto de execução
 * @returns {number} Resultado da soma
 */
export function add({ nodeData, inputs, context }) {
  const a = extractNumericValue(inputs['data-a'])
  const b = extractNumericValue(inputs['data-b'])

  return a + b
}

/**
 * Subtrai dois valores
 * @param {Object} params
 * @param {Object} params.inputs - Inputs recebidos (a, b)
 * @returns {number} Resultado da subtração
 */
export function subtract({ inputs }) {
  const a = extractNumericValue(inputs['data-a'])
  const b = extractNumericValue(inputs['data-b'])

  return a - b
}

/**
 * Multiplica dois valores
 * @param {Object} params
 * @param {Object} params.inputs - Inputs recebidos (a, b)
 * @returns {number} Resultado da multiplicação
 */
export function multiply({ inputs }) {
  const a = extractNumericValue(inputs['data-a'])
  const b = extractNumericValue(inputs['data-b'])

  return a * b
}

/**
 * Divide dois valores
 * @param {Object} params
 * @param {Object} params.inputs - Inputs recebidos (a, b)
 * @returns {number} Resultado da divisão
 */
export function divide({ inputs }) {
  const a = extractNumericValue(inputs['data-a'])
  const b = extractNumericValue(inputs['data-b'])

  if (b === 0) {
    throw new Error('Divisão por zero não permitida')
  }

  return a / b
}

/**
 * Valida configuração de operações matemáticas
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  // Math nodes não precisam de configuração adicional
  return { valid: true, errors: [] }
}
