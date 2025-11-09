const { google } = require('../utils/googleApis');
const Connection = require('../models/Connection');
const logger = require('../utils/logger');
class OAuthService {

  constructor() {
    this.providers = {
      // Configuração unificada do Google
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
        scopePresets: {
          analytics: [
            'https://www.googleapis.com/auth/analytics.readonly',
            'https://www.googleapis.com/auth/analytics'
          ],
          sheets: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.file'
          ],
          profile: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile'
          ]
        }
      },
      // Manter compatibilidade com rotas antigas (DEPRECATED)
      google_analytics: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
        scopes: [
          'https://www.googleapis.com/auth/analytics.readonly',
          'https://www.googleapis.com/auth/analytics',
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile'
        ],
        _deprecated: true
      },
      google_sheets: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile'
        ],
        _deprecated: true
      }
    };
  }

  // Gerar URL de autorização
  getAuthorizationUrl(provider, userId, state, options = {}) {
    // Suporte para novo formato: provider='google' com scopes e purpose
    if (provider === 'google') {
      return this.getGoogleAuthUrlV2(userId, state, options);
    }

    // Retrocompatibilidade (DEPRECATED)
    if (provider === 'google_analytics' || provider === 'google_sheets') {
      logger.warn(`⚠️  Provider '${provider}' is deprecated. Use 'google' with scopes instead.`);
      return this.getGoogleAuthUrl(provider, userId, state);
    }

    throw new Error(`Provider não suportado: ${provider}`);
  }

  // Novo método v2 com scopes dinâmicos
  getGoogleAuthUrlV2(userId, state, options = {}) {
    const config = this.providers.google;
    const { scopes = [], purpose = 'connection', serviceType = null, flowId = null } = options;

    // Construir scopes finais
    let finalScopes = [];

    // Adicionar scopes via presets
    scopes.forEach(scopeKey => {
      if (config.scopePresets[scopeKey]) {
        finalScopes = [...finalScopes, ...config.scopePresets[scopeKey]];
      }
    });

    // Sempre incluir profile para identificar usuário
    if (!finalScopes.some(s => s.includes('userinfo'))) {
      finalScopes = [...finalScopes, ...config.scopePresets.profile];
    }

    // Remover duplicatas
    finalScopes = [...new Set(finalScopes)];

    logger.info('🔐 Gerando URL OAuth:', { purpose, serviceType, scopes: finalScopes });

    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    // State para segurança (inclui userId, purpose, serviceType, flowId)
    const stateData = JSON.stringify({
      userId,
      purpose,
      serviceType,
      flowId,
      timestamp: Date.now(),
      custom: state
    });
    const encodedState = Buffer.from(stateData).toString('base64');

    return oauth2Client.generateAuthUrl({
      access_type: 'offline', // Para receber refresh token
      scope: finalScopes,
      state: encodedState,
      prompt: 'consent' // Força mostrar tela de consentimento
    });
  }

  // Método legado (DEPRECATED)
  getGoogleAuthUrl(provider, userId, state) {
    const config = this.providers[provider];

    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    // State para segurança (inclui userId)
    const stateData = JSON.stringify({
      userId,
      provider, // Para identificar na migração
      timestamp: Date.now(),
      custom: state
    });
    const encodedState = Buffer.from(stateData).toString('base64');

    return oauth2Client.generateAuthUrl({
      access_type: 'offline', // Para receber refresh token
      scope: config.scopes,
      state: encodedState,
      prompt: 'consent' // Força mostrar tela de consentimento
    });
  }

  // Trocar code por tokens
  async exchangeCodeForTokens(provider, code, userId, stateData = {}, ip = null, userAgent = null) {
    // Novo formato v2
    if (provider === 'google' || stateData.purpose) {
      return this.exchangeGoogleCodeV2(code, userId, stateData, ip, userAgent);
    }

    // Retrocompatibilidade (DEPRECATED)
    if (provider === 'google_analytics' || provider === 'google_sheets') {
      logger.warn(`⚠️  Provider '${provider}' is deprecated. Use 'google' instead.`);
      return this.exchangeGoogleCode(provider, code, userId);
    }

    throw new Error(`Provider não suportado: ${provider}`);
  }

  // Novo método v2 que trata purpose
  async exchangeGoogleCodeV2(code, userId, stateData = {}, ip = null, userAgent = null) {
    const config = this.providers.google;
    const { purpose = 'connection', serviceType = null } = stateData;

    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    try {
      // Trocar code por tokens
      const { tokens } = await oauth2Client.getToken(code);

      logger.info('🔑 Tokens recebidos do Google:', {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiryDate: tokens.expiry_date,
        scope: tokens.scope,
        purpose,
        serviceType
      });

      if (!tokens.access_token) {
        throw new Error('Não foi possível obter access token');
      }

      // Calcular expiração
      const expiresAt = tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : new Date(Date.now() + 3600 * 1000);

      // Buscar informações do usuário Google
      oauth2Client.setCredentials(tokens);
      const userData = await this.fetchGoogleUserInfo(oauth2Client);

      // Tratar conforme purpose
      if (purpose === 'authentication') {
        // Login social - criar/atualizar User e retornar JWT
        return this.handleAuthenticationFlow(userId, userData, tokens, expiresAt, ip, userAgent);
      } else {
        // Connection - criar conexão API
        return this.handleConnectionFlow(userId, userData, tokens, expiresAt, serviceType);
      }

    } catch (error) {
      logger.error('Erro ao trocar code por tokens:', error);
      throw new Error(`Erro na autenticação: ${error.message}`);
    }
  }

  // Buscar userinfo do Google
  async fetchGoogleUserInfo(oauth2Client) {
    let userData = {
      email: 'Google User',
      name: 'Google User',
      picture: null,
      googleId: null
    };

    try {
      logger.info('📧 Buscando informações do usuário...');
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();
      userData = {
        email: data.email,
        name: data.name,
        picture: data.picture,
        googleId: data.id
      };
      logger.info('✅ Usuário encontrado:', data.email);
    } catch (userInfoError) {
      logger.warn('⚠️  Não foi possível buscar userinfo (não crítico):', userInfoError.message);
    }

    return userData;
  }

  // Fluxo de autenticação (login social)
  async handleAuthenticationFlow(userId, userData, tokens, expiresAt, ip = null, userAgent = null) {
    const User = require('../models/User');
    const jwt = require('jsonwebtoken');
    const crypto = require('crypto');
    const UAParser = require('ua-parser-js');

    // Buscar ou criar usuário
    let user = await User.findOne({ email: userData.email });

    if (!user) {
      // Criar novo usuário
      user = new User({
        email: userData.email,
        name: userData.name,
        googleId: userData.googleId,
        picture: userData.picture,
        provider: 'google',
        isVerified: true // Email já verificado pelo Google
      });
      await user.save();
      logger.info('✅ Novo usuário criado via Google:', userData.email);
    } else {
      // Atualizar informações
      user.lastLoginAt = new Date();
      if (!user.googleId) user.googleId = userData.googleId;
      if (!user.picture) user.picture = userData.picture;
      logger.info('✅ Usuário existente atualizado:', userData.email);
    }

    // Gerar tokens (igual ao authService)
    const payload = { userId: user._id, email: user.email, role: user.role };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Salvar refresh token
    user.refreshToken = refreshToken;

    // Adicionar sessão ativa
    const sessionId = crypto.randomBytes(16).toString('hex');
    const device = this.parseDeviceInfo(userAgent);

    user.activeSessions.push({
      sessionId,
      token: refreshToken,
      device,
      ip,
      userAgent,
      createdAt: new Date(),
      lastActivity: new Date()
    });

    await user.save();

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture
      },
      email: userData.email
    };
  }

  // Detectar informações do dispositivo a partir do User-Agent
  parseDeviceInfo(userAgent) {
    if (!userAgent) {
      return 'Unknown Device';
    }

    const UAParser = require('ua-parser-js');
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    const browser = result.browser.name || 'Unknown Browser';
    const os = result.os.name || 'Unknown OS';
    const deviceType = result.device.type || 'desktop';

    // Formatar: "Chrome on Windows", "Safari on iPhone", etc.
    if (deviceType === 'mobile') {
      return `${browser} on ${result.device.model || os}`;
    } else if (deviceType === 'tablet') {
      return `${browser} on ${result.device.model || os} (Tablet)`;
    } else {
      return `${browser} on ${os}`;
    }
  }

  // Fluxo de conexão (API access)
  async handleConnectionFlow(userId, userData, tokens, expiresAt, serviceType) {
    const serviceName = serviceType ? this.getServiceName(serviceType) : 'Google';

    // 1. Buscar TODAS as conexões existentes para este usuário e serviceType
    // Incluindo formatos antigos (provider: 'google_sheets'/'google_analytics')
    // e novos (provider: 'google' com serviceType)
    const providerQueries = [];

    // Query para novo formato
    providerQueries.push({
      userId,
      provider: 'google',
      serviceType: serviceType || 'generic',
      isActive: true
    });

    // Query para formato antigo compatível
    if (serviceType === 'sheets') {
      providerQueries.push({
        userId,
        provider: 'google_sheets',
        isActive: true
      });
    } else if (serviceType === 'analytics') {
      providerQueries.push({
        userId,
        provider: 'google_analytics',
        isActive: true
      });
    }

    const existingConnections = await Connection.find({
      $or: providerQueries
    });

    logger.info('🔍 Conexões existentes encontradas:', {
      count: existingConnections.length,
      serviceType,
      email: userData.email
    });

    // 2. Identificar e remover duplicatas do mesmo email
    let deletedCount = 0;
    for (const conn of existingConnections) {
      // Extrair email da conexão (tentar vários formatos)
      let connEmail = null;

      if (conn.providerData?.email) {
        connEmail = conn.providerData.email;
      } else if (conn.name) {
        // Tentar extrair email do nome (formato: "Google Sheets - email@example.com")
        const emailMatch = conn.name.match(/[\w\.-]+@[\w\.-]+\.\w+/);
        if (emailMatch) {
          connEmail = emailMatch[0];
        }
      }

      // Se encontrou email e é o mesmo que está sendo conectado, deletar conexão antiga
      if (connEmail && connEmail.toLowerCase() === userData.email.toLowerCase()) {
        logger.info('🗑️  Removendo conexão duplicada:', {
          connectionId: conn._id,
          provider: conn.provider,
          serviceType: conn.serviceType,
          email: connEmail
        });

        await Connection.deleteOne({ _id: conn._id });
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      logger.info(`✅ ${deletedCount} conexão(ões) duplicada(s) removida(s)`);
    }

    // 3. Criar nova conexão (sempre criar nova após limpar duplicatas)
    logger.info('✨ Criando nova conexão:', {
      email: userData.email,
      serviceType
    });

    const connection = new Connection({
      userId,
      provider: 'google',
      serviceType: serviceType || 'generic',
      purpose: 'connection',
      name: `${serviceName} - ${userData.email}`,
      accessToken: '',
      refreshToken: '',
      expiresAt,
      scope: tokens.scope ? tokens.scope.split(' ') : [],
      providerData: userData
    });

    // Criptografar tokens
    connection.accessToken = connection.encryptToken(tokens.access_token);
    if (tokens.refresh_token) {
      connection.refreshToken = connection.encryptToken(tokens.refresh_token);
    }

    await connection.save();

    logger.info('✅ Nova conexão criada com sucesso (duplicatas limpas)');

    return {
      connection,
      email: userData.email
    };
  }

  getServiceName(serviceType) {
    const names = {
      analytics: 'Google Analytics',
      sheets: 'Google Sheets',
      drive: 'Google Drive',
      generic: 'Google'
    };
    return names[serviceType] || 'Google';
  }

  async exchangeGoogleCode(provider, code, userId) {
    const config = this.providers[provider];

    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    try {
      // Trocar code por tokens
      const { tokens } = await oauth2Client.getToken(code);

      logger.info('🔑 Tokens recebidos do Google:', {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiryDate: tokens.expiry_date,
        scope: tokens.scope
      });

      if (!tokens.access_token) {
        throw new Error('Não foi possível obter access token');
      }

      // Calcular expiração (expiry_date já é timestamp absoluto)
      const expiresAt = tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : new Date(Date.now() + 3600 * 1000);

      // Buscar informações do usuário Google (para nome da conexão)
      oauth2Client.setCredentials(tokens);

      let userData = {
        email: 'Google Analytics User',
        name: 'Google User',
        picture: null
      };

      try {
        logger.info('📧 Buscando informações do usuário...');
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data } = await oauth2.userinfo.get();
        userData = {
          email: data.email,
          name: data.name,
          picture: data.picture
        };
        logger.info('✅ Usuário encontrado:', data.email);
      } catch (userInfoError) {
        logger.warn('⚠️  Não foi possível buscar userinfo (não crítico):', userInfoError.message);
        // Continuar mesmo sem userinfo
      }

      // Criar conexão
      const providerName = provider === 'google_analytics' ? 'Google Analytics' : 'Google Sheets';
      const connection = new Connection({
        userId,
        provider,
        name: `${providerName} - ${userData.email}`,
        accessToken: '', // Será criptografado abaixo
        refreshToken: '',
        expiresAt,
        scope: tokens.scope ? tokens.scope.split(' ') : config.scopes,
        providerData: userData
      });

      // Criptografar tokens
      connection.accessToken = connection.encryptToken(tokens.access_token);
      if (tokens.refresh_token) {
        connection.refreshToken = connection.encryptToken(tokens.refresh_token);
      }

      await connection.save();

      return {
        connection,
        email: userData.email
      };

    } catch (error) {
      logger.error('Erro ao trocar code por tokens:', error);
      throw new Error(`Erro na autenticação: ${error.message}`);
    }
  }

  // Refresh token
  async refreshAccessToken(connectionId, userId) {
    const connection = await Connection.findActiveConnection(connectionId, userId);

    if (!connection) {
      throw new Error('Conexão não encontrada');
    }

    if (connection.provider === 'google' || connection.provider === 'google_analytics' || connection.provider === 'google_sheets') {
      return this.refreshGoogleToken(connection);
    }

    throw new Error(`Provider não suportado: ${connection.provider}`);
  }

  async refreshGoogleToken(connection) {
    const config = this.providers[connection.provider];

    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    try {
      // Descriptografar refresh token
      const refreshToken = connection.decryptToken(connection.refreshToken);

      if (!refreshToken) {
        throw new Error('Refresh token não disponível. Reconecte a conta.');
      }

      oauth2Client.setCredentials({ refresh_token: refreshToken });

      // Obter novo access token
      const { credentials } = await oauth2Client.refreshAccessToken();

      // Atualizar conexão
      connection.accessToken = connection.encryptToken(credentials.access_token);
      connection.expiresAt = new Date(credentials.expiry_date);
      connection.resetErrors();
      await connection.save();

      return connection;

    } catch (error) {
      logger.error('Erro ao refresh token:', error);
      await connection.markError(error);
      throw new Error(`Erro ao renovar token: ${error.message}`);
    }
  }

  // Obter access token válido (refresh automático se expirado)
  async getValidAccessToken(connectionId, userId) {
    let connection = await Connection.findActiveConnection(connectionId, userId);

    if (!connection) {
      throw new Error('Conexão não encontrada');
    }

    // Se expirado, fazer refresh
    if (connection.isExpired()) {
      logger.info('Token expirado, fazendo refresh...');
      connection = await this.refreshAccessToken(connectionId, userId);
    }

    // Atualizar último uso
    await connection.updateLastUsed();

    const decryptedToken = connection.decryptToken(connection.accessToken);

    // Debug
    logger.info('🔑 Token descriptografado:', decryptedToken ? `${decryptedToken.substring(0, 20)}...` : 'NULL');

    if (!decryptedToken) {
      throw new Error('Não foi possível descriptografar o token. Reconecte sua conta.');
    }

    return decryptedToken;
  }

  // Revogar conexão
  async revokeConnection(connectionId, userId) {
    const connection = await Connection.findActiveConnection(connectionId, userId);

    if (!connection) {
      throw new Error('Conexão não encontrada');
    }

    if (connection.provider === 'google_analytics' || connection.provider === 'google_sheets') {
      await this.revokeGoogleToken(connection);
    }

    // Marcar como inativa
    connection.isActive = false;
    await connection.save();

    return connection;
  }

  async revokeGoogleToken(connection) {
    const config = this.providers[connection.provider];

    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    try {
      const accessToken = connection.decryptToken(connection.accessToken);
      oauth2Client.setCredentials({ access_token: accessToken });
      await oauth2Client.revokeCredentials();
    } catch (error) {
      logger.error('Erro ao revogar token no Google:', error);
      // Continuar mesmo com erro (marcar como inativo de qualquer forma)
    }
  }

  // Listar conexões do usuário
  async listUserConnections(userId, provider = null) {
    const query = { userId, isActive: true };
    if (provider) {
      query.provider = provider;
    }

    const connections = await Connection.find(query)
      .sort({ lastUsedAt: -1, createdAt: -1 })
      .lean();

    // Adicionar campo 'id' baseado em '_id' (pois .lean() não inclui virtuals)
    return connections.map(conn => ({
      ...conn,
      id: conn._id.toString()
    }));
  }

  // Verificar estado (segurança)
  validateState(stateParam, expectedUserId) {
    try {
      const decoded = Buffer.from(stateParam, 'base64').toString('utf8');
      const stateData = JSON.parse(decoded);

      // Verificar userId
      if (stateData.userId !== expectedUserId) {
        return { valid: false, reason: 'User ID mismatch' };
      }

      // Verificar timestamp (expirar após 10 minutos)
      const age = Date.now() - stateData.timestamp;
      if (age > 10 * 60 * 1000) {
        return { valid: false, reason: 'State expired' };
      }

      return { valid: true, data: stateData };
    } catch (error) {
      return { valid: false, reason: 'Invalid state format' };
    }
  }
}

module.exports = new OAuthService();
