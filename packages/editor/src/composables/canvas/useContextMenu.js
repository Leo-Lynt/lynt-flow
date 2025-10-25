/**
 * Context Menu Composable
 * Handles context menu display and node creation from menu
 */
import { ref } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { createNodeFromType } from '../../utils/nodeFactory'

export function useContextMenu(canvasRef) {
  const { viewportRef, project } = useVueFlow()
  const showContextMenu = ref(false)
  const contextMenuPosition = ref({ x: 0, y: 0 })

  const quickAddNodes = [
    { type: 'connector', label: 'Data Connector', icon: 'material-symbols:cable' },
    { type: 'field-extractor', label: 'Field Extractor', icon: 'material-symbols:filter-alt' },
    { type: 'add', label: 'Add', icon: 'material-symbols:add' },
    { type: 'output', label: 'Output', icon: 'material-symbols:output' }
  ]

  const showContextMenuAt = (x, y) => {
    contextMenuPosition.value = { x, y }
    showContextMenu.value = true
  }

  const hideContextMenu = () => {
    showContextMenu.value = false
  }

  const createNodeFromMenu = (nodeType, mousePosition) => {
    const flowPosition = screenToFlowCoordinates(mousePosition.x, mousePosition.y)
    createNodeFromType(nodeType, flowPosition)
    hideContextMenu()
  }

  const screenToFlowCoordinates = (screenX, screenY) => {
    if (!viewportRef.value) {
      const rect = canvasRef.value?.getBoundingClientRect()
      if (rect) {
        return {
          x: screenX - rect.left,
          y: screenY - rect.top
        }
      }
      return { x: screenX, y: screenY }
    }

    const rect = viewportRef.value.getBoundingClientRect()
    return project({
      x: screenX - rect.left,
      y: screenY - rect.top
    })
  }

  return {
    showContextMenu,
    contextMenuPosition,
    quickAddNodes,
    showContextMenuAt,
    hideContextMenu,
    createNodeFromMenu,
    screenToFlowCoordinates
  }
}