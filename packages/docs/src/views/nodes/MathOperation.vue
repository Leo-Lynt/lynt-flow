<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '../../components/Icon.vue'
import PlaygroundEmbed from '../../components/PlaygroundEmbed.vue'

const route = useRoute()
const router = useRouter()

const operations = {
  add: {
    id: 'add',
    title: 'Add (Soma)',
    icon: 'material-symbols:add',
    color: 'blue',
    description: 'Soma dois números e retorna o resultado. É a operação matemática mais básica.',
    example: '2 + 3 = 5',
    tutorialId: 'soma-numeros',
    playgroundTitle: 'Playground: Somando 2 + 3',
    nextOperation: 'subtract'
  },
  subtract: {
    id: 'subtract',
    title: 'Subtract (Subtração)',
    icon: 'material-symbols:remove',
    color: 'green',
    description: 'Subtrai o segundo número do primeiro. O resultado pode ser negativo.',
    example: '10 - 3 = 7',
    tutorialId: 'subtracao-numeros',
    playgroundTitle: 'Playground: Subtraindo 10 - 3',
    prevOperation: 'add',
    nextOperation: 'multiply'
  },
  multiply: {
    id: 'multiply',
    title: 'Multiply (Multiplicação)',
    icon: 'material-symbols:close',
    color: 'purple',
    description: 'Multiplica dois números. Útil para cálculos de porcentagem, área, volume, etc.',
    example: '4 × 5 = 20',
    tutorialId: 'multiplicacao-numeros',
    playgroundTitle: 'Playground: Multiplicando 4 × 5',
    prevOperation: 'subtract',
    nextOperation: 'divide'
  },
  divide: {
    id: 'divide',
    title: 'Divide (Divisão)',
    icon: 'material-symbols:keyboard-tab',
    color: 'orange',
    description: 'Divide o primeiro número pelo segundo. Atenção: divisão por zero resulta em erro.',
    example: '20 ÷ 4 = 5',
    tutorialId: 'divisao-numeros',
    playgroundTitle: 'Playground: Dividindo 20 ÷ 4',
    prevOperation: 'multiply',
    nextOperation: 'round'
  },
  round: {
    id: 'round',
    title: 'Round (Arredondamento)',
    icon: 'material-symbols:rotate-90-degrees-ccw',
    color: 'pink',
    description: 'Arredonda um número decimal para o inteiro mais próximo. Valores >= 0.5 arredondam para cima.',
    example: '4.3 → 4 | 4.7 → 5 | 4.5 → 5',
    tutorialId: 'round-numero',
    playgroundTitle: 'Playground: Arredondando 4.7',
    prevOperation: 'divide'
  }
}

const currentOperation = ref(null)
const operationsList = Object.keys(operations)
const currentIndex = computed(() => operationsList.indexOf(route.params.operation))

// Carregar operação atual
function loadOperation() {
  const op = route.params.operation
  if (operations[op]) {
    currentOperation.value = operations[op]
  } else {
    router.push('/nodes/math')
  }
}

// Watch para mudanças na rota
watch(() => route.params.operation, () => {
  loadOperation()
}, { immediate: true })

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500'
}

const colorBorderClasses = {
  blue: 'border-blue-200',
  green: 'border-green-200',
  purple: 'border-purple-200',
  orange: 'border-orange-200',
  pink: 'border-pink-200'
}

const colorBgClasses = {
  blue: 'bg-blue-50',
  green: 'bg-green-50',
  purple: 'bg-purple-50',
  orange: 'bg-orange-50',
  pink: 'bg-pink-50'
}

function goToOperation(operationId) {
  router.push(`/nodes/math/${operationId}`)
}

function goBack() {
  router.push('/nodes/math')
}
</script>

<template>
  <div v-if="currentOperation" class="max-w-3xl mx-auto">
    <!-- Header com Breadcrumb -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <button @click="goBack" class="hover:text-brand-purple transition-colors">Math</button>
        <Icon icon="material-symbols:chevron-right" class="w-4 h-4" />
        <span class="text-gray-800 font-medium">{{ currentOperation.title }}</span>
      </div>

      <h1 class="text-4xl font-light text-gray-800 tracking-wide mb-4">
        {{ currentOperation.title }}
      </h1>
    </div>

    <!-- Indicador de Progresso -->
    <div class="flex items-center justify-center gap-2 mb-4">
      <div
        v-for="(op, index) in operationsList"
        :key="op"
        :class="[
          'h-2 rounded-full transition-all cursor-pointer hover:opacity-80',
          index === currentIndex ? 'w-8 bg-brand-purple' : 'w-2 bg-gray-300'
        ]"
        @click="goToOperation(op)"
      ></div>
    </div>

    <!-- Contador -->
    <div class="text-center mb-8">
      <p class="text-sm text-gray-600 font-medium">
        {{ currentIndex + 1 }} de {{ operationsList.length }}
      </p>
    </div>

    <!-- Card da Operação -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-6 shadow-lg">
      <div class="flex items-center gap-3 mb-6">
        <div :class="['w-12 h-12 rounded-lg flex items-center justify-center', colorClasses[currentOperation.color]]">
          <Icon :icon="currentOperation.icon" :class="currentOperation.id === 'divide' ? 'w-6 h-6 text-white rotate-90' : 'w-6 h-6 text-white'" />
        </div>
        <h2 class="text-2xl font-medium text-gray-800">{{ currentOperation.title }}</h2>
      </div>

      <p class="text-gray-700 font-light leading-relaxed mb-6">
        {{ currentOperation.description }}
      </p>

      <div :class="['rounded-lg p-4 mb-6 border', colorBgClasses[currentOperation.color], colorBorderClasses[currentOperation.color]]">
        <p class="text-sm text-gray-700">
          <strong>Exemplo:</strong> {{ currentOperation.example }}
        </p>
      </div>

      <PlaygroundEmbed
        :tutorial-id="currentOperation.tutorialId"
        :title="currentOperation.playgroundTitle"
        height="450px"
      />
    </div>

    <!-- Botões de Navegação -->
    <div class="flex items-center justify-between gap-4 mb-8">
      <!-- Botão Anterior -->
      <button
        v-if="currentOperation.prevOperation"
        @click="goToOperation(currentOperation.prevOperation)"
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
        v-if="currentOperation.nextOperation"
        @click="goToOperation(currentOperation.nextOperation)"
        class="flex items-center gap-2 px-6 py-3 rounded-xl font-medium backdrop-blur-xl bg-brand-purple text-white hover:brightness-110 shadow-lg transition-all"
      >
        <span>Próximo</span>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5" />
      </button>
      <button
        v-else
        @click="router.push('/nodes/condition')"
        class="flex items-center gap-2 px-6 py-3 rounded-xl font-medium backdrop-blur-xl bg-brand-green text-white hover:brightness-110 shadow-lg transition-all"
      >
        <span>Próxima Página: Condition</span>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
