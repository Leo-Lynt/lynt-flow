/**
 * RedisAdapter - Adapter para armazenamento em Redis
 *
 * Implementa a interface StorageAdapter usando Redis
 * Ideal para API/backend (produção com cache distribuído)
 *
 * Requer: npm install redis
 */

import { StorageAdapter } from '../CacheManager.js'

export class RedisAdapter extends StorageAdapter {
  constructor(redisClient, prefix = 'LyntFlow') {
    super()

    if (!redisClient) {
      throw new Error('RedisAdapter requires a redis client instance')
    }

    this.client = redisClient
    this.prefix = prefix
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
   * Define um valor no Redis
   */
  async set(key, value) {
    try {
      const fullKey = this._getFullKey(key)
      const serialized = JSON.stringify(value)

      // Se o valor tem TTL, usar SETEX
      if (value.ttl) {
        const ttlSeconds = Math.ceil(value.ttl / 1000)
        await this.client.setEx(fullKey, ttlSeconds, serialized)
      } else {
        await this.client.set(fullKey, serialized)
      }

      return true
    } catch (error) {
      console.error('RedisAdapter.set error:', error)
      throw new Error(`Failed to set item in Redis: ${error.message}`)
    }
  }

  /**
   * Recupera um valor do Redis
   */
  async get(key) {
    try {
      const fullKey = this._getFullKey(key)
      const serialized = await this.client.get(fullKey)

      if (serialized === null) {
        return null
      }

      return JSON.parse(serialized)
    } catch (error) {
      console.error('RedisAdapter.get error:', error)
      return null
    }
  }

  /**
   * Remove um valor do Redis
   */
  async delete(key) {
    try {
      const fullKey = this._getFullKey(key)
      await this.client.del(fullKey)
      return true
    } catch (error) {
      console.error('RedisAdapter.delete error:', error)
      return false
    }
  }

  /**
   * Limpa todo o cache Redis (apenas chaves com o prefix)
   */
  async clear() {
    try {
      const pattern = `${this.prefix}:*`
      const keys = await this.client.keys(pattern)

      if (keys.length > 0) {
        await this.client.del(keys)
      }

      return true
    } catch (error) {
      console.error('RedisAdapter.clear error:', error)
      return false
    }
  }

  /**
   * Limpa um namespace específico
   */
  async clearNamespace(namespace) {
    try {
      const pattern = `${this.prefix}:${namespace}:*`
      const keys = await this.client.keys(pattern)

      if (keys.length > 0) {
        await this.client.del(keys)
      }

      return true
    } catch (error) {
      console.error('RedisAdapter.clearNamespace error:', error)
      return false
    }
  }

  /**
   * Lista todas as chaves armazenadas (sem o prefix)
   */
  async keys() {
    try {
      const pattern = `${this.prefix}:*`
      const fullKeys = await this.client.keys(pattern)

      return fullKeys.map(key => this._stripPrefix(key))
    } catch (error) {
      console.error('RedisAdapter.keys error:', error)
      return []
    }
  }

  /**
   * Define TTL para uma chave existente
   */
  async expire(key, ttlSeconds) {
    try {
      const fullKey = this._getFullKey(key)
      await this.client.expire(fullKey, ttlSeconds)
      return true
    } catch (error) {
      console.error('RedisAdapter.expire error:', error)
      return false
    }
  }

  /**
   * Verifica se uma chave existe
   */
  async exists(key) {
    try {
      const fullKey = this._getFullKey(key)
      const result = await this.client.exists(fullKey)
      return result === 1
    } catch (error) {
      console.error('RedisAdapter.exists error:', error)
      return false
    }
  }

  /**
   * Obtém TTL restante de uma chave (em segundos)
   */
  async ttl(key) {
    try {
      const fullKey = this._getFullKey(key)
      return await this.client.ttl(fullKey)
    } catch (error) {
      console.error('RedisAdapter.ttl error:', error)
      return -1
    }
  }

  /**
   * Ping para verificar conexão
   */
  async ping() {
    try {
      return await this.client.ping()
    } catch (error) {
      console.error('RedisAdapter.ping error:', error)
      return null
    }
  }

  /**
   * Obtém informações do servidor Redis
   */
  async info() {
    try {
      const info = await this.client.info()
      return info
    } catch (error) {
      console.error('RedisAdapter.info error:', error)
      return null
    }
  }

  /**
   * Fecha a conexão com Redis
   */
  async disconnect() {
    try {
      await this.client.quit()
      return true
    } catch (error) {
      console.error('RedisAdapter.disconnect error:', error)
      return false
    }
  }
}

/**
 * Factory function para criar RedisAdapter conectado
 * @param {Object} config - Configuração do Redis
 * @param {string} config.host - Host do Redis (padrão: localhost)
 * @param {number} config.port - Porta do Redis (padrão: 6379)
 * @param {string} config.password - Senha (opcional)
 * @param {number} config.db - Database number (padrão: 0)
 * @param {string} config.prefix - Prefix das chaves (padrão: LyntFlow)
 */
export async function createRedisAdapter(config = {}) {
  try {
    // Importação dinâmica do redis
    const redis = await import('redis')

    const {
      host = 'localhost',
      port = 6379,
      password,
      db = 0,
      prefix = 'LyntFlow'
    } = config

    const client = redis.createClient({
      socket: {
        host,
        port
      },
      password,
      database: db
    })

    // Conectar
    await client.connect()

    console.log(`✅ RedisAdapter connected to ${host}:${port}`)

    return new RedisAdapter(client, prefix)
  } catch (error) {
    console.error('❌ Failed to create RedisAdapter:', error.message)
    throw error
  }
}

export default RedisAdapter
