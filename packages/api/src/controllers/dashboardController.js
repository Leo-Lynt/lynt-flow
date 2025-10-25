const dashboardService = require('../services/dashboardService');
const logger = require('../utils/logger');

class DashboardController {
  async getOverview(req, res) {
    try {
      const result = await dashboardService.getOverview(req.user.userId);
      if (!result.success) {
        const status = result.error?.code === 'USER_NOT_FOUND' ? 404 : 400;
        return res.status(status).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Erro ao obter visão geral do dashboard:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Erro interno do servidor',
          code: 'INTERNAL_ERROR'
        }
      });
    }
  }
}

module.exports = new DashboardController();
