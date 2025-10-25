/**
 * Marker/Frame Node
 * Visual organization tool - does not execute
 */

export function execute({ nodeData, inputs }) {
  // Marker nodes don't execute - they're just visual containers
  return {}
}

export function validate(nodeData) {
  return { valid: true, errors: [] }
}
