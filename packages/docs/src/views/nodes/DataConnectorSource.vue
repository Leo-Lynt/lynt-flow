<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '../../components/Icon.vue'
import PlaygroundEmbed from '../../components/PlaygroundEmbed.vue'

const route = useRoute()
const router = useRouter()

const sources = {
  api: {
    id: 'api',
    title: 'API (HTTP REST)',
    icon: 'material-symbols:api',
    color: 'blue',
    description: 'Faça requisições HTTP GET para qualquer endpoint REST e receba os dados em JSON.',
    details: 'Configure a URL do endpoint no painel de propriedades. Pode adicionar headers personalizados e query parameters. O resultado é automaticamente parseado como JSON.',
    example: 'GET https://jsonplaceholder.typicode.com/users → Array de usuários',
    tutorialId: 'data-connector-api',
    playgroundTitle: 'Playground: Conectando API REST',
    nextSource: 'google-sheets'
  },
  'google-sheets': {
    id: 'google-sheets',
    title: 'Google Sheets (Planilhas)',
    icon: 'material-symbols:table-chart',
    color: 'green',
    description: 'Conecte sua conta Google e busque dados de planilhas. Ideal para trabalhar com dados tabulares.',
    details: 'Clique em "Connect" para fazer OAuth com sua conta Google. Depois selecione a planilha e a aba nos dropdowns. Os dados são retornados como array de objetos, onde cada coluna vira uma propriedade.',
    example: 'Nome | Email | Idade → [{nome: "João", email: "joao@example.com", idade: 25}, ...]',
    tutorialId: 'data-connector-sheets',
    playgroundTitle: 'Playground: Conectando Google Sheets',
    prevSource: 'api'
  }
}

const currentSource = ref(null)
const sourcesList = Object.keys(sources)
const currentIndex = computed(() => sourcesList.indexOf(route.params.source))

function loadSource() {
  const s = route.params.source
  if (sources[s]) {
    currentSource.value = sources[s]
  } else {
    router.push('/nodes/data-connector')
  }
}

watch(() => route.params.source, () => {
  loadSource()
}, { immediate: true })

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500'
}

const colorBorderClasses = {
  blue: 'border-blue-200',
  green: 'border-green-200',
  purple: 'border-purple-200'
}

const colorBgClasses = {
  blue: 'bg-blue-50',
  green: 'bg-green-50',
  purple: 'bg-purple-50'
}

function goToSource(sourceId) {
  router.push(`/nodes/data-connector/${sourceId}`)
}

function goBack() {
  router.push('/nodes/data-connector')
}
</script>

<template>
  <div v-if="currentSource" class="max-w-3xl mx-auto">
    <!-- Header com Breadcrumb -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <button @click="goBack" class="hover:text-brand-purple transition-colors">Data Connector</button>
        <Icon icon="material-symbols:chevron-right" class="w-4 h-4" />
        <span class="text-gray-800 font-medium">{{ currentSource.title }}</span>
      </div>

      <h1 class="text-4xl font-light text-gray-800 tracking-wide mb-4">
        {{ currentSource.title }}
      </h1>
    </div>

    <!-- Indicador de Progresso -->
    <div class="flex items-center justify-center gap-2 mb-4">
      <div
        v-for="(s, index) in sourcesList"
        :key="s"
        :class="[
          'h-2 rounded-full transition-all cursor-pointer hover:opacity-80',
          index === currentIndex ? 'w-8 bg-brand-purple' : 'w-2 bg-gray-300'
        ]"
        @click="goToSource(s)"
      ></div>
    </div>

    <!-- Contador -->
    <div class="text-center mb-8">
      <p class="text-sm text-gray-600 font-medium">
        {{ currentIndex + 1 }} de {{ sourcesList.length }}
      </p>
    </div>

    <!-- Card da Fonte -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-6 shadow-lg">
      <div class="flex items-center gap-3 mb-6">
        <div :class="['w-12 h-12 rounded-lg flex items-center justify-center', colorClasses[currentSource.color]]">
          <Icon :icon="currentSource.icon" class="w-6 h-6 text-white" />
        </div>
        <h2 class="text-2xl font-medium text-gray-800">{{ currentSource.title }}</h2>
      </div>

      <p class="text-gray-700 font-light leading-relaxed mb-4">
        {{ currentSource.description }}
      </p>

      <p class="text-gray-600 text-sm font-light leading-relaxed mb-6">
        {{ currentSource.details }}
      </p>

      <div :class="['rounded-lg p-4 mb-6 border', colorBgClasses[currentSource.color], colorBorderClasses[currentSource.color]]">
        <p class="text-sm text-gray-700">
          <strong>Exemplo:</strong> {{ currentSource.example }}
        </p>
      </div>

      <PlaygroundEmbed
        :tutorial-id="currentSource.tutorialId"
        :title="currentSource.playgroundTitle"
        height="450px"
      />
    </div>

    <!-- Botões de Navegação -->
    <div class="flex items-center justify-between gap-4 mb-8">
      <!-- Botão Anterior -->
      <button
        v-if="currentSource.prevSource"
        @click="goToSource(currentSource.prevSource)"
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

      <!-- Botão Próximo ou Finalizar -->
      <button
        v-if="currentSource.nextSource"
        @click="goToSource(currentSource.nextSource)"
        class="flex items-center gap-2 px-6 py-3 rounded-xl font-medium backdrop-blur-xl bg-brand-purple text-white hover:brightness-110 shadow-lg transition-all"
      >
        <span>Próximo</span>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5" />
      </button>
      <button
        v-else
        @click="router.push('/nodes/filter')"
        class="flex items-center gap-2 px-6 py-3 rounded-xl font-medium backdrop-blur-xl bg-brand-green text-white hover:brightness-110 shadow-lg transition-all"
      >
        <span>Próxima Página: Filter</span>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
