/**
 * IOutputDestination Interface
 * Define contrato para implementações de output destinations
 */

export class IOutputDestination {
  /**
   * Envia dados para o destino
   * @param {Object} data - Dados a enviar
   * @param {Object} config - Configuração do destino
   * @param {Object} context - Contexto de execução
   * @returns {Promise<any>} Resultado do envio
   */
  async send(data, config, context) {
    throw new Error('IOutputDestination.send() must be implemented')
  }

  /**
   * Valida configuração do destino
   * @param {Object} config - Configuração a validar
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validate(config) {
    throw new Error('IOutputDestination.validate() must be implemented')
  }

  /**
   * Retorna tipo de destino que este adapter suporta
   * @returns {string}
   */
  getDestinationType() {
    throw new Error('IOutputDestination.getDestinationType() must be implemented')
  }
}
