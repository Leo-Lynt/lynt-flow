/**
 * CacheManager - Sistema unificado de cache para LyntFlow
 *
 * Gerencia cache de dados, detecção de tipos e estados temporários
 * usando storage adapter injetado (LocalStorage, Memory, Redis, etc.)
 */

export class CacheManager {
  constructor(storageAdapter) {
    if (!storageAdapter) {
      throw new Error('CacheManager requires a storage adapter')
    }

    this.storage = storageAdapter
    this.memoryCache = new Map() // Cache em memória para acesso rápido
  }

  /**
   * Define um valor no cache
   * @param {string} key - Chave única
   * @param {any} value - Valor a armazenar
   * @param {Object} options - Opções de cache
   * @param {number} options.ttl - Time to live em milissegundos
   * @param {string} options.namespace - Namespace para organizar chaves
   */
  async set(key, value, options = {}) {
    const { ttl, namespace } = options
    const fullKey = namespace ? `${namespace}:${key}` : key

    const cacheEntry = {
      value,
      timestamp: Date.now(),
      ttl: ttl || null
    }

    // Atualizar memory cache
    this.memoryCache.set(fullKey, cacheEntry)

    // Persistir no storage adapter
    await this.storage.set(fullKey, cacheEntry)

    return true
  }

  /**
   * Recupera um valor do cache
   * @param {string} key - Chave única
   * @param {Object} options - Opções de recuperação
   * @param {string} options.namespace - Namespace da chave
   * @returns {any} - Valor armazenado ou null se expirado/não encontrado
   */
  async get(key, options = {}) {
    const { namespace } = options
    const fullKey = namespace ? `${namespace}:${key}` : key

    // Tentar memory cache primeiro
    let cacheEntry = this.memoryCache.get(fullKey)

    // Se não estiver em memória, buscar no storage adapter
    if (!cacheEntry) {
      cacheEntry = await this.storage.get(fullKey)

      // Restaurar para memory cache se encontrado
      if (cacheEntry) {
        this.memoryCache.set(fullKey, cacheEntry)
      }
    }

    // Verificar se existe e não expirou
    if (!cacheEntry) {
      return null
    }

    if (cacheEntry.ttl && (Date.now() - cacheEntry.timestamp > cacheEntry.ttl)) {
      // Expirado - remover
      await this.delete(key, options)
      return null
    }

    return cacheEntry.value
  }

  /**
   * Remove um valor do cache
   * @param {string} key - Chave única
   * @param {Object} options - Opções de remoção
   * @param {string} options.namespace - Namespace da chave
   */
  async delete(key, options = {}) {
    const { namespace } = options
    const fullKey = namespace ? `${namespace}:${key}` : key

    // Remover do memory cache
    this.memoryCache.delete(fullKey)

    // Remover do storage adapter
    await this.storage.delete(fullKey)

    return true
  }

  /**
   * Verifica se uma chave existe no cache
   * @param {string} key - Chave única
   * @param {Object} options - Opções de verificação
   * @param {string} options.namespace - Namespace da chave
   */
  async has(key, options = {}) {
    const value = await this.get(key, options)
    return value !== null
  }

  /**
   * Limpa todo o cache ou apenas um namespace específico
   * @param {Object} options - Opções de limpeza
   * @param {string} options.namespace - Namespace a limpar (opcional)
   */
  async clear(options = {}) {
    const { namespace } = options

    if (namespace) {
      // Limpar apenas o namespace específico
      const prefix = `${namespace}:`

      // Limpar memory cache
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(prefix)) {
          this.memoryCache.delete(key)
        }
      }

      // Limpar storage adapter
      await this.storage.clearNamespace(namespace)
    } else {
      // Limpar tudo
      this.memoryCache.clear()
      await this.storage.clear()
    }

    return true
  }

  /**
   * Lista todas as chaves do cache (ou de um namespace específico)
   * @param {Object} options - Opções de listagem
   * @param {string} options.namespace - Namespace a listar (opcional)
   */
  async keys(options = {}) {
    const { namespace } = options
    const allKeys = await this.storage.keys()

    if (namespace) {
      const prefix = `${namespace}:`
      return allKeys.filter(key => key.startsWith(prefix))
    }

    return allKeys
  }

  /**
   * Obtém estatísticas do cache
   */
  async stats() {
    const allKeys = await this.storage.keys()
    const memoryCacheSize = this.memoryCache.size

    return {
      totalKeys: allKeys.length,
      memoryCacheSize,
      storageType: this.storage.constructor.name
    }
  }

  /**
   * Define múltiplos valores de uma vez (batch operation)
   * @param {Array<{key: string, value: any, options?: Object}>} entries
   */
  async setMany(entries) {
    const promises = entries.map(({ key, value, options }) =>
      this.set(key, value, options)
    )
    return Promise.all(promises)
  }

  /**
   * Recupera múltiplos valores de uma vez (batch operation)
   * @param {Array<{key: string, options?: Object}>} keys
   */
  async getMany(keys) {
    const promises = keys.map(({ key, options }) =>
      this.get(key, options)
    )
    return Promise.all(promises)
  }
}

/**
 * Interface abstrata que todos os storage adapters devem implementar
 */
export class StorageAdapter {
  async set(key, value) {
    throw new Error('StorageAdapter.set() must be implemented')
  }

  async get(key) {
    throw new Error('StorageAdapter.get() must be implemented')
  }

  async delete(key) {
    throw new Error('StorageAdapter.delete() must be implemented')
  }

  async clear() {
    throw new Error('StorageAdapter.clear() must be implemented')
  }

  async clearNamespace(namespace) {
    throw new Error('StorageAdapter.clearNamespace() must be implemented')
  }

  async keys() {
    throw new Error('StorageAdapter.keys() must be implemented')
  }
}

/**
 * Adapter para armazenamento em memória (padrão para testes e fallback)
 */
export class MemoryStorageAdapter extends StorageAdapter {
  constructor() {
    super()
    this.store = new Map()
  }

  async set(key, value) {
    this.store.set(key, value)
    return true
  }

  async get(key) {
    return this.store.get(key) || null
  }

  async delete(key) {
    return this.store.delete(key)
  }

  async clear() {
    this.store.clear()
    return true
  }

  async clearNamespace(namespace) {
    const prefix = `${namespace}:`
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key)
      }
    }
    return true
  }

  async keys() {
    return Array.from(this.store.keys())
  }
}

export default CacheManager
