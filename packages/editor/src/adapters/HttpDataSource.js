/**
 * HttpDataSource Adapter (Frontend)
 * Implementa IDataSource usando HTTP para comunicação com API
 */

import { IDataSource } from '@leo-lynt/lynt-flow-core/interfaces/IDataSource.js'
import { mapSourceTypeToApi } from '@leo-lynt/lynt-flow-core/config/mappings.js'

export class HttpDataSource extends IDataSource {
  constructor(apiBaseUrl) {
    super()
    // Usar VITE_API_URL se disponível, senão fallback para localhost
    const baseUrl = apiBaseUrl || `${import.meta.env.VITE_API_URL}/api`
    this.apiBaseUrl = baseUrl
    this.sourceType = null // Will be set by subclasses or constructor
  }

  /**
   * Busca dados via API HTTP
   * @param {Object} config - Configuração canônica (já normalizada pelo core)
   * @param {Object} context - Contexto com apiConfig (token, baseUrl), userId, etc
   * @returns {Promise<any>}
   */
  async fetch(config, context) {
    const endpoint = `${this.apiBaseUrl}/connectors/execute`

    // Obter token do context.apiConfig
    const token = context.apiConfig?.token

    // Mapear sourceType do frontend para formato da API (usa Core mappings.js)
    const frontendSourceType = this.getSourceType()
    const apiSourceType = mapSourceTypeToApi(frontendSourceType)

    // Remover sourceType do config (já enviamos como parâmetro raiz)
    const { sourceType: _, ...configWithoutSourceType } = config

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...(context.userId && { 'X-User-Id': context.userId })
        },
        body: JSON.stringify({
          sourceType: apiSourceType,
          config: configWithoutSourceType,
          userId: context.userId
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      // Estrutura da resposta: { success: true, data: { result: { data, metadata }, performance } }
      // Retornar apenas os dados
      return result.data?.result?.data || result.data
    } catch (error) {
      console.error(`❌ HttpDataSource fetch error (${this.getSourceType()}):`, error.message)
      throw error
    }
  }

  /**
   * Valida configuração
   * No frontend, a validação canônica já foi feita pelo core
   */
  validate(config) {
    return { valid: true, errors: [] }
  }

  /**
   * Retorna tipo de fonte
   */
  getSourceType() {
    return this.sourceType
  }
}

/**
 * Factory para criar adapters HTTP por tipo de fonte
 */
export class HttpDataSourceFactory {
  static create(sourceType) {
    const adapter = new HttpDataSource()
    adapter.sourceType = sourceType
    return adapter
  }

  /**
   * Cria todos os adapters HTTP disponíveis
   */
  static createAll() {
    const sourceTypes = [
      'google_sheets',
      'google_analytics',
      'api',
      'json',
      'csv',
      'graphql',
      'database',
      'mk3d'
    ]

    return sourceTypes.map(type => ({
      type,
      adapter: HttpDataSourceFactory.create(type)
    }))
  }
}
