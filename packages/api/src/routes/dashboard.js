const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Rotas de agregação para o dashboard do CMS
 */

router.use(authenticate);

/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     summary: Obter visão consolidada para o dashboard do CMS
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados agregados do dashboard
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/overview', dashboardController.getOverview);

module.exports = router;
