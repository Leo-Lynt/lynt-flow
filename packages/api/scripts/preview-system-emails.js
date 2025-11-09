const emailService = require('../src/services/emailService');
const fs = require('fs').promises;
const path = require('path');

/**
 * Gera previews HTML de todos os templates de email do sistema
 */
async function generateSystemEmailPreviews() {
  console.log('📧 Gerando previews dos emails do sistema...\n');

  const outputDir = path.join(__dirname, '../src/templates/system-previews');

  // Criar diretório se não existir
  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (error) {
    // Diretório já existe
  }

  const previews = [
    {
      name: '1-verification-email',
      title: 'Verificação de Email',
      description: 'Enviado ao criar uma nova conta',
      html: emailService.getVerificationEmailTemplate(
        'João Silva',
        'https://app.lyntflow.com/verify-email?token=abc123xyz'
      )
    },
    {
      name: '2-reset-password',
      title: 'Recuperação de Senha',
      description: 'Enviado ao solicitar reset de senha',
      html: emailService.getResetPasswordEmailTemplate(
        'João Silva',
        'https://app.lyntflow.com/reset-password?token=abc123xyz'
      )
    },
    {
      name: '3-password-changed',
      title: 'Senha Alterada',
      description: 'Confirmação de mudança de senha',
      html: emailService.getPasswordChangedEmailTemplate('João Silva')
    },
    {
      name: '4-account-deleted',
      title: 'Conta Deletada',
      description: 'Confirmação de exclusão de conta',
      html: emailService.getAccountDeletedEmailTemplate('João Silva')
    },
    {
      name: '5-welcome',
      title: 'Boas-vindas',
      description: 'Email de boas-vindas após verificação',
      html: emailService.getWelcomeEmailTemplate('João Silva')
    },
    {
      name: '6-subscription-confirmation',
      title: 'Confirmação de Assinatura',
      description: 'Ao assinar plano Starter/Pro',
      html: emailService.getSubscriptionConfirmationTemplate('João Silva', 'Pro', 'mensal')
    },
    {
      name: '7-upgrade-confirmation',
      title: 'Upgrade Confirmado',
      description: 'Ao fazer upgrade de plano',
      html: emailService.getUpgradeConfirmationTemplate('João Silva', 'starter', 'pro')
    },
    {
      name: '8-downgrade-scheduled',
      title: 'Downgrade Agendado',
      description: 'Ao fazer downgrade de plano',
      html: emailService.getDowngradeScheduledTemplate(
        'João Silva',
        'pro',
        'starter',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
      )
    },
    {
      name: '9-cancellation-confirmation',
      title: 'Cancelamento Confirmado',
      description: 'Ao cancelar assinatura',
      html: emailService.getCancellationConfirmationTemplate(
        'João Silva',
        'pro',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
      )
    },
    {
      name: '10-payment-success',
      title: 'Pagamento Confirmado',
      description: 'Confirmação de pagamento bem-sucedido',
      html: emailService.getPaymentSuccessTemplate('João Silva', 'R$ 99,90', {
        invoice_pdf: 'https://example.com/invoice.pdf'
      })
    },
    {
      name: '11-payment-failed',
      title: 'Falha no Pagamento',
      description: 'Aviso de falha no pagamento',
      html: emailService.getPaymentFailedTemplate(
        'João Silva',
        'R$ 99,90',
        new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR') // 3 dias
      )
    },
    {
      name: '12-limit-warning',
      title: 'Aviso de Limite Próximo',
      description: 'Quando atingir 80% do limite',
      html: emailService.getLimitWarningTemplate('João Silva', 'executions', 85)
    },
    {
      name: '13-limit-exceeded',
      title: 'Limite Excedido',
      description: 'Quando exceder 100% do limite',
      html: emailService.getLimitExceededTemplate('João Silva', 'executions')
    }
  ];

  console.log('🎨 Gerando previews:\n');

  for (const preview of previews) {
    try {
      console.log(`   📄 ${preview.name}`);
      console.log(`      ${preview.title} - ${preview.description}`);

      const outputPath = path.join(outputDir, `${preview.name}.html`);
      await fs.writeFile(outputPath, preview.html, 'utf-8');

      console.log(`      ✅ Gerado: system-previews/${preview.name}.html\n`);
    } catch (error) {
      console.error(`      ❌ Erro ao gerar ${preview.name}:`, error.message, '\n');
    }
  }

  console.log('✅ Todos os previews foram gerados com sucesso!');
  console.log(`📁 Diretório: ${outputDir}`);
  console.log('\n🌐 Abra os arquivos no navegador para visualizar os emails.\n');

  // Gerar index.html para navegação fácil
  await generateIndexPage(outputDir, previews);
}

/**
 * Gera página index.html para navegação entre previews
 */
async function generateIndexPage(outputDir, previews) {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LyntFlow - System Email Templates Preview</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
    }
    h1 {
      color: white;
      text-align: center;
      margin-bottom: 12px;
      font-size: 36px;
      font-weight: 700;
    }
    .subtitle {
      color: rgba(255,255,255,0.95);
      text-align: center;
      margin-bottom: 40px;
      font-size: 18px;
      font-weight: 500;
    }
    .category {
      margin-bottom: 40px;
    }
    .category-title {
      color: white;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid rgba(255,255,255,0.3);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }
    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    }
    .card-number {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      text-align: center;
      line-height: 32px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .card-title {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    .card-description {
      font-size: 14px;
      color: #6B7280;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .card-link {
      display: inline-block;
      background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
      color: white;
      text-decoration: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    .card-link:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .footer {
      text-align: center;
      color: white;
      margin-top: 60px;
      font-size: 14px;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📧 LyntFlow System Emails</h1>
    <p class="subtitle">Preview de todos os templates de email do sistema</p>

    <div class="category">
      <h2 class="category-title">🔐 Autenticação & Conta</h2>
      <div class="grid">
        ${previews.slice(0, 5).map((preview, idx) => `
          <div class="card">
            <div class="card-number">${idx + 1}</div>
            <div class="card-title">${preview.title}</div>
            <div class="card-description">${preview.description}</div>
            <a href="${preview.name}.html" target="_blank" class="card-link">
              Ver Preview →
            </a>
          </div>
        `).join('\n        ')}
      </div>
    </div>

    <div class="category">
      <h2 class="category-title">💳 Billing & Planos</h2>
      <div class="grid">
        ${previews.slice(5, 11).map((preview, idx) => `
          <div class="card">
            <div class="card-number">${idx + 6}</div>
            <div class="card-title">${preview.title}</div>
            <div class="card-description">${preview.description}</div>
            <a href="${preview.name}.html" target="_blank" class="card-link">
              Ver Preview →
            </a>
          </div>
        `).join('\n        ')}
      </div>
    </div>

    <div class="category">
      <h2 class="category-title">⚠️ Limites & Alertas</h2>
      <div class="grid">
        ${previews.slice(11).map((preview, idx) => `
          <div class="card">
            <div class="card-number">${idx + 12}</div>
            <div class="card-title">${preview.title}</div>
            <div class="card-description">${preview.description}</div>
            <a href="${preview.name}.html" target="_blank" class="card-link">
              Ver Preview →
            </a>
          </div>
        `).join('\n        ')}
      </div>
    </div>

    <div class="footer">
      <p><strong>13 templates</strong> organizados em 3 categorias</p>
      <p style="margin-top: 8px; opacity: 0.8;">Gerado automaticamente em ${new Date().toLocaleString('pt-BR')}</p>
    </div>
  </div>
</body>
</html>`;

  const indexPath = path.join(outputDir, 'index.html');
  await fs.writeFile(indexPath, html, 'utf-8');
  console.log('📑 Página de índice gerada: system-previews/index.html');
}

// Executar
generateSystemEmailPreviews().catch(error => {
  console.error('❌ Erro ao gerar previews:', error);
  process.exit(1);
});
