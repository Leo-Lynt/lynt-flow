/**
 * Conditional Branch
 * Ramifica o fluxo baseado em uma condição (IF/ELSE)
 */

import { unwrapData } from '../../utils/dataUtils.js'


/**
 * Executa conditional branch
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {Object} Indica qual caminho seguir
 */
export function execute({ nodeData, inputs }) {
  // O input pode vir como "condition" ou "data-condition"
  const conditionKey = Object.keys(inputs).find(k => k.includes('condition')) || 'condition'
  let condition = unwrapData(inputs[conditionKey])

  // Se condition é um objeto, tentar extrair o valor boolean
  if (typeof condition === 'object' && condition !== null && !Array.isArray(condition)) {
    // Procurar por campos boolean comuns
    if ('GetTxCovn' in condition) {
      condition = condition.GetTxCovn
    } else if ('value' in condition) {
      condition = condition.value
    } else if ('condition' in condition) {
      condition = condition.condition
    } else {
      // Fallback: pegar o primeiro valor
      const values = Object.values(condition)
      if (values.length > 0) {
        condition = values[0]
      }
    }
  }

  // Converter para boolean explícito
  const boolCondition = Boolean(condition)

  // Retorna qual execution path seguir
  return {
    branch: boolCondition ? 'exec-true' : 'exec-false',
    condition: boolCondition
  }
}

/**
 * Valida configuração do Conditional Branch
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  // Não há configuração, apenas inputs
  return {
    valid: true,
    errors: []
  }
}
