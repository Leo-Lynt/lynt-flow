# Variable Node - Documentação

## Visão Geral

O **Variable Node** permite armazenar e recuperar valores globais durante a execução de um flow. Funciona em dois modos:

- **SET Mode**: Armazena um valor em uma variável global
- **GET Mode**: Recupera o valor de uma variável global

## Características

### Armazenamento em Memória
- Variáveis são armazenadas **apenas em memória** (não persistem entre sessões)
- Variáveis são **limpas** quando um novo flow é carregado
- Escopo: **sessão atual** do flow no frontend ou execução única no backend

### Tipos Dinâmicos (Wildcard)
- Aceita qualquer tipo de dado (number, string, boolean, array, object)
- Tipo é detectado automaticamente e propagado
- Suporta detecção de tipos específicos (float, integer, etc)

### Reatividade (Frontend)
- **GET Mode**: Re-executa automaticamente quando a variável é modificada
- Não requer `exec-in` ou `exec-out` no modo GET
- **SET Mode**: Requer fluxo de execução (`exec-in`) para garantir ordem

### Ordenação de Execução
- O sistema **garante** que Variable SET executa antes de Variable GET
- Implementado via dependências implícitas na ordenação topológica
- Funciona tanto no frontend quanto no backend (API)

## Modos de Operação

### SET Mode

Armazena um valor em uma variável global.

**Handles:**
- **Input (Execução)**: `exec-in` - Recebe fluxo de execução
- **Input (Dados)**: `data-input` - Valor a ser armazenado (wildcard type)
- **Output (Execução)**: `exec-out` - Continua fluxo após armazenar
- **Output (Dados)**: `data-out` - Retorna o valor armazenado

**Configuração:**
- `variableName`: Nome da variável (alfanumérico, `_`, `-`)

**Exemplo de Uso:**
```
Input (5.37) → Variable SET (nome: "myValue") → Output
```

### GET Mode

Recupera o valor de uma variável global.

**Handles:**
- **Output (Dados)**: `data-out` - Valor recuperado (wildcard type)

**Configuração:**
- `variableName`: Nome da variável a recuperar (dropdown com variáveis existentes)

**Exemplo de Uso:**
```
Variable GET (nome: "myValue") → Math Add → Output
```

## Arquitetura

### Editor (packages/editor)

#### FlowStore (src/stores/flowStore.js)
- **globalVariables** (ref): Armazena variáveis em memória
- **globalVariablesCache** (ref): Cache para detectar mudanças
- **watch()**: Monitora mudanças e re-executa Variable GET reativamente

#### FlowCanvas (src/components/FlowCanvas.vue)
- Inicializa Variable nodes com valores padrão:
  ```javascript
  {
    label: 'Variable',
    mode: 'get',
    variableName: ''
  }
  ```

#### GenericNode (src/components/nodes/GenericNode.vue)
- Renderiza Variable node
- Usa `savedDetectedTypes` para exibir tipo correto
- Suporta wildcard type propagation

### Core (packages/core)

#### Variable Method (src/methods/storage/variable.js)
- **execute()**: Executa SET ou GET
- **validate()**: Valida configuração (variableName obrigatório)
- Validação de segurança: `validateSafeValue()`
- Validação de nome: regex `^[a-zA-Z0-9_-]+$`

#### FlowEngine (src/engine/FlowEngine.js)
- Passa `context.globalVariables` para todos os nodes
- Usa `addVariableDependencies()` para ordenação correta

#### GraphUtils (src/utils/graphUtils.js)
- **addVariableDependencies()**: Cria edges virtuais SET → GET
- Garante que SET executa antes de GET para mesma variável

### Backend API (packages/api)

#### FlowExecutor (src/services/flowExecutor.js)
- Inicializa `context.globalVariables` vazio para cada execução
- Usa `addVariableDependencies()` (cópia da implementação do core)
- Garante ordenação correta na execução via API

## Fluxo de Execução

### 1. Criação do Node
```javascript
// FlowCanvas.vue - createNodeFromType()
case 'variable':
  baseNode.data = {
    label: 'Variable',
    mode: 'get',
    variableName: ''
  }
```

### 2. Configuração
- Usuário seleciona modo (SET ou GET)
- Define `variableName`
- Handles são atualizados dinamicamente via `dynamicHandles`

### 3. Execução (SET Mode)
```javascript
// variable.js - execute()
if (mode === 'set') {
  const value = inputs['data-input']
  validateSafeValue(value)
  globalVariables[variableName] = value
  return value
}
```

### 4. Execução (GET Mode)
```javascript
// variable.js - execute()
else {
  const value = globalVariables[variableName]
  return value
}
```

### 5. Reatividade (Frontend)
```javascript
// flowStore.js - watch globalVariables
watch(globalVariables, (newVars) => {
  const changedVars = detectChanges(newVars, cache)

  // Re-executar GET nodes afetados
  nodes.forEach(node => {
    if (node.type === 'variable' &&
        node.mode === 'get' &&
        changedVars.has(node.variableName)) {
      executeNodeById(node.id)
    }
  })
})
```

### 6. Detecção de Tipos
```javascript
// flowStore.js - executeNodeById()
typeEngine.detectType(nodeId, handleId, outputs[handleId])
savedDetectedTypes.value = typeEngine.exportDetectedTypes()
```

## Ordenação de Execução

### Problema
Quando um flow tem Variable SET e GET sem conexão direta, o GET pode executar antes do SET, resultando em `undefined`.

### Solução
**Dependências Implícitas via Edges Virtuais**

```javascript
// graphUtils.js - addVariableDependencies()
function addVariableDependencies(nodes, edges, getNodeData) {
  const variableMap = new Map() // variableName → {setNodes, getNodes}

  // Identificar SET e GET de cada variável
  nodes.forEach(node => {
    if (node.type === 'variable') {
      const mode = getNodeData(node.id).mode
      const varName = getNodeData(node.id).variableName

      if (mode === 'set') variableMap.get(varName).setNodes.push(node.id)
      else if (mode === 'get') variableMap.get(varName).getNodes.push(node.id)
    }
  })

  // Criar edges virtuais: SET → GET
  const virtualEdges = []
  variableMap.forEach(({setNodes, getNodes}) => {
    setNodes.forEach(setId => {
      getNodes.forEach(getId => {
        virtualEdges.push({
          source: setId,
          target: getId,
          edgeType: 'data',
          _virtual: true
        })
      })
    })
  })

  return [...edges, ...virtualEdges]
}
```

### Integração

**Frontend (FlowEngine.js):**
```javascript
async executeFlow(nodes, edges) {
  const edgesWithVariableDeps = addVariableDependencies(
    nodes, edges, (nodeId) => this.getNodeData(nodeId)
  )
  const sortedNodes = topologicalSort(nodes, edgesWithVariableDeps)
  // ... executar na ordem correta
}
```

**Backend (flowExecutor.js):**
```javascript
async executeFlowInternal(flow, inputData, execution) {
  const edgesWithVariableDeps = addVariableDependencies(
    connectedNodes, edges, nodeData
  )
  const executionOrder = topologicalSort(connectedNodes, edgesWithVariableDeps)
  // ... executar na ordem correta
}
```

## Validações e Segurança

### Nome da Variável
```javascript
if (!/^[a-zA-Z0-9_-]+$/.test(variableName)) {
  throw new Error('Nome de variável deve conter apenas letras, números, _ ou -')
}
```

### Valor Seguro
```javascript
import { validateSafeValue } from '../../utils/security.js'

validateSafeValue(value) // Lança erro se valor inseguro
```

### Variável Vazia
```javascript
if (!variableName || variableName.trim() === '') {
  return undefined // Não lançar erro, node pode estar em configuração
}
```

## Limitações Conhecidas

1. **Não Persistente**: Variáveis não são salvas com o flow
2. **Escopo de Sessão**: Variáveis são perdidas ao recarregar a página
3. **Sem Namespace**: Todas as variáveis são globais no flow
4. **Sem Tipos Estáticos**: Tipo é inferido em runtime

## Casos de Uso

### 1. Armazenar Resultado Intermediário
```
API Request → Variable SET (nome: "apiResult") → ...
... → Variable GET (nome: "apiResult") → Transform → Output
```

### 2. Compartilhar Valor Entre Branches
```
Input → Conditional Branch
  ├─ true → Variable SET (nome: "status")
  └─ false → Variable SET (nome: "status")

Variable GET (nome: "status") → Output
```

### 3. Acumular Valores em Loop
```
ForEach → Math Add (currentSum + item) → Variable SET (nome: "sum")
Loop Done → Variable GET (nome: "sum") → Output
```

## Comparação com Outros Nodes

| Feature | Variable | Constant | Input | Output |
|---------|----------|----------|-------|--------|
| Persistência | ❌ Sessão | ✅ Flow | ❌ Runtime | ❌ Runtime |
| Modificável | ✅ SET/GET | ❌ Read-only | ❌ External | ✅ Write-only |
| Reatividade | ✅ GET mode | ❌ | ❌ | ❌ |
| Wildcard Type | ✅ | ❌ | ✅ | ✅ |
| Execução | SET: exec, GET: auto | Auto | Auto | Manual |

## Debugging

### Console Logs (Removidos em Produção)
Durante desenvolvimento, havia logs em:
- `variable.js` - Execução SET/GET
- `flowStore.js` - Watch de globalVariables
- `GenericNode.vue` - Detecção de tipos

### Verificar Variáveis
```javascript
// No console do navegador
flowStore.globalVariables.value
// { myValue: 5.37, status: "success" }
```

### Verificar Tipos Detectados
```javascript
flowStore.savedDetectedTypes.value
// { variable_123: { "data-out": "float" } }
```

## Roadmap Futuro

- [ ] Namespace/escopo de variáveis
- [ ] Persistência opcional (localStorage/sessionStorage)
- [ ] Tipos estáticos opcionais
- [ ] Variáveis privadas vs públicas
- [ ] UI para visualizar todas as variáveis ativas
- [ ] History/undo de mudanças de variáveis
- [ ] Suporte a variáveis de ambiente (.env)
