/**
 * Flow Executor - Core
 *
 * Orquestrador de execução de flows completo.
 * Implementação única que serve tanto Frontend quanto Backend.
 *
 * Baseado na implementação funcional do frontend.
 *
 * IMPORTANTE: Este executor NÃO importa executeNode diretamente para evitar
 * dependência do registry (que usa import.meta.glob, incompatível com Node.js).
 * O executeNode deve ser passado via context.
 */

/**
 * Extrai valor de campo usando path notation (ex: "user.address.city")
 * @param {any} data - Dados para navegar
 * @param {string} path - Path do campo (ex: "user.name")
 * @returns {any} Valor extraído
 */
function getFieldValue(data, path) {
  // Se for array, pegar primeiro elemento
  if (Array.isArray(data) && data.length > 0) {
    data = data[0]
  }

  const parts = path.split('.')
  let value = data

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part]
    } else {
      return undefined
    }
  }

  return value
}

/**
 * Verifica se node tem exec-input (precisa ser ativado por flow)
 * @param {string} nodeId - ID do node
 * @param {Array} edges - Lista de edges
 * @returns {boolean}
 */
function hasExecInput(nodeId, edges) {
  return edges.some(e =>
    e.target === nodeId &&
    (e.edgeType === 'flow' || e.targetHandle === 'exec-input')
  )
}

/**
 * Obtém edges de saída de execução de um node
 * @param {string} nodeId - ID do node
 * @param {Array} edges - Lista de edges
 * @returns {Array} Edges de exec-output
 */
function getOutgoingExecEdges(nodeId, edges) {
  return edges.filter(e =>
    e.source === nodeId &&
    (e.edgeType === 'flow' || e.sourceHandle?.startsWith('exec-'))
  )
}

/**
 * Obtém edges de entrada de dados de um node
 * @param {string} nodeId - ID do node
 * @param {Array} edges - Lista de edges
 * @returns {Array} Edges de data input
 */
function getIncomingDataEdges(nodeId, edges) {
  return edges.filter(e =>
    e.target === nodeId &&
    e.edgeType !== 'flow' &&
    !e.targetHandle?.startsWith('exec-')
  )
}

/**
 * Adiciona dependências virtuais para Variable nodes
 * Variable GET deve esperar Variable SET com mesmo variableName
 *
 * @param {Array} nodes - Lista de nodes
 * @param {Array} edges - Lista de edges
 * @param {Object} nodeDataMap - Mapa de dados dos nodes { nodeId: nodeData }
 * @returns {Array} Edges com dependências virtuais adicionadas
 */
function addVariableDependencies(nodes, edges, nodeDataMap) {
  const variableMap = new Map() // variableName -> { setNodes: [], getNodes: [] }

  // Identificar todos os Variable nodes
  nodes.forEach(node => {
    if (node.type !== 'variable') return

    const data = nodeDataMap[node.id] || {}
    const mode = data.mode || 'get'
    const variableName = data.variableName

    if (!variableName || variableName.trim() === '') return

    if (!variableMap.has(variableName)) {
      variableMap.set(variableName, { setNodes: [], getNodes: [] })
    }

    const varInfo = variableMap.get(variableName)
    if (mode === 'set') {
      varInfo.setNodes.push(node.id)
    } else {
      varInfo.getNodes.push(node.id)
    }
  })

  // Criar edges virtuais: GET depende de todos os SETs
  const virtualEdges = []

  variableMap.forEach((varInfo, variableName) => {
    varInfo.getNodes.forEach(getNodeId => {
      varInfo.setNodes.forEach(setNodeId => {
        // Adicionar edge virtual: SET -> GET
        virtualEdges.push({
          id: `virtual-${setNodeId}-${getNodeId}`,
          source: setNodeId,
          target: getNodeId,
          sourceHandle: 'data-out',
          targetHandle: 'data-variable-dep',
          edgeType: 'data',
          _virtual: true,
          _variableName: variableName
        })
      })
    })
  })

  return [...edges, ...virtualEdges]
}

/**
 * Executa um flow completo
 *
 * @param {Object} params - Parâmetros de execução
 * @param {Array} params.nodes - Lista de nodes do flow
 * @param {Array} params.edges - Lista de edges do flow
 * @param {Object} params.nodeDataMap - Mapa de dados dos nodes { nodeId: nodeData }
 * @param {Object} params.inputData - Dados de entrada para Input nodes
 * @param {Object} params.context - Contexto de execução (adapters, globalVariables, etc)
 * @returns {Promise<Object>} Resultado da execução { success, results, executedNodes }
 */
export async function executeFlow({ nodes, edges, nodeDataMap, inputData = {}, context = {} }) {
  console.log('🚀 Starting flow execution...')

  // State de execução
  const executionResults = {}
  const executedNodes = new Set()
  const globalVariables = context.globalVariables || {}

  // Adicionar dependências virtuais para Variable nodes
  const edgesWithDeps = addVariableDependencies(nodes, edges, nodeDataMap)

  /**
   * Coleta inputs de um node a partir dos resultados de execução
   * NOTA: Esta função está dentro do escopo de executeFlow, então tem acesso
   * a executeNodeById para executar nodes entry que ainda não executaram
   */
  const collectNodeInputs = async (nodeId) => {
    const inputs = {}
    const incomingEdges = getIncomingDataEdges(nodeId, edgesWithDeps)

    for (const edge of incomingEdges) {
      // Ignorar edges virtuais que não executaram
      if (edge._virtual && !executionResults[edge.source]) {
        continue
      }

      let sourceResult = executionResults[edge.source]

      // Se o source não executou mas é um entry node (sem exec-in), executar agora
      if (sourceResult === undefined && !edge._virtual) {
        const sourceNode = nodes.find(n => n.id === edge.source)
        if (sourceNode && !hasExecInput(edge.source, edgesWithDeps)) {
          console.log(`  🔄 Lazy executing entry node ${edge.source} for data dependency`)
          // Executar com fromExecSignal = true para evitar check de dependências
          // pois collectNodeInputs vai executar recursivamente os deps
          sourceResult = await executeNodeById(edge.source, true)
        }
      }

      if (sourceResult !== undefined) {
        // Extract specific field if handle specifies it
        const handleId = edge.sourceHandle
        if (handleId && handleId.startsWith('data-output-') && handleId !== 'data-output-all') {
          const fieldName = handleId.replace('data-output-', '').replace(/-/g, '.')
          inputs[edge.targetHandle] = getFieldValue(sourceResult, fieldName)
        } else {
          // Para nodes com sourceHandle específico, usar como chave
          const outputKey = handleId || 'data-out'
          const value = typeof sourceResult === 'object' && sourceResult !== null && outputKey in sourceResult
            ? sourceResult[outputKey]
            : sourceResult
          inputs[edge.targetHandle] = value
        }
      }
    }

    return inputs
  }

  /**
   * Verifica se um node tem todas as dependências satisfeitas
   */
  const hasPendingDependencies = (nodeId) => {
    const incomingEdges = getIncomingDataEdges(nodeId, edgesWithDeps)

    for (const edge of incomingEdges) {
      // Se é virtual, verificar se o source vai executar
      if (edge._virtual) {
        const sourceNode = nodes.find(n => n.id === edge.source)
        if (!sourceNode) continue

        // Se o source tem exec-input mas não executou, pode ser branch não escolhido
        if (hasExecInput(edge.source, edgesWithDeps) && !executedNodes.has(edge.source)) {
          // Ignorar esta dependência - source está em branch não ativado
          continue
        }
      }

      // Dependência real: precisa ter executado
      if (!executedNodes.has(edge.source)) {
        return true // Ainda tem dependências pendentes
      }
    }

    return false // Todas dependências satisfeitas
  }

  /**
   * Executa um node individual
   */
  const executeNodeById = async (nodeId, fromExecSignal = false) => {
    // Evitar execução duplicada
    if (executedNodes.has(nodeId)) {
      return executionResults[nodeId]
    }

    // Verificar dependências APENAS se NÃO veio de exec signal
    // Quando vem de exec signal, o node DEVE executar (fluxo mandou executar)
    if (!fromExecSignal && hasPendingDependencies(nodeId)) {
      console.log(`⏸️  Node ${nodeId} tem dependências pendentes, pulando...`)
      return null
    }

    console.log(`🔄 Executing node: ${nodeId}`)

    const node = nodes.find(n => n.id === nodeId)
    if (!node) {
      throw new Error(`Node ${nodeId} not found`)
    }

    const nodeData = nodeDataMap[nodeId] || {}

    // Coletar inputs (agora é async)
    const inputs = await collectNodeInputs(nodeId)

    if (node.type === 'output') {
      console.log(`  📥 Output node inputs:`, JSON.stringify(inputs, null, 2))
      console.log(`  📦 Execution results available:`, Object.keys(executionResults))
    }

    // Para Input nodes, passar inputData
    if (node.type === 'input') {
      Object.assign(inputs, inputData)
    }

    // Executar node com contexto
    const execContext = {
      ...context,
      globalVariables,
      executionResults,
      adapters: context.adapters
    }

    // executeNode deve vir do context (injetado pelo caller)
    const executeNodeFn = context.executeNode
    if (!executeNodeFn) {
      throw new Error('executeNode function must be provided in context')
    }

    const result = await executeNodeFn(node, nodeData, inputs, execContext)

    // Armazenar resultado
    executionResults[nodeId] = result
    executedNodes.add(nodeId)

    console.log(`✅ Node ${nodeId} executed successfully`)

    // Executar downstream nodes conectados via exec-output
    const outgoingExecEdges = getOutgoingExecEdges(nodeId, edgesWithDeps)

    if (outgoingExecEdges.length > 0) {
      console.log(`  📤 Node ${nodeId} has ${outgoingExecEdges.length} exec-out edge(s)`)
    }

    for (const edge of outgoingExecEdges) {
      // Para conditional-branch, verificar qual path seguir
      if (node.type === 'conditional-branch' && result?.branch) {
        // Só seguir pelo branch correto
        if (edge.sourceHandle === result.branch) {
          console.log(`  ➡️  Following branch ${result.branch} to ${edge.target}`)
          await executeNodeById(edge.target, true)
        } else {
          console.log(`  ⏭️  Skipping branch ${edge.sourceHandle} (chosen: ${result.branch})`)
        }
      } else {
        // Nodes normais: executar todos os downstream
        console.log(`  ➡️  Following exec edge to ${edge.target}`)
        await executeNodeById(edge.target, true)
      }
    }

    return result
  }

  // Encontrar entry nodes (nodes sem exec-input E sem dependências de dados)
  const entryNodes = nodes.filter(node => {
    // Input nodes são sempre entry points
    if (node.type === 'input' || node.type === 'constant') {
      return true
    }

    // Se tem exec-input, não é entry node
    if (hasExecInput(node.id, edgesWithDeps)) {
      return false
    }

    // Se tem dependências de dados REAIS (não virtuais de branches), não é entry
    const hasRealDataDeps = getIncomingDataEdges(node.id, edgesWithDeps).some(e => {
      if (e._virtual) {
        // Virtual dep de Variable: só conta se o source não tem exec-input
        // (se tem exec-input, pode não executar)
        const sourceNode = nodes.find(n => n.id === e.source)
        return sourceNode && !hasExecInput(e.source, edgesWithDeps)
      }
      // Check if source already executed - if yes, NOT a pending dependency
      return !executedNodes.has(e.source)
    })

    return !hasRealDataDeps
  })

  console.log('📍 Entry nodes:', entryNodes.map(n => n.id))

  // Executar entry nodes
  try {
    for (const node of entryNodes) {
      await executeNodeById(node.id)
    }

    console.log('✅ Flow execution completed')
    console.log(`📊 Executed ${executedNodes.size} nodes`)

    return {
      success: true,
      results: executionResults,
      executedNodes: Array.from(executedNodes),
      globalVariables
    }

  } catch (error) {
    console.error('❌ Flow execution error:', error)

    // Retornar resultados parciais mesmo com erro
    return {
      success: false,
      error: error.message,
      results: executionResults,
      executedNodes: Array.from(executedNodes),
      globalVariables
    }
  }
}

export default {
  executeFlow
}
