/**
 * Debug Viewer
 * Visualiza dados em tempo real (passthrough)
 */

import { unwrapData } from '../../utils/dataUtils.js'


/**
 * Executa debug viewer (passthrough - apenas retorna o input)
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @returns {any} Input data (passthrough)
 */
export function execute({ nodeData, inputs }) {
  // Debug viewer é apenas visualização, não processa dados
  // Apenas retorna o input como está para permitir visualização
  const inputData = inputs.input !== undefined ? unwrapData(inputs.input) : null

  return inputData
}

/**
 * Valida configuração do Debug Viewer
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  // Debug viewer sempre válido, não tem requisitos
  return {
    valid: true,
    errors: []
  }
}
