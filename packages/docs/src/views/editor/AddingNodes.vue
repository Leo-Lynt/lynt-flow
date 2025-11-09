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
        Adicionar Nodes
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Como buscar e adicionar nodes ao canvas.
      </p>
    </div>

    <!-- Conteúdo principal -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Como Adicionar</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        Existem duas formas de adicionar nodes ao seu fluxo:
      </p>

      <ul class="space-y-4 text-gray-700 font-light mb-8">
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1 font-medium">•</span>
          <div>
            <strong class="font-medium">Arrastar da lista:</strong> Na sidebar esquerda, clique e arraste
            o node desejado para o canvas. Solte no local onde quer posicioná-lo.
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1 font-medium">•</span>
          <div>
            <strong class="font-medium">Menu rápido (Space):</strong> Aperte a tecla Espaço no canvas
            para abrir o menu de busca rápida. Digite o nome do node e clique para adicionar.
          </div>
        </li>
      </ul>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Buscar Nodes</h2>
      <p class="text-gray-700 font-light leading-relaxed">
        Use a barra de busca no topo da sidebar para filtrar nodes por nome.
        Os nodes estão organizados em categorias como Input/Output, Math, Array, Object, etc.
      </p>
    </div>

    <!-- Próximos passos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg hover:bg-white/40 hover:border-brand-purple/60 transition-all group cursor-pointer" @click="router.push('/editor/connecting')">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:link" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-800">Próximo: Conectar</p>
            <p class="text-sm text-gray-600 font-light">Aprenda a conectar nodes entre si</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
