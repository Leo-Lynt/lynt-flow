/**
 * ExecutionStateManager - Gerenciador de estados de execução de flows
 *
 * Mantém o estado de execução de flows, nodes executados, outputs gerados,
 * e permite retomar execuções parciais ou debugar flows.
 */

import { CacheManager } from './CacheManager.js'

export class ExecutionStateManager {
  constructor(cacheManager) {
    if (!cacheManager || !(cacheManager instanceof CacheManager)) {
      throw new Error('ExecutionStateManager requires a CacheManager instance')
    }

    this.cache = cacheManager
    this.namespace = 'execution-state'
  }

  /**
   * Cria um novo estado de execução para um flow
   * @param {string} flowId - ID único do flow
   * @param {Object} flowData - Dados completos do flow
   * @returns {string} executionId - ID único da execução
   */
  async createExecution(flowId, flowData) {
    const executionId = `exec-${flowId}-${Date.now()}`

    const executionState = {
      executionId,
      flowId,
      flowData,
      status: 'running',
      startTime: Date.now(),
      endTime: null,
      executedNodes: [],
      nodeOutputs: {},
      errors: [],
      metadata: {}
    }

    await this.cache.set(executionId, executionState, {
      namespace: this.namespace,
      ttl: 3600000 // 1 hora de TTL padrão
    })

    return executionId
  }

  /**
   * Recupera o estado de uma execução
   * @param {string} executionId - ID da execução
   */
  async getExecution(executionId) {
    return await this.cache.get(executionId, { namespace: this.namespace })
  }

  /**
   * Atualiza o estado de uma execução
   * @param {string} executionId - ID da execução
   * @param {Object} updates - Atualizações parciais do estado
   */
  async updateExecution(executionId, updates) {
    const currentState = await this.getExecution(executionId)

    if (!currentState) {
      throw new Error(`Execution ${executionId} not found`)
    }

    const updatedState = {
      ...currentState,
      ...updates,
      lastUpdated: Date.now()
    }

    await this.cache.set(executionId, updatedState, {
      namespace: this.namespace,
      ttl: 3600000
    })

    return updatedState
  }

  /**
   * Marca um node como executado e armazena seus outputs
   * @param {string} executionId - ID da execução
   * @param {string} nodeId - ID do node executado
   * @param {Object} outputs - Outputs gerados pelo node
   * @param {Object} metadata - Metadados da execução (tempo, erro, etc.)
   */
  async recordNodeExecution(executionId, nodeId, outputs, metadata = {}) {
    const currentState = await this.getExecution(executionId)

    if (!currentState) {
      throw new Error(`Execution ${executionId} not found`)
    }

    // Adicionar node à lista de executados
    if (!currentState.executedNodes.includes(nodeId)) {
      currentState.executedNodes.push(nodeId)
    }

    // Armazenar outputs do node
    currentState.nodeOutputs[nodeId] = {
      outputs,
      timestamp: Date.now(),
      ...metadata
    }

    await this.cache.set(executionId, currentState, {
      namespace: this.namespace,
      ttl: 3600000
    })

    return true
  }

  /**
   * Recupera os outputs de um node específico
   * @param {string} executionId - ID da execução
   * @param {string} nodeId - ID do node
   */
  async getNodeOutputs(executionId, nodeId) {
    const state = await this.getExecution(executionId)

    if (!state) {
      return null
    }

    return state.nodeOutputs[nodeId]?.outputs || null
  }

  /**
   * Registra um erro durante a execução
   * @param {string} executionId - ID da execução
   * @param {string} nodeId - ID do node onde ocorreu o erro
   * @param {Error|Object} error - Erro ocorrido
   */
  async recordError(executionId, nodeId, error) {
    const currentState = await this.getExecution(executionId)

    if (!currentState) {
      throw new Error(`Execution ${executionId} not found`)
    }

    const errorEntry = {
      nodeId,
      message: error.message || String(error),
      stack: error.stack,
      timestamp: Date.now()
    }

    currentState.errors.push(errorEntry)

    await this.cache.set(executionId, currentState, {
      namespace: this.namespace,
      ttl: 3600000
    })

    return errorEntry
  }

  /**
   * Finaliza uma execução (sucesso ou erro)
   * @param {string} executionId - ID da execução
   * @param {string} status - Status final ('completed' ou 'failed')
   * @param {Object} result - Resultado final da execução
   */
  async completeExecution(executionId, status, result = null) {
    const currentState = await this.getExecution(executionId)

    if (!currentState) {
      throw new Error(`Execution ${executionId} not found`)
    }

    currentState.status = status
    currentState.endTime = Date.now()
    currentState.duration = currentState.endTime - currentState.startTime
    currentState.result = result

    await this.cache.set(executionId, currentState, {
      namespace: this.namespace,
      ttl: 7200000 // 2 horas após completar
    })

    return currentState
  }

  /**
   * Lista todas as execuções de um flow específico
   * @param {string} flowId - ID do flow
   */
  async getFlowExecutions(flowId) {
    const allKeys = await this.cache.keys({ namespace: this.namespace })

    const executions = []

    for (const key of allKeys) {
      if (key.includes(flowId)) {
        const execution = await this.cache.get(key, { namespace: this.namespace })
        if (execution) {
          executions.push(execution)
        }
      }
    }

    // Ordenar por startTime (mais recente primeiro)
    return executions.sort((a, b) => b.startTime - a.startTime)
  }

  /**
   * Remove execuções antigas (cleanup)
   * @param {number} olderThanMs - Remove execuções mais antigas que X milissegundos
   */
  async cleanupOldExecutions(olderThanMs = 86400000) { // 24 horas padrão
    const allKeys = await this.cache.keys({ namespace: this.namespace })
    const now = Date.now()

    let cleanedCount = 0

    for (const key of allKeys) {
      const execution = await this.cache.get(key, { namespace: this.namespace })

      if (execution && execution.endTime && (now - execution.endTime > olderThanMs)) {
        await this.cache.delete(key, { namespace: this.namespace })
        cleanedCount++
      }
    }

    return cleanedCount
  }

  /**
   * Obtém estatísticas de execuções
   * @param {string} flowId - ID do flow (opcional)
   */
  async getStats(flowId = null) {
    const allKeys = await this.cache.keys({ namespace: this.namespace })

    const stats = {
      total: 0,
      running: 0,
      completed: 0,
      failed: 0,
      avgDuration: 0
    }

    const durations = []

    for (const key of allKeys) {
      if (flowId && !key.includes(flowId)) {
        continue
      }

      const execution = await this.cache.get(key, { namespace: this.namespace })

      if (!execution) {
        continue
      }

      stats.total++

      if (execution.status === 'running') {
        stats.running++
      } else if (execution.status === 'completed') {
        stats.completed++
        if (execution.duration) {
          durations.push(execution.duration)
        }
      } else if (execution.status === 'failed') {
        stats.failed++
      }
    }

    if (durations.length > 0) {
      stats.avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
    }

    return stats
  }

  /**
   * Detecta tipos de dados baseado em outputs executados
   * Útil para TypeSystem dinâmico
   */
  async detectOutputTypes(executionId, nodeId) {
    const outputs = await this.getNodeOutputs(executionId, nodeId)

    if (!outputs) {
      return null
    }

    const detectedTypes = {}

    for (const [handleId, value] of Object.entries(outputs)) {
      detectedTypes[handleId] = this._inferType(value)
    }

    return detectedTypes
  }

  /**
   * Infere o tipo de um valor (auxiliar privado)
   */
  _inferType(value) {
    if (value === null || value === undefined) {
      return 'any'
    }

    if (Array.isArray(value)) {
      return 'array'
    }

    const type = typeof value

    if (type === 'object') {
      return 'object'
    }

    if (type === 'number') {
      return 'number'
    }

    if (type === 'string') {
      return 'string'
    }

    if (type === 'boolean') {
      return 'boolean'
    }

    return 'any'
  }

  /**
   * Limpa todos os estados de execução
   */
  async clearAll() {
    return await this.cache.clear({ namespace: this.namespace })
  }
}

export default ExecutionStateManager
