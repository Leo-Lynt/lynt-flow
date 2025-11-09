<script setup>
import { useRouter } from 'vue-router'
import Icon from '../../components/Icon.vue'

const router = useRouter()

const types = [
  {
    id: 'compare',
    title: 'Compare',
    subtitle: 'Comparação',
    icon: 'material-symbols:compare-arrows',
    color: 'blue',
    bgColor: 'from-blue-400 to-blue-600',
    description: 'Compara dois valores usando operadores',
    example: '5 > 3 → true'
  },
  {
    id: 'branch',
    title: 'Conditional Branch',
    subtitle: 'Ramificação',
    icon: 'material-symbols:alt-route',
    color: 'purple',
    bgColor: 'from-purple-400 to-purple-600',
    description: 'Ramifica a execução baseado em um boolean',
    example: 'true → caminho A | false → caminho B'
  },
  {
    id: 'logic',
    title: 'Logic',
    subtitle: 'Lógica',
    icon: 'material-symbols:logic',
    color: 'green',
    bgColor: 'from-green-400 to-green-600',
    description: 'Operações lógicas entre valores booleanos',
    example: 'true AND false → false'
  }
]

function goToType(typeId) {
  router.push(`/nodes/condition/${typeId}`)
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-12">
      <h1 class="text-4xl font-light text-gray-800 tracking-wide mb-4">
        Condition
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Crie ramificações condicionais no seu fluxo.
      </p>
    </div>

    <!-- Introdução -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">O que são Conditions?</h2>
      <p class="text-gray-700 font-light leading-relaxed">
        Conditions permitem que seu fluxo tome decisões diferentes baseadas em valores.
        Use Compare para criar condições, Conditional Branch para ramificar execução, e Logic para combinar múltiplas condições.
      </p>
    </div>

    <!-- Lista de Tipos -->
    <div class="space-y-3 mb-8">
      <div
        v-for="type in types"
        :key="type.id"
        @click="goToType(type.id)"
        class="backdrop-blur-xl bg-white/30 rounded-xl border border-white/20 p-4 shadow hover:shadow-md hover:bg-white/40 transition-all cursor-pointer group"
      >
        <div class="flex items-center gap-3">
          <!-- Ícone -->
          <div :class="['w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform', type.bgColor]">
            <Icon :icon="type.icon" class="w-5 h-5 text-white" />
          </div>

          <!-- Conteúdo -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-base font-semibold text-gray-800">{{ type.title }}</h3>
              <span class="text-xs text-gray-500">{{ type.subtitle }}</span>
            </div>
            <p class="text-xs text-gray-600">
              {{ type.description }} · <span class="font-medium">{{ type.example }}</span>
            </p>
          </div>

          <!-- Seta -->
          <Icon icon="material-symbols:chevron-right" class="w-5 h-5 text-gray-400 group-hover:text-brand-purple group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>
      </div>
    </div>

    <!-- Próximos passos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg hover:bg-white/40 hover:border-brand-purple/60 transition-all group cursor-pointer" @click="router.push('/flows/connections')">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:account-tree" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-800">Próximo: Criando Fluxos</p>
            <p class="text-sm text-gray-600 font-light">Aprenda a construir fluxos completos</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
