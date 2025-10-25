/**
 * AutoExecutionEngine - Pure JavaScript Auto-Execution Logic
 * Manages automatic node execution based on triggers
 * Safe for Node.js and browser environments
 */

/**
 * AutoExecutionEngine determines when nodes should auto-execute
 */
export class AutoExecutionEngine {
  constructor() {
    // Configuration
    this.autoExecuteDelay = 500 // ms delay for debouncing

    // Node types that auto-execute on creation
    this.autoExecuteOnCreate = [
      'input',
      'constant',
      'variable',
      'array-create',
      'object-create'
    ]

    // Node types that auto-execute on config change
    this.autoExecuteOnConfigChange = [
      'input',
      'constant',
      'variable',
      'data-connector',
      'array-create',
      'object-create',
      'array-slice',
      'array-filter',
      'array-map',
      'array-sort',
      'array-aggregate',
      'array-merge',
      'array-distinct',
      'array-groupby',
      'object-filter',
      'object-pick',
      'object-merge',
      'object-transform',
      'object-rename',
      'object-set-property',
      'object-to-array',
      'object-keys-values',
      'field-extractor',
      'comparison',
      'logic',
      'math',
      'string-ops',
      'type-conversion',
      'debug-viewer'
    ]

    // Node types that auto-execute on data received
    this.autoExecuteOnDataReceived = [
      'array-filter',
      'array-map',
      'array-sort',
      'array-aggregate',
      'array-merge',
      'array-distinct',
      'array-groupby',
      'array-slice',
      'object-filter',
      'object-pick',
      'object-merge',
      'object-transform',
      'object-rename',
      'object-set-property',
      'object-to-array',
      'object-keys-values',
      'field-extractor',
      'comparison',
      'logic',
      'math',
      'string-ops',
      'type-conversion',
      'debug-viewer'
    ]
  }

  /**
   * Check if node should auto-execute on creation
   * @param {string} nodeType - Node type
   * @returns {boolean}
   */
  shouldAutoExecuteOnCreate(nodeType) {
    return this.autoExecuteOnCreate.includes(nodeType)
  }

  /**
   * Check if node should auto-execute on config change
   * @param {string} nodeType - Node type
   * @returns {boolean}
   */
  shouldAutoExecuteOnConfigChange(nodeType) {
    return this.autoExecuteOnConfigChange.includes(nodeType)
  }

  /**
   * Check if node should auto-execute on data received
   * @param {string} nodeType - Node type
   * @returns {boolean}
   */
  shouldAutoExecuteOnDataReceived(nodeType) {
    return this.autoExecuteOnDataReceived.includes(nodeType)
  }

  /**
   * Check if node should auto-execute based on trigger
   * @param {string} nodeType - Node type
   * @param {string} trigger - Trigger type ('create', 'config', 'data')
   * @returns {boolean}
   */
  shouldAutoExecute(nodeType, trigger) {
    switch (trigger) {
      case 'create':
        return this.shouldAutoExecuteOnCreate(nodeType)
      case 'config':
        return this.shouldAutoExecuteOnConfigChange(nodeType)
      case 'data':
        return this.shouldAutoExecuteOnDataReceived(nodeType)
      default:
        return false
    }
  }

  /**
   * Get auto-execute delay
   * @returns {number} Delay in milliseconds
   */
  getDelay() {
    return this.autoExecuteDelay
  }

  /**
   * Set auto-execute delay
   * @param {number} delay - Delay in milliseconds
   */
  setDelay(delay) {
    this.autoExecuteDelay = delay
  }

  /**
   * Check if node has execution flow inputs
   * (nodes with exec inputs should not auto-execute)
   * @param {string} nodeId - Node ID
   * @param {Array} edges - All edges
   * @returns {boolean}
   */
  hasExecInputs(nodeId, edges) {
    return edges.some(e =>
      e.target === nodeId && e.edgeType === 'exec'
    )
  }

  /**
   * Get nodes affected by a source node change
   * @param {string} sourceNodeId - Source node ID
   * @param {Array} nodes - All nodes
   * @param {Array} edges - All edges
   * @returns {Array} Affected node IDs
   */
  getAffectedNodes(sourceNodeId, nodes, edges) {
    const affected = []
    const visited = new Set()

    const traverse = (nodeId) => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)

      // Find outgoing data edges
      const outgoingEdges = edges.filter(e =>
        e.source === nodeId && e.edgeType === 'data'
      )

      for (const edge of outgoingEdges) {
        const targetNode = nodes.find(n => n.id === edge.target)
        if (!targetNode) continue

        // Only include nodes that auto-execute on data received
        if (this.shouldAutoExecuteOnDataReceived(targetNode.type)) {
          // Only if they don't have exec inputs
          if (!this.hasExecInputs(targetNode.id, edges)) {
            affected.push(targetNode.id)
            // Recursively check downstream nodes
            traverse(targetNode.id)
          }
        }
      }
    }

    traverse(sourceNodeId)
    return affected
  }

  /**
   * Determine execution trigger for a node
   * @param {Object} node - Node instance
   * @param {Array} edges - All edges
   * @param {string} context - Context ('create', 'config-change', 'upstream-execution')
   * @returns {string|null} Trigger type or null if shouldn't execute
   */
  determineTrigger(node, edges, context) {
    // Nodes with exec inputs never auto-execute
    if (this.hasExecInputs(node.id, edges)) {
      return null
    }

    switch (context) {
      case 'create':
        return this.shouldAutoExecuteOnCreate(node.type) ? 'create' : null

      case 'config-change':
        return this.shouldAutoExecuteOnConfigChange(node.type) ? 'config' : null

      case 'upstream-execution':
        return this.shouldAutoExecuteOnDataReceived(node.type) ? 'data' : null

      default:
        return null
    }
  }

  /**
   * Get execution plan for auto-execution
   * Returns nodes in topological order that should execute
   * @param {string} triggerNodeId - Node that triggered the change
   * @param {Array} nodes - All nodes
   * @param {Array} edges - All edges
   * @param {string} context - Context ('create', 'config-change', 'upstream-execution')
   * @returns {Array} Node IDs in execution order
   */
  getExecutionPlan(triggerNodeId, nodes, edges, context) {
    const plan = []

    // If context is create or config-change, only execute the trigger node
    if (context === 'create' || context === 'config-change') {
      const node = nodes.find(n => n.id === triggerNodeId)
      if (node && this.determineTrigger(node, edges, context)) {
        plan.push(triggerNodeId)
      }
    }

    // If context is upstream-execution, execute affected downstream nodes
    if (context === 'upstream-execution') {
      const affected = this.getAffectedNodes(triggerNodeId, nodes, edges)
      plan.push(...affected)
    }

    return plan
  }

  /**
   * Add custom auto-execute rule
   * @param {string} nodeType - Node type
   * @param {string} trigger - Trigger type ('create', 'config', 'data')
   */
  addAutoExecuteRule(nodeType, trigger) {
    switch (trigger) {
      case 'create':
        if (!this.autoExecuteOnCreate.includes(nodeType)) {
          this.autoExecuteOnCreate.push(nodeType)
        }
        break
      case 'config':
        if (!this.autoExecuteOnConfigChange.includes(nodeType)) {
          this.autoExecuteOnConfigChange.push(nodeType)
        }
        break
      case 'data':
        if (!this.autoExecuteOnDataReceived.includes(nodeType)) {
          this.autoExecuteOnDataReceived.push(nodeType)
        }
        break
    }
  }

  /**
   * Remove auto-execute rule
   * @param {string} nodeType - Node type
   * @param {string} trigger - Trigger type ('create', 'config', 'data')
   */
  removeAutoExecuteRule(nodeType, trigger) {
    switch (trigger) {
      case 'create':
        this.autoExecuteOnCreate = this.autoExecuteOnCreate.filter(t => t !== nodeType)
        break
      case 'config':
        this.autoExecuteOnConfigChange = this.autoExecuteOnConfigChange.filter(t => t !== nodeType)
        break
      case 'data':
        this.autoExecuteOnDataReceived = this.autoExecuteOnDataReceived.filter(t => t !== nodeType)
        break
    }
  }

  /**
   * Get all auto-execute rules
   * @returns {Object} All rules
   */
  getRules() {
    return {
      onCreate: [...this.autoExecuteOnCreate],
      onConfigChange: [...this.autoExecuteOnConfigChange],
      onDataReceived: [...this.autoExecuteOnDataReceived]
    }
  }
}
