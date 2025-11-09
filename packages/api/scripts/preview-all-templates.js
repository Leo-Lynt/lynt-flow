const emailTemplateService = require('../src/services/emailTemplateService');
const fs = require('fs').promises;
const path = require('path');

/**
 * Gera previews HTML para diferentes cenários de dados
 */
async function generateAllPreviews() {
  console.log('📧 Gerando previews de templates de email...\n');

  const scenarios = [
    {
      name: 'scenario-1-simple-object',
      description: 'Objeto simples com Categoria/Valor',
      data: {
        Data: {
          Categoria: 'sessão',
          valor: 53220
        }
      },
      metadata: {
        flowName: 'Google Analytics Report',
        executedAt: new Date()
      }
    },
    {
      name: 'scenario-2-analytics',
      description: 'Dados do Google Analytics',
      data: {
        Analytics: {
          activeUsers: 1234,
          sessions: 5678,
          pageViews: 12345,
          avgSessionDuration: 204
        },
        Conversions: {
          transactions: 42,
          revenue: 15890.50,
          conversionRate: 4.2
        }
      },
      metadata: {
        flowName: 'Analytics Daily Report',
        executedAt: new Date()
      }
    },
    {
      name: 'scenario-3-nested-objects',
      description: 'Objetos aninhados complexos',
      data: {
        UserData: {
          name: 'João Silva',
          email: 'joao@example.com',
          role: 'Admin'
        },
        Preferences: {
          theme: 'dark',
          language: 'pt-BR',
          notifications: true
        },
        Activity: {
          lastLogin: '2025-01-09 14:30',
          totalSessions: 156,
          activeFlows: 8
        }
      },
      metadata: {
        flowName: 'User Activity Report',
        executedAt: new Date()
      }
    },
    {
      name: 'scenario-4-arrays',
      description: 'Dados com arrays',
      data: {
        TopPages: [
          { page: '/home', views: 1234, bounceRate: 45.2 },
          { page: '/produtos', views: 890, bounceRate: 38.5 },
          { page: '/contato', views: 456, bounceRate: 52.1 }
        ]
      },
      metadata: {
        flowName: 'Top Pages Report',
        executedAt: new Date()
      }
    },
    {
      name: 'scenario-5-mixed',
      description: 'Dados mistos (primitivos, objetos, arrays)',
      data: {
        Summary: {
          totalUsers: 5432,
          activeFlows: 12,
          successRate: 98.5
        },
        status: 'active',
        lastUpdate: '2025-01-09 15:45',
        Config: {
          apiVersion: 'v2',
          region: 'sa-east-1',
          environment: 'production'
        }
      },
      metadata: {
        flowName: 'System Status Report',
        executedAt: new Date()
      }
    },
    {
      name: 'scenario-6-single-values',
      description: 'Valores simples sem aninhamento',
      data: {
        temperature: 25.5,
        humidity: 65,
        pressure: 1013,
        status: 'normal'
      },
      metadata: {
        flowName: 'IoT Sensor Reading',
        executedAt: new Date()
      }
    }
  ];

  const outputDir = path.join(__dirname, '../src/templates/previews');

  // Criar diretório se não existir
  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (error) {
    // Diretório já existe
  }

  console.log('🎨 Gerando previews para diferentes cenários:\n');

  for (const scenario of scenarios) {
    try {
      console.log(`   📄 ${scenario.name}`);
      console.log(`      ${scenario.description}`);

      const html = await emailTemplateService.generateDataTableEmail(
        scenario.data,
        scenario.metadata
      );

      const outputPath = path.join(outputDir, `${scenario.name}.html`);
      await fs.writeFile(outputPath, html, 'utf-8');

      console.log(`      ✅ Gerado: previews/${scenario.name}.html\n`);
    } catch (error) {
      console.error(`      ❌ Erro ao gerar ${scenario.name}:`, error.message, '\n');
    }
  }

  console.log('✅ Todos os previews foram gerados com sucesso!');
  console.log(`📁 Diretório: ${outputDir}`);
  console.log('\n🌐 Abra os arquivos no navegador para visualizar os emails.\n');

  // Gerar index.html para navegação fácil
  await generateIndexPage(outputDir, scenarios);
}

/**
 * Gera página index.html para navegação entre previews
 */
async function generateIndexPage(outputDir, scenarios) {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LyntFlow - Email Templates Preview</title>
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
      max-width: 900px;
      margin: 0 auto;
    }
    h1 {
      color: white;
      text-align: center;
      margin-bottom: 16px;
      font-size: 32px;
      font-weight: 600;
    }
    .subtitle {
      color: rgba(255,255,255,0.9);
      text-align: center;
      margin-bottom: 40px;
      font-size: 16px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
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
    .card-title {
      font-size: 14px;
      font-weight: 600;
      color: #3B82F6;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
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
      margin-top: 40px;
      font-size: 14px;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📧 LyntFlow Email Templates</h1>
    <p class="subtitle">Preview de templates em diferentes cenários de dados</p>

    <div class="grid">
      ${scenarios.map(scenario => `
        <div class="card">
          <div class="card-title">${scenario.name.replace(/-/g, ' ')}</div>
          <div class="card-description">${scenario.description}</div>
          <a href="${scenario.name}.html" target="_blank" class="card-link">
            Ver Preview →
          </a>
        </div>
      `).join('\n      ')}
    </div>

    <div class="footer">
      <p>Gerado automaticamente em ${new Date().toLocaleString('pt-BR')}</p>
    </div>
  </div>
</body>
</html>`;

  const indexPath = path.join(outputDir, 'index.html');
  await fs.writeFile(indexPath, html, 'utf-8');
  console.log('📑 Página de índice gerada: previews/index.html');
}

// Executar
generateAllPreviews().catch(error => {
  console.error('❌ Erro ao gerar previews:', error);
  process.exit(1);
});
