# ✅ Checklist - Deploy da API

Use este checklist enquanto segue o guia passo a passo.

---

## 🗄️ MongoDB Atlas

- [ ] Conta criada no MongoDB Atlas
- [ ] Cluster M0 (Free) criado
- [ ] Região: us-east-1 (N. Virginia)
- [ ] Usuário do banco criado (ex: lynt-admin)
- [ ] Senha do banco **SALVA** 📝
- [ ] IP 0.0.0.0/0 adicionado (Allow all)
- [ ] Connection string copiada
- [ ] `<password>` substituída pela senha real
- [ ] `/lynt-flow` adicionado após `.net/`
- [ ] Connection string completa **SALVA** 📝

**Connection String Exemplo:**
```
mongodb+srv://lynt-admin:SUA_SENHA@cluster0.xxxxx.mongodb.net/lynt-flow?retryWrites=true&w=majority
```

---

## 🔐 JWT Secret

- [ ] JWT Secret gerado (64 caracteres aleatórios)
- [ ] JWT Secret **SALVO** 📝

**Comando para gerar:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🚢 Render

### Criar Service
- [ ] Conta criada no Render
- [ ] GitHub conectado ao Render
- [ ] New + → Web Service
- [ ] Repositório `lynt-flow` selecionado

### Configuração
- [ ] Name: `lynt-flow-api`
- [ ] Region: `Oregon (US West)`
- [ ] Branch: `main` (ou `master`)
- [ ] Root Directory: `packages/api` ⚠️
- [ ] Runtime: `Node`
- [ ] Build Command: `pnpm install`
- [ ] Start Command: `pnpm start`
- [ ] Instance Type: `Free`

### Variáveis de Ambiente (9 variáveis)

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `MONGODB_URI` = (connection string do Atlas)
- [ ] `JWT_SECRET` = (string aleatória gerada)
- [ ] `FRONTEND_URL` = `http://localhost:3000` (temporário)
- [ ] `ALLOWED_ORIGINS` = `http://localhost:3000,http://localhost:5175,http://localhost:5174`
- [ ] `TRUST_PROXY` = `1`
- [ ] `RATE_LIMIT_WINDOW_MS` = `900000`
- [ ] `RATE_LIMIT_MAX_REQUESTS` = `1000`

### Deploy
- [ ] "Create Web Service" clicado
- [ ] Deploy em andamento (aguardando...)
- [ ] Deploy concluído (vê "Listening on port 10000" nos logs)
- [ ] URL da API copiada: `https://lynt-flow-api.onrender.com`
- [ ] URL da API **SALVA** 📝

---

## ✅ Testes

- [ ] Health check funcionando: `https://lynt-flow-api.onrender.com/api/health`
- [ ] Retorna JSON: `{"status":"ok","timestamp":"..."}`
- [ ] MongoDB Atlas mostra banco `lynt-flow` criado

---

## 📝 Informações Para Guardar

Salve estas 3 informações em um local seguro:

```
1. MongoDB Connection String:
mongodb+srv://lynt-admin:_________@cluster0._____.mongodb.net/lynt-flow?retryWrites=true&w=majority

2. JWT Secret:
________________________________________________________________

3. URL da API:
https://lynt-flow-api.onrender.com
```

---

## 🎯 Status

- [ ] ✅ API no ar e funcionando
- [ ] ✅ Pronto para deploy dos frontends

---

## ⏭️ Próximo Passo

Quando tudo estiver ✅:
→ Deploy dos Frontends no Vercel
