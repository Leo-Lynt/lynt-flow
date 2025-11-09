<script setup>
import { useRouter } from 'vue-router'
import Icon from '../../components/Icon.vue'

const router = useRouter()

const operations = [
  {
    id: 'add',
    title: 'Add',
    subtitle: 'Soma',
    icon: 'material-symbols:add',
    color: 'blue',
    bgColor: 'from-blue-400 to-blue-600',
    description: 'Soma dois números e retorna o resultado',
    example: '2 + 3 = 5'
  },
  {
    id: 'subtract',
    title: 'Subtract',
    subtitle: 'Subtração',
    icon: 'material-symbols:remove',
    color: 'green',
    bgColor: 'from-green-400 to-green-600',
    description: 'Subtrai o segundo número do primeiro',
    example: '10 - 3 = 7'
  },
  {
    id: 'multiply',
    title: 'Multiply',
    subtitle: 'Multiplicação',
    icon: 'material-symbols:close',
    color: 'purple',
    bgColor: 'from-purple-400 to-purple-600',
    description: 'Multiplica dois números',
    example: '4 × 5 = 20'
  },
  {
    id: 'divide',
    title: 'Divide',
    subtitle: 'Divisão',
    icon: 'material-symbols:keyboard-tab',
    color: 'orange',
    bgColor: 'from-orange-400 to-orange-600',
    description: 'Divide o primeiro número pelo segundo',
    example: '20 ÷ 4 = 5'
  },
  {
    id: 'round',
    title: 'Round',
    subtitle: 'Arredondamento',
    icon: 'material-symbols:rotate-90-degrees-ccw',
    color: 'pink',
    bgColor: 'from-pink-400 to-pink-600',
    description: 'Arredonda um número para o inteiro mais próximo',
    example: '4.7 → 5'
  }
]

function goToOperation(operationId) {
  router.push(`/nodes/math/${operationId}`)
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-12">
      <h1 class="text-4xl font-light text-gray-800 tracking-wide mb-4">
        Math
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Operações matemáticas básicas com exemplos interativos.
      </p>
    </div>

    <!-- Introdução -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">O que são nodes Math?</h2>
      <p class="text-gray-700 font-light leading-relaxed">
        Os nodes de matemática realizam cálculos com valores numéricos.
        Cada operação tem seu próprio node dedicado. Clique em uma operação abaixo para ver exemplos interativos.
      </p>
    </div>

    <!-- Lista de Operações -->
    <div class="space-y-3 mb-8">
      <div
        v-for="op in operations"
        :key="op.id"
        @click="goToOperation(op.id)"
        class="backdrop-blur-xl bg-white/30 rounded-xl border border-white/20 p-4 shadow hover:shadow-md hover:bg-white/40 transition-all cursor-pointer group"
      >
        <div class="flex items-center gap-3">
          <!-- Ícone -->
          <div :class="['w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform', op.bgColor]">
            <Icon :icon="op.icon" :class="op.id === 'divide' ? 'w-5 h-5 text-white rotate-90' : 'w-5 h-5 text-white'" />
          </div>

          <!-- Conteúdo -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-base font-semibold text-gray-800">{{ op.title }}</h3>
              <span class="text-xs text-gray-500">{{ op.subtitle }}</span>
            </div>
            <p class="text-xs text-gray-600">
              {{ op.description }} · <span class="font-medium">{{ op.example }}</span>
            </p>
          </div>

          <!-- Seta -->
          <Icon icon="material-symbols:chevron-right" class="w-5 h-5 text-gray-400 group-hover:text-brand-purple group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>
      </div>
    </div>

    <!-- Próximos passos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg hover:bg-white/40 hover:border-brand-purple/60 transition-all group cursor-pointer" @click="router.push('/nodes/condition')">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:alt-route" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-800">Próximo: Condition</p>
            <p class="text-sm text-gray-600 font-light">Lógica condicional</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
