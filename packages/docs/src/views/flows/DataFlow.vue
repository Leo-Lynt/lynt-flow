<script setup>
import { useRouter } from 'vue-router'
import Icon from '../../components/Icon.vue'
import PlaygroundEmbed from '../../components/PlaygroundEmbed.vue'

const router = useRouter()
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <!-- Header -->
    <div class="mb-12">
      <h1 class="text-4xl font-light text-gray-800 tracking-wide mb-4">
        Fluxo de Dados
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Como os dados se movem através dos nodes.
      </p>
    </div>

    <!-- Conteúdo principal -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Ordem de Execução</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        O fluxo começa no Input node e segue as conexões de execução (cinza).
        Cada node processa seus inputs e gera outputs. Os dados fluem automaticamente pelas conexões coloridas.
      </p>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Cores das Conexões</h2>
      <ul class="space-y-3 text-gray-700 font-light">
        <li class="flex items-start gap-3">
          <span class="text-blue-500 mt-1 font-bold">●</span>
          <div><strong class="font-medium">Azul:</strong> Any (aceita qualquer tipo)</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-emerald-500 mt-1 font-bold">●</span>
          <div><strong class="font-medium">Verde:</strong> String (texto)</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-orange-500 mt-1 font-bold">●</span>
          <div><strong class="font-medium">Laranja:</strong> Number (número)</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-purple-500 mt-1 font-bold">●</span>
          <div><strong class="font-medium">Roxo:</strong> Boolean (verdadeiro/falso)</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-pink-500 mt-1 font-bold">●</span>
          <div><strong class="font-medium">Rosa:</strong> Array (lista)</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-cyan-500 mt-1 font-bold">●</span>
          <div><strong class="font-medium">Ciano:</strong> Object (objeto)</div>
        </li>
      </ul>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Rastreamento</h2>
      <p class="text-gray-700 font-light leading-relaxed">
        Clique em uma conexão colorida para ver o valor sendo transferido no console.
        Útil para debugging e entender o que está passando entre nodes.
      </p>
    </div>

    <!-- Playground -->
    <PlaygroundEmbed
      tutorial-id="flow-dataflow"
      title="Playground: Fluxo de Dados com Variáveis"
      height="450px"
    />

    <!-- Próximos passos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg hover:bg-white/40 hover:border-brand-purple/60 transition-all group cursor-pointer" @click="router.push('/flows/debugging')">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:bug-report" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-800">Próximo: Debugging</p>
            <p class="text-sm text-gray-600 font-light">Como depurar e corrigir erros</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
