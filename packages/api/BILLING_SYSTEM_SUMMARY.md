# Sistema de Planos e Billing - Resumo da Implementação

## ✅ Implementação Completa

Este documento resume o sistema de planos e billing implementado no Lynt Flow, incluindo integração com Stripe para pagamentos recorrentes.

---

## 📋 O Que Foi Implementado

### 1. Modelos do Banco de Dados

**PlanSubscription.js** - Gerencia assinaturas dos usuários
- Armazena dados do Stripe (customer ID, subscription ID, payment method)
- Rastreia status da assinatura (active, canceled, past_due, etc.)
- Gerencia período de billing e renovações
- Contador de falhas de pagamento

**UsageTracking.js** - Rastreia uso mensal de recursos
- Sistema de períodos mensais (formato YYYY-MM)
- Contadores: execuções, flows ativos, dados usados
- Auto-reset no início de cada mês
- Detalhamento de execuções para auditoria

**BillingHistory.js** - Histórico de pagamentos
- Registra todas as transações
- Links para faturas do Stripe
- Status de pagamento (paid, pending, failed, refunded)

**User.js (modificado)** - Adicionado campos de plano
- `currentPlanId`: FREE, STARTER ou PRO
- `planLimits`: Limites específicos do plano atual
- Métodos: `updatePlanLimits()`, `canExecuteFlow()`, `canCreateFlow()`, `hasStorageAvailable()`

### 2. Serviços

**billingService.js** - Integração completa com Stripe
- ✅ Criação de checkout sessions
- ✅ Portal do cliente (Stripe Customer Portal)
- ✅ Webhooks com validação de assinatura
- ✅ Upgrade (imediato com proração)
- ✅ Downgrade (agendado para fim do período)
- ✅ Cancelamento e reativação
- ✅ Sincronização de status com Stripe

**usageTrackingService.js** - Gerenciamento de uso
- ✅ Tracking de execuções, flows e dados
- ✅ Cálculo de porcentagens de uso
- ✅ Alertas de limite (80% e 100%)
- ✅ Reset automático mensal

**cronService.js** - Tarefas agendadas
- ✅ Reset mensal de uso (diário às 00:05)
- ✅ Sincronização Stripe (diário às 01:00)
- ✅ Limpeza de dados antigos (diário às 02:00)
- ✅ Envio de alertas de uso (diário às 10:00)

**emailService.js** - 8 templates de email adicionados
- ✅ Confirmação de assinatura
- ✅ Confirmação de upgrade
- ✅ Downgrade agendado
- ✅ Cancelamento confirmado
- ✅ Pagamento bem-sucedido (com link para fatura)
- ✅ Falha de pagamento
- ✅ Alerta de limite (80%)
- ✅ Limite excedido (100%)

### 3. Controllers e Middleware

**billingController.js** - 9 endpoints REST
- `POST /api/billing/checkout` - Criar sessão de checkout
- `POST /api/billing/portal` - Abrir portal do cliente
- `GET /api/billing/subscription` - Obter assinatura atual
- `GET /api/billing/invoices` - Listar histórico de faturas
- `POST /api/billing/upgrade` - Fazer upgrade de plano
- `POST /api/billing/downgrade` - Agendar downgrade
- `POST /api/billing/cancel` - Cancelar assinatura
- `POST /api/billing/reactivate` - Reativar assinatura cancelada
- `POST /api/billing/webhook` - Webhook do Stripe (público)

**checkPlanLimits.js** - Middleware para enforcement de limites
- `checkExecutionLimit` - Valida antes de executar flow
- `checkFlowLimit` - Valida antes de criar flow
- `checkScheduleLimit` - Valida antes de criar schedule
- `checkStorageLimit` - Valida antes de armazenar dados
- `checkPlanActive` - Valida se plano está ativo
- `warnNearLimit` - Adiciona avisos nas respostas

**Rotas Modificadas:**
- `POST /api/flows` - Agora valida limite de flows
- `POST /api/flows/:id/execute` - Agora valida limite de execuções
- `POST /api/schedules` - Agora valida limite de schedules

### 4. Frontend (CMS)

**usePlan.js (composable atualizado)**
- ✅ Integração com API real (removido mock data)
- ✅ Busca plano e uso do `/auth/profile`
- ✅ Métodos para checkout, upgrade, downgrade, cancel
- ✅ Formatação de dados e cálculos de percentagem

**PlanManagement.vue (atualizado)**
- ✅ Exibe plano atual e data de renovação
- ✅ Gráficos de uso com 3 métricas (execuções, flows, dados)
- ✅ Avisos de limite (80% e 100%)
- ✅ Comparação de planos com toggle mensal/anual
- ✅ Botão de gerenciar assinatura (redireciona para Stripe Portal)

**ProfileView.vue** - Já integrado
- Tab "Planos" usa o componente PlanManagement.vue

### 5. Scripts e Documentação

**scripts/migratePlans.js**
- Script de migração para usuários existentes
- Atualiza todos os usuários para plano FREE
- Cria documentos UsageTracking iniciais
- Logging detalhado de progresso

**STRIPE_SETUP_GUIDE.md**
- Guia completo de configuração do Stripe
- Passo a passo para criar conta e produtos
- Instruções para webhooks (dev e produção)
- Cartões de teste
- Troubleshooting

**BILLING_SYSTEM_SUMMARY.md** (este arquivo)
- Resumo da implementação
- Guia de uso e próximos passos

---

## 🏗️ Arquitetura

### Fluxo de Assinatura

```
1. Usuário clica "Assinar STARTER"
   ↓
2. Frontend chama POST /api/billing/checkout
   ↓
3. Backend cria Stripe Checkout Session
   ↓
4. Usuário é redirecionado para Stripe
   ↓
5. Usuário preenche dados e paga
   ↓
6. Stripe envia webhook: checkout.session.completed
   ↓
7. Backend processa webhook e atualiza banco
   ↓
8. Stripe envia webhook: customer.subscription.created
   ↓
9. Backend atualiza User.currentPlanId e planLimits
   ↓
10. Email de confirmação é enviado
   ↓
11. Usuário é redirecionado de volta ao site (success_url)
```

### Fluxo de Execução de Flow

```
1. Usuário clica "Executar Flow"
   ↓
2. Request chega em POST /api/flows/:id/execute
   ↓
3. Middleware checkExecutionLimit verifica:
   - UsageTracking.executions < User.planLimits.executions?
   ↓
4a. Se SIM: prossegue para controller
    ↓
    Flow é executado
    ↓
    usageTrackingService.incrementExecutions()

4b. Se NÃO: retorna 403 com mensagem de upgrade
```

### Fluxo de Reset Mensal

```
1. Cron roda diariamente às 00:05
   ↓
2. Busca UsageTracking onde resetAt <= now
   ↓
3. Para cada documento expirado:
   - Cria novo período (YYYY-MM atual)
   - Zera executions e dataUsed
   - Mantém activeFlows (é estado atual, não uso)
   - Define novo resetAt (próximo mês)
   ↓
4. Log de sucesso/erros
```

---

## 🚀 Como Usar

### Passo 1: Configurar Stripe

Siga o guia completo em [STRIPE_SETUP_GUIDE.md](STRIPE_SETUP_GUIDE.md):

1. Crie conta no Stripe
2. Crie produtos STARTER e PRO com preços mensais e anuais
3. Copie API keys (secret key e publishable key)
4. Configure webhook (use Stripe CLI para desenvolvimento)
5. Copie os 4 Price IDs

### Passo 2: Configurar Variáveis de Ambiente

Edite `packages/api/.env`:

```env
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_STARTER_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...

# Frontend URL (para redirects)
FRONTEND_URL=http://localhost:5174

# Email (para notificações)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Passo 3: Migrar Usuários Existentes

Execute o script de migração:

```bash
cd packages/api
node scripts/migratePlans.js
```

Isso vai:
- Atualizar todos os usuários para plano FREE
- Criar UsageTracking para o mês atual
- Mostrar resumo de sucesso/erros

### Passo 4: Iniciar Serviços

**Terminal 1 - Stripe CLI (webhooks locais):**
```bash
stripe listen --forward-to http://localhost:3001/api/billing/webhook
```

**Terminal 2 - Backend:**
```bash
cd packages/api
npm run dev
```

Você deve ver na saída:
```
🚀 Servidor rodando!
📍 Local:    http://localhost:3001
✅ Scheduler service initialized
🕐 Starting cron jobs initialization...
[Cron] ✅ Scheduled monthly usage reset (daily at 00:05)
[Cron] ✅ Scheduled Stripe sync (daily at 01:00)
[Cron] ✅ Scheduled data cleanup (daily at 02:00)
[Cron] ✅ Scheduled usage warnings (daily at 10:00)
✅ Cron jobs initialized
```

**Terminal 3 - Frontend CMS:**
```bash
cd packages/cms
npm run dev
```

### Passo 5: Testar

1. **Acessar página de planos:**
   - Login no CMS
   - Vá para Perfil > Planos
   - Você deve ver seu plano FREE com uso atual

2. **Testar checkout:**
   - Clique em "Escolher STARTER"
   - Será redirecionado para Stripe Checkout
   - Use cartão de teste: `4242 4242 4242 4242`
   - Complete o pagamento

3. **Verificar webhook:**
   - No terminal do Stripe CLI, você deve ver:
     ```
     2025-01-15 10:30:15  --> checkout.session.completed [evt_...]
     2025-01-15 10:30:16  --> customer.subscription.created [evt_...]
     ```
   - No terminal do backend:
     ```
     [Billing] Webhook recebido: checkout.session.completed
     [Billing] Subscription criada com sucesso
     [Email] Email de confirmação enviado
     ```

4. **Verificar banco de dados:**
   ```javascript
   // MongoDB
   db.users.findOne({ email: 'seu-email@example.com' })
   // currentPlanId deve ser 'starter'

   db.plansubscriptions.findOne({ userId: ObjectId('...') })
   // status deve ser 'active'

   db.usagetrackings.findOne({ userId: ObjectId('...') })
   // período atual com contadores zerados
   ```

5. **Testar limites:**
   - No plano FREE, tente criar 6 flows
   - Deve retornar erro 403: "Limite de flows atingido"

6. **Testar upgrade:**
   - No frontend, faça upgrade de STARTER para PRO
   - Deve ser imediato com crédito proporcional

---

## 📊 Planos e Limites

| Recurso | FREE | STARTER | PRO |
|---------|------|---------|-----|
| **Preço** | Grátis | R$ 35,90/mês | R$ 130/mês |
| **Execuções/mês** | 200 | 2.000 | 10.000 |
| **Flows ativos** | 5 | 25 | 100 |
| **Armazenamento** | 50 MB | 1 GB | 10 GB |
| **Retenção de dados** | 7 dias | 30 dias | 90 dias |
| **Schedules** | 0 | 5 | 20 |
| **Intervalo mínimo schedule** | - | 1 hora | 5 minutos |
| **Suporte** | Comunidade | Email (48h) | Prioritário (4h) |

---

## 🧪 Testes

### Testar com Cartões do Stripe

**Sucesso:**
- `4242 4242 4242 4242` - Pagamento bem-sucedido

**Falha:**
- `4000 0000 0000 0002` - Cartão recusado

**3D Secure:**
- `4000 0027 6000 3184` - Requer autenticação

**Mais cartões:** https://stripe.com/docs/testing#cards

### Testar Webhooks Manualmente

```bash
# Enviar evento de teste
stripe trigger customer.subscription.created

# Enviar evento de pagamento
stripe trigger invoice.paid

# Enviar evento de falha
stripe trigger invoice.payment_failed
```

---

## 📝 Próximos Passos

### Produção

Quando estiver pronto para ir ao ar:

1. **Ativar conta Stripe**
   - Complete verificação (documentos, dados bancários)
   - Aguarde aprovação (24-48h)

2. **Criar produtos em Live Mode**
   - Mude para Live Mode no dashboard
   - Recrie os 2 produtos com preços reais
   - Copie os novos Price IDs

3. **Atualizar variáveis de ambiente**
   - Use chaves `sk_live_...` e `pk_live_...`
   - Use Price IDs de Live Mode
   - Configure webhook permanente (URL pública)

4. **Deploy**
   - Deploy backend com novas env vars
   - Teste webhook em produção
   - Monitore logs

5. **Compliance**
   - Política de privacidade atualizada
   - Termos de uso com seção de pagamentos
   - LGPD: direito ao esquecimento (incluir Stripe)
   - Impostos brasileiros configurados

### Melhorias Futuras

**Recursos Adicionais:**
- [ ] Plano ENTERPRISE customizado
- [ ] Desconto para ONGs/Educação
- [ ] Programa de afiliados
- [ ] Cupons de desconto
- [ ] Trial gratuito de 14 dias

**Analytics:**
- [ ] Dashboard de métricas (MRR, churn, LTV)
- [ ] Análise de cohorts
- [ ] Funil de conversão
- [ ] A/B tests de preços

**UX:**
- [ ] Comparador de planos mais detalhado
- [ ] Preview de economia no plano anual
- [ ] Calculadora de uso estimado
- [ ] FAQs de billing no frontend

**Técnico:**
- [ ] Testes automatizados (unit + integration)
- [ ] Webhook retry com exponential backoff
- [ ] Idempotência de webhooks
- [ ] Monitoramento de falhas (Sentry)
- [ ] Alertas de webhooks falhando (PagerDuty)

---

## 🆘 Suporte e Troubleshooting

### Logs Importantes

**Backend:**
```bash
tail -f packages/api/logs/LyntFlow-api-*.log | grep -i billing
```

**Stripe CLI:**
```bash
stripe logs tail
```

### Problemas Comuns

**1. Webhook não está sendo recebido**
- Verifique se Stripe CLI está rodando
- Confirme que URL está correta
- Veja logs do Stripe CLI para erros

**2. Erro "Invalid API Key"**
- Confirme que STRIPE_SECRET_KEY está no .env
- Reinicie o servidor após alterar .env
- Verifique que não há espaços em branco

**3. Erro "No such price"**
- Confirme que os 4 Price IDs estão no .env
- Verifique que está usando IDs do ambiente correto (Test vs Live)
- Recrie os produtos se necessário

**4. Usuário não recebe emails**
- Teste configuração SMTP
- Verifique logs do servidor para erros
- Confira pasta de spam do usuário
- Use serviço profissional (SendGrid, Mailgun)

**5. Limites não estão sendo aplicados**
- Verifique que middleware está nas rotas
- Confirme que UsageTracking está sendo incrementado
- Veja logs para erros

### Contato

- **Documentação Stripe:** https://stripe.com/docs
- **Suporte Stripe:** support@stripe.com
- **GitHub Issues:** Para bugs no Lynt Flow

---

## 📜 Licença

Este sistema de billing foi implementado como parte do projeto Lynt Flow.

---

**Última atualização:** Novembro 2025
**Versão:** 1.0
**Status:** ✅ Completo e Funcional
