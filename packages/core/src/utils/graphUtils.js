/**
 * Graph utilities
 * Pure JavaScript utilities for graph operations (safe for Node.js and browser)
 */

/**
 * Get only connected nodes (filters out isolated/disconnected nodes)
 * A node is considered connected if:
 * - It has at least one incoming or outgoing edge, OR
 * - It is an Input node (entry point)
 * @param {Array} nodes - List of all nodes
 * @param {Array} edges - List of edges
 * @returns {Array} Filtered list of connected nodes only
 */
export function getConnectedNodes(nodes, edges) {
  const connectedNodeIds = new Set()

  // 1. Add all nodes that have edges (either source or target)
  edges.forEach(edge => {
    connectedNodeIds.add(edge.source)
    connectedNodeIds.add(edge.target)
  })

  // 2. Add Input nodes (entry points) even if they have no edges yet
  nodes.forEach(node => {
    if (node.type === 'input') {
      connectedNodeIds.add(node.id)
    }
  })

  // 3. Filter and return only connected nodes
  return nodes.filter(node => connectedNodeIds.has(node.id))
}

/**
 * Add implicit dependencies for Variable nodes
 * Variable SET must execute before Variable GET for the same variableName
 * @param {Array} nodes - List of nodes
 * @param {Array} edges - List of edges
 * @param {Function} getNodeData - Function to get node configuration data
 * @returns {Array} Edges with implicit Variable dependencies added
 */
export function addVariableDependencies(nodes, edges, getNodeData) {
  // Map variableName -> { setNodes: [], getNodes: [] }
  const variableMap = new Map()

  // Identify all Variable nodes and their modes
  nodes.forEach(node => {
    if (node.type !== 'variable') return

    const nodeData = getNodeData(node.id)
    const mode = nodeData?.mode || 'get'
    const variableName = nodeData?.variableName

    // Skip if variableName is not configured
    if (!variableName || variableName.trim() === '') return

    if (!variableMap.has(variableName)) {
      variableMap.set(variableName, { setNodes: [], getNodes: [] })
    }

    const entry = variableMap.get(variableName)
    if (mode === 'set') {
      entry.setNodes.push(node.id)
    } else if (mode === 'get') {
      entry.getNodes.push(node.id)
    }
  })

  // Create virtual edges: SET -> GET for each variable
  const virtualEdges = []
  for (const [variableName, { setNodes, getNodes }] of variableMap) {
    // Each GET depends on ALL SETs for that variable
    setNodes.forEach(setNodeId => {
      getNodes.forEach(getNodeId => {
        virtualEdges.push({
          id: `virtual-var-${variableName}-${setNodeId}-${getNodeId}`,
          source: setNodeId,
          target: getNodeId,
          edgeType: 'data',
          sourceHandle: 'data-out',
          targetHandle: 'data-in',
          _virtual: true // Mark as virtual for debugging
        })
      })
    })
  }

  return [...edges, ...virtualEdges]
}

/**
 * Topological Sort - Orders nodes based on dependencies using Kahn's algorithm
 * Filters only data edges (excludes execution flow edges)
 * @param {Array} nodes - List of nodes
 * @param {Array} edges - List of edges
 * @returns {Array} Topologically sorted nodes
 */
export function topologicalSort(nodes, edges) {
  const adjacency = {}
  const inDegree = {}

  nodes.forEach(node => {
    adjacency[node.id] = []
    inDegree[node.id] = 0
  })

  // IMPORTANT: Use only DATA edges for dependencies
  // FLOW edges (exec) do not represent data dependencies
  const dataEdgesOnly = edges.filter(e =>
    e.edgeType === 'data' || (!e.sourceHandle?.startsWith('exec-') && !e.targetHandle?.startsWith('exec-'))
  )


  dataEdgesOnly.forEach(edge => {
    adjacency[edge.source].push(edge.target)
    inDegree[edge.target]++
  })

  const queue = []
  const sorted = []

  Object.keys(inDegree).forEach(nodeId => {
    if (inDegree[nodeId] === 0) {
      queue.push(nodeId)
    }
  })

  while (queue.length > 0) {
    const current = queue.shift()
    const node = nodes.find(n => n.id === current)
    if (node) sorted.push(node)

    adjacency[current].forEach(neighbor => {
      inDegree[neighbor]--
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor)
      }
    })
  }

  return sorted
}
