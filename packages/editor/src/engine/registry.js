/**
 * Node Registry - FRONTEND VERSION
 *
 * ⚠️ DUPLICAÇÃO JUSTIFICADA
 * Este arquivo existe em core/ e frontend/ por razões arquiteturais:
 *
 * - CORE: Carrega apenas métodos puros do core
 * - FRONTEND: Carrega métodos do core + métodos com dependências browser (connector, output)
 *
 * RAZÃO: Frontend precisa sobrescrever alguns métodos do core para usar browser APIs:
 * - connector.js → OAuth, HTTP requests (connectorService)
 * - output.js → Download files, clipboard (outputService)
 *
 * Ver ARCHITECTURE.md para mais detalhes.
 */

// MONOREPO STRUCTURE:
// - @leo-lynt/lynt-flow-core/methods/** → Métodos puros do core (33 arquivos)
// - ../methods/** → Métodos com dependências de services frontend (2 arquivos: connector, output)

// Frontend methods usando glob (funciona pois está no mesmo pacote)
const frontendMethods = import.meta.glob('../methods/**/*.js', { eager: false })

// Core methods: import direto usando alias @core-methods (configurado no vite.config.js)
// Como import.meta.glob não atravessa boundaries de pacotes, mapeamos manualmente
// Lista baseada em: find packages/core/src/methods -name "*.js" -type f | sort
const coreMethodsMap = {
  // Comparison
  'lib/methods/comparison/comparison.js': () => import('@core-methods/comparison/comparison.js'),

  // Connectors - está no frontend (../methods/connectors/connector.js) pois tem dependências de services

  // Constants
  'lib/methods/constants/constant.js': () => import('@core-methods/constants/constant.js'),

  // Conversion
  'lib/methods/conversion/typeConversion.js': () => import('@core-methods/conversion/typeConversion.js'),

  // IO
  'lib/methods/io/input.js': () => import('@core-methods/io/input.js'),
  // output.js está no frontend (../methods/io/output.js) pois tem dependências de services

  // Iteration
  'lib/methods/iteration/forEach.js': () => import('@core-methods/iteration/forEach.js'),
  'lib/methods/iteration/whileLoop.js': () => import('@core-methods/iteration/whileLoop.js'),

  // Logic
  'lib/methods/logic/conditionalBranch.js': () => import('@core-methods/logic/conditionalBranch.js'),
  'lib/methods/logic/logic.js': () => import('@core-methods/logic/logic.js'),

  // Organization
  'lib/methods/organization/marker.js': () => import('@core-methods/organization/marker.js'),

  // Processors
  'lib/methods/processors/arrayAggregate.js': () => import('@core-methods/processors/arrayAggregate.js'),
  'lib/methods/processors/arrayCreate.js': () => import('@core-methods/processors/arrayCreate.js'),
  'lib/methods/processors/arrayDistinct.js': () => import('@core-methods/processors/arrayDistinct.js'),
  'lib/methods/processors/arrayFilter.js': () => import('@core-methods/processors/arrayFilter.js'),
  'lib/methods/processors/arrayGroupBy.js': () => import('@core-methods/processors/arrayGroupBy.js'),
  'lib/methods/processors/arrayMap.js': () => import('@core-methods/processors/arrayMap.js'),
  'lib/methods/processors/arrayMerge.js': () => import('@core-methods/processors/arrayMerge.js'),
  'lib/methods/processors/arrayProcessor.js': () => import('@core-methods/processors/arrayProcessor.js'),
  'lib/methods/processors/arraySlice.js': () => import('@core-methods/processors/arraySlice.js'),
  'lib/methods/processors/arraySort.js': () => import('@core-methods/processors/arraySort.js'),
  'lib/methods/processors/debugViewer.js': () => import('@core-methods/processors/debugViewer.js'),
  'lib/methods/processors/fieldExtractor.js': () => import('@core-methods/processors/fieldExtractor.js'),
  'lib/methods/processors/math.js': () => import('@core-methods/processors/math.js'),
  'lib/methods/processors/objectCreate.js': () => import('@core-methods/processors/objectCreate.js'),
  'lib/methods/processors/objectFilter.js': () => import('@core-methods/processors/objectFilter.js'),
  'lib/methods/processors/objectKeysValues.js': () => import('@core-methods/processors/objectKeysValues.js'),
  'lib/methods/processors/objectMerge.js': () => import('@core-methods/processors/objectMerge.js'),
  'lib/methods/processors/objectPick.js': () => import('@core-methods/processors/objectPick.js'),
  'lib/methods/processors/objectRename.js': () => import('@core-methods/processors/objectRename.js'),
  'lib/methods/processors/objectSetProperty.js': () => import('@core-methods/processors/objectSetProperty.js'),
  'lib/methods/processors/objectToArray.js': () => import('@core-methods/processors/objectToArray.js'),
  'lib/methods/processors/objectTransform.js': () => import('@core-methods/processors/objectTransform.js'),
  'lib/methods/processors/round.js': () => import('@core-methods/processors/round.js'),

  // Storage
  'lib/methods/storage/variable.js': () => import('@core-methods/storage/variable.js'),

  // String
  'lib/methods/string/stringOps.js': () => import('@core-methods/string/stringOps.js'),
}

// Combinar ambos os mapas (frontend tem prioridade sobre core)
const modules = { ...coreMethodsMap, ...frontendMethods }

class NodeRegistry {
  constructor() {
    this.nodes = new Map()
    this.categories = new Map()
    this.methodCache = new Map()
  }

  /**
   * Registra um node no registry
   * @param {string} type - Tipo do node (ex: 'connector', 'add')
   * @param {Object} definition - Definição completa do node
   */
  registerNode(type, definition) {
    this.nodes.set(type, definition)
  }

  /**
   * Registra uma categoria
   * @param {string} id - ID da categoria
   * @param {Object} categoryData - Dados da categoria
   */
  registerCategory(id, categoryData) {
    this.categories.set(id, categoryData)
  }

  /**
   * Busca a definição de um node por tipo
   * @param {string} type - Tipo do node
   * @returns {Object|null} Definição do node ou null
   */
  getNodeDefinition(type) {
    const definition = this.nodes.get(type)
    if (!definition) {
      return null
    }
    return definition
  }

  /**
   * Retorna todos os nodes registrados
   * @returns {Array} Array de definições de nodes
   */
  getAllNodes() {
    return Array.from(this.nodes.values())
  }

  /**
   * Retorna nodes de uma categoria específica
   * @param {string} categoryId - ID da categoria
   * @returns {Array} Array de definições de nodes
   */
  getNodesByCategory(categoryId) {
    return this.getAllNodes().filter(node => node.category === categoryId)
  }

  /**
   * Retorna todas as categorias registradas
   * @returns {Array} Array de categorias
   */
  getAllCategories() {
    return Array.from(this.categories.values())
  }

  /**
   * Verifica se um node type existe
   * @param {string} type - Tipo do node
   * @returns {boolean}
   */
  hasNode(type) {
    return this.nodes.has(type)
  }

  /**
   * Carrega e cacheia a função referenciada por um node
   * @param {string} type - Tipo do node
   * @param {string} functionType - Tipo de função ('method' ou 'validator')
   * @returns {Promise<Function|null>} Função carregada ou null
   */
  async getNodeFunction(type, functionType = 'method') {
    const definition = this.getNodeDefinition(type)
    if (!definition) return null

    const methodPath = definition[functionType]
    if (!methodPath) {
      return null
    }

    // Verificar cache
    const cacheKey = `${type}:${functionType}`
    if (this.methodCache.has(cacheKey)) {
      return this.methodCache.get(cacheKey)
    }

    try {
      // Parse: "lib/methods/connectors/connector.js:execute"
      const [modulePath, functionName] = methodPath.split(':')

      // Resolver path do módulo com fallback strategy
      // 1. Tentar em ../methods/ (frontend: connector, output)
      // 2. Tentar path direto do map (core methods via @core-methods alias)

      let moduleLoader = null
      let fullPath = null

      // Priority 1: Frontend methods (connector, output)
      const frontendPath = modulePath.replace('lib/methods/', '../methods/')
      moduleLoader = modules[frontendPath]
      fullPath = frontendPath

      // Priority 2: Core methods via mapeamento direto
      if (!moduleLoader) {
        fullPath = modulePath
        moduleLoader = modules[fullPath]
      }

      if (!moduleLoader) {
        throw new Error(`Módulo "${modulePath}" não encontrado no registry`)
      }

      // Carregar módulo dinamicamente
      const module = await moduleLoader()

      if (!module[functionName]) {
        throw new Error(`Função "${functionName}" não encontrada no módulo "${modulePath}"`)
      }

      const func = module[functionName]

      // Cachear função
      this.methodCache.set(cacheKey, func)

      return func
    } catch (error) {
      return null
    }
  }

  /**
   * Valida configuração de um node
   * @param {string} type - Tipo do node
   * @param {Object} config - Configuração a validar
   * @returns {Object} { valid: boolean, errors: Array }
   */
  validateNodeConfig(type, config) {
    const definition = this.getNodeDefinition(type)
    if (!definition) {
      return { valid: false, errors: [`Node type "${type}" não existe`] }
    }

    const errors = []
    const configSchema = definition.config || {}

    // Validar campos obrigatórios
    for (const [fieldName, fieldDef] of Object.entries(configSchema)) {
      if (fieldDef.required && (config[fieldName] === undefined || config[fieldName] === null || config[fieldName] === '')) {
        errors.push(`Campo obrigatório "${fieldName}" está vazio`)
      }

      // Validar condições
      if (fieldDef.condition && config[fieldName] !== undefined) {
        const [condField, condValue] = Object.entries(fieldDef.condition)[0]
        const configValue = config[condField]

        if (Array.isArray(condValue)) {
          // Condição: campo deve estar em array de valores
          if (!condValue.includes(configValue)) {
            continue // Campo não deve ser validado nesta condição
          }
        } else {
          // Condição: campo deve ser igual ao valor
          if (configValue !== condValue) {
            continue // Campo não deve ser validado nesta condição
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Retorna informações sobre handles de um node
   * @param {string} type - Tipo do node
   * @returns {Object|null} { inputs, outputs }
   */
  getNodeHandles(type) {
    const definition = this.getNodeDefinition(type)
    if (!definition) return null

    return definition.handles || { inputs: { execution: [], data: [] }, outputs: { execution: [], data: [] } }
  }

  /**
   * Limpa o registry e cache
   */
  clear() {
    this.nodes.clear()
    this.categories.clear()
    this.methodCache.clear()
  }

  /**
   * Retorna estatísticas do registry
   * @returns {Object}
   */
  getStats() {
    return {
      totalNodes: this.nodes.size,
      totalCategories: this.categories.size,
      cachedMethods: this.methodCache.size,
      nodesByCategory: Array.from(this.categories.keys()).reduce((acc, catId) => {
        acc[catId] = this.getNodesByCategory(catId).length
        return acc
      }, {})
    }
  }
}

// Singleton instance
const registry = new NodeRegistry()

// Named exports para uso direto
export const registerNode = (type, definition) => registry.registerNode(type, definition)
export const registerCategory = (id, data) => registry.registerCategory(id, data)
export const getNodeDefinition = (type) => registry.getNodeDefinition(type)
export const getAllNodes = () => registry.getAllNodes()
export const getNodesByCategory = (categoryId) => registry.getNodesByCategory(categoryId)
export const getAllCategories = () => registry.getAllCategories()
export const hasNode = (type) => registry.hasNode(type)
export const getNodeFunction = (type, functionType) => registry.getNodeFunction(type, functionType)
export const validateNodeConfig = (type, config) => registry.validateNodeConfig(type, config)
export const getNodeHandles = (type) => registry.getNodeHandles(type)
export const clearRegistry = () => registry.clear()
export const getRegistryStats = () => registry.getStats()

// Default export da instância
export default registry
