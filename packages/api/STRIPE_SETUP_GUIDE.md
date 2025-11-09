# Guia de Configuração do Stripe para Lynt Flow

Este guia fornece instruções passo a passo para configurar o Stripe e integrar o sistema de pagamentos/assinaturas no Lynt Flow.

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Criando uma Conta Stripe](#criando-uma-conta-stripe)
3. [Configurando Produtos e Preços](#configurando-produtos-e-preços)
4. [Obtendo as Chaves da API](#obtendo-as-chaves-da-api)
5. [Configurando Webhooks](#configurando-webhooks)
6. [Configurando as Variáveis de Ambiente](#configurando-as-variáveis-de-ambiente)
7. [Testando em Desenvolvimento](#testando-em-desenvolvimento)
8. [Modo de Produção](#modo-de-produção)
9. [Monitoramento e Logs](#monitoramento-e-logs)
10. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O Lynt Flow usa o Stripe para:
- Processar pagamentos recorrentes (assinaturas mensais e anuais)
- Gerenciar clientes e métodos de pagamento
- Emitir faturas automáticas
- Sincronizar status de assinatura via webhooks
- Fornecer portal de gerenciamento de assinatura para clientes

### Planos Disponíveis

| Plano | Preço Mensal | Preço Anual | Recursos |
|-------|--------------|-------------|----------|
| **FREE** | Grátis | Grátis | 200 exec/mês, 5 flows, 50MB, 0 schedules |
| **STARTER** | R$ 35,90 | R$ 359,00 (economia de 17%) | 2000 exec/mês, 25 flows, 1GB, 5 schedules |
| **PRO** | R$ 130,00 | R$ 1.300,00 (economia de 17%) | 10000 exec/mês, 100 flows, 10GB, 20 schedules |

---

## Criando uma Conta Stripe

### 1. Acesse o Stripe

Visite [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register) e crie sua conta.

**Informações necessárias:**
- Email
- Nome completo
- País (selecione **Brasil**)
- Senha

### 2. Ative sua Conta

Após criar a conta, você precisará:
- Confirmar seu email
- Adicionar informações da empresa/pessoa física
- Fornecer dados bancários (para receber pagamentos)

**Nota:** Você pode começar a testar imediatamente no **modo de teste** sem ativar completamente a conta.

### 3. Ambiente de Teste vs Produção

O Stripe possui dois ambientes separados:

- **Modo de Teste** (🧪 Test mode): Para desenvolvimento e testes
  - Use cartões de teste do Stripe
  - Não processa pagamentos reais
  - Todos os dados são simulados

- **Modo de Produção** (🔴 Live mode): Para pagamentos reais
  - Requer ativação completa da conta
  - Processa pagamentos reais
  - Dados reais de clientes

**Alternar entre modos:** Use o toggle no canto superior direito do dashboard.

---

## Configurando Produtos e Preços

### 1. Acesse o Catálogo de Produtos

1. No dashboard do Stripe, vá para **Products** (Produtos)
2. Certifique-se de estar em **Test mode** (🧪)

### 2. Criar Produto STARTER

**Passo 1:** Clique em **Add product** (Adicionar produto)

**Passo 2:** Preencha as informações:
- **Name:** `Lynt Flow - Plano Starter`
- **Description:** `Plano intermediário para automações profissionais`
- **Image:** (opcional) Faça upload do logo do Lynt Flow

**Passo 3:** Configure o primeiro preço (mensal):
- **Pricing model:** Standard pricing
- **Price:** `35.90` BRL
- **Billing period:** Monthly (Mensal)
- **Payment type:** Recurring (Recorrente)
- **Price description:** `Mensal`

**Passo 4:** Clique em **Save product**

**Passo 5:** Adicione o preço anual:
1. Na página do produto, clique em **Add another price**
2. Configure:
   - **Price:** `359.00` BRL
   - **Billing period:** Yearly (Anual)
   - **Payment type:** Recurring
   - **Price description:** `Anual (17% de desconto)`
3. Clique em **Add price**

**Passo 6:** Copie os Price IDs:
- Clique no preço mensal → Copie o ID que começa com `price_...`
- Anote como: `STRIPE_PRICE_STARTER_MONTHLY`
- Clique no preço anual → Copie o ID
- Anote como: `STRIPE_PRICE_STARTER_YEARLY`

### 3. Criar Produto PRO

Repita o processo acima com os seguintes dados:

**Informações do Produto:**
- **Name:** `Lynt Flow - Plano Pro`
- **Description:** `Plano avançado para automações em escala`

**Preço Mensal:**
- **Price:** `130.00` BRL
- **Billing period:** Monthly
- **Price description:** `Mensal`
- **Copie o Price ID** → `STRIPE_PRICE_PRO_MONTHLY`

**Preço Anual:**
- **Price:** `1300.00` BRL
- **Billing period:** Yearly
- **Price description:** `Anual (17% de desconto)`
- **Copie o Price ID** → `STRIPE_PRICE_PRO_YEARLY`

### 4. Verificação

Você deve ter 2 produtos criados, cada um com 2 preços:
- ✅ Lynt Flow - Plano Starter (2 preços)
- ✅ Lynt Flow - Plano Pro (2 preços)

Total de **4 Price IDs** copiados.

---

## Obtendo as Chaves da API

### 1. Acesse API Keys

No dashboard do Stripe:
1. Vá para **Developers** → **API keys**
2. Certifique-se de estar em **Test mode** (🧪)

### 2. Chaves Disponíveis

Você verá duas chaves:

**Publishable key** (Chave Publicável)
- Começa com `pk_test_...`
- Pode ser exposta no frontend
- Usada para iniciar checkout sessions
- **Copie e anote como:** `STRIPE_PUBLISHABLE_KEY`

**Secret key** (Chave Secreta)
- Começa com `sk_test_...`
- **NUNCA exponha esta chave no frontend ou commit no git**
- Usada para operações no backend
- **Copie e anote como:** `STRIPE_SECRET_KEY`

### 3. Segurança

⚠️ **IMPORTANTE:**
- Nunca compartilhe sua Secret Key
- Nunca faça commit da Secret Key no git
- Use variáveis de ambiente (arquivo `.env`)
- No `.gitignore`, sempre ignore arquivos `.env`

---

## Configurando Webhooks

Webhooks são essenciais para sincronizar o status das assinaturas entre Stripe e seu backend.

### 1. O que são Webhooks?

Webhooks são notificações que o Stripe envia para seu servidor quando eventos importantes acontecem:
- Assinatura criada
- Pagamento realizado
- Pagamento falhou
- Assinatura cancelada
- Período de fatura renovado

### 2. Criar Endpoint de Webhook (Desenvolvimento)

**Para desenvolvimento local, você precisa do Stripe CLI.**

#### Instalar Stripe CLI

**Windows:**
```bash
# Usando Chocolatey
choco install stripe

# Ou baixe direto de:
# https://github.com/stripe/stripe-cli/releases/latest
```

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Baixe do GitHub releases
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

#### Autenticar Stripe CLI

```bash
stripe login
```

Isso abrirá seu navegador para autorizar a CLI.

#### Encaminhar Webhooks Locais

Com seu servidor rodando em `http://localhost:3001`, execute:

```bash
stripe listen --forward-to http://localhost:3001/api/billing/webhook
```

**Output esperado:**
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Copie o webhook signing secret** (começa com `whsec_...`) e adicione ao seu `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Mantenha o comando rodando** enquanto desenvolve. Ele encaminhará todos os eventos do Stripe para seu backend local.

### 3. Criar Endpoint de Webhook (Produção)

Quando for para produção, você precisará criar um webhook permanente:

1. No dashboard do Stripe, vá para **Developers** → **Webhooks**
2. Clique em **Add endpoint**
3. Configure:
   - **Endpoint URL:** `https://seu-dominio.com/api/billing/webhook`
   - **Description:** `Lynt Flow Production Webhook`
   - **Events to send:** Selecione os seguintes eventos:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `checkout.session.completed`
4. Clique em **Add endpoint**
5. Na página do webhook, clique em **Reveal** no campo **Signing secret**
6. Copie o secret (começa com `whsec_...`)
7. Adicione ao `.env` de produção

### 4. Eventos do Webhook

O sistema está configurado para escutar os seguintes eventos:

| Evento | Ação no Sistema |
|--------|-----------------|
| `checkout.session.completed` | Cria assinatura inicial no banco de dados |
| `customer.subscription.created` | Atualiza plano do usuário e envia email de confirmação |
| `customer.subscription.updated` | Atualiza status da assinatura (upgrades, downgrades) |
| `customer.subscription.deleted` | Retorna usuário para plano FREE |
| `invoice.paid` | Registra pagamento no histórico e envia recibo |
| `invoice.payment_failed` | Incrementa contador de falhas e envia notificação |

### 5. Testar Webhooks

Com o Stripe CLI rodando, você pode enviar eventos de teste:

```bash
# Testar assinatura criada
stripe trigger customer.subscription.created

# Testar pagamento bem-sucedido
stripe trigger invoice.paid

# Testar falha de pagamento
stripe trigger invoice.payment_failed
```

Verifique os logs do seu servidor para confirmar que os webhooks estão sendo recebidos e processados.

---

## Configurando as Variáveis de Ambiente

### 1. Copiar Arquivo de Exemplo

```bash
cd packages/api
cp .env.example .env
```

### 2. Preencher Variáveis do Stripe

Edite o arquivo `.env` e preencha as variáveis do Stripe com os valores que você copiou:

```env
# Stripe Configuration (Billing & Subscriptions)
# Get your keys from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Stripe Price IDs (create products and prices in Stripe Dashboard)
# STARTER Plan
STRIPE_PRICE_STARTER_MONTHLY=price_xxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_STARTER_YEARLY=price_xxxxxxxxxxxxxxxxxxxxxx

# PRO Plan
STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_PRO_YEARLY=price_xxxxxxxxxxxxxxxxxxxxxx
```

### 3. Outras Variáveis Importantes

Certifique-se de que as seguintes variáveis também estão configuradas:

```env
# Frontend URL (para redirects após checkout)
FRONTEND_URL=http://localhost:5174

# Email (para enviar notificações de pagamento)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. Verificação

Confirme que todas as variáveis estão preenchidas:
- ✅ `STRIPE_SECRET_KEY` (começa com `sk_test_`)
- ✅ `STRIPE_PUBLISHABLE_KEY` (começa com `pk_test_`)
- ✅ `STRIPE_WEBHOOK_SECRET` (começa com `whsec_`)
- ✅ 4 Price IDs (começam com `price_`)
- ✅ `FRONTEND_URL`

---

## Testando em Desenvolvimento

### 1. Iniciar Serviços

**Terminal 1 - Stripe CLI (webhooks):**
```bash
stripe listen --forward-to http://localhost:3001/api/billing/webhook
```

**Terminal 2 - Backend:**
```bash
cd packages/api
npm run dev
```

**Terminal 3 - Frontend CMS:**
```bash
cd packages/cms
npm run dev
```

### 2. Testar Fluxo de Checkout

1. Acesse o frontend: `http://localhost:5174`
2. Faça login com um usuário
3. Vá para a página de planos/billing
4. Clique em **Assinar Plano STARTER**
5. Você será redirecionado para o Checkout do Stripe

### 3. Usar Cartões de Teste

O Stripe fornece cartões de teste para simular diferentes cenários:

**Pagamento bem-sucedido:**
- **Número:** `4242 4242 4242 4242`
- **Data:** Qualquer data futura (ex: `12/34`)
- **CVC:** Qualquer 3 dígitos (ex: `123`)
- **ZIP:** Qualquer código postal (ex: `12345`)

**Pagamento com falha:**
- **Número:** `4000 0000 0000 0002`

**Requer autenticação 3D Secure:**
- **Número:** `4000 0027 6000 3184`

**Mais cartões de teste:** [https://stripe.com/docs/testing#cards](https://stripe.com/docs/testing#cards)

### 4. Verificar Webhook

Após completar o checkout:
1. Verifique o terminal do Stripe CLI - você deve ver eventos sendo recebidos
2. Verifique os logs do backend - deve processar `checkout.session.completed` e `customer.subscription.created`
3. Verifique o banco de dados:
   ```javascript
   // No MongoDB, verifique que foram criados:
   // - Documento em PlanSubscription
   // - Documento em UsageTracking
   // - User.currentPlanId atualizado
   ```

### 5. Testar Portal do Cliente

1. No frontend, acesse a página de gerenciamento de assinatura
2. Clique em **Gerenciar Assinatura**
3. Você será redirecionado para o Stripe Customer Portal
4. Teste funcionalidades:
   - Atualizar método de pagamento
   - Ver faturas
   - Cancelar assinatura

### 6. Testar Upgrades e Downgrades

**Upgrade (imediato):**
1. Assine o plano STARTER
2. Faça upgrade para PRO
3. Verifique:
   - ✅ Plano atualizado imediatamente
   - ✅ Crédito proporcional aplicado
   - ✅ Email de confirmação enviado

**Downgrade (fim do período):**
1. Assine o plano PRO
2. Faça downgrade para STARTER
3. Verifique:
   - ✅ `cancelAtPeriodEnd` = true
   - ✅ Ainda tem acesso ao PRO até o fim do período
   - ✅ Email confirmando que mudança ocorrerá na data X

### 7. Testar Limites de Plano

**Execuções:**
1. No plano FREE, execute 200 flows
2. Tente executar o 201º flow
3. Deve retornar erro 403: "Limite de execuções atingido"

**Flows:**
1. No plano FREE, crie 5 flows
2. Tente criar o 6º flow
3. Deve retornar erro 403: "Limite de flows atingido"

**Schedules:**
1. No plano FREE, tente criar um schedule
2. Deve retornar erro 403: "Schedules não disponíveis no plano FREE"

---

## Modo de Produção

Quando estiver pronto para receber pagamentos reais:

### 1. Ativar Conta Stripe

1. Complete o processo de ativação no dashboard
2. Forneça documentos necessários (CPF/CNPJ, dados bancários)
3. Aguarde aprovação (geralmente 24-48h)

### 2. Alternar para Live Mode

No dashboard do Stripe:
1. Clique no toggle para mudar de **Test mode** para **Live mode** (🔴)
2. Repita TODOS os passos de configuração:
   - Criar produtos e preços (com valores reais)
   - Copiar novas API keys (`sk_live_...` e `pk_live_...`)
   - Criar webhook permanente (URL pública)

### 3. Atualizar Variáveis de Ambiente (Produção)

```env
# Live API Keys
STRIPE_SECRET_KEY=sk_live_[YOUR_LIVE_SECRET_KEY]
STRIPE_PUBLISHABLE_KEY=pk_live_[YOUR_LIVE_PUBLISHABLE_KEY]
STRIPE_WEBHOOK_SECRET=whsec_[YOUR_WEBHOOK_SECRET]

# Live Price IDs
STRIPE_PRICE_STARTER_MONTHLY=price_[YOUR_STARTER_MONTHLY_ID]
STRIPE_PRICE_STARTER_YEARLY=price_[YOUR_STARTER_YEARLY_ID]
STRIPE_PRICE_PRO_MONTHLY=price_[YOUR_PRO_MONTHLY_ID]
STRIPE_PRICE_PRO_YEARLY=price_[YOUR_PRO_YEARLY_ID]

# Production Frontend URL
FRONTEND_URL=https://seu-dominio.com
```

### 4. Deploy

1. Faça deploy do backend com as novas variáveis de ambiente
2. Certifique-se de que a URL do webhook está acessível publicamente
3. Teste o webhook usando o botão "Send test webhook" no dashboard

### 5. Configurar Emails de Notificação

Configure os emails do Stripe para clientes:
1. Vá para **Settings** → **Emails**
2. Personalize:
   - Receipts (Recibos)
   - Invoices (Faturas)
   - Failed payments (Pagamentos falhados)
3. Adicione seu logo e cores da marca

### 6. Configurar Faturamento

1. **Settings** → **Billing** → **Invoices**
2. Configure:
   - Dados da empresa (nome, endereço)
   - Informações fiscais (CNPJ)
   - Nota fiscal eletrônica (se aplicável)

### 7. Compliance e Impostos

**Brasil:**
- Configure impostos brasileiros (ISS, PIS, COFINS)
- Integre com sistema de nota fiscal eletrônica
- Consulte um contador para obrigações fiscais

**LGPD:**
- Certifique-se de ter política de privacidade
- Informe usuários sobre uso do Stripe
- Implemente direito ao esquecimento (deletar dados do Stripe também)

---

## Monitoramento e Logs

### 1. Dashboard do Stripe

Monitore métricas importantes:
- **Home**: MRR (Monthly Recurring Revenue), churn rate, new customers
- **Payments**: Todas as transações
- **Subscriptions**: Assinaturas ativas, canceladas, etc.
- **Customers**: Lista de clientes

### 2. Logs do Backend

O sistema registra logs detalhados de todas as operações do Stripe:

```javascript
// Exemplos de logs
[Stripe] Criando sessão de checkout para usuário 123 - plano: starter, intervalo: monthly
[Stripe] Webhook recebido: customer.subscription.created
[Stripe] Assinatura criada com sucesso para usuário 123
[Stripe] Email de confirmação enviado para user@example.com
```

### 3. Alertas Importantes

Configure alertas para:
- **Pagamentos falhados** → Notificar equipe de suporte
- **Cancelamentos** → Analisar motivos (pesquisa de saída)
- **Webhooks falhando** → Crítico! Sincronização pode falhar

### 4. Reconciliação Mensal

1. Exporte relatório de pagamentos do Stripe
2. Compare com registros no banco de dados (`BillingHistory`)
3. Verifique se todos os pagamentos estão registrados
4. Investigue discrepâncias

---

## Troubleshooting

### Problema: Webhook não está sendo recebido

**Sintomas:**
- Checkout completa, mas assinatura não é criada no banco
- Status da assinatura não sincroniza

**Soluções:**
1. **Desenvolvimento:**
   - Verifique se `stripe listen` está rodando
   - Confirme que a URL está correta: `http://localhost:3001/api/billing/webhook`
   - Verifique logs do Stripe CLI

2. **Produção:**
   - Teste o webhook manualmente: Dashboard → Webhooks → Send test webhook
   - Verifique se a URL é acessível publicamente (use [webhook.site](https://webhook.site) para testar)
   - Confirme que `STRIPE_WEBHOOK_SECRET` está correto
   - Verifique logs do servidor (pode estar bloqueado por firewall)

### Problema: Erro "Invalid API Key"

**Causa:** Chave da API incorreta ou não configurada

**Solução:**
1. Verifique o arquivo `.env`:
   ```bash
   cat .env | grep STRIPE_SECRET_KEY
   ```
2. Confirme que começa com `sk_test_` (dev) ou `sk_live_` (prod)
3. Reinicie o servidor após alterar `.env`
4. Verifique se não há espaços em branco ao redor da chave

### Problema: Erro "No such price"

**Causa:** Price ID inválido ou não existe no ambiente atual

**Solução:**
1. Verifique se está usando Price IDs do ambiente correto (Test vs Live)
2. No dashboard, vá para Products e copie os IDs novamente
3. Confirme que os 4 Price IDs estão no `.env`
4. Reinicie o servidor

### Problema: Webhook signature verification failed

**Causa:** Webhook secret incorreto ou body da requisição foi modificado

**Solução:**
1. Confirme que `rawBodyMiddleware` está aplicado à rota do webhook
2. Verifique que não há middlewares que processam JSON antes do webhook
3. No `app.js`, certifique-se de que a rota do webhook vem ANTES de `express.json()`:
   ```javascript
   // ✅ CORRETO
   app.use('/api/billing/webhook', rawBodyMiddleware, webhookHandler);
   app.use(express.json());

   // ❌ ERRADO
   app.use(express.json());
   app.use('/api/billing/webhook', webhookHandler);
   ```

### Problema: Cliente não consegue completar pagamento

**Sintomas:**
- Erro no checkout
- Pagamento recusado

**Soluções:**
1. **Cartão recusado:**
   - Em test mode, use cartões de teste válidos
   - Em live mode, cliente deve verificar com banco

2. **Método de pagamento não suportado:**
   - Verifique configuração de métodos aceitos
   - Dashboard → Settings → Payment methods
   - Habilite cartões de crédito brasileiros

3. **Problema com 3D Secure:**
   - Certifique-se de que o checkout suporta autenticação 3D Secure
   - Em test mode, use cartão `4000 0027 6000 3184` para testar

### Problema: Usuário não recebe emails

**Causas possíveis:**
- Configuração SMTP incorreta
- Email marcado como spam
- Erro ao enviar email

**Soluções:**
1. Verifique logs do servidor para erros de email
2. Teste conexão SMTP:
   ```javascript
   // No node, teste:
   const nodemailer = require('nodemailer');
   const transporter = nodemailer.createTransport({
     host: process.env.SMTP_HOST,
     port: process.env.SMTP_PORT,
     auth: {
       user: process.env.SMTP_USER,
       pass: process.env.SMTP_PASS
     }
   });
   transporter.verify((error, success) => {
     if (error) console.log('Erro:', error);
     else console.log('SMTP funcionando!');
   });
   ```
3. Use serviço profissional de email (SendGrid, Mailgun, AWS SES)
4. Configure SPF, DKIM e DMARC para evitar spam

### Problema: Limites não estão sendo aplicados

**Sintomas:**
- Usuário FREE pode executar mais de 200 flows/mês
- Usuário FREE pode criar schedules

**Soluções:**
1. Verifique se middleware está aplicado às rotas:
   ```javascript
   // Em routes/flows.js
   router.post('/', checkFlowLimit, flowController.createFlow);
   router.post('/:id/execute', checkExecutionLimit, flowController.executeFlow);
   ```
2. Verifique se `UsageTracking` está sendo incrementado:
   ```javascript
   // No flowController.executeFlow(), deve ter:
   await usageTrackingService.incrementExecutions(userId, flowId, executionId);
   ```
3. Verifique o plano atual do usuário no banco:
   ```javascript
   db.users.findOne({ email: 'user@example.com' })
   // currentPlanId deve ser 'free', 'starter', ou 'pro'
   ```

### Problema: Downgrade não acontece no fim do período

**Causa:** Webhook não está processando `customer.subscription.deleted`

**Solução:**
1. Verifique logs do webhook quando a assinatura expirar
2. No dashboard do Stripe, confirme que o evento `customer.subscription.deleted` foi enviado
3. Teste manualmente:
   ```bash
   stripe trigger customer.subscription.deleted
   ```
4. Verifique handler em `billingService.js`:
   ```javascript
   exports.handleSubscriptionDeleted = async (stripeSubscription) => {
     // Deve retornar usuário para plano FREE
   }
   ```

---

## Recursos Adicionais

### Documentação do Stripe

- **Documentação oficial:** [https://stripe.com/docs](https://stripe.com/docs)
- **API Reference:** [https://stripe.com/docs/api](https://stripe.com/docs/api)
- **Webhooks Guide:** [https://stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)
- **Testing Guide:** [https://stripe.com/docs/testing](https://stripe.com/docs/testing)
- **Subscriptions Guide:** [https://stripe.com/docs/billing/subscriptions/overview](https://stripe.com/docs/billing/subscriptions/overview)

### Stripe CLI

- **Documentação:** [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
- **GitHub:** [https://github.com/stripe/stripe-cli](https://github.com/stripe/stripe-cli)

### Comunidade

- **Stack Overflow:** [stripe tag](https://stackoverflow.com/questions/tagged/stripe-payments)
- **Stripe Discord:** [https://discord.gg/stripe](https://discord.gg/stripe)

### Suporte

- **Stripe Support:** [https://support.stripe.com](https://support.stripe.com)
- Email: support@stripe.com
- Chat ao vivo disponível no dashboard

---

## Checklist Final

Antes de ir para produção, confirme:

- [ ] Conta Stripe ativada para live mode
- [ ] Produtos e preços criados em live mode
- [ ] API keys de produção configuradas (`sk_live_...` e `pk_live_...`)
- [ ] Webhook configurado para URL pública
- [ ] Webhook secret de produção no `.env`
- [ ] Testado fluxo completo: checkout → pagamento → webhook → sincronização
- [ ] Emails de notificação funcionando
- [ ] Limites de plano testados e validados
- [ ] Upgrade/downgrade testados
- [ ] Portal do cliente funcionando
- [ ] Monitoramento configurado (logs, alertas)
- [ ] Compliance: política de privacidade, termos de uso, LGPD
- [ ] Configuração fiscal (impostos, nota fiscal)
- [ ] Backup do banco de dados configurado
- [ ] Documentação interna atualizada

---

## Manutenção Contínua

### Mensal
- Revisar métricas de MRR e churn
- Reconciliar pagamentos com banco de dados
- Analisar motivos de cancelamento
- Verificar webhooks falhados

### Trimestral
- Revisar e ajustar preços se necessário
- Avaliar introdução de novos planos
- Analisar padrões de uso para otimizar limites

### Anual
- Revisar compliance (LGPD, PCI-DSS)
- Atualizar dependências (stripe SDK)
- Renovar certificados SSL/TLS
- Auditoria de segurança

---

## Contato

Se você tiver dúvidas ou problemas durante a configuração do Stripe, consulte:

1. Esta documentação
2. Documentação oficial do Stripe
3. Suporte do Stripe (disponível 24/7)
4. Equipe de desenvolvimento do Lynt Flow

---

**Última atualização:** Novembro 2025
**Versão:** 1.0
**Autor:** Equipe Lynt Flow
