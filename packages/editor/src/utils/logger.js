/**
 * Configurable Logger System
 * Can be enabled/disabled globally or by module
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
}

class Logger {
  constructor() {
    // Default configuration - can be changed via setConfig()
    this.config = {
      enabled: true,
      level: LOG_LEVELS.INFO,
      modules: {
        flowStore: true,
        connector: true,
        canvas: true,
        fieldExtractor: true,
        general: true
      }
    }

    // Development mode - enabled by default in dev
    this.isDev = import.meta.env.DEV || false
  }

  setConfig(config) {
    this.config = { ...this.config, ...config }
  }

  setLevel(level) {
    this.config.level = level
  }

  enableModule(moduleName) {
    this.config.modules[moduleName] = true
  }

  disableModule(moduleName) {
    this.config.modules[moduleName] = false
  }

  _shouldLog(level, module) {
    if (!this.config.enabled) return false
    if (level < this.config.level) return false
    if (module && this.config.modules[module] === false) return false
    return true
  }

  _formatMessage(module, message, data) {
    const prefix = module ? `[${module}]` : ''
    if (data !== undefined) {
      return [prefix, message, data]
    }
    return [prefix, message]
  }

  debug(message, data, module = 'general') {
    if (this._shouldLog(LOG_LEVELS.DEBUG, module)) {
    }
  }

  info(message, data, module = 'general') {
    if (this._shouldLog(LOG_LEVELS.INFO, module)) {
    }
  }

  warn(message, data, module = 'general') {
    if (this._shouldLog(LOG_LEVELS.WARN, module)) {
    }
  }

  error(message, data, module = 'general') {
    if (this._shouldLog(LOG_LEVELS.ERROR, module)) {
    }
  }

  // Convenience methods with emojis for visual clarity (only in dev mode)
  success(message, data, module = 'general') {
    if (this.isDev && this._shouldLog(LOG_LEVELS.INFO, module)) {
    }
  }

  loading(message, data, module = 'general') {
    if (this.isDev && this._shouldLog(LOG_LEVELS.INFO, module)) {
    }
  }

  failure(message, data, module = 'general') {
    if (this.isDev && this._shouldLog(LOG_LEVELS.ERROR, module)) {
    }
  }
}

// Singleton instance
export const logger = new Logger()

// Export LOG_LEVELS for external configuration
export { LOG_LEVELS }

// Example usage:
// import { logger } from '@/utils/logger'
// logger.info('Node added', { id: 'node_123' }, 'flowStore')
// logger.success('Connector executed', { type: 'api' }, 'connector')
// logger.error('Execution failed', { error }, 'flowStore')