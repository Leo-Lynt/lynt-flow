/**
 * @flow-forge/core - Main Entry Point
 * Pure JavaScript execution engines and utilities
 * Safe for Node.js and browser environments
 */

// Engines
export { FlowEngine, TypeEngine, AutoExecutionEngine } from './engine/index.js'

// Utilities
export {
  deepClone,
  getFieldValue,
  topologicalSort,
  unwrapData
} from './utils/index.js'

// Re-export all for convenience
export * from './engine/index.js'
export * from './utils/index.js'
