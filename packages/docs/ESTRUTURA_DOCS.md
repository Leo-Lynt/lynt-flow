# 📚 Estrutura da Documentação Lynt Flow

## 🗂️ Nova Organização

A documentação segue esta estrutura:

```
📁 Docs
├── 🏠 Início (Home)
├── 📚 Introdução
│   └── O que é Lynt Flow
├── 🖥️ Usando o Editor
│   ├── Interface
│   ├── Adicionar Nodes
│   ├── Conectar
│   └── Executar
├── 🧩 Nodes (COM PLAYGROUND)
│   ├── Input/Output
│   ├── Data Connector
│   ├── Filter
│   ├── Sort
│   ├── Map
│   ├── Math
│   └── Condition
├── 🔗 Criando Fluxos
│   ├── Conexões
│   ├── Fluxo de Dados
│   └── Debugging
├── 💼 Casos de Uso
│   ├── Filtrar Dados
└── 📖 Referência
    └── FAQ
```

---

## 🎯 Páginas de Nodes (COM PLAYGROUND)

Cada página de node deve ter esta estrutura:

### Template da Página:

```vue
<template>
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-3">Nome do Node</h1>
      <p class="text-gray-600 text-lg">
        Descrição breve do que o node faz
      </p>
    </div>

    <!-- Conteúdo dividido em 2 colunas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

      <!-- COLUNA ESQUERDA: Documentação -->
      <div class="space-y-6">

        <!-- O que faz -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 mb-3">O que faz?</h2>
          <p class="text-gray-700">
            Explicação clara e simples...
          </p>
        </section>

        <!-- Como usar -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 mb-3">Como usar</h2>
          <ol class="list-decimal list-inside space-y-2 text-gray-700">
            <li>Passo 1...</li>
            <li>Passo 2...</li>
            <li>Passo 3...</li>
          </ol>
        </section>

        <!-- Configurações -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 mb-3">Configurações</h2>
          <div class="space-y-3">
            <div class="p-3 bg-gray-50 rounded border">
              <p class="font-semibold text-gray-900">Campo 1</p>
              <p class="text-sm text-gray-600">Descrição...</p>
            </div>
            <!-- mais campos... -->
          </div>
        </section>

        <!-- Exemplo de dados -->
        <section>
          <h2 class="text-xl font-bold text-gray-900 mb-3">Exemplo</h2>
          <div class="space-y-3">
            <div>
              <p class="text-sm font-semibold text-gray-900 mb-1">Entrada:</p>
              <pre class="bg-gray-900 text-green-400 p-3 rounded text-xs">[1, 2, 3, 4, 5]</pre>
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900 mb-1">Saída:</p>
              <pre class="bg-gray-900 text-green-400 p-3 rounded text-xs">[3, 4, 5]</pre>
            </div>
          </div>
        </section>

      </div>

      <!-- COLUNA DIREITA: Playground -->
      <div class="lg:sticky lg:top-24 h-fit">
        <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-3">💪 Experimente</h3>
          <p class="text-sm text-gray-700 mb-4">
            Teste o node diretamente no playground abaixo
          </p>

          <!-- ÁREA DO PLAYGROUND -->
          <div class="bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
            <!-- Aqui vai o iframe do playground -->
            <PlaygroundEmbed :flowId="FLOW_ID_DO_EXEMPLO" />
          </div>

          <div class="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p class="text-xs text-blue-800">
              💡 <strong>Dica:</strong> Clique em "Executar" para ver o resultado
            </p>
          </div>
        </div>
      </div>

    </div>

    <!-- Próximos passos -->
    <div class="mt-12 p-6 bg-gray-50 rounded-lg border">
      <h3 class="text-lg font-bold text-gray-900 mb-3">📚 Próximos passos</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <router-link to="/nodes/outro-node" class="p-3 bg-white rounded border hover:border-purple-500">
          Próximo Node →
        </router-link>
        <router-link to="/use-cases/exemplo" class="p-3 bg-white rounded border hover:border-purple-500">
          Ver caso de uso →
        </router-link>
      </div>
    </div>

  </div>
</template>
```

---

## 🎮 Como Criar Exemplos no Playground

### Passo a Passo:

#### 1. **Crie o fluxo de exemplo no editor**
   - Abra o editor Lynt Flow
   - Crie um fluxo simples que demonstra o node
   - Exemplo para Filter:
     ```
     Input (lista [1,2,3,4,5])
       → Filter (valor > 2)
       → Output
     ```

#### 2. **Salve o fluxo**
   - Clique em "Salvar"
   - Anote o **Flow ID** (aparece na URL)
   - Exemplo: `/editor/abc123` → Flow ID = `abc123`

#### 3. **Use o Flow ID na documentação**
   ```vue
   <PlaygroundEmbed :flowId="'abc123'" />
   ```

#### 4. **Componente PlaygroundEmbed** (você precisa criar):
   ```vue
   <!-- packages/docs/src/components/PlaygroundEmbed.vue -->
   <template>
     <iframe
       :src="`http://localhost:5174/playground/${flowId}`"
       class="w-full h-[500px] border-0"
       title="Playground"
     />
   </template>

   <script setup>
   defineProps({
     flowId: {
       type: String,
       required: true
     }
   })
   </script>
   ```

#### 5. **Rota do Playground** (você precisa criar no editor):
   ```javascript
   // No router do editor
   {
     path: '/playground/:flowId',
     component: PlaygroundView,
     // Este componente deve:
     // 1. Carregar o flow pelo ID
     // 2. Mostrar em modo "view only" ou "editable"
     // 3. Ter botão "Executar" visível
   }
   ```

---

## 📋 Checklist para Cada Node

Quando for documentar um node:

- [ ] Criar fluxo exemplo no editor
- [ ] Salvar e anotar Flow ID
- [ ] Criar página do node (`/nodes/nome-do-node.vue`)
- [ ] Preencher:
  - [ ] O que faz
  - [ ] Como usar (passos)
  - [ ] Configurações (campos)
  - [ ] Exemplo (entrada/saída)
  - [ ] Playground embed (com Flow ID)
  - [ ] Links de próximos passos
- [ ] Adicionar rota no router
- [ ] Testar playground funcionando

---

## 🎨 Exemplos Sugeridos por Node

### Input/Output
**Flow ID:** `example-input-output`
```
Input (texto: "Olá") → Output
```

### Data Connector
**Flow ID:** `example-data-connector`
```
Data Connector (sheets demo) → Output
```

### Filter
**Flow ID:** `example-filter`
```
Input ([1,2,3,4,5]) → Filter (> 2) → Output
```

### Sort
**Flow ID:** `example-sort`
```
Input ([5,2,8,1]) → Sort (ASC) → Output
```

### Map
**Flow ID:** `example-map`
```
Input ([1,2,3]) → Map (x * 2) → Output
```

### Math
**Flow ID:** `example-math`
```
Input (5) → Math (+ 3) → Output
```

### Condition
**Flow ID:** `example-condition`
```
Input (10) → Condition (> 5) → Output (true/false)
```

---

## 📝 Próximos Passos de Implementação

1. **Criar componente PlaygroundEmbed** ✅ Você precisa fazer
2. **Criar rota /playground/:flowId no editor** ✅ Você precisa fazer
3. **Criar fluxos de exemplo** ✅ Você precisa fazer
4. **Criar páginas de nodes** ⏳ Posso ajudar com templates
5. **Criar páginas de editor** ⏳ Posso ajudar
6. **Criar páginas de casos de uso** ⏳ Posso ajudar

---

## 🔧 Tecnicamente, você precisa:

### No Editor (packages/editor):
1. Criar `PlaygroundView.vue` que:
   - Recebe `flowId` via route params
   - Carrega o flow do backend
   - Renderiza em modo "demo" (talvez read-only)
   - Tem botão "Executar" bem visível

### No Docs (packages/docs):
1. Criar `PlaygroundEmbed.vue` que:
   - Recebe `flowId` como prop
   - Renderiza iframe apontando pro editor
   - Trata loading/error states

### Exemplo de PlaygroundView.vue:
```vue
<template>
  <div class="playground-container">
    <div class="top-bar">
      <button @click="executeFlow" class="btn-execute">
        ▶️ Executar
      </button>
    </div>
    <FlowCanvas :flowId="flowId" :readOnly="false" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const flowId = route.params.flowId

// Carregar flow, executar, etc.
</script>
```

---

**Dúvidas?** Me avise e eu crio exemplos mais detalhados!
