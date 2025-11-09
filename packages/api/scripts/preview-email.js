/**
 * Script para gerar preview HTML do template de email
 *
 * Uso: node scripts/preview-email.js
 */

const emailTemplateService = require('../src/services/emailTemplateService');
const fs = require('fs').promises;
const path = require('path');

async function generatePreview() {
  console.log('📧 Gerando preview do template de email...\n');

  // Dados de exemplo
  const sampleData = {
    Data: {
      Categoria: 'sessão',
      valor: 53220
    },
    Analytics: {
      activeUsers: 1234,
      sessions: 5678,
      pageViews: 12345
    },
    Config: {
      theme: 'dark',
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo'
    }
  };

  const metadata = {
    flowName: 'Analytics Report',
    executedAt: new Date()
  };

  try {
    // Gerar HTML do email
    const html = await emailTemplateService.generateDataTableEmail(sampleData, metadata);

    // Salvar em arquivo
    const outputPath = path.join(__dirname, '../src/templates/preview-email-output.html');
    await fs.writeFile(outputPath, html, 'utf-8');

    console.log('✅ Preview gerado com sucesso!');
    console.log(`📄 Arquivo: ${outputPath}`);
    console.log('\n🌐 Abra o arquivo no navegador para visualizar o email.\n');

    // Informações sobre os dados
    console.log('📊 Dados de exemplo usados:');
    console.log(JSON.stringify(sampleData, null, 2));

  } catch (error) {
    console.error('❌ Erro ao gerar preview:', error);
    process.exit(1);
  }
}

generatePreview();
