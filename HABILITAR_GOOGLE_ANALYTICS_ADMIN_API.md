# Como Habilitar a Google Analytics Admin API

## 🎯 Problema

Ao tentar listar propriedades do Google Analytics, você recebe o erro:

```
Google Analytics Admin API has not been used in project 327065550565
before or it is disabled.
```

## ✅ Solução (1 minuto)

### Passo 1: Acesse o Google Cloud Console

**Link direto para seu projeto:**
https://console.developers.google.com/apis/api/analyticsadmin.googleapis.com/overview?project=327065550565

### Passo 2: Faça Login

- Use sua conta Google (leonardo@metakosmos.com.br ou outra)
- A mesma conta que você usou para criar o projeto OAuth

### Passo 3: Clique em "ENABLE" (ATIVAR)

Você verá uma tela assim:

```
┌─────────────────────────────────────────────┐
│  Google Analytics Admin API                 │
│                                              │
│  [  ENABLE  ]  ← CLIQUE AQUI                │
│                                              │
│  Description: Manage Google Analytics        │
│  accounts and properties                     │
└─────────────────────────────────────────────┘
```

### Passo 4: Aguarde (2-5 minutos)

Após clicar em "Enable":
- ✅ API será ativada automaticamente
- ⏳ Aguarde 2-5 minutos para propagação
- 🔄 Pode fechar a aba

### Passo 5: Teste Novamente

1. Volte ao editor do LyntFlow
2. Crie/abra um Data Source node
3. Selecione "Google Analytics"
4. Selecione sua conexão
5. **Agora deve listar as propriedades!** 🎉

---

## 🤔 E se eu não tiver acesso ao Google Cloud Console?

Se você não é o administrador do projeto ou não tem permissão:

### Opção 1: Pedir para o Administrador

Envie este link para quem criou o projeto OAuth:
```
https://console.developers.google.com/apis/api/analyticsadmin.googleapis.com/overview?project=327065550565
```

E peça para clicar em "Enable".

### Opção 2: Usar Property ID Manual (Workaround)

Se não conseguir habilitar a API, você pode fornecer o Property ID manualmente:

1. **Encontrar seu Property ID:**
   - Vá para https://analytics.google.com/
   - Clique em "Admin" (⚙️ ícone de engrenagem)
   - No menu "Property", clique em "Property Settings"
   - Copie o **PROPERTY ID** (um número como `123456789`)

2. **Usar no LyntFlow:**
   - No campo "GA4 Property ID", digite o número
   - Exemplo: `380149142`

---

## 📋 Checklist

- [ ] Acessei o Google Cloud Console
- [ ] Fiz login com minha conta Google
- [ ] Cliquei em "ENABLE" na Google Analytics Admin API
- [ ] Aguardei 2-5 minutos
- [ ] Testei no LyntFlow novamente
- [ ] Propriedades estão listando! ✅

---

## ❓ Troubleshooting

### "Não consigo acessar o link"

**Causa:** Você não tem permissão no projeto 327065550565

**Solução:**
- Use a conta Google que criou o projeto OAuth
- OU peça para o administrador do projeto habilitar a API
- OU use o workaround do Property ID manual

---

### "API está habilitada mas ainda dá erro 403"

**Causa:** Propagação ainda não completou

**Solução:**
- Aguarde mais 5-10 minutos
- Limpe cache do navegador (Ctrl+Shift+Delete)
- Tente novamente

---

### "Não sei qual é meu Property ID"

**Solução:**

1. Vá para https://analytics.google.com/
2. Clique em **"Admin"** (ícone de engrenagem no canto inferior esquerdo)
3. Na coluna do meio (Property), clique em **"Property Settings"**
4. Você verá:
   ```
   Property Details
   Property name: Meu Site
   Property ID: 380149142  ← ESTE É O ID
   ```
5. Copie o número

---

## 🎥 Tutorial em Vídeo (Alternativa)

Se preferir ver um tutorial visual, procure no YouTube:
- "How to enable Google Analytics Admin API"
- "Enable API in Google Cloud Console"

---

## 🔐 Informações Técnicas

**API que precisa ser habilitada:**
- Nome: Google Analytics Admin API
- ID: `analyticsadmin.googleapis.com`
- Versão: v1alpha
- Documentação: https://developers.google.com/analytics/devguides/config/admin/v1

**Scopes OAuth necessários:**
- `https://www.googleapis.com/auth/analytics.readonly` ✅
- `https://www.googleapis.com/auth/analytics` ✅

**Endpoints utilizados:**
- `GET https://analyticsadmin.googleapis.com/v1alpha/accountSummaries`

---

## ✅ Após Habilitar a API

Você poderá:
- ✅ Listar todas as suas contas Google Analytics
- ✅ Listar todas as propriedades GA4
- ✅ Selecionar propriedades em dropdown
- ✅ Selecionar métricas e dimensões customizadas
- ✅ Executar queries no GA4 automaticamente

**Não será mais necessário fornecer Property ID manualmente!** 🎉

---

## 📞 Precisa de Ajuda?

Se ainda tiver problemas:
1. Verifique se está usando a conta correta
2. Confirme que o projeto 327065550565 é seu
3. Aguarde pelo menos 10 minutos após habilitar
4. Tente desconectar e reconectar a conta no LyntFlow

---

**Boa sorte!** 🚀
