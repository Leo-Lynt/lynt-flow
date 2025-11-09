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
        Interface do Editor
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Conheça as áreas principais da tela de trabalho.
      </p>
    </div>

    <!-- Conteúdo principal -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Áreas da Interface</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        O editor é dividido em 4 áreas principais que trabalham juntas:
      </p>

      <ul class="space-y-4 text-gray-700 font-light">
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1 font-medium">•</span>
          <div>
            <strong class="font-medium">Toolbar (topo):</strong> Botões de ação como Executar (play verde),
            Salvar, Desfazer/Refazer. Mostra status de sincronização.
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1 font-medium">•</span>
          <div>
            <strong class="font-medium">Lista de Nodes (esquerda):</strong> Todos os nodes disponíveis
            organizados por categorias. Use a busca para filtrar. Arraste nodes para o canvas.
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1 font-medium">•</span>
          <div>
            <strong class="font-medium">Canvas (centro):</strong> Área de trabalho onde você monta o fluxo.
            Arraste nodes, conecte-os, navegue com o mouse. Inclui minimapa e controles de zoom.
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1 font-medium">•</span>
          <div>
            <strong class="font-medium">Painel de Propriedades (direita):</strong> Abre ao clicar em um node.
            Configure os parâmetros específicos de cada node aqui.
          </div>
        </li>
      </ul>
    </div>

    <!-- Próximos passos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg hover:bg-white/40 hover:border-brand-purple/60 transition-all group cursor-pointer" @click="router.push('/editor/adding-nodes')">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:add-circle" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-800">Próximo: Adicionar Nodes</p>
            <p class="text-sm text-gray-600 font-light">Aprenda a buscar e adicionar nodes</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
