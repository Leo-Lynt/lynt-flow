/**
 * Output Node
 * Formata e exibe saída do flow
 */

/**
 * Unwrap data recursively
 * Remove wrappers { type, value } retornando apenas value
 */
function unwrapData(data) {
  if (data === null || data === undefined) {
    return data
  }

  // Se é um wrapper { type, value }, extrair value
  if (data && typeof data === 'object' && 'type' in data && 'value' in data) {
    return unwrapData(data.value)
  }

  // Se é array, unwrap cada item
  if (Array.isArray(data)) {
    return data.map(item => unwrapData(item))
  }

  // Se é objeto, unwrap cada propriedade
  if (typeof data === 'object') {
    const unwrapped = {}
    for (const [key, value] of Object.entries(data)) {
      unwrapped[key] = unwrapData(value)
    }
    return unwrapped
  }

  return data
}

/**
 * Executa Output node
 * @param {Object} params
 * @param {Object} params.nodeData - Configuração do node
 * @param {Object} params.inputs - Inputs recebidos
 * @param {Object} params.context - Contexto
 * @returns {Object} Resultado formatado
 */
export async function execute({ nodeData, inputs, context }) {
  console.log('📤 Output: Executando', {
    destination: nodeData.destination,
    inputs: Object.keys(inputs)
  })
  console.log('📤 Output: Full inputs object:', JSON.stringify(inputs, null, 2))

  // Coletar dados dos inputs dinâmicos
  const outputData = {}

  // Se tem inputs dinâmicos definidos, coletar apenas eles
  if (nodeData.dynamicInputs && nodeData.dynamicInputs.length > 0) {
    console.log('📤 Output: Processing dynamic inputs', {
      dynamicInputs: nodeData.dynamicInputs,
      availableInputKeys: Object.keys(inputs)
    })

    nodeData.dynamicInputs.forEach(inputDef => {
      const key = inputDef.key

      // Tentar várias formas de encontrar o valor
      let value = inputs[key]  // Tentar chave direta primeiro
      console.log(`  🔍 Looking for '${key}': direct =`, value !== undefined)

      if (value === undefined) {
        value = inputs[`data-${key}`]  // Tentar com prefixo data-
        console.log(`  🔍 Looking for 'data-${key}':`, value !== undefined, value)
      }

      // Se ainda não encontrou e tem dynamicHandles, procurar pelo handle ID
      if (value === undefined && nodeData.dynamicHandles && nodeData.dynamicHandles.inputs) {
        const matchingHandle = nodeData.dynamicHandles.inputs.find(h =>
          h.label === key || h.id.endsWith(`-${key}`)
        )
        if (matchingHandle && inputs[matchingHandle.id] !== undefined) {
          value = inputs[matchingHandle.id]
        }
      }

      if (value !== undefined) {
        outputData[key] = unwrapData(value)
        const valueType = value === null ? 'null' :
                         Array.isArray(value) ? `array(${value.length})` :
                         typeof value === 'object' ? `object(${Object.keys(value || {}).length})` :
                         typeof value
        console.log(`  ✓ Collected '${key}':`, valueType)
      } else {
        console.log(`  ✗ Missing '${key}' - not found in inputs`)
      }
    })
  } else {
    // Fallback: coletar todos os inputs
    Object.keys(inputs).forEach(key => {
      outputData[key] = unwrapData(inputs[key])
    })
  }

  console.log('📤 Output: Dados coletados', outputData)

  // Formatar resultado baseado na configuração de destination
  const destination = nodeData.destination || 'display'
  const config = nodeData.destinationConfig || {}

  // Se destination é display, apiResponse ou não definido, retornar dados
  if (destination === 'display' || destination === 'apiResponse') {
    console.log(`✅ Output: ${destination} mode`)

    // Se é apiResponse, aplicar formato se definido
    if (destination === 'apiResponse') {
      const format = config.format || 'wrapped'

      if (format === 'wrapped') {
        return {
          success: true,
          data: outputData
        }
      } else if (format === 'raw') {
        return outputData
      }
    }

    return outputData
  }

  // Para outras destinations (webhook, email, etc), retornar dados + metadata
  console.log(`⚠️ Output: Destination '${destination}' requer implementação específica`)
  return {
    success: true,
    data: outputData,
    destination: destination,
    message: `Output configured for ${destination} (implementation pending)`
  }
}


/**
 * Valida configuração do Output
 * @param {Object} nodeData - Configuração do node
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validate(nodeData) {
  const errors = []

  if (!nodeData.destination) {
    errors.push('Destination é obrigatório')
  }

  const config = nodeData.destinationConfig || {}

  // Validar configuração por tipo de destination
  if (nodeData.destination === 'webhook') {
    if (!config.url) {
      errors.push('Webhook URL é obrigatória')
    } else if (!config.url.startsWith('http')) {
      errors.push('URL deve começar com http:// ou https://')
    }
  }

  if (nodeData.destination === 'email') {
    if (!config.to) {
      errors.push('Email destinatário é obrigatório')
    }
  }

  if (nodeData.destination === 'googleSheets') {
    if (!config.connectionId) {
      errors.push('Conexão Google é obrigatória')
    }
    if (!config.spreadsheetUrl) {
      errors.push('URL da planilha é obrigatória')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
