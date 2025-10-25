/**
 * FlowEngine - Pure JavaScript Flow Execution Engine
 * Orchestrates flow execution without Vue/Pinia dependencies
 * Safe for Node.js and browser environments
 */

import { topologicalSort, getConnectedNodes, addVariableDependencies } from '../utils/graphUtils.js'

/**
 * FlowEngine handles all flow execution logic
 */
export class FlowEngine {
  constructor(executeNodeFn = null, extractOutputsFn = null) {
    // Execution state
    this.executionResults = new Map() // nodeId -> results
    this.executingNodes = new Set()
    this.executedNodes = new Set()
    this.errorNodes = new Set()
    this.executeTimers = new Map()

    // Flow-driven execution state
    this.execSignals = new Set() // nodeIds that received exec signal
    this.readyQueue = [] // nodes ready to execute

    // Configuration
    this.apiConfig = null
    this.globalVariables = {}
    this.nodeData = new Map() // nodeId -> config data

    // Callbacks for state updates (Vue integration)
    this.onStateChange = null

    // Injected executor function (from frontend)
    this.executeNodeFn = executeNodeFn
    this.extractOutputsFn = extractOutputsFn
  }

  /**
   * Set configuration
   */
  setConfig(apiConfig, globalVariables = {}) {
    this.apiConfig = apiConfig
    this.globalVariables = globalVariables
  }

  /**
   * Set node data
   */
  setNodeData(nodeId, data) {
    this.nodeData.set(nodeId, data)
  }

  /**
   * Get node data
   */
  getNodeData(nodeId) {
    return this.nodeData.get(nodeId) || {}
  }

  /**
   * Clear all execution results
   */
  clearExecutionResults() {
    this.executionResults.clear()
    this.executedNodes.clear()
    this.executingNodes.clear()
    this.errorNodes.clear()
    this.execSignals.clear()
    this.readyQueue = []

    // Clear any pending timers
    for (const timer of this.executeTimers.values()) {
      clearTimeout(timer)
    }
    this.executeTimers.clear()

    this._notifyStateChange()
  }

  /**
   * Execute a single node
   * @param {Object} node - Node instance
   * @param {Object} inputs - Input data
   * @returns {Promise<any>} Execution result
   */
  async executeNode(node, inputs = {}) {
    const data = this.getNodeData(node.id)

    // Mark node as executing
    this.executingNodes.add(node.id)
    this.errorNodes.delete(node.id)
    this._notifyStateChange()

    try {
      const context = {
        apiConfig: this.apiConfig,
        globalVariables: this.globalVariables,
        nodeId: node.id,
        // Allow nodes to update their own nodeData (for Field Extractor)
        updateNodeData: (updates) => {
          const current = this.getNodeData(node.id)
          this.setNodeData(node.id, { ...current, ...updates })
        }
      }

      const result = await this.executeNodeFn(node, data, inputs, context)

      // Mark as executed successfully
      this.executingNodes.delete(node.id)
      this.executedNodes.add(node.id)
      this._notifyStateChange()

      return result
    } catch (error) {
      // Mark as error
      this.executingNodes.delete(node.id)
      this.errorNodes.add(node.id)
      this._notifyStateChange()

      // Log error with clean format
      console.error('\n❌ Execution Error')
      console.error('━'.repeat(50))
      console.error(`Node: ${node.data?.label || node.type} (${node.id})`)
      console.error(`Type: ${node.type}`)
      console.error(`Message: ${error.message}`)
      if (error.stack) {
        console.error(`\nStack trace:`)
        console.error(error.stack)
      }
      console.error('━'.repeat(50) + '\n')

      throw error
    }
  }

  /**
   * Execute entire flow (Flow-driven execution)
   * @param {Array} nodes - All nodes
   * @param {Array} edges - All edges
   * @returns {Promise<void>}
   */
  async executeFlow(nodes, edges) {
    console.log('\n🚀 EXECUTION START')
    this.clearExecutionResults()
    this.globalVariables = {}

    // Store nodes for access in helper methods
    this.currentNodes = nodes

    // Filter only connected nodes
    const connectedNodes = getConnectedNodes(nodes, edges)

    // Add implicit dependencies for Variable nodes (SET must execute before GET)
    const edgesWithVariableDeps = addVariableDependencies(
      connectedNodes,
      edges,
      (nodeId) => this.getNodeData(nodeId)
    )

    // Track execution path for visualization
    const executionPath = []

    // STEP 1: Find TRUE entry nodes (no exec-in AND no data dependencies)
    // OR nodes connected to the exec flow chain
    const trueEntryNodes = this._findTrueEntryNodes(connectedNodes, edgesWithVariableDeps)

    // DEBUG: Show all nodes and their exec connections
    console.log('\n📊 FLOW ANALYSIS:')
    console.log('Total nodes:', connectedNodes.length)

    const nodesWithExecIn = connectedNodes.filter(n => this._hasExecInput(n, edges))

    const nodesWithExecOut = connectedNodes.filter(n => this._hasExecOutput(n, edges))

    // STEP 2: Add entry nodes to ready queue
    this.readyQueue = [...trueEntryNodes]

    // STEP 3: Execute nodes from queue (flow-driven)
    const maxIterations = connectedNodes.length * 2 // Prevent infinite loops
    let iteration = 0

    while (this.readyQueue.length > 0 && iteration < maxIterations) {
      iteration++

      // Get next node from queue
      const node = this.readyQueue.shift()

      // Skip if already executed
      if (this.executedNodes.has(node.id)) {
        continue
      }

      // Check if ready to execute
      if (!this._isReadyToExecute(node, edgesWithVariableDeps)) {
        // Not ready, add back to end of queue
        this.readyQueue.push(node)
        continue
      }

      // EXECUTE NODE
      const nodeLabel = this._getNodeLabel(node)
      executionPath.push(nodeLabel)

      const hasExecIn = this._hasExecInput(node, edges)
      const hasExecOut = this._hasExecOutput(node, edges)
      const execInfo = []
      if (hasExecIn) execInfo.push('exec-in')
      if (hasExecOut) execInfo.push('exec-out')
      const execStr = execInfo.length > 0 ? ` [${execInfo.join(', ')}]` : ' [data-only]'

      const inputs = this._gatherInputs(node, edges)

      try {
        const result = await this.executeNode(node, inputs)

        // Process result
        if (this.extractOutputsFn) {
          const nodeWithData = { ...node, data: this.getNodeData(node.id) }
          const processedResult = this.extractOutputsFn(nodeWithData, result)
          this.executionResults.set(node.id, processedResult)
        } else {
          this.executionResults.set(node.id, result)
        }

        // PROPAGATE EXEC SIGNAL (if node has exec-out)
        if (this._hasExecOutput(node, edges)) {
          if (node.type === 'conditional-branch') {
            // Conditional Branch: send signal only to chosen branch
            const branchPath = result?.branch
            const branchLabel = branchPath === 'exec-true' ? 'TRUE' : 'FALSE'
            executionPath[executionPath.length - 1] += ` (→ ${branchLabel})`
            if (branchPath) {
              this._sendExecSignal(node.id, edges, branchPath)
            }
          } else {
            // Other nodes: send signal to all exec-out
            this._sendExecSignal(node.id, edges)
          }
        }

        // ADD READY NODES TO QUEUE
        // Check all connected nodes to see if they became ready
        connectedNodes.forEach(targetNode => {
          // Skip if already executed or already in queue
          if (this.executedNodes.has(targetNode.id) || this.readyQueue.includes(targetNode)) {
            return
          }

          // Check if this node depends on the one we just executed
          const hasDataDependency = edgesWithVariableDeps.some(
            e => e.target === targetNode.id && e.source === node.id && e.edgeType === 'data'
          )

          const hasExecDependency = this.execSignals.has(targetNode.id)

          // Add to queue if it has a dependency on current node and might be ready
          if (hasDataDependency || hasExecDependency) {
            if (this._isReadyToExecute(targetNode, edgesWithVariableDeps)) {
              this.readyQueue.push(targetNode)
            }
          }
        })
      } catch (error) {
        executionPath[executionPath.length - 1] += ' ❌'
        this.executionResults.set(node.id, { error: error.message })
        this._notifyStateChange()
        console.log('🏁 EXECUTION END (error)\n')
        return
      }
    }

    // Display execution path
    console.log('🏁 EXECUTION END\n')

    this._notifyStateChange()
  }

  /**
   * Execute connected nodes (for control flow)
   * @param {string} sourceNodeId - Source node that triggered execution
   * @param {Array} nodes - All nodes
   * @param {Array} edges - All edges
   * @param {string|null} branchPath - For conditional branches
   * @returns {Promise<void>}
   */
  async executeConnectedNodes(sourceNodeId, nodes, edges, branchPath = null) {

    // Find outgoing execution edges
    const execEdges = edges.filter(e =>
      e.source === sourceNodeId &&
      e.edgeType === 'exec' &&
      (branchPath === null || e.sourceHandle === branchPath)
    )

    if (execEdges.length === 0) {
      return
    }

    // Execute each connected node
    for (const edge of execEdges) {
      const targetNode = nodes.find(n => n.id === edge.target)
      if (!targetNode) continue

      // Gather inputs for the target node
      const inputs = this._gatherInputs(targetNode, edges)

      try {
        const result = await this.executeNode(targetNode, inputs)
        this.executionResults.set(targetNode.id, result)

        // If this node has execution outputs, continue the chain
        if (targetNode.type === 'conditional-branch') {
          // Handle conditional branch
          const branchResult = result?.branch
          if (branchResult) {
            await this.executeConnectedNodes(targetNode.id, nodes, edges, `exec-${branchResult}`)
          }
        } else if (targetNode.type === 'forEach' || targetNode.type === 'whileLoop') {
          // Loops handle their own execution flow
          // Already handled in their execute methods
        } else {
          // Continue with next nodes
          await this.executeConnectedNodes(targetNode.id, nodes, edges)
        }
      } catch (error) {
        this.executionResults.set(targetNode.id, { error: error.message })
      }
    }
  }

  /**
   * Execute While Loop
   * @param {string} whileNodeId - While loop node ID
   * @param {Array} nodes - All nodes
   * @param {Array} edges - All edges
   * @param {boolean} initialCondition - Initial condition
   * @param {number} maxIterations - Maximum iterations
   * @returns {Promise<void>}
   */
  async executeWhileLoop(whileNodeId, nodes, edges, initialCondition, maxIterations = 1000) {

    let iteration = 0
    let condition = initialCondition

    while (condition && iteration < maxIterations) {
      iteration++

      // Execute connected nodes in the loop body
      await this.executeConnectedNodes(whileNodeId, nodes, edges, 'exec-loop')

      // Re-evaluate condition by checking the last result
      const result = this.executionResults.get(whileNodeId)
      condition = result?.condition ?? false

      if (iteration >= maxIterations) {
        break
      }
    }

    // After loop completes, execute "done" branch
    await this.executeConnectedNodes(whileNodeId, nodes, edges, 'exec-done')
  }

  /**
   * Execute For Each Loop
   * @param {string} forEachNodeId - ForEach node ID
   * @param {Array} nodes - All nodes
   * @param {Array} edges - All edges
   * @param {Array} array - Array to iterate over
   * @returns {Promise<void>}
   */
  async executeForEachLoop(forEachNodeId, nodes, edges, array) {

    const results = []

    for (let index = 0; index < array.length; index++) {
      const item = array[index]

      // Store current item and index in results for loop body to access
      this.executionResults.set(forEachNodeId, {
        currentItem: item,
        currentIndex: index,
        totalItems: array.length
      })

      // Execute connected nodes in the loop body
      await this.executeConnectedNodes(forEachNodeId, nodes, edges, 'exec-loop')

      // Collect result from the loop body if needed
      results.push(item)
    }

    // After loop completes, execute "done" branch
    this.executionResults.set(forEachNodeId, { results })
    await this.executeConnectedNodes(forEachNodeId, nodes, edges, 'exec-done')

  }

  /**
   * Get execution result for a node
   */
  getResult(nodeId) {
    return this.executionResults.get(nodeId)
  }

  /**
   * Get all execution results
   */
  getAllResults() {
    return Object.fromEntries(this.executionResults)
  }

  /**
   * Get all executed node IDs
   */
  getAllExecutedNodes() {
    return Array.from(this.executedNodes)
  }

  /**
   * Get all executing node IDs
   */
  getAllExecutingNodes() {
    return Array.from(this.executingNodes)
  }

  /**
   * Get all error node IDs
   */
  getAllErrorNodes() {
    return Array.from(this.errorNodes)
  }

  /**
   * Check if node is executing
   */
  isExecuting(nodeId) {
    return this.executingNodes.has(nodeId)
  }

  /**
   * Check if node has been executed
   */
  hasExecuted(nodeId) {
    return this.executedNodes.has(nodeId)
  }

  /**
   * Check if node has error
   */
  hasError(nodeId) {
    return this.errorNodes.has(nodeId)
  }

  /**
   * Private: Gather inputs for a node from connected edges
   */
  _gatherInputs(node, edges) {
    const inputs = {}

    // Find incoming data edges
    const incomingEdges = edges.filter(e =>
      e.target === node.id && e.edgeType === 'data'
    )

    for (const edge of incomingEdges) {
      const sourceResult = this.executionResults.get(edge.source)
      if (!sourceResult) continue

      // Get the specific output from source handle
      const outputValue = sourceResult[edge.sourceHandle]

      // Map to target handle
      inputs[edge.targetHandle] = outputValue
    }

    return inputs
  }

  /**
   * Private: Check if node has pending dependencies
   */
  _hasPendingDependencies(node, edges) {
    // Find incoming data edges
    const incomingDataEdges = edges.filter(e => {
      if (e.target !== node.id) return false
      // Consider it a data edge if edgeType is 'data' OR if sourceHandle doesn't start with 'exec-'
      return e.edgeType === 'data' || !e.sourceHandle?.startsWith('exec-')
    })

    // Special case: Variable GET nodes with Variable SET dependencies
    // Only require AT LEAST ONE SET to have executed (for conditional branches)
    const nodeData = this.getNodeData(node.id)
    if (node.type === 'variable' && nodeData?.mode === 'get') {
      // Check if all incoming edges are from Variable SET nodes
      const allFromVariableSets = incomingDataEdges.every(edge => {
        const sourceNode = this.currentNodes?.find(n => n.id === edge.source)
        const sourceData = sourceNode ? this.getNodeData(sourceNode.id) : null
        return sourceNode?.type === 'variable' && sourceData?.mode === 'set'
      })

      if (allFromVariableSets && incomingDataEdges.length > 0) {
        // At least ONE Variable SET must have executed
        const hasAtLeastOne = incomingDataEdges.some(edge =>
          this.executionResults.get(edge.source)
        )

        if (!hasAtLeastOne) {
          return true // Still waiting for at least one SET
        }

        return false // At least one SET executed, we're good
      }
    }

    // Default behavior: ALL dependencies must be satisfied
    // Both the source node must have executed AND the specific handle must have a value
    for (const edge of incomingDataEdges) {
      const sourceResult = this.executionResults.get(edge.source)

      // Check if source node has executed
      if (!sourceResult) {
        return true // Source node hasn't executed yet
      }

      // Check if the specific output handle has a value
      // This ensures that nodes only execute when ALL their data inputs have values
      const outputValue = sourceResult[edge.sourceHandle]
      if (outputValue === undefined) {
        return true // Edge hasn't passed a value yet
      }
    }

    return false // All dependencies satisfied
  }

  /**
   * Private: Check if node has exec-in
   */
  _hasExecInput(node, edges) {
    return edges.some(e => e.target === node.id && e.edgeType === 'flow')
  }

  /**
   * Private: Check if node has exec-out
   */
  _hasExecOutput(node, edges) {
    return edges.some(e => e.source === node.id && e.edgeType === 'flow')
  }

  /**
   * Private: Send exec signal to downstream nodes
   */
  _sendExecSignal(sourceNodeId, edges, branchPath = null) {
    // Find exec edges going out from this node
    const execEdges = edges.filter(
      e =>
        e.source === sourceNodeId &&
        e.edgeType === 'flow' &&
        (branchPath === null || e.sourceHandle === branchPath)
    )

    // Send signal to each target
    execEdges.forEach(edge => {
      this.execSignals.add(edge.target)
    })
  }

  /**
   * Private: Check if node is ready to execute
   */
  _isReadyToExecute(node, edges) {
    // 1. Check data dependencies
    if (this._hasPendingDependencies(node, edges)) {
      return false // Data not ready
    }

    // 2. Check exec signal (only for nodes with exec-in)
    if (this._hasExecInput(node, edges)) {
      const hasSignal = this.execSignals.has(node.id)
      if (!hasSignal) {
        return false // No exec signal received
      }
    }

    return true // Ready to execute
  }

  /**
   * Private: Find entry nodes (nodes without exec-in)
   */
  _findEntryNodes(nodes, edges) {
    return nodes.filter(node => !this._hasExecInput(node, edges))
  }

  /**
   * Private: Find TRUE entry nodes (start points of execution)
   * These are nodes that:
   * 1. Have no exec-in AND no incoming data edges (completely independent)
   * OR
   * 2. Are Input/Constant nodes (always start points)
   */
  _findTrueEntryNodes(nodes, edges) {
    return nodes.filter(node => {
      // Input and Constant nodes are always entry points
      if (node.type === 'input' || node.type === 'constant') {
        return true
      }

      // Variable GET nodes are also entry points (they read from global state)
      if (node.type === 'variable') {
        const nodeData = this.getNodeData(node.id)
        if (nodeData?.mode === 'get') {
          return true
        }
      }

      // Check if node has exec-in
      const hasExecIn = this._hasExecInput(node, edges)

      // If it has exec-in, it's NOT an entry node (must wait for exec signal)
      if (hasExecIn) {
        return false
      }

      // Check if it has incoming data dependencies
      const hasIncomingData = edges.some(
        e => e.target === node.id && e.edgeType === 'data'
      )

      // Entry node = no exec-in AND no data dependencies
      return !hasIncomingData
    })
  }

  /**
   * Private: Get human-readable node label for execution path
   */
  _getNodeLabel(node) {
    const nodeData = this.getNodeData(node.id)
    const label = nodeData?.label || node.data?.label

    if (label) {
      return label
    }

    // Fallback to type-based labels
    const typeLabels = {
      'input': 'Input',
      'output': 'Output',
      'connector': 'Data Connector',
      'variable': 'Variable',
      'conditional-branch': 'Conditional Branch',
      'constant': 'Constant',
      'http-request': 'HTTP Request',
      'string-ops': 'String Ops',
      'field-extractor': 'Field Extractor'
    }

    return typeLabels[node.type] || node.type
  }

  /**
   * Private: Notify state change (for Vue integration)
   */
  _notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange({
        executionResults: this.getAllResults(),
        executingNodes: Array.from(this.executingNodes),
        executedNodes: Array.from(this.executedNodes),
        errorNodes: Array.from(this.errorNodes)
      })
    }
  }
}
