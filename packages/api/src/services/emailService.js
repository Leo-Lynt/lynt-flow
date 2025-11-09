const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Inicializa o transporter do nodemailer
   */
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true para porta 465
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      logger.info('Email service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  /**
   * Envia um email
   * @param {Object} options - Opções do email
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendEmail({ to, subject, html, text }) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: `${process.env.APP_NAME || 'Flow-Forge'} <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}`);

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Remove tags HTML de uma string
   * @param {string} html - String HTML
   * @returns {string} Texto sem HTML
   */
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  /**
   * Envia email de verificação de conta
   * @param {Object} user - Dados do usuário
   * @param {string} token - Token de verificação
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendVerificationEmail(user, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    // Log verification URL in development
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Verification email generated', {
        email: user.email,
        verificationUrl
      });
    }

    const subject = 'Verifique seu email - Flow-Forge';
    const html = this.getVerificationEmailTemplate(user.name, verificationUrl);

    return await this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  /**
   * Envia email de reset de senha
   * @param {Object} user - Dados do usuário
   * @param {string} token - Token de reset
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendResetPasswordEmail(user, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const subject = 'Recuperação de senha - Flow-Forge';
    const html = this.getResetPasswordEmailTemplate(user.name, resetUrl);

    return await this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  /**
   * Envia email de confirmação de mudança de senha
   * @param {Object} user - Dados do usuário
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendPasswordChangedEmail(user) {
    const subject = 'Senha alterada - Flow-Forge';
    const html = this.getPasswordChangedEmailTemplate(user.name);

    return await this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  /**
   * Envia email de confirmação de deleção de conta
   * @param {Object} user - Dados do usuário
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendAccountDeletedEmail(user) {
    const subject = 'Conta deletada - Flow-Forge';
    const html = this.getAccountDeletedEmailTemplate(user.name);

    return await this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  /**
   * Envia email de boas-vindas
   * @param {Object} user - Dados do usuário
   * @returns {Promise<Object>} Resultado do envio
   */
  async sendWelcomeEmail(user) {
    const subject = 'Bem-vindo ao Flow-Forge!';
    const html = this.getWelcomeEmailTemplate(user.name);

    return await this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  /**
   * Template de email de verificação
   */
  getVerificationEmailTemplate(name, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificação de Email</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #F3F4F6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
          <div style="background: #3B82F6; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Lynt Flow</h1>
          </div>

          <div style="padding: 32px 24px;">
            <h2 style="color: #1F2937; margin-top: 0; font-size: 20px;">Olá, ${name}!</h2>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Obrigado por se registrar no Lynt Flow. Para começar a usar sua conta, precisamos verificar seu endereço de email.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
                Verificar Email
              </a>
            </div>

            <p style="color: #6B7280; font-size: 14px;">Se você não criou uma conta no Lynt Flow, pode ignorar este email.</p>

            <p style="color: #6B7280; font-size: 14px;">Este link expira em 24 horas.</p>

            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Lynt Flow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template de email de reset de senha
   */
  getResetPasswordEmailTemplate(name, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperação de Senha</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #F3F4F6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
          <div style="background: #3B82F6; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Lynt Flow</h1>
          </div>

          <div style="padding: 32px 24px;">
            <h2 style="color: #1F2937; margin-top: 0; font-size: 20px;">Olá, ${name}!</h2>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Recebemos uma solicitação para redefinir a senha da sua conta Lynt Flow.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
                Redefinir Senha
              </a>
            </div>

            <p style="color: #6B7280; font-size: 14px;">Se você não solicitou a redefinição de senha, pode ignorar este email. Sua senha permanecerá inalterada.</p>

            <p style="color: #6B7280; font-size: 14px;">Este link expira em 1 hora.</p>

            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Lynt Flow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template de email de senha alterada
   */
  getPasswordChangedEmailTemplate(name) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Senha Alterada</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #F3F4F6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
          <div style="background: #3B82F6; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Lynt Flow</h1>
          </div>

          <div style="padding: 32px 24px;">
            <h2 style="color: #1F2937; margin-top: 0; font-size: 20px;">Olá, ${name}!</h2>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Sua senha foi alterada com sucesso.</p>

            <p style="color: #6B7280; font-size: 14px;">Se você não realizou esta alteração, entre em contato conosco imediatamente.</p>

            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Lynt Flow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template de email de conta deletada
   */
  getAccountDeletedEmailTemplate(name) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Conta Deletada</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #F3F4F6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
          <div style="background: #3B82F6; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Lynt Flow</h1>
          </div>

          <div style="padding: 32px 24px;">
            <h2 style="color: #1F2937; margin-top: 0; font-size: 20px;">Até logo, ${name}!</h2>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Sua conta Lynt Flow foi deletada conforme solicitado.</p>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Sentiremos sua falta! Se você mudar de ideia, pode criar uma nova conta a qualquer momento.</p>

            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Lynt Flow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template de email de boas-vindas
   */
  getWelcomeEmailTemplate(name) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #F3F4F6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
          <div style="background: #3B82F6; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Lynt Flow</h1>
          </div>

          <div style="padding: 32px 24px;">
            <h2 style="color: #1F2937; margin-top: 0; font-size: 20px;">Bem-vindo, ${name}!</h2>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Estamos muito felizes em ter você conosco no Lynt Flow!</p>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Com o Lynt Flow, você pode criar fluxos de automação e transformação de dados de forma visual e intuitiva.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}" style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
                Começar Agora
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Lynt Flow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envia email de confirmação de assinatura
   */
  async sendSubscriptionConfirmation(user, planId, billingInterval) {
    const planNames = { starter: 'Starter', pro: 'Pro' };
    const planName = planNames[planId] || planId.toUpperCase();
    const interval = billingInterval === 'monthly' ? 'mensal' : 'anual';

    const subject = `Bem-vindo ao Lynt Flow ${planName}!`;
    const html = this.getSubscriptionConfirmationTemplate(user.name, planName, interval);

    return await this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  getSubscriptionConfirmationTemplate(name, planName, interval) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Assinatura Confirmada</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #F3F4F6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
          <div style="background: #3B82F6; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Lynt Flow</h1>
          </div>

          <div style="padding: 32px 24px;">
            <h2 style="color: #1F2937; margin-top: 0; font-size: 20px;">Parabéns, ${name}!</h2>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Sua assinatura do plano <strong>${planName}</strong> (${interval}) foi confirmada com sucesso!</p>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Agora você tem acesso a todos os benefícios do plano ${planName}.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
                Acessar Dashboard
              </a>
            </div>

            <p style="color: #6B7280; font-size: 14px;">Você pode gerenciar sua assinatura a qualquer momento no seu perfil.</p>

            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Lynt Flow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envia email de upgrade confirmado
   */
  async sendUpgradeConfirmation(user, oldPlan, newPlan) {
    const subject = 'Upgrade realizado com sucesso!';
    const html = this.getUpgradeConfirmationTemplate(user.name, oldPlan, newPlan);

    return await this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  getUpgradeConfirmationTemplate(name, oldPlan, newPlan) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Upgrade Confirmado</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #F3F4F6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
          <div style="background: #3B82F6; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⬆️ Lynt Flow</h1>
          </div>

          <div style="padding: 32px 24px;">
            <h2 style="color: #1F2937; margin-top: 0; font-size: 20px;">Parabéns, ${name}!</h2>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Seu upgrade de <strong>${oldPlan.toUpperCase()}</strong> para <strong>${newPlan.toUpperCase()}</strong> foi realizado com sucesso!</p>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Seus novos limites estão ativos imediatamente. Aproveite ao máximo!</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/profile?tab=plan" style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
                Ver Meu Plano
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Lynt Flow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envia email de downgrade agendado
   */
  async sendDowngradeScheduled(user, currentPlan, newPlan, effectiveDate) {
    const subject = 'Downgrade agendado';
    const html = this.getDowngradeScheduledTemplate(user.name, currentPlan, newPlan, effectiveDate);

    return await this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  getDowngradeScheduledTemplate(name, currentPlan, newPlan, effectiveDate) {
    const formattedDate = new Date(effectiveDate).toLocaleDateString('pt-BR');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Downgrade Agendado</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #F3F4F6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
          <div style="background: #3B82F6; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Lynt Flow</h1>
          </div>

          <div style="padding: 32px 24px;">
            <h2 style="color: #1F2937; margin-top: 0; font-size: 20px;">Olá, ${name}!</h2>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Seu downgrade de <strong>${currentPlan.toUpperCase()}</strong> para <strong>${newPlan.toUpperCase()}</strong> foi agendado.</p>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Você continuará com acesso aos recursos do plano ${currentPlan.toUpperCase()} até <strong>${formattedDate}</strong>.</p>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Após essa data, seu plano será alterado automaticamente.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/profile?tab=plan" style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
                Gerenciar Plano
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Lynt Flow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envia email de cancelamento confirmado
   */
  async sendCancellationConfirmation(user, plan, effectiveDate) {
    const subject = 'Cancelamento confirmado';
    const html = this.getCancellationConfirmationTemplate(user.name, plan, effectiveDate);

    return await this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  getCancellationConfirmationTemplate(name, plan, effectiveDate) {
    const formattedDate = new Date(effectiveDate).toLocaleDateString('pt-BR');
    const isImmediate = new Date(effectiveDate) <= new Date();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cancelamento Confirmado</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #F3F4F6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
          <div style="background: #3B82F6; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Lynt Flow</h1>
          </div>

          <div style="padding: 32px 24px;">
            <h2 style="color: #1F2937; margin-top: 0; font-size: 20px;">Olá, ${name}!</h2>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Sua assinatura do plano <strong>${plan.toUpperCase()}</strong> foi cancelada.</p>

            ${isImmediate
              ? '<p style="color: #4B5563; font-size: 15px; line-height: 1.6;">O cancelamento é imediato. Você foi movido para o plano FREE.</p>'
              : `<p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Você continuará com acesso até <strong>${formattedDate}</strong>. Após essa data, será movido para o plano FREE.</p>`
            }

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Sentiremos sua falta! Se mudar de ideia, você pode reativar sua assinatura a qualquer momento.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/profile?tab=plan" style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
                Ver Planos
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Lynt Flow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envia email de pagamento bem-sucedido
   */
  async sendPaymentSuccess(user, amount, invoice) {
    const subject = 'Pagamento confirmado';
    const amountFormatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100);

    const html = this.getPaymentSuccessTemplate(user.name, amountFormatted, invoice);

    return await this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  getPaymentSuccessTemplate(name, amount, invoice) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pagamento Confirmado</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #F3F4F6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
          <div style="background: #10B981; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">✅ Lynt Flow</h1>
          </div>

          <div style="padding: 32px 24px;">
            <h2 style="color: #1F2937; margin-top: 0; font-size: 20px;">Olá, ${name}!</h2>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Recebemos seu pagamento de <strong>${amount}</strong> com sucesso!</p>

            <div style="background: #ECFDF5; padding: 16px; border-left: 4px solid #10B981; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #065F46; font-size: 14px; line-height: 1.6;">
                <strong>Status:</strong> Pago<br>
                <strong>Valor:</strong> ${amount}
              </p>
            </div>

            ${invoice.invoice_pdf
              ? `<div style="text-align: center; margin: 30px 0;">
                   <a href="${invoice.invoice_pdf}" style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
                     Baixar Recibo (PDF)
                   </a>
                 </div>`
              : ''
            }

            <p style="color: #6B7280; font-size: 14px;">Obrigado por confiar no Lynt Flow!</p>

            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Lynt Flow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envia email de falha no pagamento
   */
  async sendPaymentFailed(user, amount, retryDate) {
    const subject = '⚠️ Falha no pagamento';
    const amountFormatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100);
    const retryFormatted = new Date(retryDate).toLocaleDateString('pt-BR');

    const html = this.getPaymentFailedTemplate(user.name, amountFormatted, retryFormatted);

    return await this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  getPaymentFailedTemplate(name, amount, retryDate) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Falha no Pagamento</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #F3F4F6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
          <div style="background: #EF4444; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Lynt Flow</h1>
          </div>

          <div style="padding: 32px 24px;">
            <h2 style="color: #1F2937; margin-top: 0; font-size: 20px;">Olá, ${name}!</h2>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Não conseguimos processar o pagamento de <strong>${amount}</strong> da sua assinatura.</p>

            <div style="background: #FEF2F2; padding: 16px; border-left: 4px solid #EF4444; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #991B1B; font-size: 14px; line-height: 1.6;">
                <strong>Valor:</strong> ${amount}<br>
                <strong>Próxima tentativa:</strong> ${retryDate}
              </p>
            </div>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Por favor, atualize seu método de pagamento para evitar interrupção do serviço.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/billing/portal" style="background: #EF4444; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
                Atualizar Método de Pagamento
              </a>
            </div>

            <p style="color: #6B7280; font-size: 14px;">Se você não atualizar, tentaremos novamente automaticamente. Após 3 falhas, sua assinatura será cancelada.</p>

            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Lynt Flow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envia email de aviso de limite próximo
   */
  async sendLimitWarning(user, resourceType, percentage) {
    const subject = `⚠️ Você está próximo do limite de ${resourceType}`;
    const html = this.getLimitWarningTemplate(user.name, resourceType, percentage);

    return await this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  getLimitWarningTemplate(name, resourceType, percentage) {
    const resourceNames = {
      executions: 'execuções',
      flows: 'flows ativos',
      data: 'armazenamento'
    };

    const resourceName = resourceNames[resourceType] || resourceType;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Aviso de Limite</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #F3F4F6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
          <div style="background: #F59E0B; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Lynt Flow</h1>
          </div>

          <div style="padding: 32px 24px;">
            <h2 style="color: #1F2937; margin-top: 0; font-size: 20px;">Atenção, ${name}!</h2>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Você está usando <strong>${percentage}%</strong> do seu limite de ${resourceName}.</p>

            <div style="background: #FFFBEB; padding: 16px; border-left: 4px solid #F59E0B; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400E; font-size: 14px; line-height: 1.6;">
                Considere fazer upgrade do seu plano para evitar interrupção do serviço.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/profile?tab=plan" style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
                Ver Planos
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Lynt Flow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envia email de limite excedido
   */
  async sendLimitExceeded(user, resourceType) {
    const subject = `🚫 Limite de ${resourceType} atingido`;
    const html = this.getLimitExceededTemplate(user.name, resourceType);

    return await this.sendEmail({
      to: user.email,
      subject,
      html
    });
  }

  getLimitExceededTemplate(name, resourceType) {
    const resourceNames = {
      executions: 'execuções',
      flows: 'flows ativos',
      data: 'armazenamento'
    };

    const resourceName = resourceNames[resourceType] || resourceType;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Limite Atingido</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background: #F3F4F6; margin: 0; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">
          <div style="background: #EF4444; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚫 Lynt Flow</h1>
          </div>

          <div style="padding: 32px 24px;">
            <h2 style="color: #1F2937; margin-top: 0; font-size: 20px;">Olá, ${name}!</h2>

            <p style="color: #4B5563; font-size: 15px; line-height: 1.6;">Você atingiu o limite de <strong>${resourceName}</strong> do seu plano.</p>

            <div style="background: #FEF2F2; padding: 16px; border-left: 4px solid #EF4444; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #991B1B; font-size: 14px; line-height: 1.6;">
                ${resourceType === 'executions'
                  ? 'Novas execuções estão bloqueadas até o próximo mês ou até você fazer upgrade do plano.'
                  : resourceType === 'flows'
                  ? 'Você não poderá criar novos flows até deletar alguns ou fazer upgrade do plano.'
                  : 'Você não poderá salvar novas execuções até fazer upgrade do plano.'
                }
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/billing/checkout" style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 15px;">
                Fazer Upgrade Agora
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">

            <p style="color: #9CA3AF; font-size: 12px; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} Lynt Flow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();
