# Deploy dos Frontends no Vercel - Passo a Passo

Este guia vai te ajudar a fazer deploy do CMS e Editor no Vercel em aproximadamente **10-15 minutos**.

## 📋 Pré-requisitos

Antes de começar, você precisa:

- ✅ API já deployada no Render (você já tem!)
- ✅ URL da API do Render (exemplo: `https://lynt-flow-api.onrender.com`)
- ✅ Conta no GitHub com o repositório (você já tem!)
- 📝 Conta no Vercel (vamos criar se necessário)

---

## Parte 1: Atualizar vercel.json com URL da API (2 min)

### 1.1 Pegar a URL da sua API no Render

1. Acesse o dashboard do Render: https://dashboard.render.com
2. Clique no seu serviço **lynt-flow-api**
3. Na parte superior, você verá a URL (exemplo: `https://lynt-flow-api.onrender.com`)
4. **Copie essa URL completa**

### 1.2 Atualizar o vercel.json

Você precisa editar o arquivo `vercel.json` e substituir `YOUR-API-NAME` pela URL real da sua API.

**Exemplo:**
Se sua URL for `https://lynt-flow-api.onrender.com`, o arquivo deve ficar:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://lynt-flow-api.onrender.com/api/:path*"
    }
  ]
}
```

**⚠️ Importante**: Já vou fazer essa atualização para você no próximo passo!

---

## Parte 2: Criar conta e fazer deploy no Vercel (10 min)

### 2.1 Acessar o Vercel

1. Acesse: https://vercel.com/signup
2. Clique em **"Continue with GitHub"**
3. Faça login com sua conta do GitHub
4. Autorize o Vercel a acessar seus repositórios

### 2.2 Importar o Projeto

1. No dashboard do Vercel, clique em **"Add New..."** → **"Project"**
2. Você verá uma lista dos seus repositórios do GitHub
3. Procure por **"lynt-flow"** (ou o nome do seu repositório)
4. Clique em **"Import"** ao lado do repositório

### 2.3 Configurar o Build

Na tela de configuração do projeto:

1. **Project Name**: Deixe como `lynt-flow` (ou escolha outro nome)
2. **Framework Preset**: Selecione **"Other"** (não é React, Vue, etc - é customizado)
3. **Root Directory**: Deixe em branco ou **"."** (raiz do projeto)
4. **Build Command**:
   ```bash
   pnpm build:vercel
   ```
5. **Output Directory**:
   ```
   dist
   ```
6. **Install Command**: Deixe em branco (Vercel detecta o pnpm automaticamente)

### 2.4 Environment Variables (Opcional)

Por enquanto, **não precisa adicionar nenhuma variável de ambiente**. O frontend vai usar a API através do proxy configurado no vercel.json.

### 2.5 Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (2-3 minutos)
3. ✅ Quando aparecer "Congratulations!" está pronto!

### 2.6 Acessar sua aplicação

1. Você verá três links:
   - **CMS**: `https://seu-projeto.vercel.app/` (raiz)
   - **Editor**: `https://seu-projeto.vercel.app/editor/` (rota /editor)
   - **API (proxy)**: `https://seu-projeto.vercel.app/api/*` (proxeado para Render)

2. **Copie a URL principal** (exemplo: `https://lynt-flow.vercel.app`)

---

## Parte 3: Atualizar variáveis de ambiente da API (5 min)

Agora que você tem a URL do Vercel, precisa atualizar a API para aceitar requisições dessa origem.

### 3.1 Acessar o Render

1. Volte para o dashboard do Render: https://dashboard.render.com
2. Clique no serviço **lynt-flow-api**
3. No menu esquerdo, clique em **"Environment"**

### 3.2 Atualizar FRONTEND_URL

1. Procure a variável **FRONTEND_URL**
2. Clique no ícone de editar (lápis)
3. Substitua `https://YOUR-VERCEL-DOMAIN.vercel.app` pela **URL real do Vercel**
   - Exemplo: `https://lynt-flow.vercel.app`
4. Clique em **"Save Changes"**

### 3.3 Atualizar ALLOWED_ORIGINS

1. Procure a variável **ALLOWED_ORIGINS**
2. Clique no ícone de editar (lápis)
3. Substitua `https://YOUR-VERCEL-DOMAIN.vercel.app` pela **URL real do Vercel**
   - Exemplo: `https://lynt-flow.vercel.app`
4. Clique em **"Save Changes"**

### 3.4 Deploy automático

O Render vai automaticamente fazer redeploy da API com as novas variáveis. Aguarde 1-2 minutos.

---

## Parte 4: Testar tudo funcionando (5 min)

### 4.1 Testar o CMS

1. Acesse `https://seu-projeto.vercel.app/`
2. Você deve ver a interface do CMS
3. Tente fazer login ou criar uma conta

### 4.2 Testar o Editor

1. Acesse `https://seu-projeto.vercel.app/editor/`
2. Você deve ver a interface do Flow Editor
3. Tente criar um novo flow

### 4.3 Testar a API (proxy)

1. Abra o DevTools do navegador (F12)
2. Vá para a aba **Network**
3. Faça qualquer ação que chame a API (login, criar flow, etc)
4. Você deve ver requisições para `/api/*` funcionando
5. **Status 200** = sucesso! ✅

### 4.4 Verificar CORS

Se você ver erros de CORS no console:

1. Verifique se o ALLOWED_ORIGINS está correto no Render
2. Certifique-se que não tem barra `/` no final da URL
3. Aguarde o redeploy da API completar

---

## 🎉 Sucesso!

Se tudo funcionou, você agora tem:

- ✅ **CMS** rodando no Vercel: `https://seu-projeto.vercel.app/`
- ✅ **Editor** rodando no Vercel: `https://seu-projeto.vercel.app/editor/`
- ✅ **API** rodando no Render com CORS configurado
- ✅ Proxy automático do Vercel para a API

---

## 📝 Informações importantes para salvar

```
===========================================
  DEPLOYMENT INFO - SALVE ESSAS INFOS!
===========================================

VERCEL (Frontends)
------------------
URL: https://_____________________.vercel.app
CMS: https://_____________________.vercel.app/
Editor: https://_____________________.vercel.app/editor/

RENDER (API)
------------------
URL: https://_____________________.onrender.com

INTEGRAÇÃO
------------------
Frontend → /api/* → Proxy → Render API
CORS configurado: ✅
```

---

## 🔄 Próximos deploys

Depois do primeiro deploy, é muito simples:

1. **Faça commit e push** no GitHub
2. **Vercel detecta automaticamente** e faz redeploy
3. **Render detecta automaticamente** e faz redeploy (se mudou a API)

Pronto! 🚀

---

## ❌ Troubleshooting

### Erro: "CORS policy"
- Verifique ALLOWED_ORIGINS no Render
- Certifique-se que a URL está exatamente igual (sem barra no final)
- Aguarde o redeploy da API

### Erro: "API request failed"
- Verifique se a API está online no Render
- Verifique se o vercel.json tem a URL correta da API
- Verifique o proxy no DevTools (Network tab)

### Build falhou no Vercel
- Verifique se o Build Command está correto: `pnpm build:vercel`
- Verifique se o Output Directory está correto: `dist`
- Veja os logs do build para detalhes

### Frontend carrega mas está em branco
- Verifique o console do navegador (F12)
- Pode ser erro de rota - certifique-se de acessar `/` para CMS e `/editor/` para Editor

---

## 📚 Próximos passos

Após o deploy:

1. Configure um domínio customizado no Vercel (opcional)
2. Configure SSL/HTTPS (automático no Vercel)
3. Configure monitoramento e logs
4. Configure CI/CD para testes automáticos

---

**Precisa de ajuda?** Chame o Claude! 🤖
