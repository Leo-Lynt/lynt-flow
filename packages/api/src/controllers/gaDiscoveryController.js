const gaDiscoveryService = require('../services/gaDiscoveryService');
const oauthService = require('../services/oauthService');
const { formatError, formatSuccess } = require('../utils/helpers');
const logger = require('../utils/logger');

class GADiscoveryController {
  /**
   * GET /api/connectors/ga/accounts
   * Lista todas as contas do Google Analytics do usuário
   */
  async listAccounts(req, res) {
    try {
      const { connectionId } = req.query;
      const userId = req.user.userId;

      if (!connectionId) {
        return res.status(400).json(formatError('connectionId é obrigatório', 'MISSING_CONNECTION_ID'));
      }

      logger.info(`🔍 Listando contas GA para connectionId: ${connectionId}`);

      // Obter access token válido
      const accessToken = await oauthService.getValidAccessToken(connectionId, userId);

      // Buscar contas
      const accounts = await gaDiscoveryService.listAccounts(accessToken);

      return res.status(200).json(formatSuccess({
        accounts,
        count: accounts.length
      }, 'Contas obtidas com sucesso'));

    } catch (error) {
      logger.error('❌ Erro ao listar contas GA:', error.message);

      if (error.message.includes('Token')) {
        return res.status(401).json(formatError(error.message, 'AUTH_ERROR'));
      }

      if (error.message.includes('Permissão')) {
        return res.status(403).json(formatError(error.message, 'PERMISSION_DENIED'));
      }

      return res.status(500).json(formatError('Erro ao listar contas do Google Analytics', 'GA_ACCOUNTS_ERROR', {
        details: error.message
      }));
    }
  }

  /**
   * GET /api/connectors/ga/properties
   * Lista todas as propriedades GA4 do usuário
   */
  async listProperties(req, res) {
    try {
      const { connectionId } = req.query;
      const userId = req.user.userId;

      if (!connectionId) {
        return res.status(400).json(formatError('connectionId é obrigatório', 'MISSING_CONNECTION_ID'));
      }

      logger.info(`🔍 Listando propriedades GA para connectionId: ${connectionId}`);

      // Obter access token válido
      const accessToken = await oauthService.getValidAccessToken(connectionId, userId);

      // Buscar propriedades
      const properties = await gaDiscoveryService.listProperties(accessToken);

      return res.status(200).json(formatSuccess({
        properties,
        count: properties.length
      }, 'Propriedades obtidas com sucesso'));

    } catch (error) {
      logger.error('❌ Erro ao listar propriedades GA:', error.message);

      if (error.message.includes('Token')) {
        return res.status(401).json(formatError(error.message, 'AUTH_ERROR'));
      }

      if (error.message.includes('Permissão')) {
        return res.status(403).json(formatError(error.message, 'PERMISSION_DENIED'));
      }

      return res.status(500).json(formatError('Erro ao listar propriedades do Google Analytics', 'GA_PROPERTIES_ERROR', {
        details: error.message
      }));
    }
  }

  /**
   * GET /api/connectors/ga/metadata
   * Retorna métricas e dimensões disponíveis no GA4
   */
  async getMetadata(req, res) {
    try {
      logger.info('🔍 Buscando metadata (métricas e dimensões) do GA4');

      // Buscar métricas e dimensões
      const [metrics, dimensions] = await Promise.all([
        gaDiscoveryService.getAvailableMetrics(),
        gaDiscoveryService.getAvailableDimensions()
      ]);

      return res.status(200).json(formatSuccess({
        metrics,
        dimensions,
        metricsCount: metrics.length,
        dimensionsCount: dimensions.length
      }, 'Metadata obtido com sucesso'));

    } catch (error) {
      logger.error('❌ Erro ao buscar metadata GA:', error.message);

      return res.status(500).json(formatError('Erro ao buscar metadata do Google Analytics', 'GA_METADATA_ERROR', {
        details: error.message
      }));
    }
  }

  /**
   * GET /api/connectors/ga/properties/:propertyId/validate
   * Valida se uma propriedade existe e o usuário tem acesso
   */
  async validateProperty(req, res) {
    try {
      const { propertyId } = req.params;
      const { connectionId } = req.query;
      const userId = req.user.userId;

      if (!connectionId) {
        return res.status(400).json(formatError('connectionId é obrigatório', 'MISSING_CONNECTION_ID'));
      }

      if (!propertyId) {
        return res.status(400).json(formatError('propertyId é obrigatório', 'MISSING_PROPERTY_ID'));
      }

      logger.info(`🔍 Validando propriedade ${propertyId}`);

      // Obter access token válido
      const accessToken = await oauthService.getValidAccessToken(connectionId, userId);

      // Validar acesso
      const isValid = await gaDiscoveryService.validatePropertyAccess(accessToken, propertyId);

      if (!isValid) {
        return res.status(404).json(formatError(
          `Propriedade ${propertyId} não encontrada ou você não tem acesso`,
          'PROPERTY_NOT_FOUND'
        ));
      }

      // Buscar dados da propriedade
      const property = await gaDiscoveryService.getProperty(accessToken, propertyId);

      return res.status(200).json(formatSuccess({
        valid: true,
        property
      }, 'Propriedade válida'));

    } catch (error) {
      logger.error('❌ Erro ao validar propriedade GA:', error.message);

      if (error.message.includes('Token')) {
        return res.status(401).json(formatError(error.message, 'AUTH_ERROR'));
      }

      return res.status(500).json(formatError('Erro ao validar propriedade', 'GA_VALIDATE_ERROR', {
        details: error.message
      }));
    }
  }
}

module.exports = new GADiscoveryController();
