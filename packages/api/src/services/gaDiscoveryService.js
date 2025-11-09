const { google } = require('../utils/googleApis');
const logger = require('../utils/logger');

// Try to require node-cache, fallback to simple in-memory cache
let NodeCache;
try {
  NodeCache = require('node-cache');
} catch (err) {
  logger.warn('node-cache not found, using simple in-memory cache');
  // Simple in-memory cache fallback
  class SimpleCache {
    constructor(options = {}) {
      this.cache = new Map();
      this.stdTTL = options.stdTTL || 900;
    }
    get(key) {
      const item = this.cache.get(key);
      if (!item) return undefined;
      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        return undefined;
      }
      return item.value;
    }
    set(key, value, ttl) {
      const timeToLive = ttl !== undefined ? ttl : this.stdTTL;
      this.cache.set(key, {
        value,
        expiry: Date.now() + (timeToLive * 1000)
      });
    }
    flushAll() {
      this.cache.clear();
    }
  }
  NodeCache = SimpleCache;
}

/**
 * Google Analytics Discovery Service
 * Responsável por descobrir accounts, properties, metrics e dimensions do GA4
 */
class GADiscoveryService {
  constructor() {
    // Cache de 15 minutos para reduzir chamadas à API do Google
    this.cache = new NodeCache({ stdTTL: 900, checkperiod: 120 });
  }

  /**
   * Lista todas as contas do Google Analytics acessíveis pelo usuário
   * @param {string} accessToken - OAuth2 access token
   * @returns {Promise<Array>} Lista de contas
   */
  async listAccounts(accessToken) {
    const cacheKey = `accounts_${accessToken.substring(0, 20)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger.info('📦 Retornando accounts do cache');
      return cached;
    }

    try {
      logger.info('🔍 Buscando contas do Google Analytics...');

      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });

      // Usar Admin API v1alpha para listar account summaries (conforme documentação oficial)
      const analyticsAdmin = google.analyticsadmin({ version: 'v1alpha', auth });

      const response = await analyticsAdmin.accountSummaries.list();

      const accounts = response.data.accountSummaries || [];

      // Formatar resposta
      const formattedAccounts = accounts.map(account => ({
        id: account.account,
        name: account.displayName,
        propertySummaries: account.propertySummaries || []
      }));

      logger.info(`✅ Encontradas ${formattedAccounts.length} contas`);

      // Cachear resultado
      this.cache.set(cacheKey, formattedAccounts);

      return formattedAccounts;
    } catch (error) {
      logger.error('❌ Erro ao buscar contas do GA:', error.message);
      logger.error('Detalhes completos do erro:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        stack: error.stack
      });

      if (error.response?.status === 403 || error.code === 403) {
        const googleError = error.response?.data?.error;

        // Verificar se é erro de API não habilitada
        if (googleError?.message?.includes('has not been used') || googleError?.message?.includes('is disabled')) {
          const activationUrl = googleError?.details?.find(d => d['@type']?.includes('Help'))?.links?.[0]?.url;
          throw new Error(`A Google Analytics Admin API não está habilitada no seu projeto. Habilite em: ${activationUrl || 'Google Cloud Console'}. Após habilitar, aguarde 5 minutos e tente novamente.`);
        }

        const details = googleError?.message || error.message;
        throw new Error(`Permissão negada pelo Google Analytics: ${details}`);
      }

      if (error.response?.status === 401 || error.code === 401) {
        throw new Error('Token de acesso inválido ou expirado. Reconecte sua conta Google Analytics.');
      }

      throw new Error(`Erro ao buscar contas do Google Analytics: ${error.message}`);
    }
  }

  /**
   * Lista todas as propriedades GA4 de todas as contas
   * @param {string} accessToken - OAuth2 access token
   * @returns {Promise<Array>} Lista de propriedades
   */
  async listProperties(accessToken) {
    const cacheKey = `properties_${accessToken.substring(0, 20)}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      logger.info('📦 Retornando properties do cache');
      return cached;
    }

    try {
      logger.info('🔍 Buscando propriedades do Google Analytics...');

      const accounts = await this.listAccounts(accessToken);

      const allProperties = [];

      // Extrair properties de cada account summary
      for (const account of accounts) {
        if (account.propertySummaries && account.propertySummaries.length > 0) {
          const properties = account.propertySummaries.map(prop => ({
            id: prop.property.replace('properties/', ''), // Remover prefixo
            name: prop.displayName,
            accountId: account.id,
            accountName: account.name,
            propertyType: prop.propertyType || 'PROPERTY_TYPE_ORDINARY',
            fullPath: prop.property
          }));

          allProperties.push(...properties);
        }
      }

      logger.info(`✅ Encontradas ${allProperties.length} propriedades`);

      // Cachear resultado
      this.cache.set(cacheKey, allProperties);

      return allProperties;
    } catch (error) {
      logger.error('❌ Erro ao buscar propriedades do GA:', error.message);
      throw error;
    }
  }

  /**
   * Busca uma propriedade específica por ID
   * @param {string} accessToken - OAuth2 access token
   * @param {string} propertyId - ID da propriedade
   * @returns {Promise<Object|null>} Propriedade encontrada ou null
   */
  async getProperty(accessToken, propertyId) {
    try {
      const properties = await this.listProperties(accessToken);
      return properties.find(p => p.id === propertyId) || null;
    } catch (error) {
      logger.error('❌ Erro ao buscar propriedade:', error.message);
      throw error;
    }
  }

  /**
   * Retorna lista de métricas disponíveis no GA4
   * Lista completa baseada na documentação oficial do GA4 Data API
   * https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema
   *
   * @returns {Promise<Array>} Lista de métricas
   */
  async getAvailableMetrics() {
    const cached = this.cache.get('ga4_metrics');
    if (cached) {
      return cached;
    }

    // Métricas mais comuns do GA4 organizadas por categoria
    const metrics = [
      // Usuários
      { name: 'activeUsers', label: 'Active Users', category: 'Users', description: 'Número de usuários ativos' },
      { name: 'newUsers', label: 'New Users', category: 'Users', description: 'Número de novos usuários' },
      { name: 'totalUsers', label: 'Total Users', category: 'Users', description: 'Total de usuários' },
      { name: 'userEngagementDuration', label: 'User Engagement Duration', category: 'Users', description: 'Duração do engajamento do usuário' },

      // Sessões
      { name: 'sessions', label: 'Sessions', category: 'Sessions', description: 'Número de sessões' },
      { name: 'sessionsPerUser', label: 'Sessions per User', category: 'Sessions', description: 'Sessões por usuário' },
      { name: 'engagedSessions', label: 'Engaged Sessions', category: 'Sessions', description: 'Sessões engajadas' },
      { name: 'engagementRate', label: 'Engagement Rate', category: 'Sessions', description: 'Taxa de engajamento' },
      { name: 'averageSessionDuration', label: 'Average Session Duration', category: 'Sessions', description: 'Duração média da sessão' },
      { name: 'bounceRate', label: 'Bounce Rate', category: 'Sessions', description: 'Taxa de rejeição' },

      // Visualizações
      { name: 'screenPageViews', label: 'Page Views', category: 'Views', description: 'Visualizações de página' },
      { name: 'screenPageViewsPerSession', label: 'Pages per Session', category: 'Views', description: 'Páginas por sessão' },
      { name: 'screenPageViewsPerUser', label: 'Pages per User', category: 'Views', description: 'Páginas por usuário' },

      // Eventos
      { name: 'eventCount', label: 'Event Count', category: 'Events', description: 'Total de eventos' },
      { name: 'eventCountPerUser', label: 'Events per User', category: 'Events', description: 'Eventos por usuário' },
      { name: 'eventsPerSession', label: 'Events per Session', category: 'Events', description: 'Eventos por sessão' },
      { name: 'conversions', label: 'Conversions', category: 'Events', description: 'Conversões' },

      // E-commerce
      { name: 'purchaseRevenue', label: 'Purchase Revenue', category: 'Ecommerce', description: 'Receita de compras' },
      { name: 'totalRevenue', label: 'Total Revenue', category: 'Ecommerce', description: 'Receita total' },
      { name: 'transactions', label: 'Transactions', category: 'Ecommerce', description: 'Transações' },
      { name: 'itemsViewed', label: 'Items Viewed', category: 'Ecommerce', description: 'Itens visualizados' },
      { name: 'itemsPurchased', label: 'Items Purchased', category: 'Ecommerce', description: 'Itens comprados' },
      { name: 'averagePurchaseRevenue', label: 'Average Purchase Revenue', category: 'Ecommerce', description: 'Receita média de compra' },
    ];

    this.cache.set('ga4_metrics', metrics, 3600); // Cache por 1 hora
    return metrics;
  }

  /**
   * Retorna lista de dimensões disponíveis no GA4
   * Lista completa baseada na documentação oficial do GA4 Data API
   *
   * @returns {Promise<Array>} Lista de dimensões
   */
  async getAvailableDimensions() {
    const cached = this.cache.get('ga4_dimensions');
    if (cached) {
      return cached;
    }

    // Dimensões mais comuns do GA4 organizadas por categoria
    const dimensions = [
      // Temporal
      { name: 'date', label: 'Date', category: 'Time', description: 'Data no formato YYYYMMDD' },
      { name: 'year', label: 'Year', category: 'Time', description: 'Ano' },
      { name: 'month', label: 'Month', category: 'Time', description: 'Mês' },
      { name: 'week', label: 'Week', category: 'Time', description: 'Semana' },
      { name: 'day', label: 'Day', category: 'Time', description: 'Dia do mês' },
      { name: 'dayOfWeek', label: 'Day of Week', category: 'Time', description: 'Dia da semana' },
      { name: 'hour', label: 'Hour', category: 'Time', description: 'Hora do dia' },

      // Geográfico
      { name: 'country', label: 'Country', category: 'Geography', description: 'País' },
      { name: 'city', label: 'City', category: 'Geography', description: 'Cidade' },
      { name: 'region', label: 'Region', category: 'Geography', description: 'Região' },
      { name: 'continent', label: 'Continent', category: 'Geography', description: 'Continente' },

      // Tecnologia
      { name: 'deviceCategory', label: 'Device Category', category: 'Technology', description: 'Categoria do dispositivo (desktop, mobile, tablet)' },
      { name: 'operatingSystem', label: 'Operating System', category: 'Technology', description: 'Sistema operacional' },
      { name: 'browser', label: 'Browser', category: 'Technology', description: 'Navegador' },
      { name: 'platform', label: 'Platform', category: 'Technology', description: 'Plataforma' },

      // Tráfego
      { name: 'source', label: 'Source', category: 'Traffic', description: 'Fonte de tráfego' },
      { name: 'medium', label: 'Medium', category: 'Traffic', description: 'Meio de tráfego' },
      { name: 'campaign', label: 'Campaign', category: 'Traffic', description: 'Campanha' },
      { name: 'sessionSource', label: 'Session Source', category: 'Traffic', description: 'Fonte da sessão' },
      { name: 'sessionMedium', label: 'Session Medium', category: 'Traffic', description: 'Meio da sessão' },
      { name: 'sessionCampaignName', label: 'Session Campaign', category: 'Traffic', description: 'Campanha da sessão' },

      // Conteúdo
      { name: 'pagePath', label: 'Page Path', category: 'Content', description: 'Caminho da página' },
      { name: 'pageTitle', label: 'Page Title', category: 'Content', description: 'Título da página' },
      { name: 'landingPage', label: 'Landing Page', category: 'Content', description: 'Página de entrada' },
      { name: 'eventName', label: 'Event Name', category: 'Content', description: 'Nome do evento' },

      // E-commerce
      { name: 'itemName', label: 'Item Name', category: 'Ecommerce', description: 'Nome do item' },
      { name: 'itemCategory', label: 'Item Category', category: 'Ecommerce', description: 'Categoria do item' },
      { name: 'itemBrand', label: 'Item Brand', category: 'Ecommerce', description: 'Marca do item' },
    ];

    this.cache.set('ga4_dimensions', dimensions, 3600); // Cache por 1 hora
    return dimensions;
  }

  /**
   * Valida se uma propriedade existe e o usuário tem acesso
   * @param {string} accessToken - OAuth2 access token
   * @param {string} propertyId - ID da propriedade
   * @returns {Promise<boolean>} True se válido
   */
  async validatePropertyAccess(accessToken, propertyId) {
    try {
      const property = await this.getProperty(accessToken, propertyId);
      return property !== null;
    } catch (error) {
      logger.error('❌ Erro ao validar acesso à propriedade:', error.message);
      return false;
    }
  }

  /**
   * Limpa o cache (útil para testes ou refresh forçado)
   */
  clearCache() {
    this.cache.flushAll();
    logger.info('🗑️ Cache do GA Discovery Service limpo');
  }
}

module.exports = new GADiscoveryService();
