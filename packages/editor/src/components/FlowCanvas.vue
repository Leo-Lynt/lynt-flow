<template>
  <div class="h-screen flex flex-col relative overflow-hidden">
    <!-- Background base branco -->
    <div class="fixed inset-0 bg-white -z-10"></div>

    <!-- Background Gradient Orbs (sutis, estáticos) -->
    <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#f2f7ff]">
      <div class="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-300/20 rounded-full blur-3xl"></div>
      <div class="absolute top-1/3 left-1/4 w-[450px] h-[450px] bg-cyan-300/15 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-purple-300/10 rounded-full blur-3xl"></div>
    </div>

    <!-- Grid pattern sutil -->
    <div class="fixed inset-0 opacity-[0.02] -z-5 pointer-events-none">
      <div class="absolute inset-0" style="background-image: radial-gradient(circle, #3B82F6 1px, transparent 1px); background-size: 40px 40px;"></div>
    </div>

    <!-- Top Toolbar -->
    <TopToolbar
      :can-undo="flowStore.canUndo"
      :can-redo="flowStore.canRedo"
      :execution-status="executionStatus"
      :has-unsaved-changes="flowStore.hasUnsavedChanges"
      :hide-save-button="props.hideSaveButton"
      :playground-mode="props.demoMode"
      @execute="executeFlow"
      @clear="clearFlow"
      @undo="flowStore.undo"
      @redo="flowStore.redo"
      @save="handleManualSave"
    />

    <div class="flex flex-1 overflow-hidden">
      <!-- Left Sidebar - Node List -->
      <NodeSidebar v-if="!props.hideSidebar" />

      <!-- Center - Canvas -->
      <div class="flex-1 relative outline-none focus:outline-none" @drop="handleDrop" @dragover.prevent
        @keydown="handleKeyDown" @keyup="handleKeyUp" @click="handleCanvasClick" @mousemove="handleMouseMove"
        @contextmenu.prevent tabindex="0" ref="canvasRef">
        <VueFlow :nodes="nodes" :edges="edgesWithAttributes" @nodes-change="handleNodesChange"
          @edges-change="handleEdgesChange" @connect="onConnect" @connect-start="onConnectStart"
          @connect-end="onConnectEnd" @edge-click="onEdgeClick" @node-click="handleNodeClick"
          @node-drag-start="handleNodeDragStart" @node-drag="handleNodeDrag" @node-drag-stop="handleNodeDragStop"
          :default-edge-options="defaultEdgeOptions" :is-valid-connection="isValidConnection" :fit-view-on-init="false"
          :connection-mode="ConnectionMode.Loose"
          :zoom-on-scroll="true" :pan-on-scroll="false" :pan-on-drag="[1, 2]" :node-draggable="true"
          :nodes-deletable="props.allowDelete" :edges-deletable="props.allowDelete" :delete-key-code="'Delete'"
          :multi-selection-key-code="'Control'" :selection-mode="'partial'"
          class="w-full h-full bg-transparent">
          <Background :variant="BackgroundVariant.Dots" pattern-color="#94a3b8" />
          <MiniMap v-if="!props.hideMinimap" pannable zoomable />
          <Controls v-if="!props.hideControls" />

          <!-- Generic Node Templates -->
          <template #node-connector="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-add="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-subtract="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-multiply="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-divide="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-round="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-array-filter="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-array-aggregate="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-array-slice="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-array-sort="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-array-map="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-array-groupby="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-array-distinct="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-array-merge="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-object-create="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-array-create="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-object-merge="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-object-pick="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-object-keys-values="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-object-rename="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-object-set-property="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-object-to-array="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-object-transform="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-field-extractor="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-output="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-variable="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-input="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-constant="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-compare="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-conditional-branch="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-type-conversion="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-logic="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-string-ops="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-for-each="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-while-loop="props">
            <GenericNode v-bind="props" />
          </template>
          <template #node-marker="props">
            <MarkerNode v-bind="props" />
          </template>
          <template #node-debug-viewer="props">
            <DebugViewerNode v-bind="props" />
          </template>
        </VueFlow>

        <!-- Context Menu (usado para right-click e Quick Add) -->
        <ContextMenu :show="showContextMenu" :position="contextMenuPosition" :nodes="quickAddNodes"
          @create-node="createNodeFromMenu" />
      </div>

      <!-- Right Sidebar - Properties Panel -->
      <PropertiesPanel :selected-node="selectedNode" @close="selectedNode = null" @delete="selectedNode = null" />
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { VueFlow, useVueFlow, ConnectionMode } from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

import { useFlowStore } from '../stores/flowStore'

// Props para modo demo/playground
const props = defineProps({
  demoMode: {
    type: Boolean,
    default: false
  },
  hideSidebar: {
    type: Boolean,
    default: false
  },
  hideSaveButton: {
    type: Boolean,
    default: false
  },
  hideMinimap: {
    type: Boolean,
    default: false
  },
  hideControls: {
    type: Boolean,
    default: false
  },
  allowDelete: {
    type: Boolean,
    default: true
  }
})
import { useContextMenu as useContextMenuComposable } from '../composables/flow/useContextMenu'
import { deepClone } from '@leo-lynt/lynt-flow-core'
import { getTypeColor } from '@leo-lynt/lynt-flow-core/engine/dataTypes.js'
import {
  getHandleType as getHandleTypeFromSystem,
  getAcceptedTypes,
  isConnectionValid,
  validateConnection
} from '@leo-lynt/lynt-flow-core/engine/typeSystem.js'
import { getNodeDefinition } from '../engine/registry'
import TopToolbar from './TopToolbar.vue'
import NodeSidebar from './NodeSidebar.vue'
import PropertiesPanel from './PropertiesPanel.vue'
import ContextMenu from './flow/ContextMenu.vue'
import GenericNode from './nodes/GenericNode.vue'
import DebugViewerNode from './nodes/DebugViewerNode.vue'
import MarkerNode from './nodes/MarkerNode.vue'
import FlowIcon from './Icon.vue'

const flowStore = useFlowStore()
const { addNodes, addEdges, project, viewportRef, updateNode, getSelectedEdges, fitView } = useVueFlow()
const canvasRef = ref(null)

// Quick Add menu state
const quickAddMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  sourceNodeId: null,
  sourceHandle: null,
  compatibleNodes: []
})

// Track connection being dragged
const connectionInProgress = ref({
  active: false,
  sourceNodeId: null,
  sourceHandle: null
})

// Flag para indicar se uma conexão foi criada com sucesso
const connectionJustMade = ref(false)

// Prevenir fechamento imediato do menu após abrir
const justOpenedMenu = ref(false)

// Auto-centralizar view quando nodes carregarem (tanto editor quanto playground)
const hasInitiallyFitted = ref(false)

watch(
  () => flowStore.nodes,
  async (newNodes) => {
    if (newNodes && newNodes.length > 0 && !hasInitiallyFitted.value) {
      // Aguardar o próximo tick para garantir que o DOM foi atualizado
      await nextTick()
      // Pequeno delay adicional para garantir que os nodes foram renderizados
      setTimeout(() => {
        fitView({ padding: 2, duration: 0 })
        hasInitiallyFitted.value = true
      }, 100)
    }
  },
  { immediate: true }
)

// 🚀 PERFORMANCE: Computed simples que sempre retorna nodes atualizados
const nodes = computed(() => {
  // Adicionar deletable: false para Input e Output nodes
  return flowStore.nodes.map(node => {
    if (node.type === 'input' || node.type === 'output') {
      return { ...node, deletable: false }
    }
    return node
  })
})

// 🚀 PERFORMANCE: Map para lookup rápido O(1) ao invés de .find() O(n)
// Criado APÓS nodes para garantir que usa nodes processados
const nodesMap = computed(() => {
  const map = new Map()
  nodes.value.forEach(node => map.set(node.id, node))
  return map
})

const edges = computed(() => {
  return flowStore.edges
})

// 🚀 OTIMIZAÇÃO: Cache de edges processadas para evitar recálculo desnecessário
const edgesCache = new Map() // edgeId -> { edge, sourceNodeType, executionResultsHash }
let isDraggingNode = false // Flag para pular recálculo durante drag

// 🚀 PERFORMANCE: Hash leve ao invés de JSON.stringify
const getExecutionResultsHash = (nodeId) => {
  const result = flowStore.executionResults[nodeId]
  if (!result) return 'null'
  // Hash simples baseado em tipo e length (muito mais rápido que JSON.stringify)
  return `${typeof result}-${Array.isArray(result) ? result.length : Object.keys(result).length}`
}

// Adicionar atributo data-edge-type para estilização CSS
const edgesWithAttributes = computed(() => {
  // 🚀 PERFORMANCE: Se está arrastando node, retornar cache sem recalcular
  if (isDraggingNode && edgesCache.size > 0) {
    return Array.from(edgesCache.values()).map(cached => cached.edge)
  }

  const result = edges.value.map(edge => {
    // Garantir que edge tem todas as propriedades necessárias
    if (!edge.source || !edge.target) {
      return null
    }

    // Criar chave de cache baseada em propriedades relevantes
    const cacheKey = `${edge.id}-${edge.source}-${edge.target}-${edge.sourceHandle}-${edge.edgeType}`

    // Hash leve dos execution results
    const executionResultsHash = getExecutionResultsHash(edge.source)

    // Verificar se edge está em cache e se nada mudou
    if (edgesCache.has(cacheKey)) {
      const cached = edgesCache.get(cacheKey)

      // 🚀 PERFORMANCE: Usar nodesMap ao invés de .find()
      const sourceNode = nodesMap.value.get(edge.source)

      if (sourceNode &&
          cached.sourceNodeType === sourceNode.type &&
          cached.executionResultsHash === executionResultsHash) {
        // Cache válido, retornar edge processada
        return cached.edge
      }
    }

    // Cache inválido ou não existe, processar edge
    let edgeStyle = {}
    let markerEnd = {}
    let dataType = 'any'

    // Para edges de fluxo (exec)
    if (edge.edgeType === 'flow') {
      edgeStyle = {
        stroke: '#9ca3af',
        strokeWidth: 3
      }
      markerEnd = {
        type: 'arrowclosed',
        width: 10,
        height: 10,
        color: '#9ca3af'
      }
    } else {
      // 🚀 PERFORMANCE: Usar nodesMap ao invés de .find()
      const sourceNode = nodesMap.value.get(edge.source)
      if (sourceNode) {
        dataType = getHandleType(sourceNode, edge.sourceHandle, 'source')
        const typeColor = getTypeColor(dataType)

        edgeStyle = {
          stroke: typeColor,
          strokeWidth: 2.5
        }

        markerEnd = {
          type: 'arrowclosed',
          width: 8,
          height: 8,
          color: typeColor
        }
      } else {
        // Fallback se não encontrar source node
        edgeStyle = {
          stroke: '#3b82f6',
          strokeWidth: 2.5
        }
        markerEnd = {
          type: 'arrowclosed',
          width: 8,
          height: 8,
          color: '#3b82f6'
        }
      }
    }

    const edgeWithAttrs = {
      ...edge,
      type: 'default', // Força VueFlow a aplicar styles customizados
      animated: edge.edgeType === 'flow', // Animar apenas edges de fluxo
      class: edge.edgeType === 'flow' ? 'flow-edge' : `data-edge data-edge-type-${dataType}`,
      style: edgeStyle,
      markerEnd: markerEnd,
      data: {
        ...edge.data,
        edgeType: edge.edgeType,
        dataType: dataType
      }
    }

    // Armazenar em cache
    const sourceNode = nodesMap.value.get(edge.source)
    edgesCache.set(cacheKey, {
      edge: edgeWithAttrs,
      sourceNodeType: sourceNode?.type,
      executionResultsHash
    })

    return edgeWithAttrs
  }).filter(Boolean) // Remove edges inválidos

  return result
})

const checkOAuthCallback = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const success = urlParams.get('success')
  const error = urlParams.get('error')
  const email = urlParams.get('email')

  if (success === 'true') {
    // Show success notification
    alert(`✅ Successfully connected to Google Analytics!\n\nAccount: ${email}`)

    // Clean OAuth params but keep flowId and other params
    urlParams.delete('success')
    urlParams.delete('error')
    urlParams.delete('provider')
    urlParams.delete('serviceType')
    urlParams.delete('email')

    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '')
    window.history.replaceState({}, document.title, newUrl)

    // Reload connections in properties panel if it's open
    window.dispatchEvent(new CustomEvent('oauth-success'))
  }

  if (error) {
    alert(`❌ Connection failed: ${error}`)

    // Clean OAuth params but keep flowId and other params
    urlParams.delete('success')
    urlParams.delete('error')
    urlParams.delete('provider')
    urlParams.delete('serviceType')
    urlParams.delete('email')

    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '')
    window.history.replaceState({}, document.title, newUrl)
  }
}

// UI State
const selectedNode = ref(null)
const executionStatus = ref(null)
const clipboard = ref([])
const mousePosition = ref({ x: 0, y: 0 })

// Context Menu Composable
const {
  showContextMenu,
  contextMenuPosition,
  openContextMenu,
  closeContextMenu
} = useContextMenuComposable()

const quickAddNodes = ref([
  { type: 'input', label: 'Input', icon: 'material-symbols:input' },
  { type: 'connector', label: 'Data Connector', icon: 'material-symbols:cable' },
  { type: 'field-extractor', label: 'Field Extractor', icon: 'material-symbols:filter-alt' },
  { type: 'add', label: 'Add', icon: 'material-symbols:add' },
  { type: 'output', label: 'Output', icon: 'material-symbols:output' }
])

const defaultEdgeOptions = {
  type: 'default', // Bezier curves - linhas suaves
  animated: true,
  style: {
    stroke: '#9ca3af', // Mesma cor das esferas exec (gray-400)
    strokeWidth: 2,
  },
  markerEnd: {
    type: 'arrowclosed',
    width: 10, // Reduzido de 15 para 10
    height: 10, // Reduzido de 15 para 10
    color: '#9ca3af', // Mesma cor das esferas exec
  },
}

// Node Management
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
    // Error handled silently
  }
}

const createNodeFromType = (type, position) => {
  const baseNode = {
    id: `${type}_${Date.now()}`,
    type,
    position,
    data: {},
    zIndex: 1 // Default z-index para todos os nodes (acima de markers que têm -100)
  }

  switch (type) {
    case 'connector':
      baseNode.data = {
        label: 'Data Connector',
        sourceType: 'api', // Default to 'api' (valid option)
        apiUrl: '',
        dataPath: ''
      }
      break
    case 'field-extractor':
      baseNode.data = {
        label: 'Field Extractor',
        selectedFields: []
      }
      break
    case 'add':
    case 'subtract':
    case 'multiply':
    case 'divide':
      baseNode.data = {
        label: type.charAt(0).toUpperCase() + type.slice(1),
        operation: type
      }
      break
    case 'output':
      baseNode.data = {
        label: 'Output',
        customInputs: []
      }
      baseNode.deletable = false // 🚀 Output node não pode ser deletado
      break
    case 'constant':
      baseNode.data = {
        label: 'Constant',
        valueType: 'number',
        numberValue: 0,
        stringValue: '',
        booleanValue: false,
        objectValue: '{}',
        arrayValue: '[]'
      }
      break
    case 'compare':
      baseNode.data = {
        label: 'Compare',
        operation: 'equals'
      }
      break
    case 'type-conversion':
      baseNode.data = {
        label: 'Type Conversion',
        targetType: 'string'
      }
      break
    case 'logic':
      baseNode.data = {
        label: 'Logic Operation',
        operation: 'and'
      }
      break
    case 'string-ops':
      baseNode.data = {
        label: 'String Operations',
        operation: 'concat',
        templateString: 'Hello {name}!'
      }
      break
    case 'marker':
      baseNode.data = {
        label: 'Frame',
        name: 'Frame',
        color: 'rgba(147, 197, 253, 0.2)', // Blue com 20% opacidade (80% transparência)
        width: 400,
        height: 300
      }
      baseNode.zIndex = -100 // Sempre atrás de todos os nodes
      baseNode.selectable = true
      baseNode.draggable = true
      break
    case 'input':
      baseNode.data = {
        label: 'Input',
        parameters: [
          {
            name: 'param1',
            type: 'string',
            required: false,
            defaultValue: 'Hello World'
          }
        ]
      }
      baseNode.deletable = false // 🚀 Input node não pode ser deletado
      break
    case 'variable':
      baseNode.data = {
        label: 'Variable',
        mode: 'get',
        variableName: ''
      }
      break
    default:
      baseNode.data = {
        label: type.charAt(0).toUpperCase() + type.slice(1)
      }
  }

  flowStore.addNode(baseNode)
  return baseNode
}

// Event Handlers
const handleNodeClick = (event) => {
  selectedNode.value = event.node
}

// Estado para rastrear nodes dentro de markers durante drag
let lastMarkerPosition = new Map() // markerId -> {x, y}

const handleNodeDragStart = (event) => {
  flowStore.setDragging(true)
  // 🚀 PERFORMANCE: Ativar flag para pular recálculo de edges durante drag
  isDraggingNode = true

  // Se for um marker, salvar posição inicial
  if (event.node.type === 'marker') {
    lastMarkerPosition.set(event.node.id, {
      x: event.node.position.x,
      y: event.node.position.y
    })
  }
}

// Função helper para detectar nodes dentro de um marker
// Usa detecção por bounding box overlap (sobreposição)
const getNodesInsideMarker = (marker) => {
  const markerBox = {
    x1: marker.position.x,
    y1: marker.position.y,
    x2: marker.position.x + (marker.data.width || 400),
    y2: marker.position.y + (marker.data.height || 300)
  }

  return nodes.value
    .filter(n => n.id !== marker.id && n.type !== 'marker') // Excluir markers
    .filter(n => {
      // Estimar tamanho do node (GenericNode tem ~200px width, ~120px height)
      // Valores podem variar, mas essa é uma boa aproximação
      const nodeWidth = 200
      const nodeHeight = 120

      const nodeBox = {
        x1: n.position.x,
        y1: n.position.y,
        x2: n.position.x + nodeWidth,
        y2: n.position.y + nodeHeight
      }

      // Verificar se há sobreposição entre as bounding boxes
      // Duas caixas se sobrepõem se:
      // - A esquerda de uma está à esquerda da direita da outra E
      // - O topo de uma está acima do fundo da outra
      const overlapsX = nodeBox.x1 < markerBox.x2 && nodeBox.x2 > markerBox.x1
      const overlapsY = nodeBox.y1 < markerBox.y2 && nodeBox.y2 > markerBox.y1

      // Considerar "dentro" se houver qualquer sobreposição
      // Alternativamente, pode exigir que o CENTRO esteja dentro:
      const nodeCenterX = n.position.x + nodeWidth / 2
      const nodeCenterY = n.position.y + nodeHeight / 2
      const centerInside = (
        nodeCenterX >= markerBox.x1 &&
        nodeCenterX <= markerBox.x2 &&
        nodeCenterY >= markerBox.y1 &&
        nodeCenterY <= markerBox.y2
      )

      // Usar estratégia: centro do node deve estar dentro do marker
      // Isso evita "arrastar acidentalmente" nodes que só tocam a borda
      return centerInside
    })
}

const handleNodeDrag = (event) => {
  // Evento não usado - lógica movida para handleNodesChange
  // (VueFlow dispara handleNodesChange durante o drag, que é mais confiável)
}

const handleNodeDragStop = (event) => {
  flowStore.setDragging(false)
  // 🚀 PERFORMANCE: Desativar flag e forçar recálculo de edges após drag
  isDraggingNode = false

  // Salvar posição final no store após drag (usando updateNodePosition para evitar auto-execução)
  if (event.node) {
    flowStore.updateNodePosition(event.node.id, event.node.position)

    // Se for marker, salvar posições finais dos children também
    if (event.node.type === 'marker' && lastMarkerPosition.has(event.node.id)) {
      // Detectar nodes que estavam dentro durante o último movimento
      const childrenInside = getNodesInsideMarker(event.node)

      childrenInside.forEach(child => {
        flowStore.updateNodePosition(child.id, child.position)
      })

      // Limpar estado
      lastMarkerPosition.delete(event.node.id)
    }
  }
}

const handleNodesChange = (changes) => {
  changes.forEach(change => {
    if (change.type === 'position' && change.position) {
      // 🚀 PERFORMANCE: Usar nodesMap ao invés de .find()
      const node = nodesMap.value.get(change.id)
      const isMarker = node?.type === 'marker'

      if (isMarker && flowStore.isDragging) {
        // Se for marker, mover nodes internos junto
        if (lastMarkerPosition.has(change.id)) {
          const lastPos = lastMarkerPosition.get(change.id)
          const deltaX = change.position.x - lastPos.x
          const deltaY = change.position.y - lastPos.y

          // Detectar e mover nodes internos
          const childrenInside = getNodesInsideMarker({
            ...node,
            position: lastPos
          })

          childrenInside.forEach(child => {
            const newPos = {
              x: child.position.x + deltaX,
              y: child.position.y + deltaY
            }

            // Atualizar VueFlow (visual)
            updateNode(child.id, { position: newPos })

            // Atualizar flowStore (dados)
            flowStore.updateNodePosition(child.id, newPos)
          })

          lastMarkerPosition.set(change.id, change.position)
        }
      }

      // 🚀 OTIMIZAÇÃO: Para mudanças de posição, SEMPRE usar updateNodePosition
      // updateNode só deve ser usado para mudanças de DADOS, não de posição
      flowStore.updateNodePosition(change.id, change.position)
    } else if (change.type === 'remove') {
      // 🚀 PERFORMANCE: Usar nodesMap ao invés de .find()
      const node = nodesMap.value.get(change.id)
      if (node && (node.type === 'input' || node.type === 'output')) {
        console.warn(`❌ Cannot remove ${node.type} node: It is required for the flow`)
        return // Bloquear remoção
      }

      const wasRemoved = flowStore.removeNode(change.id)
      if (wasRemoved !== false && selectedNode.value?.id === change.id) {
        selectedNode.value = null
      }
    } else if (change.type === 'select') {
      // 🚀 PERFORMANCE: Usar nodesMap ao invés de .findIndex()
      const node = nodesMap.value.get(change.id)
      if (node) {
        node.selected = change.selected
        if (change.selected) {
          selectedNode.value = node
        }
      }
    }
  })
}

const handleEdgesChange = (changes) => {
  changes.forEach(change => {
    if (change.type === 'remove') {
      flowStore.removeEdge(change.id)
    }
  })
}

const isValidConnection = (connection) => {

  // Permitir conexões se ambos são exec ou ambos são dados
  const sourceIsExec = connection.sourceHandle?.startsWith('exec-')
  const targetIsExec = connection.targetHandle?.startsWith('exec-')

  // Exec só pode conectar com exec, dados só podem conectar com dados
  if (sourceIsExec !== targetIsExec) {
    return false
  }

  // Se é conexão exec, permite
  if (sourceIsExec && targetIsExec) {
    return true
  }

  // Para conexões de dados, usar validateConnection do typeSystem
  const sourceNode = flowStore.nodes.find(n => n.id === connection.source)
  const targetNode = flowStore.nodes.find(n => n.id === connection.target)

  if (!sourceNode || !targetNode) {
    return false
  }

  const isValid = validateConnection(sourceNode, connection.sourceHandle, targetNode, connection.targetHandle, flowStore)

  return isValid
}

// Wrapper para getHandleType do typeSystem
const getHandleType = (node, handleId, handlePosition) => {
  const nodeData = flowStore.nodeData[node.id] || {}
  // Adicionar nodeId ao nodeData para casos dinâmicos
  const nodeDataWithId = { ...nodeData, _nodeId: node.id }

  // Buscar definição no registry do FRONTEND (que tem os nodes carregados)
  const definition = getNodeDefinition(node.type)

  if (!definition) {
    return 'any'
  }

  // Implementar lógica de detecção de tipo diretamente aqui (usando definição do frontend)
  const handleGroup = handlePosition === 'source' ? definition?.handles?.outputs : definition?.handles?.inputs
  const handle = handleGroup?.data?.find(h => h.id === handleId)

  if (!handle) {
    return 'any'
  }

  // Se o handle tem tipo dinâmico, usar lógica de runtime detection
  if (handle.dynamic?.mode === 'runtime-detection') {
    // Tentar obter tipo dos resultados de execução
    const executionResult = flowStore.executionResults[node.id]?.[handleId]
    if (executionResult !== undefined) {
      const detectedType = typeof executionResult === 'number' ? 'number' :
                          typeof executionResult === 'string' ? 'string' :
                          typeof executionResult === 'boolean' ? 'boolean' :
                          Array.isArray(executionResult) ? 'array' :
                          typeof executionResult === 'object' ? 'object' : 'any'
      return detectedType
    }

    // Fallback para savedDetectedTypes
    const savedType = flowStore.savedDetectedTypes[node.id]?.[handleId]
    if (savedType) {
      return savedType
    }
  }

  // Tipo estático da definição
  return handle.type || 'any'
}


const onConnect = (params) => {
  // Validar que params tem source e target
  if (!params.source || !params.target) {
    return
  }

  // Detectar se é conexão de fluxo (exec) ou dados
  const isFlowConnection = params.sourceHandle?.startsWith('exec-') || params.targetHandle?.startsWith('exec-')

  // Validar que exec só conecta com exec
  const sourceIsExec = params.sourceHandle?.startsWith('exec-')
  const targetIsExec = params.targetHandle?.startsWith('exec-')

  if (sourceIsExec !== targetIsExec) {
    return
  }

  // ✨ MÚLTIPLAS CONEXÕES EXEC
  console.log('🔗 onConnect - Nova conexão:', {
    source: params.source,
    sourceHandle: params.sourceHandle,
    target: params.target,
    targetHandle: params.targetHandle,
    isExec: isFlowConnection
  })

  if (isFlowConnection) {
    // exec-out: apenas 1 conexão (remover anterior do source)
    const existingSourceEdges = flowStore.edges.filter(e =>
      e.source === params.source &&
      e.sourceHandle === params.sourceHandle &&
      e.edgeType === 'flow'
    )
    existingSourceEdges.forEach(edge => {
      console.log('🗑️ Removendo conexão anterior do exec-out:', edge.id)
      flowStore.removeEdge(edge.id)
    })

    // exec-in: múltiplas conexões permitidas (não remover)
    console.log('✅ exec-in permite múltiplas conexões')
  } else {
    // Para conexões de dados, remover conexões anteriores no targetHandle
    // (um input de dados só pode receber uma conexão por vez)
    const existingTargetEdges = flowStore.edges.filter(e =>
      e.target === params.target &&
      e.targetHandle === params.targetHandle &&
      e.edgeType === 'data'
    )
    existingTargetEdges.forEach(edge => {
      flowStore.removeEdge(edge.id)
    })
  }

  let edgeColor = '#9ca3af' // Default gray for exec
  let dataType = 'any'

  // Se é conexão de dados, obter cor baseada no tipo
  if (!isFlowConnection) {
    const sourceNode = flowStore.nodes.find(n => n.id === params.source)
    if (sourceNode) {
      dataType = getHandleType(sourceNode, params.sourceHandle, 'source')
      edgeColor = getTypeColor(dataType)
    }
  }

  // Validar que source e target existem
  if (!params.source || !params.target) {
    return
  }

  const newEdge = {
    id: `edge_${Date.now()}`,
    source: params.source,
    target: params.target,
    sourceHandle: params.sourceHandle,
    targetHandle: params.targetHandle,
    edgeType: isFlowConnection ? 'flow' : 'data',
    dataType: dataType, // Armazenar tipo de dado
    animated: isFlowConnection,
    style: {
      stroke: edgeColor,
      strokeWidth: isFlowConnection ? 3 : 2.5,
    },
    markerEnd: {
      type: 'arrowclosed',
      width: isFlowConnection ? 10 : 8,
      height: isFlowConnection ? 10 : 8,
      color: edgeColor,
    },
  }

  // Log da conexão criada
  if (!isFlowConnection) {
    const sourceNode = flowStore.nodes.find(n => n.id === params.source)
    const targetNode = flowStore.nodes.find(n => n.id === params.target)
    const sourceOutputs = flowStore.executionResults[params.source]
    const sourceValue = sourceOutputs?.[params.sourceHandle]

    const targetOutputs = flowStore.executionResults[params.target]
    const targetInputValue = targetOutputs?.[params.targetHandle]
    console.log(`
🔗 NOVA CONEXÃO
├─ OUTPUT
│  ├─ Node: ${sourceNode?.type || 'unknown'} (${params.source})
│  ├─ Parâmetro: ${params.sourceHandle}
│  └─ Valor: ${sourceValue !== undefined ? JSON.stringify(sourceValue) : 'não executado ainda'}
│
└─ INPUT
   ├─ Node: ${targetNode?.type || 'unknown'} (${params.target})
   ├─ Parâmetro: ${params.targetHandle}
   └─ Valor: ${targetInputValue !== undefined ? JSON.stringify(targetInputValue) : 'não executado ainda'}
    `)
  }

  flowStore.addEdge(newEdge)

  // Marcar que uma conexão foi criada com sucesso
  connectionJustMade.value = true
  setTimeout(() => {
    connectionJustMade.value = false
  }, 100)
}

// Handler quando iniciar arrasto de conexão
const onConnectStart = (params) => {
  connectionInProgress.value = {
    active: true,
    sourceNodeId: params.nodeId,
    sourceHandle: params.handleId
  }
  // Reset flag de conexão criada
  connectionJustMade.value = false
}

// Handler quando soltar conexão sem conectar (Quick Add)
const onConnectEnd = (event) => {
  // Se não há conexão em progresso, sair
  if (!connectionInProgress.value.active) return

  // Se uma conexão foi criada com sucesso, não abrir Quick Add
  if (connectionJustMade.value) {
    connectionInProgress.value.active = false
    return
  }

  // Verificar se o mouse está sobre um handle (conexão bem-sucedida)
  const targetElement = document.elementFromPoint(event.clientX, event.clientY)
  const isOnHandle = targetElement?.closest('.vue-flow__handle')

  // Se está sobre um handle, significa que a conexão foi feita - não abrir Quick Add
  if (isOnHandle) {
    connectionInProgress.value.active = false
    return
  }

  // Se está sobre um node (mas não em handle), também não abrir
  const isOnNode = targetElement?.closest('.vue-flow__node')
  if (isOnNode) {
    connectionInProgress.value.active = false
    return
  }

  // Pegar informações da conexão
  const sourceNode = flowStore.nodes.find(n => n.id === connectionInProgress.value.sourceNodeId)
  const sourceHandle = connectionInProgress.value.sourceHandle

  if (!sourceNode || !sourceHandle) {
    connectionInProgress.value.active = false
    return
  }

  // Detectar tipo do output
  const outputType = getHandleType(sourceNode, sourceHandle, 'source')
  const isExecHandle = sourceHandle.startsWith('exec-')


  // Filtrar nodes compatíveis
  const compatible = flowStore.nodeCatalog.nodes.filter(nodeDef => {
    // Se é exec, mostrar nodes com exec-in
    if (isExecHandle) {
      return nodeDef.handles?.inputs?.execution?.some(h => h.id?.startsWith('exec-'))
    }

    // Se é data, verificar compatibilidade de tipos
    const dataInputs = nodeDef.handles?.inputs?.data || []
    const hasCompatibleInput = dataInputs.some(input => {
      // Obter tipos aceitos pelo input
      const acceptedTypes = getAcceptedTypes(nodeDef.type, input.id)

      // Usar isConnectionValid que já tem toda a lógica de compatibilidade
      const isValid = isConnectionValid(outputType, acceptedTypes)

      if (isValid) {
      }

      return isValid
    })

    return hasCompatibleInput
  })


  // Guardar info da conexão para usar depois
  quickAddMenu.value.sourceNodeId = sourceNode.id
  quickAddMenu.value.sourceHandle = sourceHandle
  quickAddMenu.value.compatibleNodes = compatible

  // Atualizar lista de nodes do context menu
  quickAddNodes.value = compatible

  // Abrir context menu com nodes filtrados
  openContextMenu(event.clientX, event.clientY)

  // Prevenir que handleCanvasClick feche o menu imediatamente
  justOpenedMenu.value = true
  setTimeout(() => {
    justOpenedMenu.value = false
  }, 100)

  // Reset connection state
  connectionInProgress.value.active = false
}

// Handler quando clicar em uma edge (linha de conexão)
const onEdgeClick = ({ edge }) => {
  if (!edge || edge.edgeType === 'flow') return // Ignorar edges de execução

  const sourceNode = flowStore.nodes.find(n => n.id === edge.source)
  const targetNode = flowStore.nodes.find(n => n.id === edge.target)
  const sourceOutputs = flowStore.executionResults[edge.source]
  const targetOutputs = flowStore.executionResults[edge.target]

  // Tipos detectados
  const sourceDetectedTypes = flowStore.savedDetectedTypes[edge.source] || {}
  const targetDetectedTypes = flowStore.savedDetectedTypes[edge.target] || {}

  // Valor específico do handle de origem (OUTPUT)
  const sourceValue = sourceOutputs?.[edge.sourceHandle]

  // Para Input node, pegar tipo do parâmetro
  let sourceType = 'unknown'
  if (sourceNode?.type === 'input') {
    const paramIndex = parseInt(edge.sourceHandle?.replace('param-output-', ''))
    const params = flowStore.nodeData[edge.source]?.parameters || []
    sourceType = params[paramIndex]?.type || 'any'
  } else {
    sourceType = sourceDetectedTypes[edge.sourceHandle] || 'unknown'
  }

  // Para o destino, calcular os INPUTS (não outputs)
  const targetInputs = flowStore.getNodeDataInputs?.(edge.target) || {}
  const targetInputKey = edge.targetHandle?.replace('data-', '') || 'input'
  const targetInputValue = targetInputs[targetInputKey]
  const targetType = targetDetectedTypes[edge.targetHandle] || 'unknown'

  // Helper para formatar valores
  const formatValue = (val) => {
    if (val === undefined) return 'undefined'
    if (val === null) return 'null'
    const str = JSON.stringify(val)
    return str.length > 38 ? str.substring(0, 38) : str
  }

  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           CONEXÃO CLICADA (VALOR SENDO TRANSMITIDO)          ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  📤 OUTPUT (ORIGEM)                                           ║
║  ├─ Node: ${ (sourceNode?.type || 'unknown').padEnd(47) }║
║  ├─ ID: ${ (edge.source || 'unknown').padEnd(49) }║
║  ├─ Handle: ${ (edge.sourceHandle || 'unknown').padEnd(45) }║
║  ├─ TIPO: ${ (sourceType).padEnd(49) }║
║  └─ VALOR: ${ formatValue(sourceValue).padEnd(47) }║
║                                                               ║
║  📥 INPUT (DESTINO)                                           ║
║  ├─ Node: ${ (targetNode?.type || 'unknown').padEnd(47) }║
║  ├─ ID: ${ (edge.target || 'unknown').padEnd(49) }║
║  ├─ Handle: ${ (edge.targetHandle || 'unknown').padEnd(45) }║
║  ├─ TIPO: ${ (targetType).padEnd(49) }║
║  └─ VALOR: ${ formatValue(targetInputValue).padEnd(47) }║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`)

}

// Flow Execution
const executeFlow = async () => {
  executionStatus.value = 'running'
  try {
    await flowStore.executeFlow()
    executionStatus.value = 'success'
    setTimeout(() => {
      executionStatus.value = null
    }, 3000)
  } catch (error) {
    executionStatus.value = 'error'
    setTimeout(() => {
      executionStatus.value = null
    }, 5000)
  }
}

// 🚀 NOVO: Manual Save Handler
const handleManualSave = async () => {
  try {
    console.log('💾 Manual save triggered')
    await flowStore.syncToAPI()
  } catch (error) {
    console.error('❌ Failed to save:', error)
  }
}

// Clear flow
const clearFlow = () => {
  if (confirm('Are you sure you want to clear the entire flow? This action cannot be undone.')) {
    flowStore.clearFlow()
    selectedNode.value = null
  }
}

// Keyboard Shortcuts
const handleKeyDown = (event) => {
  const interactiveElements = ['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA']
  const isFocusedOnInteractive = interactiveElements.includes(document.activeElement?.tagName)

  if (isFocusedOnInteractive) {
    if (event.key === 'Escape' && showContextMenu.value) {
      closeContextMenu()
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

  // 🚀 NOVO: Ctrl+S - Save
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    if (flowStore.hasUnsavedChanges && flowStore.syncStatus !== 'syncing') {
      handleManualSave()
    }
    return
  }

  // Space - Context Menu
  if (event.code === 'Space') {
    event.preventDefault()
    openContextMenu(mousePosition.value.x, mousePosition.value.y)
    return
  }

  // Escape - Close Context Menu
  if (event.key === 'Escape') {
    closeContextMenu()
    return
  }
}

const handleKeyUp = (event) => {
  // Optional: Handle key up events if needed
}

const handleCanvasClick = (event) => {
  const interactiveElements = ['INPUT', 'SELECT', 'BUTTON', 'TEXTAREA']
  const isInteractiveElement = interactiveElements.includes(event.target.tagName)

  if (isInteractiveElement) {
    return
  }

  // Não fechar menu se acabou de abrir (previne conflito com onConnectEnd)
  if (justOpenedMenu.value) {
    return
  }

  if (showContextMenu.value) {
    closeContextMenu()
  }

  if (quickAddMenu.value.visible) {
    closeQuickAddMenu()
  }

  const isClickingOnNode = event.target.closest('.vue-flow__node')
  if (!isClickingOnNode) {
    canvasRef.value?.focus()
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

// Context Menu
const createNodeFromMenu = (nodeType) => {
  const flowPosition = screenToFlowCoordinates(mousePosition.value.x, mousePosition.value.y)
  const newNode = createNodeFromType(nodeType, flowPosition)
  closeContextMenu()

  // Se veio do Quick Add (conexão em progresso), conectar automaticamente
  if (quickAddMenu.value.sourceNodeId && quickAddMenu.value.sourceHandle) {
    setTimeout(() => {
      const sourceHandle = quickAddMenu.value.sourceHandle
      const isExecHandle = sourceHandle.startsWith('exec-')

      // Encontrar definição do node
      const nodeDef = flowStore.nodeCatalog.nodes.find(n => n.type === nodeType)

      // Encontrar handle compatível no novo node
      let targetHandle = null
      if (isExecHandle) {
        targetHandle = nodeDef?.handles?.inputs?.execution?.[0]?.id || 'exec-in'
      } else {
        // Buscar primeiro input data compatível
        const dataInputs = nodeDef?.handles?.inputs?.data || []
        const compatibleInput = dataInputs.find(input => {
          const acceptedTypes = getAcceptedTypes(nodeType, input.id)
          const outputType = getHandleType(
            flowStore.nodes.find(n => n.id === quickAddMenu.value.sourceNodeId),
            sourceHandle,
            'source'
          )
          return acceptedTypes.includes(outputType) || acceptedTypes.includes('any')
        })
        targetHandle = compatibleInput?.id || 'data-input'
      }

      // Criar conexão
      onConnect({
        source: quickAddMenu.value.sourceNodeId,
        sourceHandle: sourceHandle,
        target: newNode.id,
        targetHandle: targetHandle
      })

      // Limpar estado do Quick Add
      quickAddMenu.value.sourceNodeId = null
      quickAddMenu.value.sourceHandle = null
    }, 100)
  }
}

// Copy/Paste
const copySelectedNodes = () => {
  const selected = nodes.value.filter(node => node.selected)
  if (selected.length === 0) return

  clipboard.value = selected.map(node => ({
    ...node,
    data: deepClone(node.data),
    position: { ...node.position }
  }))
}

const pasteNodes = () => {
  if (clipboard.value.length === 0) return

  const flowPosition = screenToFlowCoordinates(mousePosition.value.x, mousePosition.value.y)
  const offset = 30

  clipboard.value.forEach((clipboardNode, index) => {
    const newNode = {
      ...clipboardNode,
      id: `${ clipboardNode.type }_${ Date.now() }_${ index } `,
      position: {
        x: flowPosition.x + (index * offset),
        y: flowPosition.y + (index * offset)
      },
      data: deepClone(clipboardNode.data), // Ensure deep clone on paste as well
      selected: false
    }

    flowStore.addNode(newNode)
  })
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

// Lifecycle
// Keyboard shortcuts handler
const handleKeyboardShortcuts = (event) => {
  // Check for Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    event.preventDefault()
    flowStore.undo()
    return
  }

  // Check for Ctrl+Y (Windows/Linux) or Cmd+Shift+Z (Mac)
  if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.shiftKey && event.key === 'z'))) {
    event.preventDefault()
    flowStore.redo()
    return
  }
}

onMounted(() => {
  canvasRef.value?.focus()

  // Check for OAuth callback
  checkOAuthCallback()

  // Initialize API from URL parameters and load flow data
  flowStore.initializeFromUrl()

  // Add keyboard shortcuts listener
  window.addEventListener('keydown', handleKeyboardShortcuts)
})

onUnmounted(() => {
  // Remove keyboard shortcuts listener
  window.removeEventListener('keydown', handleKeyboardShortcuts)
})
</script>

<style scoped>
/* Override Vue Flow styles for enhanced visual appeal */
/* Flow edges (exec) - mesma cor das esferas */
:deep(.vue-flow__edge.flow-edge .vue-flow__edge-path) {
  stroke-width: 3;
  filter: drop-shadow(0 1px 3px rgba(156, 163, 175, 0.4));
}

/* Data edges - cores dinâmicas baseadas no tipo */
:deep(.vue-flow__edge.data-edge .vue-flow__edge-path) {
  stroke-width: 2.5;
}

/* Cores específicas por tipo de dado */
:deep(.vue-flow__edge.data-edge-type-any .vue-flow__edge-path) {
  stroke: #3b82f6 !important;
}

:deep(.vue-flow__edge.data-edge-type-string .vue-flow__edge-path) {
  stroke: #10b981 !important;
}

:deep(.vue-flow__edge.data-edge-type-number .vue-flow__edge-path) {
  stroke: #f59e0b !important;
}

:deep(.vue-flow__edge.data-edge-type-integer .vue-flow__edge-path) {
  stroke: #f97316 !important;
}

:deep(.vue-flow__edge.data-edge-type-float .vue-flow__edge-path) {
  stroke: #fb923c !important;
}

:deep(.vue-flow__edge.data-edge-type-boolean .vue-flow__edge-path) {
  stroke: #8b5cf6 !important;
}

:deep(.vue-flow__edge.data-edge-type-array .vue-flow__edge-path) {
  stroke: #ec4899 !important;
}

:deep(.vue-flow__edge.data-edge-type-object .vue-flow__edge-path) {
  stroke: #06b6d4 !important;
}

:deep(.vue-flow__edge.data-edge-type-date .vue-flow__edge-path) {
  stroke: #14b8a6 !important;
}

:deep(.vue-flow__edge.data-edge-type-null .vue-flow__edge-path) {
  stroke: #6b7280 !important;
}

/* Selected edges */
:deep(.vue-flow__edge.flow-edge.selected .vue-flow__edge-path) {
  stroke: #fbbf24 !important;
  stroke-width: 4 !important;
  filter: drop-shadow(0 3px 8px rgba(251, 191, 36, 0.6));
}

:deep(.vue-flow__edge.data-edge.selected .vue-flow__edge-path) {
  stroke-width: 3.5 !important;
  filter: drop-shadow(0 2px 6px currentColor);
}

/* Fallback - flow edges */
:deep(.vue-flow__edge[data-edge-type="flow"] .vue-flow__edge-path) {
  stroke-width: 3;
  filter: drop-shadow(0 1px 3px rgba(156, 163, 175, 0.4));
}

/* Hover effect on edges */
:deep(.vue-flow__edge:hover .vue-flow__edge-path) {
  filter: brightness(1.2);
}

/* Remove estilos antigos dos handles - agora são componentes customizados */
:deep(.vue-flow__handle) {
  opacity: 1 !important;
}

:deep(.vue-flow__minimap) {
  @apply bg-flow-surface dark:bg-flow-surface-dark border border-flow-border dark:border-flow-border-dark rounded-lg shadow-lg;
  backdrop-filter: blur(8px);
}

:deep(.vue-flow__controls) {
  @apply bg-flow-surface dark:bg-flow-surface-dark border border-flow-border dark:border-flow-border-dark rounded-lg shadow-lg;
  backdrop-filter: blur(8px);
}

:deep(.vue-flow__controls-button) {
  @apply bg-flow-surface dark:bg-flow-surface-dark border-b border-flow-border dark:border-flow-border-dark text-flow-text-secondary dark:text-flow-text-secondary-dark transition-all duration-150;
}

:deep(.vue-flow__controls-button:hover) {
  @apply bg-flow-surface-hover dark:bg-flow-surface-hover-dark scale-105;
}

:deep(.vue-flow__controls-button:last-child) {
  border-bottom: none;
}

/* Node selection enhancement */
:deep(.vue-flow__node.selected) {
  filter: drop-shadow(0 4px 12px rgba(99, 102, 241, 0.3));
}
</style>