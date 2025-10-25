# Guia de Criação de Nodes

Este guia explica o processo completo para criar um novo node no LyntFlow.

## Visão Geral

Um node no LyntFlow consiste em:
1. **Método de execução** - Lógica do node (JavaScript com ES Modules)
2. **Definição no catálogo** - Configuração no `nodes.json`
3. **Template visual** - Componente Vue para renderização (opcional)

## Estrutura de Arquivos

```
flow-forge/
├── packages/
│   ├── core/
│   │   └── src/
│   │       ├── methods/
│   │       │   └── processors/
│   │       │       └── round.js          # 1. Método de execução
│   │       └── config/
│   │           └── nodes.json            # 2. Definição do node
│   └── frontend/
│       └── src/
│           └── components/
│               └── FlowCanvas.vue        # 3. Template visual (opcional)
```

## Passo a Passo

### 1. Criar o Método de Execução

Crie o arquivo do método em `packages/core/src/methods/<categoria>/<nome>.js`

**Exemplo:** `packages/core/src/methods/processors/round.js`

```javascript
/**
 * Round Operation
 * Arredonda um valor numérico para um número específico de casas decimais
 */

import { unwrapData } from '../../utils/dataUtils.js'

/**
 * Executa a operação do node
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node (propriedades definidas pelo usuário)
 * @param {Object} params.inputs - Inputs recebidos de outros nodes
 * @param {Object} params.context - Contexto de execução do flow
 * @returns {any} Resultado da operação
 */
export function execute({ nodeData, inputs, context }) {
  // 1. Extrair inputs (usar unwrapData para desempacotar valores)
  const valueInput = inputs['data-value'] // key do input definido no nodes.json
  const unwrapped = unwrapData(valueInput)
  const value = parseFloat(unwrapped)

  // 2. Validar input
  if (isNaN(value)) {
    throw new Error(`Valor não é um número válido: ${unwrapped}`)
  }

  // 3. Obter configuração do node
  const decimalPlaces = nodeData?.decimalPlaces

  // 4. Executar lógica
  if (decimalPlaces === null || decimalPlaces === undefined || decimalPlaces === '') {
    return value
  }

  const places = parseInt(decimalPlaces)
  if (isNaN(places) || places < 0) {
    return value
  }

  // 5. Retornar resultado
  return Number(value.toFixed(places))
}

/**
 * Valida configuração do node
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

  // Validar campos obrigatórios e regras
  if (nodeData.decimalPlaces !== null && nodeData.decimalPlaces !== undefined) {
    const places = parseInt(nodeData.decimalPlaces)
    if (isNaN(places) || places < 0 || places > 10) {
      errors.push('Casas decimais deve ser um número entre 0 e 10')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
```

**Convenções importantes:**
- Use `unwrapData()` para extrair valores dos inputs
- Keys dos inputs devem ter prefixo `data-` (ex: `inputs['data-value']`)
- Sempre exporte uma função `execute()` e opcionalmente `validate()`
- Use ES Modules (`import/export`)

---

### 2. Adicionar Definição no Catálogo

Edite `packages/core/src/config/nodes.json` e adicione a definição do node:

```json
{
  "type": "round",
  "label": "Round",
  "category": "operations",
  "description": "Arredonda um número para casas decimais específicas",
  "icon": "material-symbols:dialpad-rounded",
  "color": "#a855f7",
  "method": "lib/methods/processors/round.js:execute",
  "validator": "lib/methods/processors/round.js:validate",
  "component": "GenericNode",
  "handles": {
    "inputs": {
      "execution": [],
      "data": [
        {
          "id": "data-value",
          "label": "Value",
          "type": "number",
          "position": "left",
          "required": true
        }
      ]
    },
    "outputs": {
      "execution": [],
      "data": [
        {
          "id": "data-out",
          "label": "Result",
          "type": "number",
          "position": "right"
        }
      ]
    }
  },
  "config": {
    "decimalPlaces": {
      "type": "number",
      "label": "Casas Decimais",
      "required": true,
      "default": 2,
      "min": 0,
      "max": 10,
      "placeholder": "2",
      "description": "Número de casas decimais para arredondar"
    }
  },
  "execution": {
    "mode": "auto",
    "async": false,
    "timeout": 1000
  }
}
```

**Campos importantes:**

- **type**: ID único do node (kebab-case)
- **label**: Nome exibido na UI
- **category**: Categoria do node (ver lista de categorias no nodes.json)
- **icon**: Ícone do Iconify (https://icon-sets.iconify.design/)
- **color**: Cor em hexadecimal
- **method**: Caminho do método no formato `lib/methods/<path>:<function>`
- **validator**: Caminho da função de validação (opcional)
- **component**: Componente Vue para renderização (geralmente `GenericNode`)
- **handles.inputs.data**: Inputs de dados do node
  - **id**: ID do handle (use prefixo `data-`)
  - **type**: Tipo de dado (`number`, `string`, `array`, `object`, `any`)
- **handles.outputs.data**: Outputs de dados do node
- **config**: Propriedades configuráveis no painel de propriedades
  - **type**: Tipo do campo (`string`, `number`, `select`, `boolean`, etc.)
  - **required**: Se o campo é obrigatório
  - **default**: Valor padrão
  - **min/max**: Validação para números
- **execution.mode**: `auto` (executa automaticamente) ou `manual`

---

### 3. Adicionar Template Visual (Opcional)

Edite `packages/editor/src/components/FlowCanvas.vue` e adicione o template:

```vue
<template #node-round="props">
  <GenericNode v-bind="props" />
</template>
```

Adicione após os outros nodes matemáticos (add, subtract, multiply, divide).

**Nota:** A maioria dos nodes usa `GenericNode` que renderiza automaticamente baseado na definição do `nodes.json`. Apenas nodes com UI customizada precisam de componentes específicos. Este passo é opcional - se não adicionar, o node funcionará mas pode não renderizar corretamente no canvas.

---

## Limpar Cache (Desenvolvimento)

Após criar/modificar um node, limpe o cache da API:

```bash
curl -X POST http://localhost:3001/api/nodes/clear-cache
```

Ou reinicie o servidor da API.

---

## Testando o Node

1. **No Frontend:**
   - Recarregue a página
   - O node deve aparecer na sidebar na categoria correta
   - Arraste para o canvas
   - Configure as propriedades no painel lateral
   - Conecte inputs/outputs
   - Execute o flow

2. **Na API:**
   - Teste via rota `/api/flows/:id/execute`
   - Verifique logs do servidor para erros
   - O node deve carregar automaticamente do core

---

## Checklist de Criação de Node

- [ ] Método criado em `packages/core/src/methods/<categoria>/<nome>.js`
- [ ] Funções `execute()` e opcionalmente `validate()` exportadas
- [ ] Definição adicionada em `packages/core/src/config/nodes.json`
- [ ] Template visual em `packages/editor/src/components/FlowCanvas.vue` (opcional)
- [ ] Cache limpo na API (`POST /api/nodes/clear-cache`)
- [ ] Testado no frontend e API

---

## Categorias Disponíveis

- **data-input**: Data & Input (connectors, input, constants, variables)
- **logic-control**: Logic & Control (conditionals, loops, comparisons)
- **operations**: Operations (math, string, conversions)
- **data-processing**: Data Processing (array/object transformations)
- **debug**: Debug & Utilities (debug viewer, markers)
- **organization**: Organization (grouping tools)

---

## Exemplo Completo: Node "Round"

Veja os arquivos criados para o node Round como referência:

1. **Método**: `packages/core/src/methods/processors/round.js`
2. **Definição**: `packages/core/src/config/nodes.json` (procure por `"type": "round"`)
3. **Template**: `packages/editor/src/components/FlowCanvas.vue` (procure por `#node-round`)

---

## Troubleshooting

### "Node type is missing" warning no frontend
- Verifique se o template foi adicionado em `FlowCanvas.vue`
- Template deve seguir o padrão: `#node-<type>="props"`
- Se não adicionar template, o node pode não renderizar corretamente

### "Unsupported node type" na API
- Limpe o cache: `curl -X POST http://localhost:3001/api/nodes/clear-cache`
- Verifique se o método está em `packages/core/src/methods/`
- Verifique o caminho do método no `nodes.json` (deve ser `lib/methods/...`)

### Node não aparece na sidebar
- Recarregue o frontend (Ctrl+Shift+R)
- Verifique se a categoria existe em `nodes.json`
- Verifique se o node foi adicionado no array `nodes` do `nodes.json`
- Verifique a sintaxe JSON (vírgulas, chaves)

### Inputs não funcionam
- Verifique se as keys dos inputs têm prefixo `data-` no `nodes.json`
- Use `inputs['data-<nome>']` no método execute
- Use `unwrapData()` para extrair valores dos inputs

### Cores das edges não aparecem corretas
- As cores são definidas automaticamente pelo tipo do output no `nodes.json`
- O sistema de tipos usa o registry local de cada ambiente (core/frontend/api)
- Cores são definidas em `packages/core/src/engine/dataTypes.json`

### Nodes isolados (sem conexões) são executados
- Nodes não conectados a nada são automaticamente ignorados na execução
- Apenas nodes conectados ou nodes tipo `input` são executados

---

## Recursos Úteis

- **Ícones**: https://icon-sets.iconify.design/
- **Material Symbols**: https://icon-sets.iconify.design/material-symbols/
- **Cores**: https://tailwindcss.com/docs/customizing-colors

---

## Convenções de Código

- Use **kebab-case** para tipos de nodes (`array-filter`, `object-create`)
- Use **camelCase** para propriedades JavaScript
- Use **PascalCase** para componentes Vue
- Prefixe inputs com `data-` (ex: `data-value`, `data-input`)
- Prefixe execution handles com `exec-` (ex: `exec-in`, `exec-out`)
- IDs de handles devem ser únicos dentro do node

---

## Arquitetura do Sistema de Tipos

### Registry Dual (Core vs Frontend)

O LyntFlow usa **dois registries separados**:

1. **Registry do Core** (`packages/core/src/engine/registry.js`)
   - Usado pela API/backend
   - Carrega nodes via `import()` dinâmico do Node.js

2. **Registry do Editor** (`packages/editor/src/engine/registry.js`)
   - Usado pelo frontend/browser
   - Carrega nodes via `import()` dinâmico do Vite
   - Populado pelo `loader.js` ao inicializar o app

**⚠️ IMPORTANTE**: O `FlowCanvas.vue` deve importar do registry **local** do frontend:
```javascript
// ✅ CORRETO
import { getHandleType } from '../engine/typeSystem.js'

// ❌ ERRADO (registry vazio no frontend)
import { getHandleType } from '@flow-forge/core/engine/typeSystem.js'
```

### Fluxo de Carregamento

1. **Frontend inicia** → `loader.js` busca catálogo da API
2. **API retorna** → `nodes.json` com todas as definições
3. **Frontend registra** → Popula registry local com definições
4. **Sistema de tipos** → Usa registry local para resolver tipos dos handles
5. **Cores das edges** → Calculadas baseadas nos tipos dos outputs

### Conexões e Validação

- **Input único**: Cada input de dados só aceita **uma conexão por vez**
- **Remoção automática**: Ao conectar novo output, conexão anterior é removida
- **Handles de execução**: Seguem mesma regra (uma conexão por target handle)
- **Nodes isolados**: Nodes sem conexões são **automaticamente ignorados** na execução

---

**Última atualização**: 2025-10-13
