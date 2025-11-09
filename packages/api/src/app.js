// Carregar .env apenas em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerSpecs = require('./config/swagger');
const logger = require('./utils/logger');
const requestLoggerMiddleware = require('./middleware/requestLogger');


// Conectar ao banco de dados
const connectDB = require('./utils/database');

// Importar rotas
const authRoutes = require('./routes/auth');
const flowRoutes = require('./routes/flows');
const flowDataRoutes = require('./routes/flowDataRoutes');
const connectorRoutes = require('./routes/connectors');
const oauthRoutes = require('./routes/oauth');
const outputRoutes = require('./routes/output');
const logRoutes = require('./routes/logs');
const nodesRoutes = require('./routes/nodesRoutes');
const cacheRoutes = require('./routes/cacheRoutes');
const executionRoutes = require('./routes/executionRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const publicFlowRoutes = require('./routes/publicFlows');
const userManagementRoutes = require('./routes/userManagement');
const dashboardRoutes = require('./routes/dashboard');
const billingRoutes = require('./routes/billing');

// Importar middleware
const {
  errorHandler,
  notFoundHandler,
  requestLogger,
  createUserRateLimit,
  sanitizeRequestData
} = require('./middleware/errorHandler');
const ensureDB = require('./middleware/ensureDB');

const app = express();

// Tentar conectar ao MongoDB no início (não bloqueante)
// A conexão real será garantida pelo middleware ensureDB
connectDB().catch(err => {
  logger.warn('Conexão inicial MongoDB falhou (será reconectado pelo middleware):', err.message);
});

// Configurações de segurança
app.use(helmet({
  contentSecurityPolicy: false // Desabilitar CSP para APIs
}));

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:5176', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware básico
app.use(express.json({ limit: '10mb' })); // Aumentar limite para fluxos grandes
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (Log Viewer)
app.use(express.static(path.join(__dirname, '../public')));

// Request Logger (correlation ID + logs estruturados)
app.use(requestLoggerMiddleware);

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Limite por IP
  message: {
    success: false,
    error: {
      message: 'Muitas requisições deste IP. Tente novamente mais tarde.',
      code: 'RATE_LIMIT_EXCEEDED'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(globalLimiter);

// Middleware customizado
app.use(sanitizeRequestData);
// REMOVIDO: requestLogger duplicado (já temos requestLoggerMiddleware na linha 59)

// Configurar trust proxy de forma segura
const trustProxy = process.env.TRUST_PROXY;
if (trustProxy && trustProxy !== 'false') {
  // Se for um número, converter para integer
  if (!isNaN(trustProxy)) {
    app.set('trust proxy', parseInt(trustProxy));
  }
  // Se contém vírgulas, tratar como lista de IPs
  else if (trustProxy.includes(',')) {
    app.set('trust proxy', trustProxy.split(',').map(ip => ip.trim()));
  }
  // Caso contrário, usar o valor como string (pode ser 'loopback', 'linklocal', etc.)
  else {
    app.set('trust proxy', trustProxy);
  }
} else {
  // Por padrão, não confiar em proxies para maior segurança
  app.set('trust proxy', false);
}

// Rota de health check
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar status da API
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API funcionando corretamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Flow-Forge API está funcionando
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Flow-Forge API está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Documentação da API com Swagger UI (carregado via CDN)
app.get('/api/docs', (req, res) => {
  // Detectar URL base automaticamente (força HTTPS no Vercel)
  const protocol = req.get('x-forwarded-proto') || req.protocol;
  const host = req.get('host');
  const baseUrl = `${protocol}://${host}`;

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Flow-Forge API Documentation" />
        <title>Flow-Forge API Documentation</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
        <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js" crossorigin></script>
        <script>
          window.onload = () => {
            window.ui = SwaggerUIBundle({
              url: '${baseUrl}/api/docs.json',
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              layout: "StandaloneLayout",
              persistAuthorization: true,
              displayRequestDuration: true,
              filter: true,
              tryItOutEnabled: true
            });
          };
        </script>
      </body>
    </html>
  `);
});

// Endpoint JSON da especificação OpenAPI
app.get('/api/docs.json', (req, res) => {
  // Detectar URL base automaticamente (força HTTPS no Vercel)
  const protocol = req.get('x-forwarded-proto') || req.protocol;
  const host = req.get('host');
  const baseUrl = `${protocol}://${host}`;

  // Clonar specs e atualizar servidor dinamicamente
  const dynamicSpecs = {
    ...swaggerSpecs,
    servers: [
      {
        url: baseUrl,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ]
  };

  res.json(dynamicSpecs);
});

// Rota de informações da API
/**
 * @swagger
 * /api:
 *   get:
 *     summary: Informações gerais da API
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Informações da API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Flow-Forge API
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 endpoints:
 *                   type: object
 *                   properties:
 *                     auth:
 *                       type: string
 *                       example: /api/auth
 *                     flows:
 *                       type: string
 *                       example: /api/flows
 *                     executions:
 *                       type: string
 *                       example: /api/executions
 *                     dashboard:
 *                       type: string
 *                       example: /api/dashboard
 *                 documentation:
 *                   type: string
 *                   example: /api/docs
 *                 health:
 *                   type: string
 *                   example: /health
 */
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Flow-Forge API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      flows: '/api/flows',
      flowData: '/api/flow-data',
      connectors: '/api/connectors',
      oauth: '/api/oauth',
      output: '/api/output',
      logs: '/api/logs',
      dashboard: '/api/dashboard'
    },
    documentation: '/api/docs',
    logViewer: '/logs.html',
    health: '/health'
  });
});

// Rate limiting específico por usuário (aplicado nas rotas protegidas)
const userRateLimit = createUserRateLimit();

// Garantir conexão MongoDB antes de todas as rotas de API
app.use('/api', ensureDB);

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/flows', userRateLimit, flowRoutes);
app.use('/api/public-flows', publicFlowRoutes);
app.use('/api/admin', userManagementRoutes);
app.use('/api/connectors', userRateLimit, connectorRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/output', userRateLimit, outputRoutes);
app.use('/api/logs', userRateLimit, logRoutes);
app.use('/api/nodes', nodesRoutes);
app.use('/api/executions', userRateLimit, executionRoutes);
app.use('/api/schedules', userRateLimit, scheduleRoutes);
app.use('/api/dashboard', userRateLimit, dashboardRoutes);
app.use('/api/billing', billingRoutes); // Note: webhook has its own rate limiting
app.use('/api/cache', cacheRoutes);
app.use('/api', userRateLimit, flowDataRoutes);

// Middleware para rotas não encontradas
app.use(notFoundHandler);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Detectar ambiente serverless
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

// Tratamento de erros não capturados (apenas em ambientes tradicionais)
if (!isServerless) {
  process.on('uncaughtException', (err) => {
    logger.error('Unhandled exception', {
      error: err,
      message: err?.message,
      stack: err?.stack,
      name: err?.name
    });
    // Log adicional para debugging
    console.error('🔴 UNCAUGHT EXCEPTION DETAILS:');
    console.error('Error:', err);
    if (err instanceof Error) {
      console.error('Message:', err.message);
      console.error('Stack:', err.stack);
      console.error('Name:', err.name);
    }
    console.error('Type:', typeof err);
    console.error('Constructor:', err?.constructor?.name);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection', {
      reason: reason,
      reasonMessage: reason?.message,
      reasonStack: reason?.stack,
      reasonName: reason?.name,
      promiseString: promise?.toString()
    });
    // Log adicional para debugging
    console.error('🔴 UNHANDLED REJECTION DETAILS:');
    console.error('Reason:', reason);
    console.error('Promise:', promise);
    if (reason instanceof Error) {
      console.error('Stack:', reason.stack);
    }
    // Em produção, pode ser melhor fazer graceful shutdown
    process.exit(1);
  });
} else {
  // Em serverless, apenas logar sem fazer exit
  process.on('uncaughtException', (err) => {
    logger.error('Unhandled exception (serverless)', { error: err });
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection (serverless)', { reason });
  });
}

module.exports = app;
