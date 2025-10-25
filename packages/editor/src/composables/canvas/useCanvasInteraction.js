/**
 * Canvas Interaction Composable
 * Handles drag, drop, mouse, and keyboard interactions on the canvas
 */
import { ref } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { createNodeFromType } from '../../utils/nodeFactory'

export function useCanvasInteraction(canvasRef, showContextMenu, hideContextMenu) {
  const { project, addNodes } = useVueFlow()
  const mousePosition = ref({ x: 0, y: 0 })

  const handleDrop = (event) => {
    event.preventDefault()
    const nodeDataStr = event.dataTransfer.getData('application/vueflow')

    if (!nodeDataStr) return

    try {
      const nodeData = JSON.parse(nodeDataStr)
      const position = project({
        x: event.clientX - event.target.getBoundingClientRect().left,
        y: event.clientY - event.target.getBoundingClientRect().top,
      })

      const newNode = createNodeFromType(nodeData.type, position)
      addNodes([newNode])
    } catch (error) {
    }
  }

  const handleMouseMove = (event) => {
    const interactiveElements = ['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA']
    const isOnInteractiveElement = interactiveElements.includes(event.target.tagName)

    if (!isOnInteractiveElement) {
      mousePosition.value = {
        x: event.clientX,
        y: event.clientY
      }
    }
  }

  const handleCanvasClick = (event) => {
    const interactiveElements = ['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA']
    const isInteractiveElement = interactiveElements.includes(event.target.tagName)

    if (isInteractiveElement) {
      return
    }

    if (showContextMenu.value) {
      hideContextMenu()
    }

    const isClickingOnNode = event.target.closest('.vue-flow__node')
    if (!isClickingOnNode) {
      canvasRef.value?.focus()
    }
  }

  const handleKeyDown = (event, copySelectedNodes, pasteNodes, showContextMenuAt) => {
    const interactiveElements = ['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA']
    const isFocusedOnInteractive = interactiveElements.includes(document.activeElement?.tagName)

    if (isFocusedOnInteractive) {
      if (event.key === 'Escape' && showContextMenu.value) {
        hideContextMenu()
      }
      return
    }

    // Ctrl+C - Copy
    if (event.ctrlKey && event.key === 'c') {
      event.preventDefault()
      copySelectedNodes()
      return
    }

    // Ctrl+V - Paste
    if (event.ctrlKey && event.key === 'v') {
      event.preventDefault()
      pasteNodes()
      return
    }

    // Space - Context Menu
    if (event.code === 'Space') {
      event.preventDefault()
      showContextMenuAt(mousePosition.value.x, mousePosition.value.y)
      return
    }

    // Escape - Close Context Menu
    if (event.key === 'Escape') {
      hideContextMenu()
      return
    }
  }

  return {
    mousePosition,
    handleDrop,
    handleMouseMove,
    handleCanvasClick,
    handleKeyDown
  }
}