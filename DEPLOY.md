# 🚀 Deploy Rápido - Vercel + Render

## ⚡ TL;DR (Quick Start)

```bash
# 1. Commit tudo
git add .
git commit -m "Configurar deploy Vercel + Render"
git push

# 2. Deploy API no Render
# Acesse: render.com
# Crie Web Service apontando para: packages/api

# 3. Deploy Frontends no Vercel
# Acesse: vercel.com
# Importe repo e use: pnpm build:vercel

# 4. Atualizar URLs cruzadas
# Render: Adicionar FRONTEND_URL com URL do Vercel
# vercel.json: Atualizar URL da API do Render
```

---

## 📚 Documentação Completa

Veja o guia passo a passo detalhado:
**[docs/DEPLOY_GUIDE.md](docs/DEPLOY_GUIDE.md)**

---

## 📋 Arquivos de Configuração

- ✅ [vercel.json](vercel.json) - Configuração do Vercel
- ✅ [render.yaml](render.yaml) - Configuração do Render
- ✅ [scripts/merge-builds.mjs](scripts/merge-builds.mjs) - Script de build

---

## 🎯 Arquitetura

```
Vercel (Frontends)              Render (API)
├─ CMS (/)              →       ├─ Express
├─ Editor (/editor)     ←───→   ├─ Socket.IO
└─ /api/* (proxy)       ────→   └─ node-cron
```

---

## ⚙️ Comandos

```bash
# Testar build localmente
pnpm build:vercel

# Ver resultado
npx serve dist -l 3000
```

---

## 🔗 Links Úteis

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Render Dashboard:** https://dashboard.render.com
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Guia Completo:** [docs/DEPLOY_GUIDE.md](docs/DEPLOY_GUIDE.md)

---

## ✅ Checklist Mínimo

Antes de fazer deploy:

- [ ] MongoDB Atlas configurado
- [ ] MONGODB_URI salvo
- [ ] JWT_SECRET gerado
- [ ] Código no GitHub/GitLab
- [ ] vercel.json revisado
- [ ] render.yaml revisado

---

**Custo Total:** $0/mês (100% grátis!)

**Performance:**
- Frontends: ~20-50ms (Vercel edge no Brasil)
- API: ~120-180ms (Render us-east-1)
