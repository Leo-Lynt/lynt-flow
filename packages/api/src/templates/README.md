# 📧 LyntFlow Email Templates

Templates de email criados com MJML seguindo o design system do LyntFlow.

## 🎨 Design System

**Cores:**
- Purple: `#58328C`
- Pink: `#BF1F6A`
- Green: `#8CBF3F`
- Orange: `#F27830`
- Red: `#D93030`

**Gradientes:**
- Principal: Purple → Pink (135deg)
- Sucesso: Green → Emerald
- Info: Blue → Cyan

## 📋 Templates Disponíveis

### 1. `email-analytics.mjml` - Relatório Analytics
Visual rico com cards de métricas coloridos e tabela de dados.

**Variáveis:**
```javascript
{
  activeUsers: "1,234",
  sessions: "5,678",
  screenPageViews: "12,345",
  avgSessionDuration: "3m 24s",
  metrics: [
    { label: "Taxa de Conversão", value: "4.2%" },
    { label: "Bounce Rate", value: "45%" }
  ],
  dashboardUrl: "https://app.lyntflow.com/dashboard"
}
```

**Preview:**
- 4 cards coloridos com ícones grandes
- Tabela listrada com dados detalhados
- Botão de ação para dashboard

---

### 2. `email-simple.mjml` - Dados Simples
Template limpo para envio de dados processados.

**Variáveis:**
```javascript
{
  subject: "Dados do Google Analytics",
  data: [
    { key: "Total Users", value: "1,234" },
    { key: "Sessions", value: "5,678" },
    { key: "Page Views", value: "12,345" }
  ],
  executedAt: "2025-01-09 14:30",
  flowName: "Analytics Daily Report"
}
```

**Preview:**
- Header com ícone em círculo gradiente
- Cards com borda colorida à esquerda
- Metadata do flow

---

### 3. `email-alert.mjml` - Alertas/Notificações
Template para alertas, erros ou avisos importantes.

**Variáveis:**
```javascript
{
  isError: true,        // ou isWarning: true
  alertTitle: "Erro na Execução do Flow",
  alertMessage: "O flow 'Analytics Report' falhou durante a execução às 14:30.",
  details: [
    { label: "Flow ID", value: "flow_123456" },
    { label: "Erro", value: "API rate limit exceeded" },
    { label: "Tentativas", value: "3/3" }
  ],
  actionUrl: "https://app.lyntflow.com/flows/123456",
  actionText: "Ver Detalhes do Flow"
}
```

**Preview:**
- Header colorido (vermelho=erro, amarelo=aviso, azul=info)
- Ícone grande de alerta
- Box de detalhes com borda colorida
- Botão de ação

---

## 🧪 Como Testar

### Opção 1: MJML Online (MAIS FÁCIL)

1. Acesse: https://mjml.io/try-it-live
2. Cole o conteúdo do arquivo `.mjml`
3. Veja preview em tempo real
4. Teste responsividade (desktop/mobile)

### Opção 2: Mailtrap (TESTE REAL)

1. Crie conta gratuita: https://mailtrap.io/
2. Obtenha credenciais SMTP de teste
3. Configure `.env`:
```bash
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=seu_user_mailtrap
SMTP_PASS=sua_senha_mailtrap
```
4. Execute flow com Output → Email
5. Veja email completo no Mailtrap (com HTML, texto, headers)

### Opção 3: CLI MJML (LOCAL)

```bash
# Instalar
npm install -g mjml

# Compilar para HTML
mjml email-analytics.mjml -o preview.html

# Abrir no navegador
open preview.html  # Mac
start preview.html # Windows
```

---

## 🔧 Uso no LyntFlow

### Variáveis Suportadas (Handlebars)

Os templates usam sintaxe Handlebars para variáveis dinâmicas:

```handlebars
{{variavel}}                 <!-- Texto simples -->
{{#if condicao}}...{{/if}}  <!-- Condicional -->
{{#each array}}...{{/each}}  <!-- Loop -->
```

### Integração no Backend

```javascript
const mjml2html = require('mjml');
const Handlebars = require('handlebars');
const fs = require('fs');

// 1. Ler template
const template = fs.readFileSync('email-analytics.mjml', 'utf8');

// 2. Compilar variáveis
const compiled = Handlebars.compile(template);
const mjmlWithData = compiled({
  activeUsers: "1,234",
  sessions: "5,678"
  // ... outras variáveis
});

// 3. Converter MJML → HTML
const { html } = mjml2html(mjmlWithData);

// 4. Enviar email
await transporter.sendMail({
  to: 'user@example.com',
  subject: 'Relatório Analytics',
  html: html
});
```

---

## 🎯 Próximos Passos

1. **Testar templates** no MJML Online ou Mailtrap
2. **Ajustar cores/espaçamentos** se necessário
3. **Instalar dependências**:
   ```bash
   npm install mjml handlebars
   ```
4. **Criar service de templates** (EmailTemplateService)
5. **Integrar no outputController.email()**

---

## 📝 Customização

### Adicionar novo template

1. Crie arquivo `.mjml` nesta pasta
2. Use componentes MJML: https://mjml.io/documentation/
3. Mantenha design system (cores, fontes, bordas)
4. Teste responsividade

### Trocar cores

Busque e substitua nos arquivos:
- `#58328C` → sua cor purple
- `#BF1F6A` → sua cor pink
- etc.

---

## 📚 Recursos

- **MJML Docs:** https://mjml.io/documentation/
- **Handlebars:** https://handlebarsjs.com/guide/
- **Email Testing:** https://www.caniemail.com/
- **Design Inspiration:** https://reallygoodemails.com/

---

**Feito com 💜 para LyntFlow**
