// Mock do nodeRegistry para a documentação
// Em produção, esses dados virão do editor via API

const nodes = [
  {
    type: 'input',
    label: 'Input',
    category: 'data-input',
    icon: 'material-symbols:edit-note',
    description: 'Permite entrada manual de dados',
    handles: {
      inputs: { execution: [], data: [] },
      outputs: {
        execution: [{ id: 'exec', label: 'Executar' }],
        data: [{ id: 'value', label: 'Valor', type: 'any' }]
      }
    },
    config: {
      value: {
        type: 'text',
        label: 'Valor',
        description: 'Digite o valor desejado',
        default: '',
        required: false
      }
    }
  },
  {
    type: 'connector',
    label: 'Google Sheets',
    category: 'connector',
    icon: 'material-symbols:table',
    description: 'Conecta com Google Sheets para buscar dados',
    handles: {
      inputs: {
        execution: [{ id: 'exec', label: 'Executar' }],
        data: []
      },
      outputs: {
        execution: [{ id: 'exec', label: 'Continuar' }],
        data: [{ id: 'data', label: 'Dados', type: 'array' }]
      }
    },
    config: {
      spreadsheetId: {
        type: 'text',
        label: 'ID da Planilha',
        description: 'ID da planilha do Google Sheets',
        required: true
      },
      range: {
        type: 'text',
        label: 'Intervalo',
        description: 'Exemplo: A1:Z100',
        default: 'A1:Z100',
        required: true
      }
    }
  },
  {
    type: 'math-operation',
    label: 'Operação Matemática',
    category: 'operations',
    icon: 'material-symbols:calculate',
    description: 'Realiza operações matemáticas básicas',
    handles: {
      inputs: {
        execution: [],
        data: [
          { id: 'a', label: 'Valor A', type: 'number' },
          { id: 'b', label: 'Valor B', type: 'number' }
        ]
      },
      outputs: {
        execution: [],
        data: [{ id: 'result', label: 'Resultado', type: 'number' }]
      }
    },
    config: {
      operation: {
        type: 'select',
        label: 'Operação',
        description: 'Escolha a operação matemática',
        default: 'add',
        required: true,
        options: [
          { value: 'add', label: 'Somar (+)' },
          { value: 'subtract', label: 'Subtrair (-)' },
          { value: 'multiply', label: 'Multiplicar (×)' },
          { value: 'divide', label: 'Dividir (÷)' }
        ]
      }
    }
  },
  {
    type: 'array-filter',
    label: 'Filtrar Lista',
    category: 'data-processing',
    icon: 'material-symbols:filter-list',
    description: 'Filtra elementos de uma lista baseado em condições',
    handles: {
      inputs: {
        execution: [],
        data: [{ id: 'array', label: 'Lista', type: 'array' }]
      },
      outputs: {
        execution: [],
        data: [{ id: 'filtered', label: 'Lista Filtrada', type: 'array' }]
      }
    },
    config: {
      field: {
        type: 'text',
        label: 'Campo',
        description: 'Nome do campo para filtrar',
        required: true
      },
      operator: {
        type: 'select',
        label: 'Operador',
        default: 'equals',
        required: true,
        options: [
          { value: 'equals', label: 'Igual a' },
          { value: 'notEquals', label: 'Diferente de' },
          { value: 'greaterThan', label: 'Maior que' },
          { value: 'lessThan', label: 'Menor que' }
        ]
      },
      value: {
        type: 'text',
        label: 'Valor',
        description: 'Valor para comparação',
        required: true
      }
    }
  },
  {
    type: 'array-sort',
    label: 'Ordenar Lista',
    category: 'data-processing',
    icon: 'material-symbols:sort',
    description: 'Ordena elementos de uma lista',
    handles: {
      inputs: {
        execution: [],
        data: [{ id: 'array', label: 'Lista', type: 'array' }]
      },
      outputs: {
        execution: [],
        data: [{ id: 'sorted', label: 'Lista Ordenada', type: 'array' }]
      }
    },
    config: {
      field: {
        type: 'text',
        label: 'Campo',
        description: 'Nome do campo para ordenar',
        required: true
      },
      order: {
        type: 'select',
        label: 'Ordem',
        default: 'asc',
        required: true,
        options: [
          { value: 'asc', label: 'Crescente (A-Z)' },
          { value: 'desc', label: 'Decrescente (Z-A)' }
        ]
      }
    }
  },
  {
    type: 'condition',
    label: 'Condição',
    category: 'logic-control',
    icon: 'material-symbols:alt-route',
    description: 'Avalia uma condição e toma decisões',
    handles: {
      inputs: {
        execution: [{ id: 'exec', label: 'Executar' }],
        data: [
          { id: 'value1', label: 'Valor 1', type: 'any' },
          { id: 'value2', label: 'Valor 2', type: 'any' }
        ]
      },
      outputs: {
        execution: [
          { id: 'true', label: 'Verdadeiro' },
          { id: 'false', label: 'Falso' }
        ],
        data: []
      }
    },
    config: {
      operator: {
        type: 'select',
        label: 'Operador',
        default: 'equals',
        required: true,
        options: [
          { value: 'equals', label: 'Igual a (=)' },
          { value: 'notEquals', label: 'Diferente de (≠)' },
          { value: 'greaterThan', label: 'Maior que (>)' },
          { value: 'lessThan', label: 'Menor que (<)' }
        ]
      }
    }
  },
  {
    type: 'output',
    label: 'Output',
    category: 'debug',
    icon: 'material-symbols:download',
    description: 'Exibe ou exporta o resultado final',
    handles: {
      inputs: {
        execution: [{ id: 'exec', label: 'Executar' }],
        data: [{ id: 'data', label: 'Dados', type: 'any' }]
      },
      outputs: { execution: [], data: [] }
    },
    config: {
      format: {
        type: 'select',
        label: 'Formato',
        default: 'json',
        required: true,
        options: [
          { value: 'json', label: 'JSON' },
          { value: 'csv', label: 'CSV' },
          { value: 'text', label: 'Texto' }
        ]
      }
    }
  },
  {
    type: 'display',
    label: 'Display',
    category: 'debug',
    icon: 'material-symbols:visibility',
    description: 'Mostra dados durante a execução',
    handles: {
      inputs: {
        execution: [{ id: 'exec', label: 'Executar' }],
        data: [{ id: 'data', label: 'Dados', type: 'any' }]
      },
      outputs: {
        execution: [{ id: 'exec', label: 'Continuar' }],
        data: [{ id: 'data', label: 'Dados', type: 'any' }]
      }
    },
    config: {}
  },
  {
    type: 'note',
    label: 'Nota',
    category: 'organization',
    icon: 'material-symbols:sticky-note',
    description: 'Adiciona anotações ao fluxo',
    handles: {
      inputs: { execution: [], data: [] },
      outputs: { execution: [], data: [] }
    },
    config: {
      text: {
        type: 'textarea',
        label: 'Texto',
        description: 'Adicione suas anotações aqui',
        default: '',
        required: false
      }
    }
  },
  {
    type: 'frame',
    label: 'Frame',
    category: 'organization',
    icon: 'material-symbols:workspaces',
    description: 'Agrupa blocos visualmente',
    handles: {
      inputs: { execution: [], data: [] },
      outputs: { execution: [], data: [] }
    },
    config: {
      title: {
        type: 'text',
        label: 'Título',
        description: 'Nome do grupo',
        default: 'Grupo',
        required: false
      }
    }
  }
]

const categories = [
  { id: 'data-input', label: 'Entrada de Dados', icon: 'material-symbols:input' },
  { id: 'connector', label: 'Conectores', icon: 'material-symbols:link' },
  { id: 'operations', label: 'Operações', icon: 'material-symbols:calculate' },
  { id: 'data-processing', label: 'Processamento', icon: 'material-symbols:filter-list' },
  { id: 'logic-control', label: 'Lógica', icon: 'material-symbols:alt-route' },
  { id: 'debug', label: 'Debug', icon: 'material-symbols:bug-report' },
  { id: 'organization', label: 'Organização', icon: 'material-symbols:workspaces' }
]

export default {
  getAllNodes() {
    return nodes
  },

  getNodeDefinition(type) {
    return nodes.find(node => node.type === type)
  },

  getAllCategories() {
    return categories
  }
}
