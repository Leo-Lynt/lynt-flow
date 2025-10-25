# Planejamento: Múltiplas Conexões em exec-in

## Problema Atual

Atualmente, um `exec-in` **só aceita uma única conexão** de entrada. Isso limita casos de uso onde múltiplos caminhos condicionais devem convergir para o mesmo node.

### Exemplo de Caso de Uso

```
Input → Conditional Branch A
  ├─ true → Process A → exec-out ──┐
  └─ false → Process B → exec-out ─┤
                                    ├─> Node X (exec-in) ← PROBLEMA: só aceita 1 conexão
Input → Conditional Branch B        │
  ├─ true → Process C → exec-out ──┤
  └─ false → Process D → exec-out ─┘
```

**Comportamento desejado:** Node X deve executar quando **qualquer um** dos caminhos anteriores completar.

## Análise da Implementação Atual

### 1. Frontend - VueFlow

**Arquivo:** `packages/editor/src/components/FlowCanvas.vue`

```javascript
const isValidConnection = (connection) => {
  const sourceIsExec = connection.sourceHandle?.startsWith('exec-')
  const targetIsExec = connection.targetHandle?.startsWith('exec-')

  if (sourceIsExec !== targetIsExec) {
    return false
  }

  // Para exec, retorna true (sem verificação de duplicatas)
  if (sourceIsExec && targetIsExec) {
    return true  // ✅ JÁ PERMITE múltiplas conexões exec
  }

  // Para dados, valida tipos
  return validateConnection(...)
}
```

**Status:** ✅ Frontend **JÁ PERMITE** múltiplas conexões exec.

### 2. Comportamento do VueFlow

O VueFlow (biblioteca) tem um comportamento padrão:
- **Inputs**: Por padrão, aceita apenas 1 conexão (substitui anterior)
- **Outputs**: Aceita múltiplas conexões

**Configuração atual:** Handles são definidos sem `maxConnections`, então o VueFlow usa o padrão.

**Localização:** `packages/editor/src/components/nodes/GenericNode.vue`

### 3. Core - FlowEngine

**Arquivo:** `packages/core/src/engine/FlowEngine.js`

```javascript
async executeConnectedNodes(sourceNodeId, nodes, edges, branchPath = null) {
  // Encontra edges de execução saindo do source
  const execEdges = edges.filter(e =>
    e.source === sourceNodeId &&
    e.edgeType === 'exec' &&
    (branchPath === null || e.sourceHandle === branchPath)
  )

  // Executa cada node conectado
  for (const edge of execEdges) {
    const targetNode = nodes.find(n => n.id === edge.target)
    // ... executa targetNode
  }
}
```

**Status:** ✅ Core **JÁ SUPORTA** executar múltiplos targets.

### 4. API - FlowExecutor

**Arquivo:** `packages/api/src/services/flowExecutor.js`

Usa ordenação topológica - executa nodes quando todas as dependências estão prontas.

**Status:** ✅ API **JÁ SUPORTA** múltiplas conexões via topological sort.

## Bloqueio Identificado

### VueFlow Handle Configuration

O VueFlow bloqueia múltiplas conexões em **inputs** por padrão. Para permitir, é necessário configurar `maxConnections: Infinity` no handle.

**Localização do problema:**
`packages/editor/src/components/nodes/GenericNode.vue`

```vue
<Handle
  :id="handle.id"
  :type="handle.position === 'left' ? 'target' : 'source'"
  :position="handle.position === 'left' ? Position.Left : Position.Right"
  :style="{ ... }"
/>
```

**Solução:** Adicionar `:max-connections` dinâmico baseado no tipo de handle.

## Solução Proposta

### Fase 1: Permitir Múltiplas Conexões Exec (Frontend)

#### 1.1. Configurar maxConnections nos Handles

**Arquivo:** `packages/editor/src/components/nodes/GenericNode.vue`

**Mudança:**
```vue
<Handle
  :id="handle.id"
  :type="handle.position === 'left' ? 'target' : 'source'"
  :position="handle.position === 'left' ? Position.Left : Position.Right"
  :max-connections="getMaxConnections(handle)"  <!-- ✨ NOVO -->
  :style="{ ... }"
/>
```

**Lógica:**
```javascript
const getMaxConnections = (handle) => {
  // Exec-in: múltiplas conexões (OR logic)
  if (handle.id.startsWith('exec-') && handle.position === 'left') {
    return Infinity
  }

  // Exec-out: múltiplas conexões (sequencial)
  if (handle.id.startsWith('exec-') && handle.position === 'right') {
    return Infinity
  }

  // Data inputs: apenas 1 conexão (comportamento atual)
  if (handle.position === 'left') {
    return 1
  }

  // Data outputs: múltiplas conexões (comportamento atual)
  return Infinity
}
```

#### 1.2. Documentar Semântica de Múltiplos exec-in

**Comportamento esperado:** Quando um node tem múltiplos `exec-in` conectados:
- **OR Logic**: Node executa quando **QUALQUER** conexão exec chega
- **Não espera todas**: Diferente de data inputs (que esperam todos os inputs)

#### 1.3. Atualizar Validação (se necessário)

Verificar se `isValidConnection` precisa de ajustes para garantir que:
- Não permite ciclos em exec
- Não permite exec conectar com data

### Fase 2: Suporte Visual (UI/UX)

#### 2.1. Indicador Visual de Múltiplas Conexões

No GenericNode, quando um `exec-in` tem múltiplas conexões:
- Mostrar contador: `exec-in (3)`
- Destacar visualmente o handle (cor diferente)

#### 2.2. Tooltip Informativo

Ao passar mouse sobre `exec-in` com múltiplas conexões:
```
"Executa quando QUALQUER entrada chegar
Conexões: 3"
```

### Fase 3: Semântica Avançada (Opcional/Futuro)

#### 3.1. Modos de Execução para exec-in

Permitir configurar **modo de disparo** no handle:

**Modos:**
- `OR` (padrão): Executa quando **qualquer** exec-in chega
- `AND`: Executa quando **todos** os exec-in chegaram (útil para sync/merge)
- `FIRST`: Executa no primeiro exec-in, ignora os demais
- `DEBOUNCE`: Aguarda N ms após último exec-in

**Configuração no nodes.json:**
```json
{
  "id": "exec-in",
  "type": "exec",
  "mode": "or",  // or | and | first | debounce
  "debounceMs": 100  // se mode = debounce
}
```

#### 3.2. Node Especializado: Merge/Sync

Criar um node dedicado para merge de múltiplas execuções:

```
Process A → exec-out ──┐
Process B → exec-out ──┤→ MergeNode (exec-in x3) → exec-out → Next
Process C → exec-out ──┘
```

**Configurações:**
- `mode`: "or" | "and" | "race"
- `timeout`: Tempo máximo para aguardar todos (se mode = "and")

### Fase 4: Backend (API)

**Status:** ✅ Nenhuma mudança necessária no backend.

A ordenação topológica já suporta múltiplas edges exec chegando no mesmo node. O node será executado quando todas as dependências de **dados** estiverem prontas, independente de quantas conexões exec existam.

### Fase 5: Testes

#### 5.1. Testes Funcionais

**Cenário 1: OR Logic (múltiplos exec-in)**
```
A → exec-out ──┐
               ├→ C (exec-in)
B → exec-out ──┘
```
**Esperado:** C executa 2 vezes (uma para cada exec-in)

**Cenário 2: Conditional Merge**
```
Input → Conditional
  ├─ true → Process A ──┐
  └─ false → Process B ─┤→ Output (exec-in)
```
**Esperado:** Output executa 1 vez (apenas o branch ativo)

**Cenário 3: Parallel Merge**
```
ForEach → Process → exec-out (loop de 3 itens) → Collector (exec-in)
```
**Esperado:** Collector executa 3 vezes (uma por iteração)

#### 5.2. Testes de Edge Cases

- Ciclos em exec (devem ser bloqueados)
- exec-in sem conexões (não deve executar)
- exec-in com 100+ conexões (performance)

### Fase 6: Documentação

#### 6.1. Atualizar CREATE_NODE.md

Adicionar seção sobre handles exec com múltiplas conexões.

#### 6.2. Criar EXEC_FLOW_PATTERNS.md

Documentar padrões comuns:
- Conditional Merge
- Parallel Execution
- Error Handling (try/catch branches)
- Loop Collection

## Comparação: exec vs data

| Feature | exec Handles | data Handles |
|---------|--------------|--------------|
| **Múltiplas Conexões Input** | ✅ Permitido (OR) | ❌ Apenas 1 |
| **Múltiplas Conexões Output** | ✅ Permitido | ✅ Permitido |
| **Semântica de Execução** | Disparo (trigger) | Dependência de dados |
| **Re-execução** | Sempre | Apenas se dados mudarem |
| **Ordem** | Sequencial | Paralelo (topological) |

## Impacto em Nodes Existentes

### Nodes Afetados Positivamente

**1. Conditional Branch**
- Múltiplos branches podem convergir no mesmo node
- Simplifica flows complexos

**2. ForEach/WhileLoop**
- Loop body pode ter múltiplas saídas convergindo para `exec-done`
- Permite padrões de "early exit"

**3. Error Handling (futuro)**
- try/catch/finally podem convergir para error handler

### Nodes que Precisam de Atenção

**1. Merge Node (se criar)**
- Deve ter configuração explícita de modo (OR/AND)

**2. Nodes com Estado**
- Variable SET com múltiplos exec-in: OK (última execução vence)
- Nodes com acumulação: Precisam lidar com múltiplas chamadas

## Cronograma de Implementação

### Sprint 1: MVP (Fase 1)
- ✅ Configurar `maxConnections` em GenericNode
- ✅ Testar múltiplas conexões exec
- ✅ Validar comportamento OR logic

**Estimativa:** 2-4 horas

### Sprint 2: Refinamento (Fase 2)
- Indicadores visuais
- Tooltips informativos
- Testes funcionais

**Estimativa:** 4-6 horas

### Sprint 3: Avançado (Fase 3 - Opcional)
- Modos de disparo (AND/OR/FIRST)
- Node Merge dedicado
- Configuração por handle

**Estimativa:** 8-12 horas

### Sprint 4: Documentação (Fase 6)
- Atualizar docs
- Criar exemplos
- Padrões de uso

**Estimativa:** 2-4 horas

## Decisões de Design

### 1. Permitir múltiplos exec-in por padrão?
**✅ SIM** - Comportamento esperado e útil para maioria dos casos.

### 2. Criar node Merge dedicado?
**⏳ FUTURO** - Começar permitindo múltiplos exec-in em todos os nodes, depois criar node especializado se necessário.

### 3. Implementar modo AND (wait all)?
**⏳ FUTURO** - Começar com OR logic (mais simples e comum), adicionar AND depois se houver demanda.

### 4. Limitar número de conexões exec-in?
**❌ NÃO** - Permitir ilimitado. Se houver problema de performance, adicionar limite configurável depois.

### 5. Executar múltiplos exec-in em paralelo ou sequencial?
**🔄 SEQUENCIAL** - Por padrão, executar na ordem que chegam. Paralelo seria complexo e pode causar condições de corrida.

## Riscos e Mitigações

### Risco 1: Execução Múltipla Inesperada
**Problema:** Node executa várias vezes quando usuário esperava 1 vez.

**Mitigação:**
- Documentar comportamento claramente
- Indicador visual de múltiplas conexões
- Adicionar modo "FIRST" (executa só 1 vez)

### Risco 2: Condições de Corrida
**Problema:** Múltiplos exec-in chegando simultaneamente causam estado inconsistente.

**Mitigação:**
- FlowEngine executa sequencialmente (await)
- Nodes com estado devem ser thread-safe
- Documentar que nodes devem ser idempotentes

### Risco 3: Ciclos Infinitos
**Problema:** Exec-in conectado em loop pode causar execução infinita.

**Mitigação:**
- Detectar ciclos em exec edges (validação)
- Limitar profundidade de execução (max stack depth)
- Warning visual quando ciclo detectado

### Risco 4: Performance
**Problema:** 100+ conexões exec-in podem degradar performance.

**Mitigação:**
- Começar sem limite, monitorar
- Se necessário, adicionar limite configurável
- Otimizar renderização de múltiplas edges

## Métricas de Sucesso

- ✅ Usuário consegue conectar múltiplos exec-out em um único exec-in
- ✅ Node executa corretamente para cada exec-in ativo
- ✅ Não há regressões em nodes existentes
- ✅ Performance aceitável com até 50 conexões exec
- ✅ Documentação clara do comportamento

## Próximos Passos Recomendados

1. **Implementar Fase 1 (MVP)**: Configurar maxConnections
2. **Testar manualmente**: Criar flow de teste com conditional merge
3. **Validar comportamento**: Verificar que executa conforme esperado
4. **Iterar**: Adicionar fases 2 e 3 conforme necessidade

---

**Status:** 📋 Planejamento Completo
**Prioridade:** 🔥 Alta (melhora significativa de UX)
**Complexidade:** 🟢 Baixa (MVP) → 🟡 Média (Completo)
