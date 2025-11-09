<script setup>
import { useRouter } from 'vue-router'
import Icon from '../../components/Icon.vue'

const router = useRouter()

const inputTopics = [
  {
    id: 'input-overview',
    title: 'Overview',
    subtitle: 'Visão Geral',
    icon: 'material-symbols:info',
    color: 'blue',
    bgColor: 'from-blue-400 to-blue-600',
    description: 'O que é o Input node e como funciona',
    example: 'Ponto de partida do fluxo'
  },
  {
    id: 'input-parameters',
    title: 'Parameters',
    subtitle: 'Parâmetros',
    icon: 'material-symbols:settings',
    color: 'purple',
    bgColor: 'from-purple-400 to-purple-600',
    description: 'Como criar e configurar parâmetros',
    example: 'Obrigatório vs Opcional'
  },
  {
    id: 'input-types',
    title: 'Types',
    subtitle: 'Tipos de Dados',
    icon: 'material-symbols:data-object',
    color: 'green',
    bgColor: 'from-green-400 to-green-600',
    description: 'Tipos suportados e formatação',
    example: 'String, Number, Date, etc'
  },
  {
    id: 'input-api',
    title: 'API Usage',
    subtitle: 'Uso via API',
    icon: 'material-symbols:api',
    color: 'orange',
    bgColor: 'from-orange-400 to-orange-600',
    description: 'Como passar parâmetros via API',
    example: 'context.inputValues'
  }
]

const outputTopics = [
  {
    id: 'output-overview',
    title: 'Overview',
    subtitle: 'Visão Geral',
    icon: 'material-symbols:info',
    color: 'red',
    bgColor: 'from-red-400 to-red-600',
    description: 'O que é o Output node e como funciona',
    example: 'Ponto final do fluxo'
  },
  {
    id: 'output-inputs',
    title: 'Dynamic Inputs',
    subtitle: 'Entradas Dinâmicas',
    icon: 'material-symbols:add-box',
    color: 'pink',
    bgColor: 'from-pink-400 to-pink-600',
    description: 'Como adicionar inputs ao Output',
    example: 'Unwrapping automático'
  },
  {
    id: 'output-destinations',
    title: 'Destinations',
    subtitle: 'Destinos',
    icon: 'material-symbols:send',
    color: 'indigo',
    bgColor: 'from-indigo-400 to-indigo-600',
    description: 'Onde enviar os dados de saída',
    example: 'API, Webhook, Email, etc'
  },
  {
    id: 'output-config',
    title: 'Configuration',
    subtitle: 'Configuração',
    icon: 'material-symbols:tune',
    color: 'teal',
    bgColor: 'from-teal-400 to-teal-600',
    description: 'Configurações por destino',
    example: 'Headers, formatos, retry'
  }
]

function goToTopic(topicId) {
  router.push(`/nodes/input-output/${topicId}`)
}

function goBack() {
  router.push('/nodes')
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
      <button @click="goBack" class="hover:text-brand-purple transition-colors">Nodes</button>
      <Icon icon="material-symbols:chevron-right" class="w-4 h-4" />
      <span class="text-gray-800 font-medium">Input / Output</span>
    </div>

    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-light text-gray-800 tracking-wide mb-4">
        Input / Output
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Entrada e saída de dados do fluxo. Nodes fundamentais que definem como dados entram e saem.
      </p>
    </div>

    <!-- Input Topics Section -->
    <div class="mb-12">
      <h2 class="text-2xl font-medium text-gray-800 mb-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
          <Icon icon="material-symbols:input" class="w-5 h-5 text-white" />
        </div>
        Input Node
      </h2>
      <p class="text-gray-600 font-light mb-6">
        Define os parâmetros de entrada do fluxo. Permite receber dados externos via API ou interface.
      </p>

      <div class="space-y-3">
        <div
          v-for="topic in inputTopics"
          :key="topic.id"
          @click="goToTopic(topic.id)"
          class="backdrop-blur-xl bg-white/30 rounded-xl border border-white/20 p-4 shadow hover:shadow-md hover:bg-white/40 transition-all cursor-pointer group"
        >
          <div class="flex items-center gap-3">
            <div :class="['w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform', topic.bgColor]">
              <Icon :icon="topic.icon" class="w-5 h-5 text-white" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-base font-semibold text-gray-800">{{ topic.title }}</h3>
                <span class="text-xs text-gray-500">{{ topic.subtitle }}</span>
              </div>
              <p class="text-xs text-gray-600">
                {{ topic.description }} · <span class="font-medium">{{ topic.example }}</span>
              </p>
            </div>

            <Icon icon="material-symbols:chevron-right" class="w-5 h-5 text-gray-400 group-hover:text-brand-purple group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>

    <!-- Output Topics Section -->
    <div class="mb-8">
      <h2 class="text-2xl font-medium text-gray-800 mb-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
          <Icon icon="material-symbols:output" class="w-5 h-5 text-white" />
        </div>
        Output Node
      </h2>
      <p class="text-gray-600 font-light mb-6">
        Define como os resultados do fluxo são exportados. Suporta múltiplos destinos e formatos.
      </p>

      <div class="space-y-3">
        <div
          v-for="topic in outputTopics"
          :key="topic.id"
          @click="goToTopic(topic.id)"
          class="backdrop-blur-xl bg-white/30 rounded-xl border border-white/20 p-4 shadow hover:shadow-md hover:bg-white/40 transition-all cursor-pointer group"
        >
          <div class="flex items-center gap-3">
            <div :class="['w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform', topic.bgColor]">
              <Icon :icon="topic.icon" class="w-5 h-5 text-white" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-base font-semibold text-gray-800">{{ topic.title }}</h3>
                <span class="text-xs text-gray-500">{{ topic.subtitle }}</span>
              </div>
              <p class="text-xs text-gray-600">
                {{ topic.description }} · <span class="font-medium">{{ topic.example }}</span>
              </p>
            </div>

            <Icon icon="material-symbols:chevron-right" class="w-5 h-5 text-gray-400 group-hover:text-brand-purple group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
