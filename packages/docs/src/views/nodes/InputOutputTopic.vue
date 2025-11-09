<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '../../components/Icon.vue'
import PlaygroundEmbed from '../../components/PlaygroundEmbed.vue'

const route = useRoute()
const router = useRouter()

const topics = {
  'input-overview': {
    id: 'input-overview',
    title: 'Input: Overview',
    icon: 'material-symbols:info',
    color: 'blue',
    category: 'input',
    description: 'O Input node é o ponto de partida de qualquer fluxo. Ele define os parâmetros que o fluxo pode receber de fontes externas (API, interface do usuário, etc).',
    content: [
      {
        subtitle: 'O que é',
        text: 'O Input node permite que você defina parâmetros tipados que podem ser passados para o fluxo quando ele é executado. Esses parâmetros ficam disponíveis como saídas do node.'
      },
      {
        subtitle: 'Características principais',
        list: [
          'Define parâmetros com nome e tipo',
          'Suporta valores padrão (default values)',
          'Parâmetros podem ser obrigatórios ou opcionais',
          'Validação automática de tipos',
          'Ponto de partida da execução (exec-out handle)'
        ]
      },
      {
        subtitle: 'Quando usar',
        text: 'Use o Input node quando seu fluxo precisa receber dados externos. Por exemplo: um fluxo que processa pedidos precisa receber o ID do pedido, um fluxo de email precisa receber destinatário e mensagem, etc.'
      }
    ],
    tutorialId: null,
    playgroundTitle: null,
    nextTopic: 'input-parameters',
    prevTopic: null
  },
  'input-parameters': {
    id: 'input-parameters',
    title: 'Input: Parameters',
    icon: 'material-symbols:settings',
    color: 'purple',
    category: 'input',
    description: 'Aprenda a criar e configurar parâmetros no Input node, definindo obrigatoriedade e valores padrão.',
    content: [
      {
        subtitle: 'Criando parâmetros',
        text: 'No painel de propriedades do Input node, clique em "Add Parameter". Cada parâmetro precisa de um nome único e um tipo.'
      },
      {
        subtitle: 'Parâmetros obrigatórios',
        text: 'Marque a checkbox "Required" para tornar o parâmetro obrigatório. Se um parâmetro obrigatório não for fornecido durante a execução, o fluxo retornará um erro.'
      },
      {
        subtitle: 'Valores padrão',
        text: 'Defina um "Default Value" para parâmetros opcionais. Se o valor não for fornecido na execução, o valor padrão será usado. Parâmetros obrigatórios não precisam de valor padrão.'
      },
      {
        subtitle: 'Exemplo prático',
        text: 'Crie dois parâmetros: "nome" (string, obrigatório) e "idade" (number, opcional com default 18). Quando o fluxo executar, se idade não for fornecida, usará 18.'
      }
    ],
    tutorialId: 'input-parameters',
    playgroundTitle: 'Playground: Parâmetros obrigatórios e opcionais',
    nextTopic: 'input-types',
    prevTopic: 'input-overview'
  },
  'input-types': {
    id: 'input-types',
    title: 'Input: Types',
    icon: 'material-symbols:data-object',
    color: 'green',
    category: 'input',
    description: 'Tipos de dados suportados: string, number, integer, float, boolean, object, array e date com formatação customizada.',
    content: [
      {
        subtitle: 'Tipos primitivos',
        list: [
          '<strong>string</strong>: Texto livre',
          '<strong>number</strong>: Números decimais (float)',
          '<strong>integer</strong>: Números inteiros',
          '<strong>float</strong>: Números decimais (alias de number)',
          '<strong>boolean</strong>: Verdadeiro ou Falso'
        ]
      },
      {
        subtitle: 'Tipos complexos',
        list: [
          '<strong>object</strong>: Objetos JSON { key: value }',
          '<strong>array</strong>: Arrays/Listas [1, 2, 3]',
          '<strong>date</strong>: Datas com formatação customizada',
          '<strong>any</strong>: Qualquer tipo (sem validação)'
        ]
      },
      {
        subtitle: 'Formatação de datas',
        text: 'Para parâmetros do tipo "date", você pode escolher o formato de exibição: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, DD-MM-YYYY ou YYYY/MM/DD. A conversão é automática.'
      },
      {
        subtitle: 'Conversão automática',
        text: 'O Input node converte automaticamente strings para o tipo correto. Por exemplo, "123" vira 123 se o tipo for number, e "true" vira true se for boolean.'
      }
    ],
    tutorialId: 'input-types',
    playgroundTitle: 'Playground: Date com formato DD/MM/YYYY',
    nextTopic: 'input-api',
    prevTopic: 'input-parameters'
  },
  'input-api': {
    id: 'input-api',
    title: 'Input: API Usage',
    icon: 'material-symbols:api',
    color: 'orange',
    category: 'input',
    description: 'Como passar parâmetros para o fluxo via API usando context.inputValues e fallback para defaultValue.',
    content: [
      {
        subtitle: 'Passando via API',
        text: 'Quando você executa um fluxo via API, passe os parâmetros no body da requisição. O Input node recebe esses valores através de context.inputValues.'
      },
      {
        subtitle: 'Exemplo de chamada',
        code: `POST /api/flows/{flowId}/execute
{
  "inputValues": {
    "nome": "João",
    "idade": 25,
    "ativo": true
  }
}`
      },
      {
        subtitle: 'Fallback para default',
        text: 'Se um parâmetro não for fornecido na chamada API, o Input node usa o defaultValue definido. Se não houver defaultValue e o parâmetro for obrigatório, retorna erro.'
      },
      {
        subtitle: 'Prioridade de valores',
        list: [
          '1. Valor passado em context.inputValues',
          '2. Valor padrão (defaultValue)',
          '3. undefined (gera erro se required=true)'
        ]
      }
    ],
    tutorialId: 'input-api',
    playgroundTitle: 'Playground: Simular valores de API',
    nextTopic: null,
    prevTopic: 'input-types'
  },
  'output-overview': {
    id: 'output-overview',
    title: 'Output: Overview',
    icon: 'material-symbols:info',
    color: 'red',
    category: 'output',
    description: 'O Output node define o que o fluxo retorna. Ele coleta dados através de inputs dinâmicos e os envia para destinos configurados.',
    content: [
      {
        subtitle: 'O que é',
        text: 'O Output node é o ponto final do fluxo. Ele recebe dados de outros nodes através de inputs dinâmicos e os exporta para um destino (display, API response, webhook, email, etc).'
      },
      {
        subtitle: 'Características principais',
        list: [
          'Inputs dinâmicos (você cria conforme necessário)',
          'Unwrapping automático de dados encapsulados',
          'Múltiplos destinos suportados',
          'Configuração por destino',
          'Node obrigatório (não pode ser deletado)'
        ]
      },
      {
        subtitle: 'Quando usar',
        text: 'Todo fluxo deve ter pelo menos um Output node. Use-o para definir o que retornar ao final da execução: dados processados, resultados de cálculos, respostas de API, etc.'
      }
    ],
    tutorialId: null,
    playgroundTitle: null,
    nextTopic: 'output-inputs',
    prevTopic: null
  },
  'output-inputs': {
    id: 'output-inputs',
    title: 'Output: Dynamic Inputs',
    icon: 'material-symbols:add-box',
    color: 'pink',
    category: 'output',
    description: 'Como adicionar inputs dinâmicos ao Output node para coletar dados de diferentes partes do fluxo.',
    content: [
      {
        subtitle: 'Adicionando inputs',
        text: 'No painel de propriedades, clique em "Add Input". Defina um nome (key) e tipo para cada input. Esses inputs aparecem como handles de conexão no node.'
      },
      {
        subtitle: 'Tipos suportados',
        list: [
          '<strong>any</strong>: Aceita qualquer tipo',
          '<strong>string</strong>: Texto',
          '<strong>number</strong>: Números',
          '<strong>boolean</strong>: Booleanos',
          '<strong>object</strong>: Objetos JSON',
          '<strong>array</strong>: Arrays/Listas'
        ]
      },
      {
        subtitle: 'Unwrapping automático',
        text: 'O Output node automaticamente "desembrulha" dados que vêm encapsulados em estruturas { type, value }. Você recebe apenas o valor puro no resultado final.'
      },
      {
        subtitle: 'Estrutura de saída',
        text: 'Os dados são retornados como um objeto onde cada chave é o nome do input: { inputName1: valor1, inputName2: valor2, ... }'
      }
    ],
    tutorialId: 'output-inputs',
    playgroundTitle: 'Playground: Output com 3 inputs',
    nextTopic: 'output-destinations',
    prevTopic: 'output-overview'
  },
  'output-destinations': {
    id: 'output-destinations',
    title: 'Output: Destinations',
    icon: 'material-symbols:send',
    color: 'indigo',
    category: 'output',
    description: 'Destinos suportados: Display, API Response, Webhook, Email, Google Sheets e Download.',
    content: [
      {
        subtitle: 'Display Only',
        text: 'Apenas exibe os dados no Debug Viewer. Útil para testes e desenvolvimento.'
      },
      {
        subtitle: 'API Response',
        text: 'Retorna os dados como resposta da API. Suporta 3 formatos: "data_only" (apenas dados), "wrapped" ({ success, data }), e "full" ({ success, flowId, executedAt, data }).'
      },
      {
        subtitle: 'Webhook',
        text: 'Envia os dados via HTTP para uma URL externa. Suporta POST, PUT e PATCH com headers customizados e retry automático.'
      },
      {
        subtitle: 'Email',
        text: 'Envia os dados por email. Configurável com destinatários, assunto e formato (HTML tabela, JSON anexo, CSV anexo).'
      },
      {
        subtitle: 'Google Sheets',
        text: 'Escreve os dados em uma planilha do Google Sheets. Modos: append (adicionar no final), replace (substituir tudo), ou update (atualizar de A1).'
      },
      {
        subtitle: 'Download',
        text: 'Gera um arquivo para download. Formatos: JSON, CSV ou Excel (via CSV).'
      }
    ],
    tutorialId: 'output-destinations',
    playgroundTitle: 'Playground: API Response wrapped',
    nextTopic: 'output-config',
    prevTopic: 'output-inputs'
  },
  'output-config': {
    id: 'output-config',
    title: 'Output: Configuration',
    icon: 'material-symbols:tune',
    color: 'teal',
    category: 'output',
    description: 'Configurações específicas por destino: headers, formatos, retry e mais.',
    content: [
      {
        subtitle: 'Webhook config',
        list: [
          '<strong>URL</strong>: Endpoint de destino',
          '<strong>Method</strong>: POST, PUT ou PATCH',
          '<strong>Headers</strong>: Headers HTTP customizados (JSON)',
          '<strong>Retry</strong>: Tentar novamente em caso de falha'
        ]
      },
      {
        subtitle: 'Email config',
        list: [
          '<strong>To</strong>: Destinatários (separados por vírgula)',
          '<strong>Subject</strong>: Assunto do email',
          '<strong>Format</strong>: HTML (tabela), JSON (anexo), CSV (anexo)'
        ]
      },
      {
        subtitle: 'Google Sheets config',
        list: [
          '<strong>Connection</strong>: Conexão OAuth do Google',
          '<strong>Spreadsheet URL</strong>: URL da planilha',
          '<strong>Sheet Name</strong>: Nome da aba (ex: "Sheet1")',
          '<strong>Write Mode</strong>: append, replace ou update'
        ]
      },
      {
        subtitle: 'Download config',
        list: [
          '<strong>Filename</strong>: Nome do arquivo (sem extensão)',
          '<strong>Format</strong>: JSON, CSV ou Excel'
        ]
      }
    ],
    tutorialId: 'output-config',
    playgroundTitle: 'Playground: Webhook configurado',
    nextTopic: null,
    prevTopic: 'output-destinations'
  }
}

const currentTopic = ref(null)
const topicsList = Object.keys(topics)
const currentIndex = computed(() => topicsList.indexOf(route.params.topic))

function loadTopic() {
  const topicId = route.params.topic
  if (topics[topicId]) {
    currentTopic.value = topics[topicId]
  } else {
    router.push('/nodes/input-output')
  }
}

watch(() => route.params.topic, () => {
  loadTopic()
}, { immediate: true })

function goToTopic(topicId) {
  router.push(`/nodes/input-output/${topicId}`)
}

function goBack() {
  router.push('/nodes/input-output')
}
</script>

<template>
  <div v-if="currentTopic" class="max-w-3xl mx-auto">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
      <button @click="goBack" class="hover:text-brand-purple transition-colors">Input / Output</button>
      <Icon icon="material-symbols:chevron-right" class="w-4 h-4" />
      <span class="text-gray-800 font-medium">{{ currentTopic.title }}</span>
    </div>

    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-light text-gray-800 tracking-wide mb-4">
        {{ currentTopic.title }}
      </h1>
    </div>

    <!-- Progress Indicators -->
    <div class="flex items-center justify-center gap-2 mb-4">
      <div
        v-for="(topicKey, index) in topicsList"
        :key="topicKey"
        :class="[
          'h-2 rounded-full transition-all cursor-pointer hover:opacity-80',
          index === currentIndex ? 'w-8 bg-brand-purple' : 'w-2 bg-gray-300'
        ]"
        @click="goToTopic(topicKey)"
      ></div>
    </div>

    <!-- Counter -->
    <div class="text-center mb-8">
      <p class="text-sm text-gray-600 font-medium">
        {{ currentIndex + 1 }} de {{ topicsList.length }}
      </p>
    </div>

    <!-- Content Card -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-6 shadow-lg">
      <div class="flex items-center gap-3 mb-6">
        <div :class="['w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center', `from-${currentTopic.color}-400`, `to-${currentTopic.color}-600`]">
          <Icon :icon="currentTopic.icon" class="w-6 h-6 text-white" />
        </div>
        <h2 class="text-2xl font-medium text-gray-800">{{ currentTopic.title }}</h2>
      </div>

      <p class="text-gray-700 font-light leading-relaxed mb-6">
        {{ currentTopic.description }}
      </p>

      <!-- Dynamic content -->
      <div v-for="(section, index) in currentTopic.content" :key="index" class="mb-6">
        <h3 v-if="section.subtitle" class="text-lg font-medium text-gray-800 mb-3">{{ section.subtitle }}</h3>

        <p v-if="section.text" class="text-gray-700 font-light leading-relaxed mb-4">
          {{ section.text }}
        </p>

        <ul v-if="section.list" class="space-y-2 text-gray-700 font-light">
          <li v-for="(item, i) in section.list" :key="i" class="flex items-start gap-3">
            <span class="text-brand-purple mt-1">•</span>
            <div v-html="item"></div>
          </li>
        </ul>

        <pre v-if="section.code" class="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm"><code>{{ section.code }}</code></pre>
      </div>

      <!-- Playground -->
      <PlaygroundEmbed
        v-if="currentTopic.tutorialId"
        :tutorial-id="currentTopic.tutorialId"
        :title="currentTopic.playgroundTitle"
        height="450px"
      />
    </div>

    <!-- Navigation Buttons -->
    <div class="flex items-center justify-between gap-4 mb-8">
      <button
        v-if="currentTopic.prevTopic"
        @click="goToTopic(currentTopic.prevTopic)"
        class="flex items-center gap-2 px-6 py-3 rounded-xl font-medium backdrop-blur-xl bg-white/40 border border-white/20 text-gray-700 hover:bg-white/60 shadow-lg transition-all"
      >
        <Icon icon="material-symbols:arrow-back" class="w-5 h-5" />
        <span>Anterior</span>
      </button>
      <button
        v-else
        @click="goBack"
        class="flex items-center gap-2 px-6 py-3 rounded-xl font-medium backdrop-blur-xl bg-white/40 border border-white/20 text-gray-700 hover:bg-white/60 shadow-lg transition-all"
      >
        <Icon icon="material-symbols:arrow-back" class="w-5 h-5" />
        <span>Voltar</span>
      </button>

      <button
        v-if="currentTopic.nextTopic"
        @click="goToTopic(currentTopic.nextTopic)"
        class="flex items-center gap-2 px-6 py-3 rounded-xl font-medium backdrop-blur-xl bg-brand-purple text-white hover:brightness-110 shadow-lg transition-all"
      >
        <span>Próximo</span>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5" />
      </button>
      <button
        v-else
        @click="router.push('/nodes/data-connector')"
        class="flex items-center gap-2 px-6 py-3 rounded-xl font-medium backdrop-blur-xl bg-brand-green text-white hover:brightness-110 shadow-lg transition-all"
      >
        <span>Próximo: Data Connector</span>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
