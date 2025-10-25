import { ref } from 'vue'

/**
 * Composable for canvas event handling (drag, drop, keyboard)
 */
export function useCanvasEvents(flowStore, createNodeAtPosition) {
  const pressedKeys = ref(new Set())
  const canvasRef = ref(null)

  /**
   * Handle node drop on canvas
   */
  const handleDrop = (event) => {
    try {
      const nodeTypeData = event.dataTransfer.getData('application/node')
      if (!nodeTypeData) return

      const nodeType = JSON.parse(nodeTypeData)
      const canvasRect = event.currentTarget.getBoundingClientRect()

      const x = event.clientX - canvasRect.left
      const y = event.clientY - canvasRect.top

      createNodeAtPosition(nodeType.type, x, y)
    } catch (error) {
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = (event) => {
    pressedKeys.value.add(event.key)

    // Ctrl/Cmd + S: Save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault()
      // Trigger save
    }

    // Delete: Remove selected nodes
    if (event.key === 'Delete') {
      // Handled by VueFlow
    }

    // Escape: Clear selection
    if (event.key === 'Escape') {
      // Clear selection logic
    }
  }

  /**
   * Handle key up
   */
  const handleKeyUp = (event) => {
    pressedKeys.value.delete(event.key)
  }

  /**
   * Focus canvas for keyboard events
   */
  const focusCanvas = () => {
    if (canvasRef.value) {
      canvasRef.value.focus()
    }
  }

  return {
    canvasRef,
    pressedKeys,
    handleDrop,
    handleKeyDown,
    handleKeyUp,
    focusCanvas,
  }
}
