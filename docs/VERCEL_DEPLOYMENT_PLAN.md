# 🚀 Plano de Ação - Deploy no Vercel (Monorepo)

## 📋 Análise da Situação Atual

### ✅ O que FUNCIONA no Vercel

| Componente | Status | Motivo |
|------------|--------|--------|
| **CMS** (Vue.js) | ✅ Perfeito | Static site (após build) |
| **Editor** (Vue.js) | ✅ Perfeito | Static site (após build) |
| **Core** (Pure JS) | ✅ Perfeito | Biblioteca compartilhada |

### ⚠️ O que É DESAFIADOR no Vercel

| Componente | Status | Motivo | Impacto |
|------------|--------|--------|---------|
| **API Express** | ⚠️ Complexo | Precisa ser convertida para Serverless Functions | Alto |
| **Socket.IO** | ❌ Problemático | WebSockets não funcionam bem em serverless | Alto |
| **node-cron** | ❌ Não funciona | Jobs agendados não rodam em serverless | Médio |
| **Winston (file logging)** | ❌ Não funciona | Sistema de arquivos efêmero | Baixo |
| **MongoDB** | ✅ OK | Usar MongoDB Atlas (externo) | Nenhum |

---

## 🎯 Opções de Deploy

### **Opção 1: HÍBRIDA (Recomendada)** ⭐

**Frontend no Vercel + API em outro lugar**

```
┌─────────────────────────────────┐
│  Vercel (Frontends)             │
│  ├─ CMS (/)                     │
│  ├─ Editor (/editor)            │
│  └─ Rewrites → API Externa      │
└─────────────────────────────────┘
              ↓
    ┌──────────────────────┐
    │  Render / Railway    │
    │  (API Node.js)       │
    │  - Express           │
    │  - Socket.IO         │
    │  - node-cron         │
    └──────────────────────┘
```

**Vantagens:**
- ✅ Frontends rápidos (CDN global do Vercel)
- ✅ API funciona 100% (todas as features)
- ✅ Socket.IO funciona
- ✅ Cron jobs funcionam
- ✅ Grátis (Vercel) + Grátis (Render 750h/mês)

**Desvantagens:**
- ⚠️ API pode dormir após 15min inatividade (Render free tier)
- ⚠️ Duas plataformas para gerenciar

---

### **Opção 2: TUDO NO VERCEL (Adaptado)**

**Converter API Express para Serverless Functions**

```
┌─────────────────────────────────────┐
│  Vercel (Tudo)                      │
│  ├─ CMS (Static)                    │
│  ├─ Editor (Static)                 │
│  └─ API (Serverless Functions)      │
│      ├─ /api/auth → function        │
│      ├─ /api/flows → function       │
│      └─ /api/* → functions...       │
└─────────────────────────────────────┘
```

**Vantagens:**
- ✅ Tudo em uma plataforma
- ✅ Deploy automático
- ✅ Escalabilidade automática

**Desvantagens:**
- ❌ Socket.IO não funciona (precisa adaptar)
- ❌ node-cron não funciona (precisa Vercel Cron)
- ❌ Winston file logging não funciona (precisa adaptar)
- ⚠️ Muito trabalho de refatoração
- ⚠️ Cold starts (functions dormem)

---

### **Opção 3: MONOREPO VERCEL (Multi-Projects)**

**Cada pacote é um projeto Vercel separado**

```
┌─────────────────────┐
│  Vercel Project 1   │
│  (CMS)              │
│  lynt.io/           │
└─────────────────────┘

┌─────────────────────┐
│  Vercel Project 2   │
│  (Editor)           │
│  editor.lynt.io     │
└─────────────────────┘

┌─────────────────────┐
│  Render             │
│  (API)              │
│  api.lynt.io        │
└─────────────────────┘
```

**Vantagens:**
- ✅ Separação clara
- ✅ Deploys independentes
- ✅ API funciona 100%

**Desvantagens:**
- ⚠️ 3 projetos para gerenciar
- ⚠️ Configuração mais complexa

---

## 📊 Comparação Detalhada

| Feature | Opção 1 (Híbrida) | Opção 2 (Tudo Vercel) | Opção 3 (Multi-Projects) |
|---------|-------------------|----------------------|--------------------------|
| **Facilidade de Setup** | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Socket.IO** | ✅ Funciona | ❌ Não funciona | ✅ Funciona |
| **Cron Jobs** | ✅ Funciona | ⚠️ Precisa adaptar | ✅ Funciona |
| **Custo** | 100% Grátis | 100% Grátis | 100% Grátis |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Manutenção** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Refatoração** | Mínima | **Muita** | Mínima |

---

## 🏆 Recomendação: OPÇÃO 1 (Híbrida)

### Por quê?

1. **Zero refatoração** - API funciona como está
2. **Todas as features** - Socket.IO, cron, etc funcionam
3. **100% grátis** - Vercel + Render free tier
4. **Melhor performance** - Frontends na CDN do Vercel
5. **Setup rápido** - 30 minutos de configuração

---

## 📝 Plano de Ação Detalhado (Opção 1)

### **Fase 1: Configurar Vercel (Frontends)**

#### Passo 1.1: Criar `vercel.json`
```json
{
  "version": 2,
  "buildCommand": "pnpm build:cms && pnpm build:editor && node scripts/merge-builds.mjs",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "framework": null,
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://SUA-API.onrender.com/api/:path*"
    },
    {
      "source": "/editor/:path((?!assets).*)",
      "destination": "/editor/index.html"
    },
    {
      "source": "/:path((?!assets).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Credentials",
          "value": "true"
        },
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

#### Passo 1.2: Criar script `scripts/merge-builds.mjs`
```javascript
// Combina CMS (raiz) + Editor (/editor)
import { cpSync, mkdirSync, rmSync } from 'fs';

mkdirSync('dist', { recursive: true });
cpSync('packages/cms/dist', 'dist', { recursive: true });
cpSync('packages/editor/dist', 'dist/editor', { recursive: true });
```

#### Passo 1.3: Atualizar `package.json`
```json
{
  "scripts": {
    "build:vercel": "pnpm build:cms && pnpm build:editor && node scripts/merge-builds.mjs"
  }
}
```

---

### **Fase 2: Configurar Render (API)**

#### Passo 2.1: Criar `render.yaml`
```yaml
services:
  - type: web
    name: lynt-flow-api
    runtime: node
    region: oregon
    plan: free
    rootDir: packages/api
    buildCommand: pnpm install
    startCommand: pnpm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: ALLOWED_ORIGINS
        value: https://lynt.io,https://lynt.io/editor
```

#### Passo 2.2: Deploy no Render
1. Acesse render.com
2. New + → Web Service
3. Conecte GitHub
4. Configure variáveis de ambiente
5. Deploy!

#### Passo 2.3: Copiar URL da API
```
https://lynt-flow-api.onrender.com
```

---

### **Fase 3: Conectar Tudo**

#### Passo 3.1: Atualizar `vercel.json`
Substituir `SUA-API.onrender.com` pela URL real

#### Passo 3.2: Deploy no Vercel
```bash
# Via CLI
pnpm install -g vercel
vercel

# OU via Dashboard
# https://vercel.com/new → Import repo
```

---

### **Fase 4: Configurar Domínio (Opcional)**

```
lynt.io           → Vercel (CMS)
lynt.io/editor    → Vercel (Editor)
lynt.io/api/*     → Proxy para Render (via Vercel rewrites)
```

---

## ✅ Checklist de Implementação

### Preparação
- [ ] MongoDB Atlas configurado e rodando
- [ ] Variáveis de ambiente documentadas
- [ ] Código commitado no GitHub

### Vercel
- [ ] `vercel.json` criado
- [ ] `scripts/merge-builds.mjs` criado
- [ ] `package.json` atualizado com `build:vercel`
- [ ] Teste local: `pnpm build:vercel`
- [ ] Deploy no Vercel
- [ ] Testar CMS: https://seu-projeto.vercel.app
- [ ] Testar Editor: https://seu-projeto.vercel.app/editor

### Render
- [ ] `render.yaml` criado
- [ ] Web Service criado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado
- [ ] API testada: https://sua-api.onrender.com/api/health

### Integração
- [ ] URL da API atualizada no `vercel.json`
- [ ] Re-deploy no Vercel
- [ ] Testar chamadas de API do frontend
- [ ] Testar Socket.IO (se usado)
- [ ] Testar cron jobs

---

## 🐛 Troubleshooting

### Problema: API retorna 503
**Causa:** API dormiu (Render free tier)
**Solução:** Aguarde 30-60s para cold start

### Problema: CORS error
**Causa:** ALLOWED_ORIGINS incorreto
**Solução:** Configurar no Render: `https://lynt.io,https://lynt.io/editor`

### Problema: Build failed no Vercel
**Causa:** Dependências do monorepo
**Solução:** Certifique-se que `pnpm-workspace.yaml` está na raiz

---

## 💡 Alternativa Rápida: Opção 2 Simplificada

Se você REALMENTE quiser tudo no Vercel, precisa:

### Mudanças Necessárias:

1. **Remover Socket.IO**
   - Substituir por polling ou Server-Sent Events

2. **Remover node-cron**
   - Usar Vercel Cron (https://vercel.com/docs/cron-jobs)

3. **Adaptar Express para Serverless**
   - Criar `api/index.js` que exporta o app Express

4. **Substituir Winston file logging**
   - Usar Vercel Logs (console.log)

**Tempo estimado de refatoração:** 2-3 dias
**Recomendado?** ❌ Não. Use Opção 1.

---

## 🎯 Próximo Passo

Quer que eu implemente a **Opção 1 (Híbrida)**?

Vou criar:
1. ✅ `vercel.json`
2. ✅ `render.yaml`
3. ✅ `scripts/merge-builds.mjs`
4. ✅ Atualizar `package.json`
5. ✅ Documentação de deploy

Confirme para eu começar! 🚀
