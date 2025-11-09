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
        Map
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Transforme cada item de um array.
      </p>
    </div>

    <!-- Conteúdo principal -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">O que faz</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        Aplica uma transformação em cada item do array. Retorna um novo array
        com os items transformados, mantendo o mesmo tamanho.
      </p>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Como usar</h2>
      <ul class="space-y-3 text-gray-700 font-light">
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1">•</span>
          <div>Conecte um array na entrada</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1">•</span>
          <div>Configure a transformação (extrair campos, calcular valores, etc)</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1">•</span>
          <div>O node retorna array com mesma quantidade de items, mas transformados</div>
        </li>
      </ul>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Exemplo</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        Entrada: <code class="px-1.5 py-0.5 bg-white/60 rounded text-sm">[{name: "Ana", age: 25}, {name: "João", age: 30}]</code>.
        <br>Transformação: extrair apenas "name".
        <br>Saída: <code class="px-1.5 py-0.5 bg-white/60 rounded text-sm">["Ana", "João"]</code>.
      </p>

      <PlaygroundEmbed
        tutorial-id="array-map"
        title="Playground: Multiplicar por 2"
        height="450px"
      />
    </div>

    <!-- Próximos passos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg hover:bg-white/40 hover:border-brand-purple/60 transition-all group cursor-pointer" @click="router.push('/nodes/math')">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:calculate" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-800">Próximo: Math</p>
            <p class="text-sm text-gray-600 font-light">Operações matemáticas</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
