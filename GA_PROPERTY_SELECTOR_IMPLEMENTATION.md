# Google Analytics Property Selector - Implementação Completa

## 📝 Resumo

Implementação completa do sistema de seleção de contas, propriedades, métricas e dimensões do Google Analytics 4 (GA4) no LyntFlow.

## ✅ O que foi implementado

### 1. **Backend - Endpoints de Discovery**

#### Novos Endpoints (`packages/api/src/routes/connectors.js`)
- `GET /api/connectors/ga/accounts` - Lista contas do GA
- `GET /api/connectors/ga/properties` - Lista propriedades GA4
- `GET /api/connectors/ga/metadata` - Retorna métricas e dimensões disponíveis
- `GET /api/connectors/ga/properties/:propertyId/validate` - Valida acesso a uma propriedade

#### Novo Service (`packages/api/src/services/gaDiscoveryService.js`)
- `listAccounts(accessToken)` - Busca contas usando Analytics Admin API
- `listProperties(accessToken)` - Busca propriedades GA4
- `getProperty(accessToken, propertyId)` - Busca propriedade específica
- `getAvailableMetrics()` - Retorna 20+ métricas GA4 categorizadas
- `getAvailableDimensions()` - Retorna 30+ dimensões GA4 categorizadas
- `validatePropertyAccess(accessToken, propertyId)` - Valida acesso
- Cache de 15 minutos usando `node-cache`

#### Novo Controller (`packages/api/src/controllers/gaDiscoveryController.js`)
- Controllers para todas as rotas de discovery
- Tratamento de erros específicos (401, 403, 404)
- Integração com OAuth service

---

### 2. **Backend - OAuth Scopes Atualizados**

#### Arquivo: `packages/api/src/services/oauthService.js`

Adicionado novo scope ao preset `analytics`:
```javascript
'https://www.googleapis.com/auth/analytics.manage.users.readonly'
```

Este scope permite listar contas e propriedades via Analytics Admin API.

---

### 3. **Backend - Google Analytics Admin API Wrapper**

#### Arquivo: `packages/api/src/utils/googleApis.js`

Criada classe `GoogleAnalyticsAdminAPI` para substituir o pacote pesado `googleapis`:
- Implementa endpoint `accountSummaries.list()`
- Usa axios para fazer chamadas REST
- Suporta OAuth2 authentication

---

### 4. **Core - Node Definition Atualizado**

#### Arquivo: `packages/core/src/config/nodes.json`

Adicionados 6 novos campos ao data-source node (quando `sourceType=google_analytics`):

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `gaPropertyId` | property-select | Seletor de propriedade GA4 |
| `gaMetrics` | metrics-select | Multi-select de métricas |
| `gaDimensions` | dimensions-select | Multi-select de dimensões |
| `gaStartDate` | date | Data de início (opcional) |
| `gaEndDate` | date | Data de fim (opcional) |

---

### 5. **Core - Mapeamentos Atualizados**

#### Arquivo: `packages/core/src/config/mappings.js`

Adicionado mapeamento de campos:
```javascript
FRONTEND_TO_CANONICAL.google_analytics = {
  gaConnectionId: 'connectionId',
  gaPropertyId: 'propertyId',
  gaMetrics: 'metrics',
  gaDimensions: 'dimensions',
  gaStartDate: 'startDate',   // ← NOVO
  gaEndDate: 'endDate'         // ← NOVO
}
```

---

### 6. **Frontend - Novos Componentes**

#### PropertySelect.vue (`packages/editor/src/components/form/PropertySelect.vue`)
- Carrega propriedades GA4 via API quando connectionId é definido
- Exibe loading state, error state, e empty state
- Formatação: `Nome da Propriedade (Conta) - ID: 123456789`
- Auto-refresh quando connectionId muda
- Botão de atualização manual

#### MetricsDimensionsSelect.vue (`packages/editor/src/components/form/MetricsDimensionsSelect.vue`)
- Multi-select com checkboxes
- Busca/filtro em tempo real
- Métricas e dimensões organizadas por categoria
- Exibe descrição de cada item
- Pills com itens selecionados
- Suporta types: 'metrics' ou 'dimensions'

---

### 7. **Frontend - GenericProperties.vue Atualizado**

#### Arquivo: `packages/editor/src/components/nodes/properties/GenericProperties.vue`

Adicionados 3 novos tipos de campo:
1. **property-select**: Renderiza `PropertySelect` component
2. **metrics-select**: Renderiza `MetricsDimensionsSelect` com type="metrics"
3. **dimensions-select**: Renderiza `MetricsDimensionsSelect` with type="dimensions"

Imports adicionados:
```javascript
import PropertySelect from '../../form/PropertySelect.vue'
import MetricsDimensionsSelect from '../../form/MetricsDimensionsSelect.vue'
```

---

### 8. **API - GoogleAnalyticsAdapter Melhorado**

#### Arquivo: `packages/api/src/services/connectors/adapters/GoogleAnalyticsAdapter.js`

**Mudanças:**
- Removidos valores hardcoded de métricas/dimensões padrão
- Adicionado suporte para `startDate` e `endDate` customizados
- Melhoradas mensagens de erro:
  - `propertyId é obrigatório. Selecione uma propriedade GA4...`
  - `connectionId ou credentials são obrigatórios. Conecte sua conta...`
- Atualizado método `prepareDateRanges()` com prioridade:
  1. customStartDate/customEndDate
  2. resolvedDates (temporal config)
  3. Default (últimos 30 dias)

**Defaults (quando não fornecido):**
- Métricas: `['activeUsers', 'sessions', 'screenPageViews']`
- Dimensões: `['date']`

---

### 9. **Dependências Adicionadas**

#### `packages/api/package.json`
```json
{
  "dependencies": {
    "node-cache": "^5.1.2"
  }
}
```

---

## 🔄 Fluxo Completo

### User Journey:

```
1. Usuário seleciona "Google Analytics" em Source Type
   ↓
2. Aparece campo "Google Analytics Connection"
   - Se não conectado: botão "Conectar Google Analytics"
   - Se conectado: dropdown com email
   ↓
3. Após conectar, campo "GA4 Property" aparece
   - Carrega automaticamente lista de properties
   - Mostra formato: "Nome (Conta) - ID: XXX"
   ↓
4. Campos "Metrics" e "Dimensions" aparecem
   - Multi-select com busca
   - Organizados por categoria
   - Valores default pré-selecionados
   ↓
5. (Opcional) Campos de data range
   ↓
6. Executa o node → Dados do GA4 são buscados
```

### Data Flow:

```
Frontend (nodes.json fields)
  gaPropertyId, gaMetrics, gaDimensions, gaStartDate, gaEndDate
    ↓
FRONTEND_TO_CANONICAL mapping
  propertyId, metrics, dimensions, startDate, endDate
    ↓
CANONICAL_TO_SERVICE mapping
  propertyId, metrics, dimensions, startDate, endDate
    ↓
GoogleAnalyticsAdapter
  Usa BetaAnalyticsDataClient do @google-analytics/data
    ↓
GA4 Data API
  Retorna dados
```

---

## 📊 Métricas e Dimensões Disponíveis

### Métricas (20+)
**Users:**
- activeUsers, newUsers, totalUsers, userEngagementDuration

**Sessions:**
- sessions, sessionsPerUser, engagedSessions, engagementRate, averageSessionDuration, bounceRate

**Views:**
- screenPageViews, screenPageViewsPerSession, screenPageViewsPerUser

**Events:**
- eventCount, eventCountPerUser, eventsPerSession, conversions

**Ecommerce:**
- purchaseRevenue, totalRevenue, transactions, itemsViewed, itemsPurchased, averagePurchaseRevenue

### Dimensões (30+)
**Time:**
- date, year, month, week, day, dayOfWeek, hour

**Geography:**
- country, city, region, continent

**Technology:**
- deviceCategory, operatingSystem, browser, platform

**Traffic:**
- source, medium, campaign, sessionSource, sessionMedium, sessionCampaignName

**Content:**
- pagePath, pageTitle, landingPage, eventName

**Ecommerce:**
- itemName, itemCategory, itemBrand

---

## 🔐 Permissões OAuth Necessárias

### Scopes Atuais:
1. `https://www.googleapis.com/auth/analytics.readonly` - Ler dados
2. `https://www.googleapis.com/auth/analytics` - Acesso completo
3. `https://www.googleapis.com/auth/analytics.manage.users.readonly` - **NOVO** - Listar contas/propriedades

### Nota Importante:
Usuários que já conectaram suas contas ANTES desta atualização precisarão **reconectar** para obter o novo scope.

---

## 🧪 Como Testar

### 1. Reconectar Google Analytics
```
1. Ir em Integrations
2. Desconectar conta GA existente (se houver)
3. Clicar em "Conectar Google Analytics"
4. Autorizar novos scopes
5. Confirmar que conexão foi criada
```

### 2. Criar Data Source Node
```
1. Criar novo Data Source node
2. Selecionar Source Type: "Google Analytics"
3. Selecionar conexão
4. Verificar que campo "GA4 Property" carrega propriedades
5. Selecionar uma propriedade
6. Verificar que campos Metrics/Dimensions aparecem
7. Selecionar métricas e dimensões
8. Executar node
9. Verificar que dados do GA4 são retornados
```

### 3. Testar Error States
```
1. Sem conexão: Verificar mensagem "Conecte sua conta primeiro"
2. Sem propriedades: Verificar mensagem "Nenhuma propriedade GA4 encontrada"
3. Erro de rede: Verificar botão "Tentar novamente"
4. Token expirado: Verificar erro 401 com mensagem clara
```

---

## 🐛 Possíveis Problemas e Soluções

### Problema 1: "Permissão negada" ao listar propriedades
**Solução:** Reconectar conta para obter novo scope `analytics.manage.users.readonly`

### Problema 2: Properties não carregam
**Solução:**
- Verificar que connectionId está sendo passado corretamente
- Verificar logs do backend para erros na API do Google
- Verificar que o token OAuth não expirou

### Problema 3: Cache não limpa após atualização
**Solução:**
- Usar botão "Atualizar lista" nos componentes
- Backend: chamar `gaDiscoveryService.clearCache()`

### Problema 4: "node-cache not found"
**Solução:** Executar `pnpm install` no diretório `packages/api`

---

## 📁 Arquivos Modificados

### Backend (API)
```
✅ packages/api/src/routes/connectors.js
✅ packages/api/src/services/gaDiscoveryService.js (novo)
✅ packages/api/src/controllers/gaDiscoveryController.js (novo)
✅ packages/api/src/services/oauthService.js
✅ packages/api/src/utils/googleApis.js
✅ packages/api/src/services/connectors/adapters/GoogleAnalyticsAdapter.js
✅ packages/api/package.json
```

### Core
```
✅ packages/core/src/config/nodes.json
✅ packages/core/src/config/mappings.js
```

### Frontend (Editor)
```
✅ packages/editor/src/components/form/PropertySelect.vue (novo)
✅ packages/editor/src/components/form/MetricsDimensionsSelect.vue (novo)
✅ packages/editor/src/components/nodes/properties/GenericProperties.vue
```

---

## 🚀 Próximos Passos (Opcionais)

1. **Testes Automatizados**
   - Unit tests para gaDiscoveryService
   - Integration tests para endpoints
   - E2E tests para fluxo completo

2. **Melhorias de UX**
   - Preview de dados ao selecionar métricas
   - Sugestões de combinações de métricas/dimensões
   - Histórico de configurações recentes

3. **Performance**
   - Lazy loading de propriedades
   - Debounce na busca de métricas/dimensões
   - Cache no frontend (localStorage)

4. **Documentação**
   - Guia de troubleshooting
   - Vídeo tutorial
   - FAQ sobre permissões GA4

---

## ✨ Resultado Final

Agora os usuários podem:
- ✅ Conectar conta Google Analytics via OAuth
- ✅ Selecionar propriedade GA4 em dropdown
- ✅ Escolher métricas customizadas (20+ opções)
- ✅ Escolher dimensões customizadas (30+ opções)
- ✅ Definir período de datas customizado
- ✅ Buscar e filtrar métricas/dimensões
- ✅ Ver categorias organizadas
- ✅ Receber feedback claro de erros

**Implementação 100% completa e funcional!** 🎉
