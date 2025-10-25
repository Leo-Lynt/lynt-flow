/**
 * Node Type Definitions
 * Define os tipos de dados aceitos por cada handle de cada tipo de node
 */

export const nodeTypeDefinitions = {
  // Nodes matemáticos - aceitam apenas números
  'add': {
    inputs: {
      'data-a': ['number', 'integer', 'float'],
      'data-b': ['number', 'integer', 'float']
    },
    outputs: {
      'data-result': ['number', 'integer', 'float']
    }
  },
  'subtract': {
    inputs: {
      'data-a': ['number', 'integer', 'float'],
      'data-b': ['number', 'integer', 'float']
    },
    outputs: {
      'data-result': ['number', 'integer', 'float']
    }
  },
  'multiply': {
    inputs: {
      'data-a': ['number', 'integer', 'float'],
      'data-b': ['number', 'integer', 'float']
    },
    outputs: {
      'data-result': ['number', 'integer', 'float']
    }
  },
  'divide': {
    inputs: {
      'data-a': ['number', 'integer', 'float'],
      'data-b': ['number', 'integer', 'float']
    },
    outputs: {
      'data-result': ['number', 'integer', 'float']
    }
  },
  'round': {
    inputs: {
      'data-value': ['number', 'integer', 'float']
    },
    outputs: {
      'data-out': ['number', 'integer', 'float']
    }
  },

  // Array Processor - aceita arrays
  'array-processor': {
    inputs: {
      'data-input': ['array']
    },
    outputs: {
      'data-output': ['any'] // Pode retornar vários tipos dependendo da operação
    }
  },

  // Field Extractor - outputs dinâmicos baseados nos campos
  'field-extractor': {
    inputs: {
      'data-input': ['object', 'array', 'any'] // Aceita objetos, arrays ou qualquer tipo
    },
    outputs: {
      // Dinâmico - será determinado em runtime
      'all-data': ['object']
    }
  },

  // Output node - inputs dinâmicos, aceita qualquer tipo
  'output': {
    inputs: {
      // Dinâmico - tipo definido pelo usuário
    },
    outputs: {}
  },

  // Input node - gera qualquer tipo
  'input': {
    inputs: {},
    outputs: {
      'data-output': ['any']
    }
  },

  // Connector - gera objetos/arrays
  'connector': {
    inputs: {},
    outputs: {
      'data-output': ['object', 'array']
    }
  }
}

/**
 * Obtém os tipos aceitos por um handle específico
 * @param {string} nodeType - Tipo do node
 * @param {string} handleId - ID do handle
 * @param {string} handlePosition - 'source' ou 'target'
 * @returns {Array<string>} Lista de tipos aceitos
 */
export function getAcceptedTypes(nodeType, handleId, handlePosition) {
  const definition = nodeTypeDefinitions[nodeType]
  if (!definition) {
    return ['any'] // Se não tem definição, aceita qualquer tipo
  }

  const handleMap = handlePosition === 'source' ? definition.outputs : definition.inputs
  return handleMap[handleId] || ['any']
}

/**
 * Verifica se uma conexão é válida baseada nos tipos aceitos
 * @param {string} sourceType - Tipo do output (origem)
 * @param {Array<string>} acceptedTypes - Tipos aceitos pelo input
 * @returns {boolean} True se é válido
 */
export function isConnectionValid(sourceType, acceptedTypes) {
  // Se aceita 'any', sempre válido
  if (acceptedTypes.includes('any')) {
    return true
  }

  // Se o source é 'any', só conecta se o target aceita 'any'
  if (sourceType === 'any') {
    return acceptedTypes.includes('any')
  }

  // Verifica se o tipo de origem está na lista de aceitos
  if (acceptedTypes.includes(sourceType)) {
    return true
  }

  // Compatibilidade especial: number, integer e float são compatíveis entre si
  const numericTypes = ['number', 'integer', 'float']
  if (numericTypes.includes(sourceType)) {
    return acceptedTypes.some(t => numericTypes.includes(t))
  }

  return false
}
