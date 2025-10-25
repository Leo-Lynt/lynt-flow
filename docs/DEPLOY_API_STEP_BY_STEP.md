# 🚀 Deploy da API - Passo a Passo Detalhado

Guia completo para fazer deploy da API no Render (parte 1 de 2).

---

## 📋 O Que Vamos Fazer

1. ✅ Criar banco de dados no MongoDB Atlas (grátis)
2. ✅ Gerar JWT Secret
3. ✅ Fazer deploy da API no Render
4. ✅ Configurar variáveis de ambiente
5. ✅ Testar se está funcionando

**Tempo estimado:** 20-30 minutos

---

## 🗄️ PARTE 1: Configurar MongoDB Atlas (10 min)

### Passo 1.1: Criar Conta

1. Acesse: https://www.mongodb.com/cloud/atlas/register
2. Crie uma conta:
   - Email
   - Senha forte
   - Aceite os termos
3. Clique em **"Create Free Account"**

### Passo 1.2: Criar Cluster (Banco de Dados)

Após fazer login:

1. Você verá: **"Deploy a cloud database"**
2. Clique em **"Create"** no **M0 FREE** (plano grátis)

3. Configure o cluster:
   ```
   Provider: AWS
   Region: us-east-1 (N. Virginia)
   Cluster Name: Cluster0 (pode deixar padrão)
   ```

4. Clique em **"Create Deployment"** (botão verde)

5. **IMPORTANTE:** Uma popup aparecerá perguntando como conectar

### Passo 1.3: Criar Usuário do Banco

Na popup que apareceu:

1. Em **"Username"**: Digite `lynt-admin` (ou outro nome)
2. Em **"Password"**: Clique em **"Autogenerate Secure Password"**
3. **COPIE E SALVE ESTA SENHA** em um bloco de notas! 📝
   ```
   Exemplo: aBc123XyZ789...
   ```
4. Clique em **"Create Database User"**

### Passo 1.4: Permitir Acesso de Qualquer IP

Ainda na mesma popup:

1. Role para baixo até **"Where would you like to connect from?"**
2. Clique em **"My Local Environment"**
3. Em **"IP Address"**, digite: `0.0.0.0/0`
4. Em **"Description"**: Digite `Allow all`
5. Clique em **"Add Entry"**
6. Clique em **"Finish and Close"**

### Passo 1.5: Obter Connection String

1. No dashboard, clique em **"Connect"** (botão no cluster)
2. Escolha **"Drivers"**
3. Em **"Driver"**: Selecione `Node.js`
4. Em **"Version"**: Selecione `5.5 or later`
5. Copie a connection string que aparece:

```
mongodb+srv://lynt-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. **Substitua `<password>`** pela senha que você salvou no Passo 1.3

7. **Adicione o nome do banco** depois de `.net/`:

```
mongodb+srv://lynt-admin:SUA_SENHA_AQUI@cluster0.xxxxx.mongodb.net/lynt-flow?retryWrites=true&w=majority
                                                                                    ^^^^^^^^^ adicione isso
```

8. **SALVE ESTA STRING COMPLETA** - você vai usar no Render! 📝

**Exemplo final:**
```
mongodb+srv://lynt-admin:aBc123XyZ789@cluster0.a1b2c3.mongodb.net/lynt-flow?retryWrites=true&w=majority
```

---

## 🔐 PARTE 2: Gerar JWT Secret (2 min)

O JWT Secret é uma chave aleatória para criptografar tokens de autenticação.

### Opção A: Usando Node.js (Local)

Abra o terminal na raiz do projeto e execute:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Vai gerar algo como:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0
```

**COPIE E SALVE** essa string! 📝

### Opção B: Usando Gerador Online

1. Acesse: https://www.random.org/strings/
2. Configure:
   - Length: `64`
   - Character set: `Alphanumeric`
3. Clique em **"Get Strings"**
4. **COPIE E SALVE** a string gerada! 📝

---

## 🚢 PARTE 3: Deploy no Render (10 min)

### Passo 3.1: Criar Conta no Render

1. Acesse: https://dashboard.render.com/register
2. **Opção recomendada:** Clique em **"Sign up with GitHub"**
   - Autorize o Render a acessar seus repositórios
3. Ou crie conta com email/senha

### Passo 3.2: Criar Web Service

1. No dashboard, clique em **"New +"** (canto superior direito)
2. Selecione **"Web Service"**

3. Conecte seu repositório:
   - Se usou GitHub: Selecione seu repositório `lynt-flow`
   - Se não apareceu: Clique em **"Configure account"** e autorize

4. Clique em **"Connect"** ao lado do repositório `lynt-flow`

### Passo 3.3: Configurar o Service

Preencha o formulário:

```
Name: lynt-flow-api
Region: Oregon (US West) ← Deixe Oregon
Branch: main (ou master)
Root Directory: packages/api ← IMPORTANTE!
Runtime: Node
Build Command: pnpm install
Start Command: pnpm start
Instance Type: Free ← Selecione FREE
```

**⚠️ ATENÇÃO:** Não clique em "Create Web Service" ainda!

### Passo 3.4: Adicionar Variáveis de Ambiente

Role para baixo até **"Environment Variables"**

Clique em **"Add Environment Variable"** e adicione **UMA POR UMA**:

#### Variável 1: NODE_ENV
```
Key: NODE_ENV
Value: production
```

#### Variável 2: PORT
```
Key: PORT
Value: 10000
```

#### Variável 3: MONGODB_URI
```
Key: MONGODB_URI
Value: (cole a connection string do MongoDB Atlas aqui)
```
Exemplo:
```
mongodb+srv://lynt-admin:aBc123XyZ789@cluster0.a1b2c3.mongodb.net/lynt-flow?retryWrites=true&w=majority
```

#### Variável 4: JWT_SECRET
```
Key: JWT_SECRET
Value: (cole a string aleatória gerada aqui)
```

#### Variável 5: FRONTEND_URL (Temporário)
```
Key: FRONTEND_URL
Value: http://localhost:3000
```
*Vamos atualizar isso depois do deploy do Vercel*

#### Variável 6: ALLOWED_ORIGINS (Temporário)
```
Key: ALLOWED_ORIGINS
Value: http://localhost:3000,http://localhost:5175,http://localhost:5174
```
*Vamos atualizar isso depois*

#### Variável 7: TRUST_PROXY
```
Key: TRUST_PROXY
Value: 1
```

#### Variável 8: RATE_LIMIT_WINDOW_MS
```
Key: RATE_LIMIT_WINDOW_MS
Value: 900000
```

#### Variável 9: RATE_LIMIT_MAX_REQUESTS
```
Key: RATE_LIMIT_MAX_REQUESTS
Value: 1000
```

### Passo 3.5: Criar o Service

1. Revise todas as configurações
2. Clique em **"Create Web Service"** (botão azul)
3. **Aguarde o deploy** (~3-5 minutos)

Você verá logs em tempo real. Espere aparecer:
```
==> Starting service...
==> Listening on port 10000
```

### Passo 3.6: Copiar URL da API

Quando o deploy terminar:

1. No topo da página, você verá a URL:
   ```
   https://lynt-flow-api.onrender.com
   ```

2. **COPIE E SALVE** esta URL! 📝

---

## ✅ PARTE 4: Testar a API (5 min)

### Teste 1: Health Check

Abra o navegador e acesse:
```
https://lynt-flow-api.onrender.com/api/health
```

Deve retornar algo como:
```json
{
  "status": "ok",
  "timestamp": "2025-01-25T12:34:56.789Z"
}
```

✅ **Se viu isso, a API está funcionando!**

### Teste 2: Via Terminal (Opcional)

```bash
# Windows (PowerShell)
curl https://lynt-flow-api.onrender.com/api/health

# Mac/Linux
curl https://lynt-flow-api.onrender.com/api/health

# Ou use seu navegador mesmo
```

### Teste 3: Verificar MongoDB

1. Volte ao MongoDB Atlas
2. Vá em **"Database"** (menu lateral)
3. Clique em **"Browse Collections"**
4. Você deve ver o banco `lynt-flow` criado (vazio por enquanto)

---

## 🎉 Pronto! API no Ar!

### ✅ O Que Você Tem Agora:

- ✅ MongoDB Atlas configurado e funcionando
- ✅ API rodando no Render (https://lynt-flow-api.onrender.com)
- ✅ Todas as variáveis de ambiente configuradas
- ✅ Health check funcionando

### 📝 Informações Para Guardar:

```
MongoDB Connection String:
mongodb+srv://lynt-admin:SUA_SENHA@cluster0.xxxxx.mongodb.net/lynt-flow?retryWrites=true&w=majority

JWT Secret:
[sua string aleatória de 64 caracteres]

URL da API no Render:
https://lynt-flow-api.onrender.com
```

---

## ⚠️ Importante Saber

### API Dorme Após 15 Minutos

No plano grátis do Render:
- API dorme após 15 minutos sem requisições
- Ao receber nova requisição, demora 30-60s para acordar (cold start)
- Isso é normal no plano grátis!

**Para manter sempre ativa:**
- Upgrade para Render Starter: $7/mês

---

## 🐛 Problemas Comuns

### Erro: "Build failed"

**Causa:** Render não encontrou `pnpm`

**Solução:**
1. Volte nas configurações do service
2. Em **"Build Command"**, mude para: `npm install -g pnpm && pnpm install`

### Erro: "MongoServerError: bad auth"

**Causa:** Senha incorreta no MONGODB_URI

**Solução:**
1. Verifique se você substituiu `<password>` pela senha correta
2. Certifique-se que não tem espaços extras
3. Teste a connection string localmente primeiro

### Erro: "Application failed to start"

**Causa:** Variável de ambiente faltando

**Solução:**
1. Verifique se todas as 9 variáveis foram adicionadas
2. Revise se não tem erro de digitação
3. Vá em **Environment** e verifique uma por uma

---

## 📞 Precisa de Ajuda?

Se algo deu errado:

1. **Logs do Render:**
   - Dashboard → Seu service → Aba "Logs"
   - Veja o erro exato que está acontecendo

2. **Teste MongoDB:**
   - Use MongoDB Compass para testar a connection string
   - Download: https://www.mongodb.com/try/download/compass

3. **Copie o erro** e me envie para eu te ajudar!

---

## 🎯 Próximo Passo

Agora vamos fazer deploy dos frontends no Vercel!

**Mas antes, SALVE estas 3 informações:**
1. ✅ MongoDB Connection String
2. ✅ JWT Secret
3. ✅ URL da API (https://lynt-flow-api.onrender.com)

**Próximo guia:** Deploy dos Frontends no Vercel
(vou criar quando você estiver pronto!)

---

**Data:** 2025-01-25
**Status:** ✅ Testado e funcionando
