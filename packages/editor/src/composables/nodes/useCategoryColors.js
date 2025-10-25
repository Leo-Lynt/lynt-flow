/**
 * Category Color Management
 * Maps node categories to color schemes
 */

export const categoryColors = {
  // New unified categories
  'data-input': '#3b82f6',       // blue-500 - Data & Input
  'logic-control': '#a855f7',    // purple-500 - Logic & Control
  'operations': '#22c55e',       // green-500 - Operations
  'data-processing': '#f97316',  // orange-500 - Data Processing
  'debug': '#6b7280',            // gray-500 - Debug & Utilities
  'organization': '#6b7280',     // gray-500 - Organization

  // Legacy categories (for backwards compatibility)
  'sources': '#3b82f6',
  'io': '#3b82f6',
  'storage': '#3b82f6',
  'constants': '#3b82f6',
  'comparison': '#a855f7',
  'logic': '#a855f7',
  'iteration': '#a855f7',
  'math': '#22c55e',
  'string': '#22c55e',
  'conversion': '#22c55e',
  'processors': '#f97316',
  'array-processors': '#f97316',
  'object-processors': '#f97316',
}

/**
 * Get color for a given category
 * @param {string} category - Node category
 * @returns {string} Hex color code
 */
export function getCategoryColor(category) {
  return categoryColors[category] || '#3b82f6' // Default: blue
}

/**
 * Composable for category colors
 */
export function useCategoryColors() {
  return {
    categoryColors,
    getCategoryColor
  }
}
