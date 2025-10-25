/**
 * IDataSource Interface
 * Define contrato para implementações de data sources (connectors)
 */

export class IDataSource {
  /**
   * Busca dados da fonte
   * @param {Object} config - Configuração normalizada (formato canônico)
   * @param {Object} context - Contexto de execução (userId, apiConfig, etc)
   * @returns {Promise<any>} Dados obtidos
   */
  async fetch(config, context) {
    throw new Error('IDataSource.fetch() must be implemented')
  }

  /**
   * Valida configuração antes da execução
   * @param {Object} config - Configuração a validar
   * @returns {{ valid: boolean, errors: string[] }}
   */
  validate(config) {
    throw new Error('IDataSource.validate() must be implemented')
  }

  /**
   * Retorna tipo de fonte que este adapter suporta
   * @returns {string}
   */
  getSourceType() {
    throw new Error('IDataSource.getSourceType() must be implemented')
  }
}
