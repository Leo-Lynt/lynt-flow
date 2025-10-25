/**
 * LocalStorageAdapter - Adapter para armazenamento no LocalStorage do navegador
 *
 * Implementa a interface StorageAdapter usando window.localStorage
 * Ideal para frontend (browser environments)
 */

import { StorageAdapter } from '../CacheManager.js'

export class LocalStorageAdapter extends StorageAdapter {
  constructor(prefix = 'flowforge') {
    super()
    this.prefix = prefix

    // Verificar se localStorage está disponível
    if (typeof window === 'undefined' || !window.localStorage) {
      throw new Error('LocalStorage is not available in this environment')
    }

    this.storage = window.localStorage
  }

  /**
   * Cria a chave completa com prefix
   */
  _getFullKey(key) {
    return `${this.prefix}:${key}`
  }

  /**
   * Remove o prefix da chave
   */
  _stripPrefix(fullKey) {
    return fullKey.replace(`${this.prefix}:`, '')
  }

  /**
   * Define um valor no localStorage
   */
  async set(key, value) {
    try {
      const fullKey = this._getFullKey(key)
      const serialized = JSON.stringify(value)
      this.storage.setItem(fullKey, serialized)
      return true
    } catch (error) {
      // Quota exceeded ou outros erros
      console.error('LocalStorageAdapter.set error:', error)
      throw new Error(`Failed to set item in localStorage: ${error.message}`)
    }
  }

  /**
   * Recupera um valor do localStorage
   */
  async get(key) {
    try {
      const fullKey = this._getFullKey(key)
      const serialized = this.storage.getItem(fullKey)

      if (serialized === null) {
        return null
      }

      return JSON.parse(serialized)
    } catch (error) {
      console.error('LocalStorageAdapter.get error:', error)
      return null
    }
  }

  /**
   * Remove um valor do localStorage
   */
  async delete(key) {
    try {
      const fullKey = this._getFullKey(key)
      this.storage.removeItem(fullKey)
      return true
    } catch (error) {
      console.error('LocalStorageAdapter.delete error:', error)
      return false
    }
  }

  /**
   * Limpa todo o localStorage (apenas chaves com o prefix)
   */
  async clear() {
    try {
      const keysToRemove = []

      // Identificar todas as chaves com nosso prefix
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key && key.startsWith(`${this.prefix}:`)) {
          keysToRemove.push(key)
        }
      }

      // Remover todas as chaves identificadas
      keysToRemove.forEach(key => this.storage.removeItem(key))

      return true
    } catch (error) {
      console.error('LocalStorageAdapter.clear error:', error)
      return false
    }
  }

  /**
   * Limpa um namespace específico
   */
  async clearNamespace(namespace) {
    try {
      const namespacePrefix = `${this.prefix}:${namespace}:`
      const keysToRemove = []

      // Identificar todas as chaves do namespace
      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key && key.startsWith(namespacePrefix)) {
          keysToRemove.push(key)
        }
      }

      // Remover todas as chaves identificadas
      keysToRemove.forEach(key => this.storage.removeItem(key))

      return true
    } catch (error) {
      console.error('LocalStorageAdapter.clearNamespace error:', error)
      return false
    }
  }

  /**
   * Lista todas as chaves armazenadas (sem o prefix)
   */
  async keys() {
    try {
      const keys = []

      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key && key.startsWith(`${this.prefix}:`)) {
          keys.push(this._stripPrefix(key))
        }
      }

      return keys
    } catch (error) {
      console.error('LocalStorageAdapter.keys error:', error)
      return []
    }
  }

  /**
   * Obtém o tamanho usado do localStorage (em bytes, aproximado)
   */
  async getSize() {
    try {
      let size = 0

      for (let i = 0; i < this.storage.length; i++) {
        const key = this.storage.key(i)
        if (key && key.startsWith(`${this.prefix}:`)) {
          const value = this.storage.getItem(key)
          size += key.length + (value?.length || 0)
        }
      }

      return size
    } catch (error) {
      console.error('LocalStorageAdapter.getSize error:', error)
      return 0
    }
  }

  /**
   * Verifica quota disponível (aproximado)
   */
  async checkQuota() {
    try {
      const testKey = `${this.prefix}:__quota_test__`
      const testData = 'x'.repeat(1024) // 1KB

      // Tentar escrever
      this.storage.setItem(testKey, testData)
      this.storage.removeItem(testKey)

      return { available: true, estimated: '5-10MB' }
    } catch (error) {
      return { available: false, error: error.message }
    }
  }
}

export default LocalStorageAdapter
