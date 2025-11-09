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
        Filter
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Filtre arrays aplicando condições.
      </p>
    </div>

    <!-- Conteúdo principal -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">O que faz</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        Recebe um array e retorna apenas os items que atendem às condições definidas.
        Útil para filtrar dados antes de processar.
      </p>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Como usar</h2>
      <ul class="space-y-3 text-gray-700 font-light">
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1">•</span>
          <div>Conecte um array na entrada</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1">•</span>
          <div>Configure as condições (campo, operador, valor)</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1">•</span>
          <div>O node retorna apenas items que passam no filtro</div>
        </li>
      </ul>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Exemplo</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        Entrada: array de usuários. Condição: <code class="px-1.5 py-0.5 bg-white/60 rounded text-sm">age > 18</code>.
        Saída: apenas usuários maiores de 18 anos.
      </p>

      <PlaygroundEmbed
        tutorial-id="array-filter"
        title="Playground: Filtrar números > 5"
        height="450px"
      />
    </div>

    <!-- Próximos passos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg hover:bg-white/40 hover:border-brand-purple/60 transition-all group cursor-pointer" @click="router.push('/nodes/sort')">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:sort" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-800">Próximo: Sort</p>
            <p class="text-sm text-gray-600 font-light">Ordene arrays</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
