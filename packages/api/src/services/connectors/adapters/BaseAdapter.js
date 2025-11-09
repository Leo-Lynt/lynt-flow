const logger = require('../../../utils/logger');

class BaseAdapter {
  constructor() {
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 segundo
  }

  async fetch(config, resolvedDates) {
    throw new Error('Método fetch deve ser implementado pela subclasse');
  }

  async fetchWithRetry(fetchFn, attempt = 1) {
    try {
      logger.info(`🔄 fetchWithRetry attempt ${attempt}`);
      const result = await fetchFn();
      logger.info(`✅ fetchWithRetry attempt ${attempt} succeeded`);
      return result;
    } catch (error) {
      logger.error(`❌ fetchWithRetry attempt ${attempt} failed:`, {
        error: error.message,
        stack: error.stack,
        name: error.name,
        attempt: attempt,
        maxAttempts: this.retryAttempts
      });
      console.error('🔴 FETCH RETRY ERROR:', error);

      if (attempt >= this.retryAttempts) {
        logger.error('❌ Max retry attempts reached, throwing error');
        throw error;
      }

      // Backoff exponencial
      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      logger.info(`Tentativa ${attempt} falhou. Tentando novamente em ${delay}ms...`);

      await this.sleep(delay);
      return this.fetchWithRetry(fetchFn, attempt + 1);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  validateConfig(config, requiredFields) {
    for (const field of requiredFields) {
      if (!config[field]) {
        throw new Error(`Campo obrigatório ausente: ${field}`);
      }
    }
  }
}

module.exports = BaseAdapter;
