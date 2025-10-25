/**
 * Node Registry
 * Gerencia o registro e acesso às definições de nodes carregadas do catálogo
 */

// Pré-carregar todos os módulos de métodos usando import.meta.glob
// Isso permite que o Vite analise estaticamente os imports
const modules = import.meta.glob('../../lib/methods/**/*.js', { eager: false })

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

      // Converter path para o formato usado pelo import.meta.glob
      // "lib/methods/connectors/connector.js" -> "../../lib/methods/connectors/connector.js"
      const fullPath = `../../${modulePath}`

      // Buscar o módulo no mapa pré-carregado
      const moduleLoader = modules[fullPath]

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
