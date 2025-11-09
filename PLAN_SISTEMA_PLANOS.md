# PLANEJAMENTO: SISTEMA DE PLANOS E ASSINATURAS PARA LYNT FLOW

## VISÃO GERAL

Este documento detalha o planejamento completo para implementação do sistema de planos e assinaturas no Lynt Flow, incluindo integração com Stripe, controle de limites e gerenciamento de uso.

---

## FASE 1: MODELAGEM DE DADOS

### 1.1 Novo Model: PlanSubscription

**Propósito:** Rastrear assinaturas de planos dos usuários

**Campos necessários:**
- `userId` (referência ao User, único)
- `planId` (enum: 'free', 'starter', 'pro')
- `status` (enum: 'active', 'canceled', 'expired', 'past_due', 'trialing')
- `billingInterval` (enum: 'monthly', 'yearly')
- `currentPeriodStart` (timestamp do início do período atual)
- `currentPeriodEnd` (timestamp do fim do período atual)
- `cancelAtPeriodEnd` (boolean, para cancelamentos)
- `stripeCustomerId` (ID do cliente no Stripe)
- `stripeSubscriptionId` (ID da subscription no Stripe)
- `stripePaymentMethodId` (método de pagamento)
- `lastPaymentDate` (data do último pagamento)
- `nextPaymentDate` (data do próximo pagamento)
- `paymentFailureCount` (contador de falhas de pagamento)
- `trialEndsAt` (se houver período trial)

**Indexes:**
- userId (único)
- stripeCustomerId
- stripeSubscriptionId
- status + currentPeriodEnd (para buscar assinaturas expiradas)

---

### 1.2 Novo Model: UsageTracking

**Propósito:** Rastrear uso mensal de recursos por usuário

**Campos necessários:**
- `userId` (referência ao User)
- `period` (string no formato YYYY-MM, ex: "2025-11")
- `executions` (contador de execuções no mês)
- `activeFlows` (contador de flows ativos)
- `dataUsed` (bytes usados no período)
- `resetAt` (timestamp do próximo reset mensal)
- `executionDetails` (array com {date, flowId, executionId} para auditoria)

**Indexes:**
- (userId, period) único composto
- userId + resetAt

**Lógica de reset:**
- Cron job diário verifica se `resetAt` passou
- Reseta `executions` e cria novo documento para próximo período
- Mantém histórico de períodos anteriores para relatórios

---

### 1.3 Modificações no Model User

**Adicionar campos:**
- `currentPlanId` (enum: 'free', 'starter', 'pro', default: 'free')
- `planLimits` (objeto com limites atuais):
  ```javascript
  {
    executions: Number,
    flows: Number,
    dataPerMonth: Number,
    dataRetentionDays: Number
  }
  ```
- Remover: `executionStorageQuota` (substituído por `planLimits.dataPerMonth`)

**Métodos adicionais:**
- `updatePlanLimits(planId)` - Atualiza limites baseado no plano
- `canExecuteFlow()` - Verifica se ainda tem execuções disponíveis
- `canCreateFlow()` - Verifica se pode criar mais flows
- `hasStorageAvailable(bytes)` - Verifica espaço disponível

---

### 1.4 Novo Model: BillingHistory

**Propósito:** Histórico de cobranças e pagamentos

**Campos necessários:**
- `userId` (referência ao User)
- `subscriptionId` (referência ao PlanSubscription)
- `stripeInvoiceId` (ID da invoice no Stripe)
- `amount` (valor cobrado em centavos)
- `currency` (default: 'BRL')
- `status` (enum: 'paid', 'pending', 'failed', 'refunded')
- `paidAt` (timestamp do pagamento)
- `invoicePdf` (URL do PDF da invoice no Stripe)
- `description` (descrição da cobrança)
- `failureReason` (motivo da falha, se aplicável)

**Indexes:**
- userId + paidAt
- stripeInvoiceId
- status

---

## FASE 2: INTEGRAÇÃO COM STRIPE

### 2.1 Configuração do Stripe

**Variáveis de ambiente necessárias:**
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_STARTER_YEARLY=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
```

**Produtos e Prices no Stripe:**
- Criar 2 produtos: "Lynt Flow Starter" e "Lynt Flow Pro"
- Criar 4 prices: 2 mensais (R$ 35,90 e R$ 130) e 2 anuais (R$ 290 e R$ 999)
- Configurar billing anchor para renovação no mesmo dia do mês

---

### 2.2 Novo Service: billingService.js

**Métodos necessários:**

1. **createStripeCustomer(userId, email, name)**
   - Cria customer no Stripe
   - Salva `stripeCustomerId` no PlanSubscription
   - Associa metadata: userId

2. **createCheckoutSession(userId, planId, billingInterval, successUrl, cancelUrl)**
   - Cria Stripe Checkout Session para novo plano
   - Mode: 'subscription'
   - Configura trial period se aplicável (ex: 7 dias grátis para primeiro plano pago)
   - Retorna sessionId para redirect

3. **createBillingPortalSession(userId, returnUrl)**
   - Cria sessão do Customer Portal do Stripe
   - Permite usuário gerenciar assinatura, método de pagamento, ver invoices
   - Retorna URL do portal

4. **handleSubscriptionCreated(stripeSubscription)**
   - Webhook handler para `customer.subscription.created`
   - Cria PlanSubscription no banco
   - Atualiza User.currentPlanId
   - Atualiza User.planLimits

5. **handleSubscriptionUpdated(stripeSubscription)**
   - Webhook handler para `customer.subscription.updated`
   - Atualiza status da assinatura
   - Detecta mudanças de plano (upgrade/downgrade)
   - Atualiza limites proporcionalmente

6. **handleSubscriptionDeleted(stripeSubscription)**
   - Webhook handler para `customer.subscription.deleted`
   - Marca assinatura como cancelada
   - Downgrade para plano FREE ao fim do período
   - Notifica usuário por email

7. **handleInvoicePaid(stripeInvoice)**
   - Webhook handler para `invoice.paid`
   - Cria registro em BillingHistory
   - Reseta `paymentFailureCount`
   - Atualiza `lastPaymentDate` e `nextPaymentDate`

8. **handleInvoicePaymentFailed(stripeInvoice)**
   - Webhook handler para `invoice.payment_failed`
   - Incrementa `paymentFailureCount`
   - Marca status como 'past_due'
   - Envia email de alerta (3 tentativas antes de cancelar)
   - Após 3 falhas: cancela assinatura e downgrade para FREE

9. **handlePaymentMethodAttached(paymentMethod)**
   - Webhook handler para `payment_method.attached`
   - Atualiza `stripePaymentMethodId`

10. **upgradePlan(userId, newPlanId, newBillingInterval)**
    - Atualiza subscription no Stripe (proration automática)
    - Atualiza PlanSubscription no banco
    - Atualiza limites imediatamente
    - Cria BillingHistory para proration

11. **downgradePlan(userId, newPlanId, newBillingInterval)**
    - Agenda downgrade para fim do período (`cancel_at_period_end`)
    - Não altera limites até fim do período
    - Notifica usuário da mudança agendada

12. **cancelSubscription(userId, immediate)**
    - Se immediate=true: cancela imediatamente e downgrade para FREE
    - Se immediate=false: agenda cancelamento para fim do período
    - Marca `cancelAtPeriodEnd = true`
    - Notifica usuário

13. **reactivateSubscription(userId)**
    - Remove flag `cancelAtPeriodEnd`
    - Atualiza subscription no Stripe

---

### 2.3 Novo Controller: billingController.js

**Endpoints necessários:**

1. **POST /api/billing/checkout**
   - Authenticated
   - Body: `{ planId, billingInterval }`
   - Retorna: `{ sessionId, checkoutUrl }`
   - Valida se plano é válido
   - Cria checkout session

2. **POST /api/billing/portal**
   - Authenticated
   - Retorna: `{ portalUrl }`
   - Cria portal session para gerenciar assinatura

3. **POST /api/billing/webhook**
   - Public (validado por Stripe signature)
   - Recebe eventos do Stripe
   - Valida signature com `STRIPE_WEBHOOK_SECRET`
   - Roteia para handlers apropriados no billingService
   - Eventos a escutar:
     - customer.subscription.created
     - customer.subscription.updated
     - customer.subscription.deleted
     - invoice.paid
     - invoice.payment_failed
     - payment_method.attached

4. **GET /api/billing/subscription**
   - Authenticated
   - Retorna assinatura atual do usuário
   - Inclui: plano, status, próximo pagamento, método de pagamento

5. **GET /api/billing/invoices**
   - Authenticated
   - Retorna histórico de faturas (BillingHistory)
   - Paginado, ordenado por data

6. **POST /api/billing/upgrade**
   - Authenticated
   - Body: `{ planId, billingInterval }`
   - Processa upgrade (proration imediata)

7. **POST /api/billing/downgrade**
   - Authenticated
   - Body: `{ planId, billingInterval }`
   - Agenda downgrade para fim do período

8. **POST /api/billing/cancel**
   - Authenticated
   - Body: `{ immediate }` (opcional, default: false)
   - Cancela assinatura

9. **POST /api/billing/reactivate**
   - Authenticated
   - Reativa assinatura cancelada (se ainda em período ativo)

---

## FASE 3: MIDDLEWARE DE VERIFICAÇÃO DE LIMITES

### 3.1 Novo Middleware: checkPlanLimits.js

**Propósito:** Verificar se usuário pode realizar ação baseado em limites do plano

**Funções exportadas:**

1. **checkExecutionLimit()**
   - Middleware para execução de flows
   - Carrega UsageTracking do período atual
   - Compara `usage.executions` com `user.planLimits.executions`
   - Se excedido: retorna 403 com mensagem "Limite de execuções atingido. Faça upgrade do plano."
   - Se disponível: incrementa contador e prossegue

2. **checkFlowLimit()**
   - Middleware para criação de flows
   - Conta flows ativos do usuário (Flow.countDocuments({ userId, deletedAt: null }))
   - Compara com `user.planLimits.flows`
   - Se excedido: retorna 403 com mensagem "Limite de flows atingido. Faça upgrade do plano."
   - Se disponível: prossegue

3. **checkStorageLimit(bytes)**
   - Middleware para salvar execuções
   - Verifica `user.executionStorageUsed + bytes <= user.planLimits.dataPerMonth`
   - Se excedido: retorna 403 com mensagem "Limite de armazenamento atingido. Faça upgrade do plano."
   - Se disponível: prossegue

4. **checkScheduleLimit()**
   - Middleware para criação de schedules
   - FREE: não pode criar schedules (0 schedules)
   - STARTER: max 5 schedules
   - PRO: max 20 schedules
   - Conta schedules ativos do usuário
   - Se excedido: retorna 403 com mensagem apropriada

---

### 3.2 Novo Service: usageTrackingService.js

**Métodos necessários:**

1. **getCurrentUsage(userId)**
   - Busca ou cria UsageTracking do período atual (YYYY-MM)
   - Retorna objeto com contadores atuais

2. **incrementExecutions(userId, flowId, executionId)**
   - Incrementa contador de execuções
   - Adiciona entrada em `executionDetails`
   - Retorna novo total

3. **updateActiveFlows(userId)**
   - Conta flows ativos do usuário
   - Atualiza `activeFlows` no UsageTracking

4. **addDataUsage(userId, bytes)**
   - Incrementa `dataUsed`
   - Atualiza `user.executionStorageUsed`

5. **resetMonthlyUsage(userId)**
   - Cria novo documento para próximo período
   - Reseta apenas `executions` (execuções são mensais)
   - Mantém `dataUsed` acumulado (até atingir limite)

6. **checkAndResetIfNeeded()**
   - Cron job diário (roda 00:01 todo dia)
   - Busca UsageTracking com `resetAt <= now()`
   - Chama `resetMonthlyUsage()` para cada

---

## FASE 4: APLICAÇÃO DE LIMITAÇÕES NOS ENDPOINTS

### 4.1 Modificações em flowController.js

**createFlow():**
```javascript
Adicionar middleware: checkFlowLimit()
Fluxo:
1. Middleware verifica limite de flows
2. Se OK, cria flow
3. Incrementa activeFlows no UsageTracking
```

**deleteFlow():**
```javascript
Após soft delete:
1. Decrementa activeFlows no UsageTracking
```

---

### 4.2 Modificações em executionController.js

**saveExecution():**
```javascript
Adicionar middlewares:
1. checkExecutionLimit() - verifica limite de execuções
2. checkStorageLimit(executionSize) - verifica espaço

Fluxo:
1. Calcula tamanho da execução (outputData + logs)
2. Middleware verifica limites
3. Se OK, salva execução
4. Incrementa executions no UsageTracking
5. Incrementa user.executionStorageUsed
```

---

### 4.3 Modificações em scheduleController.js

**createSchedule():**
```javascript
Adicionar middleware: checkScheduleLimit()

Limites por plano:
- FREE: 0 schedules
- STARTER: 5 schedules
- PRO: 20 schedules

Fluxo:
1. Middleware verifica limite
2. Se OK, cria schedule
```

---

### 4.4 Novas validações em schedulerService.js

**executeScheduledFlow():**
```javascript
Antes de executar:
1. Verificar se user ainda está no mesmo plano
2. Verificar se não excedeu execuções mensais
3. Se excedeu: pausar schedule e notificar usuário
4. Se OK: executar normalmente
```

---

## FASE 5: ROTAS E INTEGRAÇÃO FRONTEND

### 5.1 Novas rotas em src/routes/billing.js

```javascript
Router configuration:
- POST /api/billing/checkout (authenticate)
- POST /api/billing/portal (authenticate)
- POST /api/billing/webhook (public, Stripe signature validation)
- GET /api/billing/subscription (authenticate)
- GET /api/billing/invoices (authenticate)
- POST /api/billing/upgrade (authenticate)
- POST /api/billing/downgrade (authenticate)
- POST /api/billing/cancel (authenticate)
- POST /api/billing/reactivate (authenticate)
```

---

### 5.2 Modificações em authController.js

**getProfile():**
```javascript
Adicionar na resposta:
- currentPlan (dados do plano atual)
- usage (uso do período atual via usageTrackingService)
- planLimits (limites do plano)
- usagePercentages (cálculo de % para cada recurso)
```

---

### 5.3 Modificações em dashboardController.js

**getDashboard():**
```javascript
Adicionar na resposta:
- subscription (status da assinatura)
- usage (uso atual vs limites)
- nextPaymentDate
- isNearLimit (boolean se >= 80% em qualquer recurso)
- isOverLimit (boolean se >= 100% em qualquer recurso)
```

---

## FASE 6: LÓGICA DE UPGRADE/DOWNGRADE

### 6.1 Regras de Upgrade (STARTER → PRO ou FREE → STARTER/PRO)

**Efeito imediato:**
1. Atualizar subscription no Stripe (com proration)
2. Atualizar User.currentPlanId
3. Atualizar User.planLimits
4. Limites aplicados imediatamente
5. Stripe calcula proration:
   - Credita dias não usados do plano anterior
   - Cobra dias restantes do novo plano
   - Próxima cobrança mantém mesma data de billing anchor

**Exemplo:**
```
Usuário no STARTER mensal (R$ 35,90)
Faz upgrade para PRO mensal (R$ 130) no dia 15
Billing anchor: dia 1 de cada mês

Stripe calcula:
- Crédito: (16 dias restantes / 30 dias) * R$ 35,90 = ~R$ 19,15
- Cobrança: (16 dias restantes / 30 dias) * R$ 130 = ~R$ 69,33
- Cobrança imediata: R$ 69,33 - R$ 19,15 = R$ 50,18
- Próxima cobrança completa: dia 1 do próximo mês (R$ 130)
```

---

### 6.2 Regras de Downgrade (PRO → STARTER ou STARTER/PRO → FREE)

**Efeito ao fim do período:**
1. Marcar `cancelAtPeriodEnd = true` na subscription atual
2. Criar nova subscription para novo plano que inicia em `currentPeriodEnd`
3. User continua com limites atuais até `currentPeriodEnd`
4. Em `currentPeriodEnd`:
   - Webhook `customer.subscription.deleted` cancela subscription antiga
   - Webhook `customer.subscription.created` ativa nova subscription
   - Atualiza User.currentPlanId
   - Atualiza User.planLimits

**Proteção contra perda de dados:**
- Se usuário tem mais flows que limite do novo plano:
  - Avisar antes de confirmar downgrade
  - Opção: "Você tem X flows, o plano Y permite apenas Z. Deseja continuar?"
  - Após downgrade: não deleta flows existentes, mas impede criar novos
- Se usuário tem mais execuções usadas que limite:
  - Avisar: "Você já usou X execuções este mês, o plano Y permite Z/mês"
  - Próximo mês: limite se aplica normalmente

---

### 6.3 Regras de Mudança de Billing Interval

**Mensal → Anual (efeito imediato com proration):**
```
Exemplo: STARTER mensal (R$ 35,90) → STARTER anual (R$ 290)
Dia 15, billing anchor dia 1

Stripe calcula:
- Crédito: (16 dias / 30 dias) * R$ 35,90 = ~R$ 19,15
- Cobrança anual: R$ 290
- Cobrança imediata: R$ 290 - R$ 19,15 = R$ 270,85
- Próxima cobrança: daqui a 1 ano
- Economia: (R$ 35,90 * 12) - R$ 290 = R$ 140,80/ano
```

**Anual → Mensal (efeito ao fim do período):**
```
Não permitir ou cobrar proration reversa
Usuário mantém plano anual até expirar
Em expiração: renova como mensal
```

---

## FASE 7: TRATAMENTO DE EDGE CASES

### 7.1 Downgrade com dados excedentes

**Cenário:** Usuário PRO com 80 flows faz downgrade para STARTER (25 flows)

**Solução:**
1. Avisar usuário antes de confirmar: "Você tem 80 flows ativos. O plano STARTER permite apenas 25. Você não poderá criar novos flows até reduzir para 25 ou menos."
2. Após downgrade:
   - Permite manter 80 flows existentes (read-only)
   - Bloqueia criação de novos flows
   - Dashboard mostra: "Você excedeu o limite de flows (80/25). Delete alguns flows ou faça upgrade."

---

### 7.2 Execuções excedidas

**Cenário:** Usuário atinge 100% do limite de execuções

**Solução:**
1. Bloquear execuções manuais (retornar 403)
2. Pausar schedules automaticamente
3. Dashboard mostra alerta: "Limite de execuções atingido (2000/2000). Faça upgrade ou aguarde próximo mês."
4. Opção: "Upgrade agora" button linkando para checkout

---

### 7.3 Armazenamento excedido

**Cenário:** Usuário atinge limite de storage

**Solução:**
1. Bloquear salvamento de novas execuções
2. Permitir visualização de execuções antigas
3. Executar limpeza automática das execuções mais antigas primeiro
4. Dashboard mostra: "Armazenamento cheio (1GB/1GB). Execuções antigas serão deletadas automaticamente."
5. Implementar em executionController.js:
```javascript
Antes de salvar execução:
1. Calcular tamanho
2. Verificar espaço disponível
3. Se insuficiente:
   - Deletar execuções antigas até liberar espaço
   - Salvar nova execução
```

---

### 7.4 Falha de pagamento

**Cenário:** Cartão de crédito falha na renovação

**Fluxo:**
1. Stripe tenta cobrar automaticamente
2. Se falha: webhook `invoice.payment_failed`
3. Incrementa `paymentFailureCount`
4. Envia email: "Falha no pagamento. Atualize seu método de pagamento."
5. Status da subscription: 'past_due'
6. Stripe tenta novamente após 3, 5, 7 dias (configurável)
7. Após 3 falhas (ou configurável):
   - Cancela subscription
   - Downgrade para FREE
   - Email: "Sua assinatura foi cancelada por falta de pagamento."

---

### 7.5 Cancelamento e reativação

**Cancelamento agendado:**
```javascript
Usuário cancela mas mantém até fim do período:
1. Marcar cancelAtPeriodEnd = true
2. Dashboard mostra: "Sua assinatura será cancelada em DD/MM/YYYY"
3. Botão: "Reativar assinatura"
4. Se reativar antes de expirar:
   - Remove flag cancelAtPeriodEnd
   - Mantém subscription ativa
```

**Cancelamento imediato:**
```javascript
Usuário quer cancelar agora:
1. Cancela subscription no Stripe
2. Downgrade imediato para FREE
3. Ajusta limites imediatamente
4. Se exceder limites: aplicar lógica de edge case
```

---

## FASE 8: NOTIFICAÇÕES E EMAIL

### 8.1 Modificações em emailService.js

**Novos templates de email:**

1. **sendSubscriptionConfirmation(user, plan, billingInterval)**
   - Assunto: "Bem-vindo ao Lynt Flow [PLAN]!"
   - Conteúdo: confirmação de assinatura, próximo pagamento, limites do plano

2. **sendUpgradeConfirmation(user, oldPlan, newPlan)**
   - Assunto: "Upgrade realizado com sucesso!"
   - Conteúdo: novo plano, novos limites, proration cobrada

3. **sendDowngradeScheduled(user, currentPlan, newPlan, effectiveDate)**
   - Assunto: "Downgrade agendado"
   - Conteúdo: novo plano será ativado em [data], limites futuros

4. **sendCancellationConfirmation(user, plan, effectiveDate)**
   - Assunto: "Cancelamento confirmado"
   - Conteúdo: assinatura cancelada, acesso até [data], convite para reativar

5. **sendPaymentSuccess(user, amount, invoice)**
   - Assunto: "Pagamento confirmado"
   - Conteúdo: recibo, próximo pagamento, link para invoice PDF

6. **sendPaymentFailed(user, amount, retryDate)**
   - Assunto: "Falha no pagamento"
   - Conteúdo: alerta, link para atualizar método de pagamento, próxima tentativa

7. **sendLimitWarning(user, resourceType, percentage)**
   - Assunto: "Você está próximo do limite"
   - Conteúdo: uso atual (ex: 80% das execuções), sugestão de upgrade

8. **sendLimitExceeded(user, resourceType)**
   - Assunto: "Limite atingido"
   - Conteúdo: recurso bloqueado, opções (upgrade ou aguardar reset)

---

### 8.2 Automação de notificações

**Triggers:**
- 80% de qualquer recurso: enviar `sendLimitWarning()`
- 100% de qualquer recurso: enviar `sendLimitExceeded()`
- Pagamento bem-sucedido: enviar `sendPaymentSuccess()`
- Pagamento falhou: enviar `sendPaymentFailed()`
- Subscription criada: enviar `sendSubscriptionConfirmation()`
- Subscription cancelada: enviar `sendCancellationConfirmation()`

---

## FASE 9: SCRIPTS E MANUTENÇÃO

### 9.1 Script de migração: scripts/migratePlans.js

**Propósito:** Migrar usuários existentes para sistema de planos

**Passos:**
1. Para cada User existente:
   - Criar PlanSubscription com planId='free', status='active'
   - Atualizar User.currentPlanId = 'free'
   - Atualizar User.planLimits com limites do FREE
   - Criar UsageTracking do período atual
2. Contar flows ativos e atualizar `activeFlows`
3. Log de progresso

---

### 9.2 Cron job: jobs/resetMonthlyUsage.js

**Execução:** Diário às 00:01 (configurar no schedulerService)

**Tarefa:**
1. Buscar UsageTracking com `resetAt <= now()`
2. Para cada registro:
   - Criar novo UsageTracking para próximo período
   - Resetar `executions = 0`
   - Manter `dataUsed` (acumulativo até limite)
3. Enviar relatório mensal por email (opcional)

---

### 9.3 Cron job: jobs/syncStripeSubscriptions.js

**Execução:** Diário às 03:00

**Tarefa:**
1. Buscar todas PlanSubscription com status 'active'
2. Para cada uma:
   - Buscar subscription no Stripe
   - Comparar status
   - Se divergir: sincronizar (Stripe é fonte da verdade)
   - Atualizar campos: status, currentPeriodEnd, nextPaymentDate
3. Detectar assinaturas expiradas e fazer downgrade

---

## FASE 10: TESTES E VALIDAÇÕES

### 10.1 Testes de integração necessários

**Billing:**
- Criar checkout session
- Processar webhook de subscription criada
- Processar webhook de pagamento bem-sucedido
- Processar webhook de pagamento falhado
- Upgrade de plano com proration
- Downgrade de plano agendado
- Cancelamento de assinatura
- Reativação de assinatura

**Limites:**
- Bloquear criação de flow quando limite atingido
- Bloquear execução quando limite atingido
- Bloquear salvamento quando storage cheio
- Permitir após reset mensal
- Permitir após upgrade

**Edge cases:**
- Downgrade com flows excedentes
- Pagamento falhado múltiplas vezes
- Cancelamento e reativação
- Mudança de billing interval

---

## FASE 11: SEGURANÇA E COMPLIANCE

### 11.1 Validações de segurança

**Webhook do Stripe:**
- SEMPRE validar signature com `stripe.webhooks.constructEvent()`
- Rejeitar requisições sem signature válida
- Log de tentativas de webhook inválidas

**Endpoints de billing:**
- Verificar ownership (usuário só pode gerenciar própria assinatura)
- Rate limiting específico para billing (ex: 10 requests/hour)
- Validar planId e billingInterval contra enum fixo

**Dados sensíveis:**
- NUNCA retornar `stripeCustomerId` ou `stripeSubscriptionId` para frontend
- Apenas admin pode ver informações de billing de outros usuários
- Logs não devem conter dados de cartão

---

### 11.2 Compliance LGPD/GDPR

**Retenção de dados:**
- BillingHistory: manter por 5 anos (obrigação fiscal)
- UsageTracking: manter histórico por 12 meses
- Dados de pagamento: armazenados apenas no Stripe

**Direito ao esquecimento:**
- Ao deletar conta (userManagementController.deleteUser):
  1. Cancelar subscription ativa
  2. Deletar customer no Stripe
  3. Anonimizar BillingHistory (manter para auditoria fiscal)
  4. Deletar PlanSubscription
  5. Deletar UsageTracking

---

## RESUMO DE IMPLEMENTAÇÃO

### Ordem de implementação recomendada:

1. **Semana 1:** Models (PlanSubscription, UsageTracking, BillingHistory)
2. **Semana 2:** billingService.js (integração Stripe básica)
3. **Semana 3:** billingController.js + rotas
4. **Semana 4:** checkPlanLimits middleware + usageTrackingService
5. **Semana 5:** Aplicar limitações em controllers existentes
6. **Semana 6:** Webhooks do Stripe + testes
7. **Semana 7:** Email notifications + cron jobs
8. **Semana 8:** Scripts de migração + testes finais
9. **Semana 9:** Testes end-to-end + edge cases
10. **Semana 10:** Deploy gradual + monitoramento

---

### Arquivos novos a criar:

**Models:**
- `packages/api/src/models/PlanSubscription.js`
- `packages/api/src/models/UsageTracking.js`
- `packages/api/src/models/BillingHistory.js`

**Services:**
- `packages/api/src/services/billingService.js`
- `packages/api/src/services/usageTrackingService.js`

**Controllers:**
- `packages/api/src/controllers/billingController.js`

**Middleware:**
- `packages/api/src/middleware/checkPlanLimits.js`

**Routes:**
- `packages/api/src/routes/billing.js`

**Scripts:**
- `packages/api/scripts/migratePlans.js`

**Jobs:**
- `packages/api/jobs/resetMonthlyUsage.js`
- `packages/api/jobs/syncStripeSubscriptions.js`

---

### Arquivos a modificar:

**Models:**
- `packages/api/src/models/User.js` (adicionar campos de plano)

**Controllers:**
- `packages/api/src/controllers/flowController.js` (aplicar checkFlowLimit)
- `packages/api/src/controllers/executionController.js` (aplicar checkExecutionLimit e checkStorageLimit)
- `packages/api/src/controllers/scheduleController.js` (aplicar checkScheduleLimit)
- `packages/api/src/controllers/authController.js` (adicionar dados de plano em getProfile)
- `packages/api/src/controllers/dashboardController.js` (adicionar usage stats)

**Services:**
- `packages/api/src/services/schedulerService.js` (verificar limites antes de executar)
- `packages/api/src/services/emailService.js` (adicionar templates de billing)

**Config:**
- `packages/api/src/app.js` (registrar rota /api/billing)
- `packages/api/package.json` (adicionar stripe npm package)
- `packages/api/.env.example` (adicionar variáveis do Stripe)

---

## DEFINIÇÃO DE LIMITES POR PLANO

### FREE
- Execuções/mês: 200
- Flows ativos: 5
- Armazenamento: 50MB
- Retenção de dados: 7 dias
- Schedules: 0

### STARTER (R$ 35,90/mês ou R$ 290/ano)
- Execuções/mês: 2.000
- Flows ativos: 25
- Armazenamento: 1GB
- Retenção de dados: 30 dias
- Schedules: 5

### PRO (R$ 130/mês ou R$ 999/ano)
- Execuções/mês: 10.000
- Flows ativos: 100
- Armazenamento: 10GB
- Retenção de dados: 90 dias
- Schedules: 20

---

## PRÓXIMOS PASSOS

1. Criar conta no Stripe e configurar produtos/prices
2. Implementar models no MongoDB
3. Desenvolver billingService com integração Stripe
4. Criar endpoints de billing
5. Implementar middlewares de verificação de limites
6. Aplicar limitações nos endpoints existentes
7. Configurar webhooks do Stripe
8. Testar fluxo completo de assinatura
9. Deploy em ambiente de staging
10. Testes end-to-end
11. Deploy em produção
