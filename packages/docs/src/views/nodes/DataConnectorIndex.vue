<script setup>
import { useRouter } from 'vue-router'
import Icon from '../../components/Icon.vue'

const router = useRouter()

const sources = [
  {
    id: 'api',
    title: 'API',
    subtitle: 'HTTP REST',
    icon: 'material-symbols:api',
    color: 'blue',
    bgColor: 'from-blue-400 to-blue-600',
    description: 'Faça requisições HTTP GET para qualquer endpoint REST',
    example: 'GET https://api.example.com/users'
  },
  {
    id: 'google-sheets',
    title: 'Google Sheets',
    subtitle: 'Planilhas',
    icon: 'material-symbols:table-chart',
    color: 'green',
    bgColor: 'from-green-400 to-green-600',
    description: 'Conecte sua conta Google e busque dados de planilhas',
    example: 'OAuth → Selecionar planilha → Buscar dados'
  }
]

function goToSource(sourceId) {
  router.push(`/nodes/data-connector/${sourceId}`)
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-12">
      <h1 class="text-4xl font-light text-gray-800 tracking-wide mb-4">
        Data Connector
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Conecte e busque dados de fontes externas.
      </p>
    </div>

    <!-- Introdução -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">O que é Data Connector?</h2>
      <p class="text-gray-700 font-light leading-relaxed">
        O Data Connector busca dados de APIs externas, planilhas Google Sheets, CMS e outras fontes.
        Retorna os dados em formato JSON para processar no seu fluxo.
      </p>
    </div>

    <!-- Lista de Fontes -->
    <div class="space-y-3 mb-8">
      <div
        v-for="source in sources"
        :key="source.id"
        @click="goToSource(source.id)"
        class="backdrop-blur-xl bg-white/30 rounded-xl border border-white/20 p-4 shadow hover:shadow-md hover:bg-white/40 transition-all cursor-pointer group"
      >
        <div class="flex items-center gap-3">
          <!-- Ícone -->
          <div :class="['w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform', source.bgColor]">
            <Icon :icon="source.icon" class="w-5 h-5 text-white" />
          </div>

          <!-- Conteúdo -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-base font-semibold text-gray-800">{{ source.title }}</h3>
              <span class="text-xs text-gray-500">{{ source.subtitle }}</span>
            </div>
            <p class="text-xs text-gray-600">
              {{ source.description }} · <span class="font-medium">{{ source.example }}</span>
            </p>
          </div>

          <!-- Seta -->
          <Icon icon="material-symbols:chevron-right" class="w-5 h-5 text-gray-400 group-hover:text-brand-purple group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>
      </div>
    </div>

    <!-- Próximos passos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg hover:bg-white/40 hover:border-brand-purple/60 transition-all group cursor-pointer" @click="router.push('/nodes/filter')">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:filter-alt" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-800">Próximo: Filter</p>
            <p class="text-sm text-gray-600 font-light">Filtre arrays de dados</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
