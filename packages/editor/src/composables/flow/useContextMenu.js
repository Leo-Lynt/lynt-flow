import { ref } from 'vue'

/**
 * Composable for context menu management
 */
export function useContextMenu() {
  const showContextMenu = ref(false)
  const contextMenuPosition = ref({ x: 0, y: 0 })
  const lastRightClickPosition = ref({ x: 0, y: 0 })

  const openContextMenu = (x, y) => {
    contextMenuPosition.value = { x, y }
    lastRightClickPosition.value = { x, y }
    showContextMenu.value = true
  }

  const closeContextMenu = () => {
    showContextMenu.value = false
  }

  const handleContextMenu = (event) => {
    event.preventDefault()
    openContextMenu(event.clientX, event.clientY)
  }

  return {
    showContextMenu,
    contextMenuPosition,
    lastRightClickPosition,
    openContextMenu,
    closeContextMenu,
    handleContextMenu,
  }
}
