/**
 * Node Catalog Loader
 * Carrega o catálogo de nodes do arquivo JSON e popula o registry
 */

import registry, { registerNode, registerCategory } from './registry.js'

let catalogLoaded = false
let catalogData = null

/**
 * Valida o schema básico do catálogo
 * @param {Object} catalog - Dados do catálogo
 * @returns {Object} { valid: boolean, errors: Array }
 */
function validateCatalog(catalog) {
  const errors = []

  if (!catalog) {
    errors.push('Catálogo está vazio ou inválido')
    return { valid: false, errors }
  }

  if (!catalog.version) {
    errors.push('Campo "version" obrigatório não encontrado')
  }

  if (!catalog.nodes || !Array.isArray(catalog.nodes)) {
    errors.push('Campo "nodes" deve ser um array')
  }

  if (catalog.categories && !Array.isArray(catalog.categories)) {
    errors.push('Campo "categories" deve ser um array')
  }

  // Validar estrutura de cada node
  if (catalog.nodes) {
    catalog.nodes.forEach((node, index) => {
      if (!node.type) {
        errors.push(`Node no índice ${index} não possui campo "type"`)
      }
      if (!node.label) {
        errors.push(`Node "${node.type || index}" não possui campo "label"`)
      }
      if (!node.method) {
        errors.push(`Node "${node.type || index}" não possui campo "method"`)
      }
      if (!node.category) {
        errors.push(`Node "${node.type || index}" não possui campo "category"`)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Carrega o catálogo de nodes do arquivo JSON
 * @param {string} catalogPath - Caminho para o arquivo JSON (default: /config/nodes.json)
 * @returns {Promise<Object>} Catálogo carregado
 */
export async function loadNodeCatalog(catalogPath = '/config/nodes.json') {
  if (catalogLoaded) {
    return catalogData
  }

  try {
    // Fetch do arquivo JSON (com cache bust em desenvolvimento)
    const cacheBuster = import.meta.env.DEV ? `?t=${Date.now()}` : ''
    const response = await fetch(`${catalogPath}${cacheBuster}`)

    if (!response.ok) {
      throw new Error(`Erro ao carregar catálogo: ${response.status} ${response.statusText}`)
    }

    const catalog = await response.json()

    // Validar estrutura básica
    const validation = validateCatalog(catalog)
    if (!validation.valid) {
      throw new Error(`Catálogo inválido: ${validation.errors.join(', ')}`)
    }

    // Registrar categorias
    if (catalog.categories) {
      catalog.categories.forEach(category => {
        registerCategory(category.id, category)
      })
    }

    // Registrar nodes
    catalog.nodes.forEach(node => {
      registerNode(node.type, node)
    })

    catalogLoaded = true
    catalogData = catalog

    // Log de estatísticas
    const stats = registry.getStats()

    return catalog
  } catch (error) {
    throw error
  }
}

/**
 * Recarrega o catálogo (força reload)
 * @param {string} catalogPath - Caminho para o arquivo JSON
 * @returns {Promise<Object>} Catálogo recarregado
 */
export async function reloadNodeCatalog(catalogPath = '/config/nodes.json') {
  catalogLoaded = false
  catalogData = null
  registry.clear()

  return await loadNodeCatalog(catalogPath)
}

/**
 * Retorna o catálogo carregado (se disponível)
 * @returns {Object|null}
 */
export function getCatalog() {
  return catalogData
}

/**
 * Verifica se o catálogo foi carregado
 * @returns {boolean}
 */
export function isCatalogLoaded() {
  return catalogLoaded
}

/**
 * Inicializa o engine carregando o catálogo
 * Deve ser chamado no bootstrap da aplicação
 * @returns {Promise<Object>}
 */
export async function initializeEngine() {
  try {
    const catalog = await loadNodeCatalog()

    return {
      success: true,
      catalog,
      stats: registry.getStats()
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Valida se todos os métodos referenciados no catálogo podem ser carregados
 * Útil para debugging e verificação de integridade
 * @returns {Promise<Object>} { success: boolean, results: Array }
 */
export async function validateCatalogMethods() {
  if (!catalogLoaded) {
    throw new Error('Catálogo não carregado. Chame loadNodeCatalog() primeiro.')
  }

  const results = []
  const nodes = catalogData.nodes

  for (const node of nodes) {
    const result = {
      type: node.type,
      method: node.method,
      validator: node.validator,
      methodLoadable: false,
      validatorLoadable: false,
      errors: []
    }

    // Testar carregamento do método principal
    try {
      const method = await registry.getNodeFunction(node.type, 'method')
      result.methodLoadable = method !== null
      if (!result.methodLoadable) {
        result.errors.push('Método não pôde ser carregado')
      }
    } catch (error) {
      result.errors.push(`Erro ao carregar método: ${error.message}`)
    }

    // Testar carregamento do validador (se existir)
    if (node.validator) {
      try {
        const validator = await registry.getNodeFunction(node.type, 'validator')
        result.validatorLoadable = validator !== null
        if (!result.validatorLoadable) {
          result.errors.push('Validador não pôde ser carregado')
        }
      } catch (error) {
        result.errors.push(`Erro ao carregar validador: ${error.message}`)
      }
    } else {
      result.validatorLoadable = true // Não tem validador, ok
    }

    results.push(result)
  }

  const successCount = results.filter(r => r.methodLoadable && r.validatorLoadable).length
  const failCount = results.length - successCount

  return {
    success: failCount === 0,
    successCount,
    failCount,
    results
  }
}

export default {
  loadNodeCatalog,
  reloadNodeCatalog,
  getCatalog,
  isCatalogLoaded,
  initializeEngine,
  validateCatalogMethods
}
