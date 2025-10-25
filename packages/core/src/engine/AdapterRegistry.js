/**
 * Adapter Registry
 * Gerencia registro e acesso a adapters por ambiente
 */

export class AdapterRegistry {
  constructor() {
    this.dataSources = new Map()
    this.outputDestinations = new Map()
  }

  /**
   * Registra um data source adapter
   * @param {string} sourceType - Tipo de fonte (google_sheets, api, etc)
   * @param {IDataSource} adapter - Implementação do adapter
   */
  registerDataSource(sourceType, adapter) {
    this.dataSources.set(sourceType, adapter)
  }

  /**
   * Obtém data source adapter por tipo
   * @param {string} sourceType
   * @returns {IDataSource|null}
   */
  getDataSource(sourceType) {
    return this.dataSources.get(sourceType) || null
  }

  /**
   * Verifica se um data source está registrado
   * @param {string} sourceType
   * @returns {boolean}
   */
  hasDataSource(sourceType) {
    return this.dataSources.has(sourceType)
  }

  /**
   * Registra um output destination adapter
   * @param {string} destinationType - Tipo de destino (webhook, email, etc)
   * @param {IOutputDestination} adapter - Implementação do adapter
   */
  registerOutputDestination(destinationType, adapter) {
    this.outputDestinations.set(destinationType, adapter)
  }

  /**
   * Obtém output destination adapter por tipo
   * @param {string} destinationType
   * @returns {IOutputDestination|null}
   */
  getOutputDestination(destinationType) {
    return this.outputDestinations.get(destinationType) || null
  }

  /**
   * Verifica se um output destination está registrado
   * @param {string} destinationType
   * @returns {boolean}
   */
  hasOutputDestination(destinationType) {
    return this.outputDestinations.has(destinationType)
  }

  /**
   * Lista todos os data sources registrados
   * @returns {string[]}
   */
  listDataSources() {
    return Array.from(this.dataSources.keys())
  }

  /**
   * Lista todos os output destinations registrados
   * @returns {string[]}
   */
  listOutputDestinations() {
    return Array.from(this.outputDestinations.keys())
  }

  /**
   * Limpa todos os adapters registrados
   */
  clear() {
    this.dataSources.clear()
    this.outputDestinations.clear()
  }
}
