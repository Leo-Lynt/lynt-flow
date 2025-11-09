const express = require('express');
const router = express.Router();
const connectorController = require('../controllers/connectorController');
const gaDiscoveryController = require('../controllers/gaDiscoveryController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { connectorExecuteSchema } = require('../middleware/validation');

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * @swagger
 * /api/connectors/execute:
 *   post:
 *     summary: Executar busca de dados de múltiplas fontes
 *     tags: [Connectors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourceType
 *               - config
 *             properties:
 *               sourceType:
 *                 type: string
 *                 enum: [api, analytics, database, json]
 *               config:
 *                 type: object
 *               temporalConfig:
 *                 type: object
 *                 properties:
 *                   enabled:
 *                     type: boolean
 *                   rangeType:
 *                     type: string
 *                     enum: [relative, absolute]
 *                   relativeRange:
 *                     type: string
 *                     enum: [today, last_7_days, last_30_days, last_90_days]
 *                   absoluteRange:
 *                     type: object
 *                     properties:
 *                       startDate:
 *                         type: string
 *                         format: date
 *                       endDate:
 *                         type: string
 *                         format: date
 *     responses:
 *       200:
 *         description: Dados obtidos com sucesso
 *       400:
 *         description: Erro de validação
 *       401:
 *         description: Não autorizado
 */
router.post('/execute', validate(connectorExecuteSchema), connectorController.executeConnector);

/**
 * @swagger
 * /api/connectors/ga/accounts:
 *   get:
 *     summary: Lista contas do Google Analytics
 *     tags: [Connectors - Google Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da conexão OAuth do Google Analytics
 *     responses:
 *       200:
 *         description: Lista de contas obtida com sucesso
 *       401:
 *         description: Não autorizado ou token inválido
 *       403:
 *         description: Permissão negada
 */
router.get('/ga/accounts', gaDiscoveryController.listAccounts);

/**
 * @swagger
 * /api/connectors/ga/properties:
 *   get:
 *     summary: Lista propriedades GA4 do Google Analytics
 *     tags: [Connectors - Google Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da conexão OAuth do Google Analytics
 *     responses:
 *       200:
 *         description: Lista de propriedades obtida com sucesso
 *       401:
 *         description: Não autorizado ou token inválido
 */
router.get('/ga/properties', gaDiscoveryController.listProperties);

/**
 * @swagger
 * /api/connectors/ga/metadata:
 *   get:
 *     summary: Obtém métricas e dimensões disponíveis no GA4
 *     tags: [Connectors - Google Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metadata obtido com sucesso
 */
router.get('/ga/metadata', gaDiscoveryController.getMetadata);

/**
 * @swagger
 * /api/connectors/ga/properties/{propertyId}/validate:
 *   get:
 *     summary: Valida acesso a uma propriedade GA4
 *     tags: [Connectors - Google Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: propertyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da propriedade GA4
 *       - in: query
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da conexão OAuth
 *     responses:
 *       200:
 *         description: Propriedade válida
 *       404:
 *         description: Propriedade não encontrada ou sem acesso
 */
router.get('/ga/properties/:propertyId/validate', gaDiscoveryController.validateProperty);

module.exports = router;