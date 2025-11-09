<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '../../components/Icon.vue'
import PlaygroundEmbed from '../../components/PlaygroundEmbed.vue'

const route = useRoute()
const router = useRouter()

const types = {
  compare: {
    id: 'compare',
    title: 'Compare (Comparação)',
    icon: 'material-symbols:compare-arrows',
    color: 'blue',
    description: 'Compara dois valores usando operadores matemáticos ou lógicos. Retorna true ou false.',
    details: 'Use operadores como = (igual), != (diferente), > (maior), < (menor), >= (maior ou igual), <= (menor ou igual) para comparar números, textos ou outros valores.',
    example: '5 > 3 → true | "abc" = "xyz" → false',
    tutorialId: 'condition-compare',
    playgroundTitle: 'Playground: Comparando Valores',
    nextType: 'branch'
  },
  branch: {
    id: 'branch',
    title: 'Conditional Branch (Ramificação)',
    icon: 'material-symbols:alt-route',
    color: 'purple',
    description: 'Ramifica a execução do fluxo baseado em um valor boolean. Tem duas saídas: TRUE e FALSE.',
    details: 'Conecte o resultado de um Compare ou Logic na entrada. O fluxo seguirá pela saída TRUE se o valor for verdadeiro, ou pela saída FALSE se for falso.',
    example: 'Input: true → Executa caminho TRUE | Input: false → Executa caminho FALSE',
    tutorialId: 'condition-branch',
    playgroundTitle: 'Playground: Ramificação Condicional',
    prevType: 'compare',
    nextType: 'logic'
  },
  logic: {
    id: 'logic',
    title: 'Logic (Operações Lógicas)',
    icon: 'material-symbols:logic',
    color: 'green',
    description: 'Realiza operações lógicas entre valores booleanos: AND, OR, NOT.',
    details: 'AND retorna true apenas se ambos forem true. OR retorna true se pelo menos um for true. NOT inverte o valor (true → false, false → true).',
    example: 'true AND false → false | true OR false → true | NOT true → false',
    tutorialId: 'condition-logic',
    playgroundTitle: 'Playground: Operadores Lógicos',
    prevType: 'branch'
  }
}

const currentType = ref(null)
const typesList = Object.keys(types)
const currentIndex = computed(() => typesList.indexOf(route.params.type))

function loadType() {
  const t = route.params.type
  if (types[t]) {
    currentType.value = types[t]
  } else {
    router.push('/nodes/condition')
  }
}

watch(() => route.params.type, () => {
  loadType()
}, { immediate: true })

const colorClasses = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500'
}

const colorBorderClasses = {
  blue: 'border-blue-200',
  purple: 'border-purple-200',
  green: 'border-green-200'
}

const colorBgClasses = {
  blue: 'bg-blue-50',
  purple: 'bg-purple-50',
  green: 'bg-green-50'
}

function goToType(typeId) {
  router.push(`/nodes/condition/${typeId}`)
}

function goBack() {
  router.push('/nodes/condition')
}
</script>

<template>
  <div v-if="currentType" class="max-w-3xl mx-auto">
    <!-- Header com Breadcrumb -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <button @click="goBack" class="hover:text-brand-purple transition-colors">Condition</button>
        <Icon icon="material-symbols:chevron-right" class="w-4 h-4" />
        <span class="text-gray-800 font-medium">{{ currentType.title }}</span>
      </div>

      <h1 class="text-4xl font-light text-gray-800 tracking-wide mb-4">
        {{ currentType.title }}
      </h1>
    </div>

    <!-- Indicador de Progresso -->
    <div class="flex items-center justify-center gap-2 mb-4">
      <div
        v-for="(t, index) in typesList"
        :key="t"
        :class="[
          'h-2 rounded-full transition-all cursor-pointer hover:opacity-80',
          index === currentIndex ? 'w-8 bg-brand-purple' : 'w-2 bg-gray-300'
        ]"
        @click="goToType(t)"
      ></div>
    </div>

    <!-- Contador -->
    <div class="text-center mb-8">
      <p class="text-sm text-gray-600 font-medium">
        {{ currentIndex + 1 }} de {{ typesList.length }}
      </p>
    </div>

    <!-- Card do Tipo -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-6 shadow-lg">
      <div class="flex items-center gap-3 mb-6">
        <div :class="['w-12 h-12 rounded-lg flex items-center justify-center', colorClasses[currentType.color]]">
          <Icon :icon="currentType.icon" class="w-6 h-6 text-white" />
        </div>
        <h2 class="text-2xl font-medium text-gray-800">{{ currentType.title }}</h2>
      </div>

      <p class="text-gray-700 font-light leading-relaxed mb-4">
        {{ currentType.description }}
      </p>

      <p class="text-gray-600 text-sm font-light leading-relaxed mb-6">
        {{ currentType.details }}
      </p>

      <div :class="['rounded-lg p-4 mb-6 border', colorBgClasses[currentType.color], colorBorderClasses[currentType.color]]">
        <p class="text-sm text-gray-700">
          <strong>Exemplos:</strong> {{ currentType.example }}
        </p>
      </div>

      <PlaygroundEmbed
        :tutorial-id="currentType.tutorialId"
        :title="currentType.playgroundTitle"
        height="450px"
      />
    </div>

    <!-- Botões de Navegação -->
    <div class="flex items-center justify-between gap-4 mb-8">
      <!-- Botão Anterior -->
      <button
        v-if="currentType.prevType"
        @click="goToType(currentType.prevType)"
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
        v-if="currentType.nextType"
        @click="goToType(currentType.nextType)"
        class="flex items-center gap-2 px-6 py-3 rounded-xl font-medium backdrop-blur-xl bg-brand-purple text-white hover:brightness-110 shadow-lg transition-all"
      >
        <span>Próximo</span>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5" />
      </button>
      <button
        v-else
        @click="router.push('/flows/connections')"
        class="flex items-center gap-2 px-6 py-3 rounded-xl font-medium backdrop-blur-xl bg-brand-green text-white hover:brightness-110 shadow-lg transition-all"
      >
        <span>Próxima Página: Fluxos</span>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
