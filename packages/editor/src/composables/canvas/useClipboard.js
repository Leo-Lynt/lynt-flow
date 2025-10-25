/**
 * Clipboard Composable
 * Handles copy/paste operations for nodes
 */
import { ref, computed } from 'vue'
import { useFlowStore } from '../../stores/flowStore'
import { deepClone } from '@leo-lynt/lynt-flow-core'

export function useClipboard(screenToFlowCoordinates) {
  const flowStore = useFlowStore()
  const clipboard = ref([])

  const nodes = computed(() => flowStore.nodes)

  const copySelectedNodes = () => {
    const selected = nodes.value.filter(node => node.selected)
    if (selected.length === 0) return

    clipboard.value = selected.map(node => ({
      ...node,
      data: deepClone(node.data),
      position: { ...node.position }
    }))
  }

  const pasteNodes = (mousePosition) => {
    if (clipboard.value.length === 0) return

    const flowPosition = screenToFlowCoordinates(mousePosition.x, mousePosition.y)
    const offset = 30

    clipboard.value.forEach((clipboardNode, index) => {
      const newNode = {
        ...clipboardNode,
        id: `${clipboardNode.type}_${Date.now()}_${index}`,
        position: {
          x: flowPosition.x + (index * offset),
          y: flowPosition.y + (index * offset)
        },
        data: deepClone(clipboardNode.data),
        selected: false
      }

      flowStore.addNode(newNode)
    })
  }

  return {
    clipboard,
    copySelectedNodes,
    pasteNodes
  }
}