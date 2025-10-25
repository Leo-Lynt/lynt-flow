# FlowForge 🚀

**Visual Flow Programming Platform** - Plataforma de programação visual baseada em nodes para criar workflows e automações.

---

## 📚 Documentação

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Guia completo de arquitetura (LEIA PRIMEIRO para trabalhar com IA)
- **[docs/](./docs/)** - Documentação técnica e guias

---

## 🏗️ Estrutura Rápida

```
lynt-flow/
├── packages/
│   ├── core/           # Motor de execução puro (compartilhado)
│   ├── api/            # Backend Node.js + Express
│   ├── editor/         # Editor visual Vue.js
│   └── cms/            # CMS/Dashboard Vue.js
├── docs/               # Documentação técnica
├── .npmrc              # Configuração do pnpm
├── pnpm-workspace.yaml # Configuração do monorepo
└── start-all.bat       # Script para iniciar todos os serviços
```

---

## 🚀 Quick Start

### Instalação
```bash
pnpm install
```

### Desenvolvimento
```bash
pnpm dev           # Inicia API + Editor
pnpm dev:api       # Apenas API (porta 3001)
pnpm dev:editor    # Apenas Editor (porta 5175)
pnpm dev:cms       # Apenas CMS (porta 5174)
```

### Build
```bash
pnpm build         # Build completo (core + api + editor + cms)
pnpm build:api     # API não precisa build (Node.js runtime)
pnpm build:core    # Core não precisa build (pure JS)
pnpm build:editor  # Build do editor
pnpm build:cms     # Build do CMS
```

---

## 📦 Pacotes

### **@leo-lynt/lynt-flow-core** (Pure JS Engine)
Motor de execução puro sem dependências de browser/UI.

**Exports:**
```javascript
import { FlowEngine, TypeEngine, AutoExecutionEngine, deepClone } from '@leo-lynt/lynt-flow-core'
import { loadNodeCatalog, initializeEngine } from '@leo-lynt/lynt-flow-core/engine'
import { security, storage } from '@leo-lynt/lynt-flow-core/utils'
```

### **@flow-forge/api** (Node.js Backend)
API REST para gerenciamento de flows, usuários, execuções e integrações.

**Features:**
- Autenticação JWT
- CRUD de flows
- Execução de flows no servidor
- Webhooks e schedulers
- Integrações (Google Sheets, MySQL, PostgreSQL, etc)

### **@flow-forge/editor** (Vue.js App)
Editor visual de flows.

**Features:**
- Editor visual de flows (Vue Flow)
- Sistema de tipos dinâmicos
- Preview de execução em tempo real
- Integração com Core engine

### **flow-forge** (Vue.js CMS)
Dashboard e gerenciamento de flows.

**Features:**
- Gerenciamento de flows
- Histórico de execuções
- Gerenciamento de usuários
- Analytics

---

## 🎯 Conceitos Principais

### **Nodes** (config/nodes.json)
Blocos funcionais do sistema (Input, Output, Math, Connector, etc).

```json
{
  "type": "input",
  "label": "Input",
  "category": "io",
  "method": "lib/methods/io/input.js:execute",
  "handles": { ... }
}
```

### **Registry**
Carrega e gerencia métodos dos nodes. Cada ambiente tem seu próprio registry:
- **Core**: Métodos puros
- **Frontend**: Métodos puros + browser (connector, output)

### **Loader**
Carrega `nodes.json` e popula o registry.

### **Executor**
Executa nodes seguindo o grafo de dependências.

---

## ⚠️ Regras Importantes

### ✅ **Utilitários no Core**
```javascript
// ✅ Correto
import { deepClone } from '@flow-forge/core'
import { detectValueType } from '@flow-forge/core/engine/dataTypes.js'

// ❌ Errado - Não duplicar
import { deepClone } from './utils/deepClone.js'
```

### ⚠️ **Duplicações Justificadas**
Alguns arquivos existem em ambos (core + frontend):
- `registry.js` - Estratégias diferentes de module loading
- `loader.js` - Depende do registry local
- `executor.js` - Frontend tem features de UI
- `typeSystem.js` - Frontend tem dynamic handles
- `connector.js` - Frontend usa OAuth/Browser APIs
- `output.js` - Frontend usa download/clipboard

**Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para detalhes.**

---

## 🧪 Testing

```bash
# Testar build
pnpm build

# Verificar tipos
# (Adicionar testes no futuro)
```

---

## 📝 Workflow de Desenvolvimento

### Adicionando novo Node

1. **Adicionar em `config/nodes.json`**
```json
{
  "type": "myNewNode",
  "label": "My New Node",
  "category": "processors",
  "method": "lib/methods/processors/myNewNode.js:execute"
}
```

2. **Criar método em `packages/core/src/methods/processors/myNewNode.js`**
```javascript
export async function execute(inputs, config) {
  // Implementação
  return { output: result }
}
```

3. **Atualizar registry do frontend** (se necessário)
```javascript
// packages/editor/src/engine/registry.js
const coreMethodsMap = {
  // ...
  'lib/methods/processors/myNewNode.js': () => import('@core-methods/processors/myNewNode.js'),
}
```

4. **Testar**
```bash
pnpm dev
```

---

## 🔧 Stack Tecnológico

- **Core**: Pure JavaScript (ES Modules)
- **Frontend**: Vue 3 + Vite + Pinia + Vue Flow
- **Monorepo**: pnpm workspaces
- **Styling**: Tailwind CSS
- **Build**: Vite

---

## 📈 Roadmap

- [ ] API Backend (Node.js + Express)
- [ ] Testes automatizados
- [ ] CI/CD
- [ ] Documentação de API
- [ ] Marketplace de nodes customizados

---

## 🤖 Trabalhando com IA neste projeto

**SEMPRE consulte [ARCHITECTURE.md](./ARCHITECTURE.md) antes de fazer mudanças.**

Quick checklist:
- [ ] Li ARCHITECTURE.md?
- [ ] Utilitário já existe no core?
- [ ] Preciso duplicar? (Justifique!)
- [ ] Testei build após mudanças?

---

## 📄 License

MIT

---

**Versão:** 0.1.0
**Status:** Em Desenvolvimento Ativo
