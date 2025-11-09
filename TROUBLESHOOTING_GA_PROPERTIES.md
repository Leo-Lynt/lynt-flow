# Troubleshooting - Google Analytics Property Selector

## ✅ Problemas Resolvidos

### 1. **ConnectionId sendo enviado como email ao invés de ID**

**Problema:** O dropdown estava enviando `"Google Analytics - leonardo@metakosmos.com.br"` ao invés do ObjectId.

**Causa:** O método `listUserConnections` usava `.lean()` do Mongoose, que não retorna campos virtuais como `id`, apenas `_id`.

**Solução:** ([oauthService.js:683-687](packages/api/src/services/oauthService.js:683-687))
```javascript
const connections = await Connection.find(query).lean();
return connections.map(conn => ({
  ...conn,
  id: conn._id.toString() // ✅ Adicionar campo 'id'
}));
```

**Fallbacks adicionados:**
- [ConnectionSelect.vue:14](packages/editor/src/components/form/ConnectionSelect.vue:14) - usa `conn.id || conn._id || conn.connectionId`
- [connectionStore.js:87-90](packages/editor/src/stores/connectionStore.js:87-90) - normaliza `conn.id`

---

### 2. **Erro "[object Object]" sendo exibido**

**Problema:** Erros não estavam sendo serializados corretamente.

**Solução:** ([PropertySelect.vue:148-159](packages/editor/src/components/form/PropertySelect.vue:148-159))
```javascript
catch (err) {
  if (err instanceof Error) {
    error.value = err.message
  } else if (typeof err === 'string') {
    error.value = err
  } else {
    error.value = 'Erro ao carregar propriedades. Tente novamente.'
  }
  console.error('Erro completo:', err)
}
```

---

### 3. **Dependência node-cache causando crash**

**Problema:** `Error: Cannot find module 'node-cache'`

**Solução:** ([gaDiscoveryService.js:4-35](packages/api/src/services/gaDiscoveryService.js:4-35))
```javascript
let NodeCache;
try {
  NodeCache = require('node-cache');
} catch (err) {
  // Fallback para SimpleCache in-memory
  class SimpleCache { ... }
  NodeCache = SimpleCache;
}
```

**Instalação:**
```bash
pnpm install  # Na raiz do monorepo
```

---

## ⚠️ Problema Atual: Erro 403 - Permissão Negada

### Diagnóstico:

```
❌ Erro ao buscar contas do GA: Request failed with status code 403
```

### Causa:

A conexão OAuth foi criada **antes** de adicionarmos o novo scope `analytics.manage.users.readonly`. O token atual não tem permissão para acessar a Analytics Admin API.

### Solução:

**RECONECTAR A CONTA GOOGLE ANALYTICS**

#### Passo a passo:

1. **Ir para Integrações**
   - URL: `http://localhost:5173/integrations` (ou equivalente)

2. **Encontrar a conexão Google Analytics**
   - Procurar por `leonardo@metakosmos.com.br`

3. **Desconectar**
   - Clicar em "Desconectar" ou "Revogar acesso"

4. **Reconectar**
   - Clicar em "Conectar Google Analytics"

5. **Autorizar novos scopes**
   - Na tela do Google, você verá:
     - ✅ Visualizar e baixar seus dados do Google Analytics **(já tinha)**
     - ✅ Gerenciar acessos de usuário do Google Analytics **(NOVO)**

6. **Voltar ao editor**
   - Criar/abrir Data Source node
   - Selecionar "Google Analytics"
   - Selecionar a conexão reconectada
   - Agora deve carregar as propriedades! 🎉

---

## 📊 Scopes OAuth Necessários

### Antes (insuficiente):
```
https://www.googleapis.com/auth/analytics.readonly
https://www.googleapis.com/auth/analytics
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
```

### Agora (completo):
```
https://www.googleapis.com/auth/analytics.readonly
https://www.googleapis.com/auth/analytics
https://www.googleapis.com/auth/analytics.manage.users.readonly  ← NOVO
https://www.googleapis.com/auth/userinfo.email
https://www.googleapis.com/auth/userinfo.profile
```

---

## 🔍 Como Verificar se os Scopes Estão Corretos

### No Backend:

```bash
# Verificar logs do servidor ao conectar
# Deve mostrar:
🔐 Gerando URL OAuth: {
  purpose: 'connection',
  serviceType: 'analytics',
  scopes: [
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/analytics',
    'https://www.googleapis.com/auth/analytics.manage.users.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ]
}
```

### No MongoDB:

```javascript
// Verificar campo 'scopes' na collection 'connections'
db.connections.findOne({ email: "leonardo@metakosmos.com.br" })
// Deve conter: analytics.manage.users.readonly
```

### No Google:

1. Ir para https://myaccount.google.com/permissions
2. Encontrar "LyntFlow" ou sua aplicação
3. Verificar permissões concedidas
4. Deve incluir: "Gerenciar acessos de usuário do Analytics"

---

## 🐛 Mensagens de Erro e Soluções

### ❌ "Permissão negada. Sua conta precisa ser reconectada..."

**Causa:** Token sem scope `analytics.manage.users.readonly`

**Solução:** Reconectar conta (passos acima)

---

### ❌ "Token de acesso inválido ou expirado"

**Causa:** Token OAuth expirado (validade: ~1h)

**Solução:**
- O sistema tenta refresh automático
- Se falhar, reconectar conta

---

### ❌ "Cast to ObjectId failed for value..."

**Causa:** ConnectionId inválido sendo passado

**Solução:**
- ✅ JÁ CORRIGIDO - backend agora retorna `id` corretamente
- Se ainda ocorrer, limpar cache do navegador

---

### ❌ "Nenhuma propriedade GA4 encontrada"

**Causas possíveis:**
1. Conta não possui propriedades GA4
2. Apenas propriedades Universal Analytics (descontinuado)
3. Sem permissão nas propriedades

**Verificação:**
1. Ir para https://analytics.google.com/
2. Clicar em "Admin" (ícone de engrenagem)
3. Verificar se existem propriedades listadas
4. Verificar se são GA4 (não Universal Analytics)

---

## 🧪 Teste Completo

### Checklist pós-reconexão:

- [ ] Servidor backend rodando (porta 3001)
- [ ] Frontend rodando (porta 5173)
- [ ] Conta Google Analytics reconectada
- [ ] Data Source node criado
- [ ] Source Type = "Google Analytics"
- [ ] Conexão selecionada
- [ ] Campo "GA4 Property" carregou propriedades
- [ ] Propriedade selecionada
- [ ] Campos "Metrics" carregaram (20+ opções)
- [ ] Campos "Dimensions" carregaram (30+ opções)
- [ ] Métricas e dimensões selecionadas
- [ ] Node executado com sucesso
- [ ] Dados do GA4 retornados

---

## 📝 Logs de Debug

### Frontend (Console do navegador):

```javascript
🔌 Conexões disponíveis: [{id: "690f44fd564b3948e056704c", email: "leonardo@...", ...}]
🔌 ConnectionSelect: Emitindo valor: {value: "690f44fd564b3948e056704c", type: "string"}
🔄 ConnectionId mudou: {old: "", new: "690f44fd564b3948e056704c", type: "string"}
🔍 Carregando propriedades GA: {connectionId: "690f44fd564b3948e056704c", ...}
📡 Fazendo request para: http://localhost:3001/api/connectors/ga/properties?connectionId=690f44fd564b3948e056704c
✅ Resposta recebida: {success: true, data: {properties: [...], count: 3}}
📊 Propriedades carregadas: 3
```

### Backend (Servidor):

```
🔍 Listando propriedades GA para connectionId: 690f44fd564b3948e056704c
🔑 Token descriptografado
🔍 Buscando contas do Google Analytics...
✅ Encontradas 2 contas
🔍 Buscando propriedades do Google Analytics...
✅ Encontradas 3 propriedades
```

---

## 🚀 Próximos Passos (Após Reconexão)

1. **Testar listagem de propriedades** ✅
2. **Testar seleção de métricas** ✅
3. **Testar seleção de dimensões** ✅
4. **Testar execução do node** ⏳
5. **Testar com múltiplas propriedades** ⏳
6. **Testar com contas sem propriedades** ⏳

---

## 💡 Dicas

### Para Desenvolvedores:

- Sempre usar `conn.id || conn._id` ao acessar IDs de conexões
- Verificar scopes OAuth ao adicionar novas APIs
- Usar `.lean()` com cuidado - adicionar campos virtuais manualmente
- Adicionar mensagens de erro descritivas

### Para Usuários:

- Reconectar contas após atualizações do sistema
- Verificar permissões no Google Account Settings
- Usar propriedades GA4 (Universal Analytics foi descontinuado)
- Manter tokens válidos (refresh automático funciona)

---

## 📚 Referências

- [Google Analytics Admin API](https://developers.google.com/analytics/devguides/config/admin/v1)
- [Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [OAuth 2.0 Scopes](https://developers.google.com/identity/protocols/oauth2/scopes#analytics)
- [Mongoose Virtuals](https://mongoosejs.com/docs/guide.html#virtuals)
