/**
 * Frontend Cache Setup
 *
 * Inicializa CacheManager com LocalStorageAdapter para uso no frontend
 */

import {
  CacheManager,
  LocalStorageAdapter,
  ExecutionStateManager
} from '@leo-lynt/lynt-flow-core/engine/index.js'

/**
 * Singleton instance do CacheManager
 */
let cacheManagerInstance = null
let executionStateManagerInstance = null

/**
 * Inicializa e retorna o CacheManager
 */
export function getCacheManager() {
  if (!cacheManagerInstance) {
    try {
      const storageAdapter = new LocalStorageAdapter('LyntFlow')
      cacheManagerInstance = new CacheManager(storageAdapter)
      console.log('✅ CacheManager initialized with LocalStorageAdapter')
    } catch (error) {
      console.error('❌ Failed to initialize CacheManager:', error)
      // Fallback para MemoryStorageAdapter se LocalStorage não disponível
      const { MemoryStorageAdapter } = await import('@leo-lynt/lynt-flow-core/engine/index.js')
      const fallbackAdapter = new MemoryStorageAdapter()
      cacheManagerInstance = new CacheManager(fallbackAdapter)
      console.warn('⚠️ Using MemoryStorageAdapter as fallback')
    }
  }

  return cacheManagerInstance
}

/**
 * Inicializa e retorna o ExecutionStateManager
 */
export function getExecutionStateManager() {
  if (!executionStateManagerInstance) {
    const cache = getCacheManager()
    executionStateManagerInstance = new ExecutionStateManager(cache)
    console.log('✅ ExecutionStateManager initialized')
  }

  return executionStateManagerInstance
}

/**
 * Cache helpers específicos para o frontend
 */

/**
 * Cache de tipos detectados (TypeSystem)
 */
export async function cacheDetectedType(nodeId, handleId, type) {
  const cache = getCacheManager()
  await cache.set(`detected-type:${nodeId}:${handleId}`, type, {
    namespace: 'types',
    ttl: 3600000 // 1 hora
  })
}

export async function getCachedDetectedType(nodeId, handleId) {
  const cache = getCacheManager()
  return await cache.get(`detected-type:${nodeId}:${handleId}`, {
    namespace: 'types'
  })
}

export async function clearDetectedTypes() {
  const cache = getCacheManager()
  return await cache.clear({ namespace: 'types' })
}

/**
 * Cache de resultados de execução de nodes
 */
export async function cacheNodeResult(nodeId, result) {
  const cache = getCacheManager()
  await cache.set(nodeId, result, {
    namespace: 'node-results',
    ttl: 600000 // 10 minutos
  })
}

export async function getCachedNodeResult(nodeId) {
  const cache = getCacheManager()
  return await cache.get(nodeId, {
    namespace: 'node-results'
  })
}

export async function clearNodeResults() {
  const cache = getCacheManager()
  return await cache.clear({ namespace: 'node-results' })
}

/**
 * Cache de flows salvos (rascunhos)
 */
export async function cacheDraftFlow(flowId, flowData) {
  const cache = getCacheManager()
  await cache.set(flowId, flowData, {
    namespace: 'drafts',
    // Sem TTL - persiste até usuário excluir
  })
}

export async function getCachedDraftFlow(flowId) {
  const cache = getCacheManager()
  return await cache.get(flowId, {
    namespace: 'drafts'
  })
}

export async function deleteDraftFlow(flowId) {
  const cache = getCacheManager()
  return await cache.delete(flowId, {
    namespace: 'drafts'
  })
}

export async function getAllDraftFlows() {
  const cache = getCacheManager()
  const keys = await cache.keys({ namespace: 'drafts' })

  const drafts = []
  for (const key of keys) {
    const data = await cache.get(key, { namespace: 'drafts' })
    if (data) {
      drafts.push({ id: key, ...data })
    }
  }

  return drafts
}

/**
 * Limpa todo o cache do frontend
 */
export async function clearAllCache() {
  const cache = getCacheManager()
  return await cache.clear()
}

/**
 * Obtém estatísticas do cache
 */
export async function getCacheStats() {
  const cache = getCacheManager()
  return await cache.stats()
}

export default {
  getCacheManager,
  getExecutionStateManager,
  cacheDetectedType,
  getCachedDetectedType,
  clearDetectedTypes,
  cacheNodeResult,
  getCachedNodeResult,
  clearNodeResults,
  cacheDraftFlow,
  getCachedDraftFlow,
  deleteDraftFlow,
  getAllDraftFlows,
  clearAllCache,
  getCacheStats
}
