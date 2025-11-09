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
        Sort
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Ordene arrays por campo ou valor.
      </p>
    </div>

    <!-- Conteúdo principal -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">O que faz</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        Recebe um array e retorna ordenado segundo o critério definido.
        Pode ordenar por campo específico em ordem crescente ou decrescente.
      </p>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Configuração</h2>
      <ul class="space-y-3 text-gray-700 font-light">
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1">•</span>
          <div><strong class="font-medium">Campo:</strong> Nome da propriedade para ordenar (ex: "price", "name")</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1">•</span>
          <div><strong class="font-medium">Ordem:</strong> Crescente (A-Z, 0-9) ou Decrescente (Z-A, 9-0)</div>
        </li>
      </ul>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Exemplo</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        Entrada: array de produtos. Campo: <code class="px-1.5 py-0.5 bg-white/60 rounded text-sm">price</code>.
        Ordem: Crescente. Saída: produtos ordenados do mais barato ao mais caro.
      </p>

      <PlaygroundEmbed
        tutorial-id="array-sort"
        title="Playground: Ordenar números"
        height="450px"
      />
    </div>

    <!-- Próximos passos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg hover:bg-white/40 hover:border-brand-purple/60 transition-all group cursor-pointer" @click="router.push('/nodes/map')">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:transform" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-800">Próximo: Map</p>
            <p class="text-sm text-gray-600 font-light">Transforme items de arrays</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
