/**
 * Variable Storage
 * Armazena e recupera variáveis globais em memória (não persistente)
 * Variáveis existem apenas durante a sessão do flow
 */

import { validateSafeValue } from '../../utils/security.js'

/**
 * Executa operação de variável (SET ou GET)
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @param {Object} params.context - Contexto (globalVariables)
 * @returns {any} Valor da variável
 */
export function execute({ nodeData, inputs, context }) {
  const mode = nodeData.mode || 'set'
  const variableName = nodeData.variableName

  // Se variableName estiver vazio, retornar undefined sem erro (node ainda não configurado)
  if (!variableName || variableName.trim() === '') {
    return undefined
  }

  // Validar nome da variável para evitar injection
  if (!/^[a-zA-Z0-9_-]+$/.test(variableName)) {
    throw new Error('Nome de variável deve conter apenas letras, números, _ ou -')
  }

  const globalVariables = context.globalVariables || {}

  if (mode === 'set') {
    // Armazenar valor - usar 'data-input' (nome do handle no nodes.json)
    const value = inputs['data-input']

    // Validar que o valor é seguro antes de armazenar
    try {
      validateSafeValue(value)
    } catch (error) {
      throw new Error(`Valor inseguro para armazenamento: ${error.message}`)
    }

    // Armazenar apenas em memória (context.globalVariables)
    globalVariables[variableName] = value

    return value
  } else {
    // Recuperar valor da memória
    const value = globalVariables[variableName]

    return value
  }
}

/**
 * Valida configuração da variável
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

  if (!nodeData.variableName) {
    errors.push('Campo "variableName" obrigatório')
  }

  if (!nodeData.mode || !['set', 'get'].includes(nodeData.mode)) {
    errors.push('Campo "mode" deve ser "set" ou "get"')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
