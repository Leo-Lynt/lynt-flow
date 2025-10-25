# 🚀 Guia de Deploy - Vercel + Render

Deploy dos frontends no Vercel e da API no Render.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ Conta no [Vercel](https://vercel.com) (grátis)
- ✅ Conta no [Render](https://render.com) (grátis)
- ✅ Conta no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (grátis) - Para o banco de dados
- ✅ Código commitado no GitHub/GitLab
- ✅ Variáveis de ambiente documentadas

---

## 🎯 Arquitetura

```
┌────────────────────────────┐
│  Vercel (Frontends)        │
│  seu-dominio.vercel.app    │
│  ├─ /         → CMS        │
│  ├─ /editor   → Editor     │
│  └─ /api/*    → Proxy ↓    │
└────────────────────────────┘
              ↓
    ┌──────────────────────────┐
    │  Render (API)            │
    │  lynt-flow-api.onrender  │
    │  - Express               │
    │  - Socket.IO             │
    │  - node-cron             │
    └──────────────────────────┘
```

---

## 🗄️ Parte 0: Configurar MongoDB Atlas

### Passo 0.1: Criar Cluster
1. Acesse https://www.mongodb.com/cloud/atlas
2. Crie uma conta gratuita
3. Crie um cluster M0 (Free Tier)
4. Região: Escolha **us-east-1** (mesma região do Render)

### Passo 0.2: Configurar Acesso
1. **Database Access** → Add New Database User
   - Username: `lynt-flow-admin`
   - Password: Gere uma senha forte (SALVE ESTA SENHA!)

2. **Network Access** → Add IP Address
   - Clique em **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Confirme

### Passo 0.3: Obter Connection String
1. Clique em **Connect** → **Connect your application**
2. Copie a string de conexão:
   ```
   mongodb+srv://lynt-flow-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
3. Substitua `<password>` pela senha criada
4. **SALVE ESTA STRING** - você vai usar no Render

---

## 🔧 Parte 1: Deploy da API no Render

### Passo 1.1: Criar Web Service

1. Acesse https://dashboard.render.com
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub/GitLab
4. Configure:

```
Nome: lynt-flow-api
Region: Oregon (US West)
Branch: main (ou master)
Root Directory: packages/api
Runtime: Node
Build Command: pnpm install
Start Command: pnpm start
Instance Type: Free
```

### Passo 1.2: Configurar Variáveis de Ambiente

No dashboard do Render, vá em **Environment** e adicione:

```bash
# Ambiente
NODE_ENV=production
PORT=10000

# MongoDB (cole a string do Atlas aqui)
MONGODB_URI=mongodb+srv://lynt-flow-admin:SUA-SENHA@cluster0.xxxxx.mongodb.net/lynt-flow?retryWrites=true&w=majority

# JWT Secret (gere um aleatório)
JWT_SECRET=GERE_UM_STRING_ALEATORIO_SEGURO_AQUI

# Frontend URL (TEMPORÁRIO - vamos atualizar depois)
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Trust Proxy (importante para Render)
TRUST_PROXY=1
```

**Como gerar JWT_SECRET:**
```bash
# No terminal local
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Passo 1.3: Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o deploy (~2-3 minutos)
3. Após concluído, copie a URL da API:
   ```
   https://lynt-flow-api.onrender.com
   ```
4. **SALVE ESTA URL** - você vai usar no Vercel

### Passo 1.4: Testar API

```bash
# Teste a API
curl https://lynt-flow-api.onrender.com/api/health

# Deve retornar algo como:
# {"status":"ok","timestamp":"2025-01-25T..."}
```

---

## 🌐 Parte 2: Deploy dos Frontends no Vercel

### Passo 2.1: Atualizar vercel.json

**IMPORTANTE:** Antes de fazer deploy, atualize o arquivo `vercel.json` com a URL real da sua API:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://lynt-flow-api.onrender.com/api/:path*"
      👆 SUBSTITUA PELA SUA URL DO RENDER
    }
  ]
}
```

### Passo 2.2: Testar Build Localmente (Opcional)

```bash
# Teste se o build funciona
pnpm build:vercel

# Deve criar a pasta dist/ com:
# dist/
#   ├── index.html (CMS)
#   └── editor/ (Editor)

# Servir localmente para testar
npx serve dist -l 3000
# Abra: http://localhost:3000 (CMS)
#       http://localhost:3000/editor (Editor)
```

### Passo 2.3: Deploy no Vercel via Dashboard

1. Acesse https://vercel.com/new
2. Clique em **"Import Git Repository"**
3. Selecione seu repositório
4. Configure:

```
Project Name: lynt-flow
Framework Preset: Other
Root Directory: ./
Build Command: pnpm build:vercel
Output Directory: dist
Install Command: pnpm install
```

5. **Environment Variables** (opcional - já está no vercel.json):
   ```
   VITE_API_URL=/api
   ```

6. Clique em **"Deploy"**
7. Aguarde o deploy (~2-5 minutos)

### Passo 2.4: Obter URL do Vercel

Após o deploy, você receberá uma URL:
```
https://lynt-flow-xxxx.vercel.app
```

---

## 🔗 Parte 3: Conectar Tudo

### Passo 3.1: Atualizar Variáveis no Render

Volte ao **Render Dashboard** → Seu serviço → **Environment**

Atualize:
```bash
FRONTEND_URL=https://lynt-flow-xxxx.vercel.app
ALLOWED_ORIGINS=https://lynt-flow-xxxx.vercel.app
```

Clique em **"Save Changes"** (vai fazer re-deploy automático)

### Passo 3.2: Testar Integração

1. Abra seu site no Vercel: `https://lynt-flow-xxxx.vercel.app`
2. Teste o CMS: `https://lynt-flow-xxxx.vercel.app`
3. Teste o Editor: `https://lynt-flow-xxxx.vercel.app/editor`
4. Teste chamadas de API:
   - Login
   - Criar flow
   - Executar flow

---

## 🎨 Parte 4: Domínio Customizado (Opcional)

### No Vercel

1. Vá em **Settings** → **Domains**
2. Adicione seu domínio: `lynt.io`
3. Configure DNS no seu provedor:
   ```
   CNAME  @     cname.vercel-dns.com
   CNAME  www   cname.vercel-dns.com
   ```

### Atualizar Variáveis

No Render, atualize novamente:
```bash
FRONTEND_URL=https://lynt.io
ALLOWED_ORIGINS=https://lynt.io,https://www.lynt.io
```

---

## ✅ Checklist de Deployment

### MongoDB Atlas
- [ ] Cluster criado (M0 Free)
- [ ] Usuário do banco criado
- [ ] Network access configurado (0.0.0.0/0)
- [ ] Connection string salva

### Render (API)
- [ ] Web Service criado
- [ ] Root directory: `packages/api`
- [ ] Build: `pnpm install`
- [ ] Start: `pnpm start`
- [ ] MONGODB_URI configurado
- [ ] JWT_SECRET configurado
- [ ] FRONTEND_URL configurado
- [ ] ALLOWED_ORIGINS configurado
- [ ] TRUST_PROXY=1 configurado
- [ ] Deploy concluído
- [ ] API testada: /api/health retorna OK
- [ ] URL da API salva

### Vercel (Frontends)
- [ ] vercel.json atualizado com URL da API
- [ ] Build local testado: `pnpm build:vercel`
- [ ] Projeto criado no Vercel
- [ ] Build command: `pnpm build:vercel`
- [ ] Output directory: `dist`
- [ ] Deploy concluído
- [ ] CMS acessível
- [ ] Editor acessível
- [ ] Chamadas de API funcionando

### Integração Final
- [ ] FRONTEND_URL atualizado no Render
- [ ] ALLOWED_ORIGINS atualizado no Render
- [ ] Login funciona
- [ ] Criar flow funciona
- [ ] Executar flow funciona
- [ ] Socket.IO funciona (se usado)

---

## 🐛 Troubleshooting

### Problema: API retorna 503

**Causa:** API dormiu (Render free tier dorme após 15min de inatividade)

**Solução:**
- Aguarde 30-60 segundos para cold start
- Ou faça upgrade para Render Starter ($7/mês) para manter sempre ativa

### Problema: CORS Error

**Causa:** ALLOWED_ORIGINS não configurado corretamente

**Solução:**
1. Verifique a variável `ALLOWED_ORIGINS` no Render
2. Deve incluir a URL EXATA do Vercel (com https://)
3. Exemplo: `https://lynt-flow-xxxx.vercel.app`

### Problema: Build Failed no Vercel

**Erro:** `Cannot find module '@leo-lynt/lynt-flow-core'`

**Solução:**
1. Certifique-se que `pnpm-workspace.yaml` está na raiz
2. Build command deve ser: `pnpm build:vercel`
3. Install command deve ser: `pnpm install`

### Problema: MongoDB Connection Error

**Erro:** `MongoServerError: bad auth`

**Solução:**
1. Verifique se a senha está correta na MONGODB_URI
2. Verifique se o usuário existe no MongoDB Atlas
3. Certifique-se que Network Access permite 0.0.0.0/0

### Problema: Página em branco no Vercel

**Causa:** Erro de roteamento

**Solução:**
1. Verifique se o build gerou a pasta `dist/` corretamente
2. Teste localmente: `pnpm build:vercel && npx serve dist`
3. Verifique console do browser para erros

---

## 📊 Monitoramento

### Render
- **Logs:** Dashboard → Seu serviço → Logs (real-time)
- **Metrics:** CPU, memória, requests

### Vercel
- **Deployments:** Histórico completo
- **Analytics:** Traffic, performance
- **Logs:** Função logs para cada request

### MongoDB Atlas
- **Metrics:** Dashboard mostra conexões, queries, storage

---

## 🔐 Segurança

### ⚠️ NUNCA Commite:
```
.env
.env.local
.env.production
JWT_SECRET
MONGODB_URI
Senhas
```

### ✅ SEMPRE Use:
- Environment variables (Render/Vercel)
- `.env.example` para documentar
- `.gitignore` para excluir .env

---

## 💰 Custos

### Gratuito:
- ✅ Vercel: Frontends ilimitados
- ✅ Render: 750h/mês (API dorme após 15min)
- ✅ MongoDB Atlas: 512MB M0 cluster

### Se Precisar Upgrade:
- Render Starter: $7/mês (API sempre ativa, 0.5GB RAM)
- MongoDB Atlas M2: $9/mês (2GB storage)
- Vercel Pro: $20/mês (teams, analytics avançado)

---

## 🎉 Pronto!

Seu projeto está no ar:

- 🌐 **CMS:** https://seu-dominio.vercel.app
- ✏️ **Editor:** https://seu-dominio.vercel.app/editor
- 🔧 **API:** https://lynt-flow-api.onrender.com

**Performance:**
- Frontends: ~20-50ms (Vercel edge no Brasil)
- API: ~120-180ms (Render US East)

---

## 📞 Suporte

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **MongoDB Atlas Docs:** https://www.mongodb.com/docs/atlas

---

**Última atualização:** 2025-01-25
