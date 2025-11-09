<script setup>
import { useRouter } from 'vue-router'
import Icon from '../../components/Icon.vue'

const router = useRouter()
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <!-- Header -->
    <div class="mb-12">
      <h1 class="text-4xl font-light text-gray-800 tracking-wide mb-4">
        O que é Lynt Flow?
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Uma ferramenta de programação visual. Conecte blocos ao invés de escrever código.
      </p>
    </div>

    <!-- Conteúdo principal -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Como funciona</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        Você conecta <strong>nodes</strong> (blocos) que executam ações. Cada node faz uma coisa específica:
        buscar dados, filtrar, calcular. Os dados fluem de um node para outro através de conexões.
      </p>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Para que serve</h2>
      <ul class="space-y-3 text-gray-700 font-light">
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1">•</span>
          <span>Automatizar tarefas repetitivas com dados</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1">•</span>
          <span>Integrar diferentes sistemas e APIs</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1">•</span>
          <span>Processar e transformar informações</span>
        </li>
      </ul>
    </div>

    <!-- Próximos passos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg hover:bg-white/40 hover:border-brand-purple/60 transition-all group cursor-pointer" @click="router.push('/editor/interface')">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:arrow-forward" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-800">Próximo: Interface do Editor</p>
            <p class="text-sm text-gray-600 font-light">Aprenda a usar a ferramenta</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
