const AdapterFactory = require('./connectors/AdapterFactory');
const TemporalResolver = require('./connectors/TemporalResolver');
const MetadataGenerator = require('./connectors/MetadataGenerator');
const logger = require('../utils/logger');

class ConnectorService {
  constructor() {
    this.adapterFactory = new AdapterFactory();
    this.temporalResolver = new TemporalResolver();
    this.metadataGenerator = new MetadataGenerator();
    this.timeout = 30000; // 30 segundos
    this.maxRecords = 1000;
  }

  async execute({ sourceType, config, temporalConfig, transformations, userId }) {
    try {
      // 1. Resolver datas se temporal config estiver habilitado
      let resolvedDates = null;
      if (temporalConfig && temporalConfig.enabled) {
        resolvedDates = this.temporalResolver.resolve(temporalConfig);
      }

      // 2. Obter adapter apropriado
      const adapter = this.adapterFactory.getAdapter(sourceType);

      // 3. Executar busca com timeout (passar userId para adapters que usam OAuth)
      const fetchPromise = adapter.fetch(config, resolvedDates, userId);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na busca de dados')), this.timeout);
      });

      let data = await Promise.race([fetchPromise, timeoutPromise]);

      // 4. Aplicar transformações se fornecidas
      if (transformations) {
        data = this.applyTransformations(data, transformations);
      }

      // 5. Limitar quantidade de registros
      if (Array.isArray(data) && data.length > this.maxRecords) {
        data = data.slice(0, this.maxRecords);
      }

      // 6. Gerar metadata
      const metadata = this.metadataGenerator.generate(data);

      const result = {
        data,
        metadata
      };

      return result;

    } catch (error) {
      logger.error('Erro no ConnectorService:', error);
      throw error;
    }
  }

  applyTransformations(data, transformations) {
    let result = data;

    // Filter
    if (transformations.filter) {
      result = this.applyFilter(result, transformations.filter);
    }

    // Limit
    if (transformations.limit && Array.isArray(result)) {
      result = result.slice(0, transformations.limit);
    }

    // Map (selecionar campos específicos)
    if (transformations.fields && Array.isArray(result)) {
      result = result.map(item => {
        const mapped = {};
        transformations.fields.forEach(field => {
          if (item[field] !== undefined) {
            mapped[field] = item[field];
          }
        });
        return mapped;
      });
    }

    return result;
  }

  applyFilter(data, filter) {
    if (!Array.isArray(data)) return data;

    return data.filter(item => {
      return Object.entries(filter).every(([key, value]) => {
        return item[key] === value;
      });
    });
  }
}

module.exports = new ConnectorService();
