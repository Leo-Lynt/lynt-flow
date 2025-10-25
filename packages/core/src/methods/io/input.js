/**
 * Input Node
 * Define parâmetros de entrada do flow
 */

/**
 * Executa Input node (retorna valores dos parâmetros)
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.context - Contexto (pode conter inputValues)
 * @returns {Object} Valores dos parâmetros
 */
export function execute({ nodeData, context }) {
  const parameters = nodeData.parameters || []

  const result = {}

  parameters.forEach(param => {
    const name = param.name
    let value = context.inputValues?.[name] ?? param.defaultValue

    // Para dates, converter para formato selecionado
    if (param.type === 'date' && value) {
      const dateFormat = param.dateFormat || 'DD/MM/YYYY' // Formato padrão
      let dateObj = null

      // Converter value para Date object primeiro
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        // Formato YYYY-MM-DD (do input HTML)
        const [year, month, day] = value.split('-').map(Number)
        dateObj = new Date(year, month - 1, day)
      } else if (typeof value === 'string') {
        // Tentar parse de outros formatos
        dateObj = new Date(value)
      } else if (value instanceof Date) {
        dateObj = value
      }

      // Se conseguiu converter, formatar de acordo com o formato escolhido
      if (dateObj && !isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear()
        const month = String(dateObj.getMonth() + 1).padStart(2, '0')
        const day = String(dateObj.getDate()).padStart(2, '0')

        // Aplicar formato
        switch (dateFormat) {
          case 'DD/MM/YYYY':
            value = `${day}/${month}/${year}`
            break
          case 'MM/DD/YYYY':
            value = `${month}/${day}/${year}`
            break
          case 'YYYY-MM-DD':
            value = `${year}-${month}-${day}`
            break
          case 'DD-MM-YYYY':
            value = `${day}-${month}-${year}`
            break
          case 'YYYY/MM/DD':
            value = `${year}/${month}/${day}`
            break
          default:
            value = `${day}/${month}/${year}` // Padrão brasileiro
        }
      }
    }

    // Convert string numbers to actual numbers
    if ((param.type === 'number' || param.type === 'integer' || param.type === 'float') && typeof value === 'string') {
      value = param.type === 'integer' ? parseInt(value, 10) : parseFloat(value)
    }

    // Parse JSON for arrays and objects
    if ((param.type === 'array' || param.type === 'object') && typeof value === 'string') {
      try {
        value = JSON.parse(value)
      } catch (e) {
        console.warn(`Failed to parse ${param.type} for parameter ${name}:`, e)
      }
    }

    result[name] = value
  })

  return result
}

/**
 * Valida configuração do Input
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []
  const parameters = nodeData.parameters || []

  // Validar estrutura dos parâmetros
  parameters.forEach((param, index) => {
    if (!param.name) {
      errors.push(`Parâmetro no índice ${index} não possui nome`)
    }
    if (!param.type) {
      errors.push(`Parâmetro "${param.name}" não possui tipo`)
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}
