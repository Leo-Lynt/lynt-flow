const BaseAdapter = require('./BaseAdapter');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const { google } = require('../../../utils/googleApis');
const oauthService = require('../../oauthService');
const axios = require('axios');

class GoogleAnalyticsAdapter extends BaseAdapter {
  async fetch(config, resolvedDates, userId = null) {
    // Suporte para OAuth ou Service Account
    const {
      propertyId,
      connectionId, // Para OAuth
      credentials,  // Para Service Account (legado)
      metrics = [],
      dimensions = [],
      limit = 1000,
      startDate,  // Data customizada de início
      endDate     // Data customizada de fim
    } = config;

    // Validar que tem propertyId e pelo menos uma forma de autenticação
    if (!propertyId) {
      throw new Error('propertyId é obrigatório. Selecione uma propriedade GA4 nas configurações do node.');
    }

    if (!connectionId && !credentials) {
      throw new Error('connectionId ou credentials são obrigatórios. Conecte sua conta Google Analytics primeiro.');
    }

    return this.fetchWithRetry(async () => {
      // Preparar date ranges (usar startDate/endDate customizados se fornecidos)
      const dateRanges = this.prepareDateRanges(resolvedDates, startDate, endDate);

      // Preparar métricas (usar defaults se não fornecidas)
      const requestMetrics = metrics.length > 0
        ? metrics.map(m => ({ name: m }))
        : [
            { name: 'activeUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' }
          ];

      // Preparar dimensões (usar defaults se não fornecidas)
      const requestDimensions = dimensions.length > 0
        ? dimensions.map(d => ({ name: d }))
        : [
            { name: 'date' }
          ];

      let response;

      // Usar OAuth se connectionId for fornecido
      if (connectionId && userId) {
        // Buscar connection por ID ou por service type
        let accessToken;

        if (connectionId.match(/^[0-9a-fA-F]{24}$/)) {
          // É um ID válido do MongoDB
          accessToken = await oauthService.getValidAccessToken(connectionId, userId);
        } else if (connectionId === 'google_analytics' || connectionId === 'analytics') {
          // Buscar por serviceType
          const Connection = require('../../models/Connection');
          const connection = await Connection.findByService(userId, 'google', 'analytics');
          if (!connection) {
            throw new Error('Nenhuma conexão Google Analytics encontrada. Conecte sua conta primeiro.');
          }
          accessToken = await oauthService.getValidAccessToken(connection._id, userId);
        }

        // Usar REST API com OAuth token
        response = await this.runReportViaREST(
          propertyId,
          accessToken,
          dateRanges,
          requestMetrics,
          requestDimensions,
          limit
        );
      } else {
        // Usar Service Account com gRPC client (modo legado)
        const analyticsDataClient = new BetaAnalyticsDataClient({
          credentials: this.parseCredentials(credentials)
        });

        const [grpcResponse] = await analyticsDataClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges,
          metrics: requestMetrics,
          dimensions: requestDimensions,
          limit
        });

        response = grpcResponse;
      }

      // Processar resposta
      return this.processResponse(response);
    });
  }

  async runReportViaREST(propertyId, accessToken, dateRanges, metrics, dimensions, limit) {
    // Usar REST API do Google Analytics Data API v1beta
    // Documentação: https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport

    const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;

    const requestBody = {
      dateRanges,
      metrics,
      dimensions,
      limit
    };

    try {
      const response = await axios.post(url, requestBody, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      // Extrair informações relevantes do erro do axios para evitar referências circulares
      if (error.response) {
        // O servidor respondeu com um status code fora do range 2xx
        const errorMessage = error.response.data?.error?.message || error.response.statusText || 'Erro na API do Google Analytics';
        const errorDetails = error.response.data?.error || {};

        throw new Error(`Google Analytics API Error (${error.response.status}): ${errorMessage}. Details: ${JSON.stringify(errorDetails)}`);
      } else if (error.request) {
        // A requisição foi feita mas não houve resposta
        throw new Error('Sem resposta da API do Google Analytics. Verifique sua conexão de rede.');
      } else {
        // Algo aconteceu ao configurar a requisição
        throw new Error(`Erro ao configurar requisição: ${error.message}`);
      }
    }
  }

  parseCredentials(credentials) {
    // Se já for um objeto, retornar diretamente
    if (typeof credentials === 'object') {
      return credentials;
    }

    // Se for string JSON, fazer parse
    if (typeof credentials === 'string') {
      try {
        return JSON.parse(credentials);
      } catch (error) {
        throw new Error('Credenciais inválidas. Deve ser um objeto JSON válido.');
      }
    }

    throw new Error('Formato de credenciais não suportado');
  }

  prepareDateRanges(resolvedDates, customStartDate, customEndDate) {
    // Prioridade: customStartDate/customEndDate > resolvedDates > default (últimos 30 dias)

    // Se startDate e endDate customizados foram fornecidos
    if (customStartDate && customEndDate) {
      return [{
        startDate: this.formatDateForGA(customStartDate),
        endDate: this.formatDateForGA(customEndDate)
      }];
    }

    // Se resolvedDates foi fornecido (vem do temporal config)
    if (resolvedDates) {
      return [{
        startDate: resolvedDates.startDate,
        endDate: resolvedDates.endDate
      }];
    }

    // Default: últimos 30 dias
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return [{
      startDate: this.formatDateForGA(startDate),
      endDate: this.formatDateForGA(endDate)
    }];
  }

  formatDateForGA(date) {
    // GA4 aceita YYYY-MM-DD
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return date;
  }

  processResponse(response) {
    const data = [];

    if (!response.rows || response.rows.length === 0) {
      return data;
    }

    // Extrair nomes das dimensões e métricas
    const dimensionHeaders = response.dimensionHeaders.map(h => h.name);
    const metricHeaders = response.metricHeaders.map(h => h.name);

    // Processar cada linha
    for (const row of response.rows) {
      const rowData = {};

      // Adicionar dimensões
      row.dimensionValues.forEach((value, index) => {
        rowData[dimensionHeaders[index]] = value.value;
      });

      // Adicionar métricas
      row.metricValues.forEach((value, index) => {
        const metricName = metricHeaders[index];
        // Tentar converter para número
        const numValue = parseFloat(value.value);
        rowData[metricName] = isNaN(numValue) ? value.value : numValue;
      });

      data.push(rowData);
    }

    return data;
  }
}

module.exports = GoogleAnalyticsAdapter;