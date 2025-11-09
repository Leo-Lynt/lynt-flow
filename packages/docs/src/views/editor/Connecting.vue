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
        Conectar Nodes
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Como criar conexões entre nodes para construir seu fluxo.
      </p>
    </div>

    <!-- Conteúdo principal -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Como Conectar</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        Arraste de um ponto de saída (direita do node) até um ponto de entrada (esquerda de outro node).
      </p>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Tipos de Conexão</h2>
      <ul class="space-y-4 text-gray-700 font-light">
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1 font-medium">•</span>
          <div>
            <strong class="font-medium">Conexões de Fluxo (cinza):</strong> Controlam a ordem de execução.
            Linha grossa animada que define qual node executa após outro.
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1 font-medium">•</span>
          <div>
            <strong class="font-medium">Conexões de Dados (coloridas):</strong> Transferem valores entre nodes.
            Cada cor representa um tipo de dado (azul=any, verde=string, laranja=number, rosa=array, etc).
          </div>
        </li>
      </ul>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Menu Rápido de Conexão</h2>
      <p class="text-gray-700 font-light leading-relaxed">
        Ao arrastar uma conexão e soltar no vazio, abre um menu com nodes compatíveis.
        Clique em um para criar o node e conectá-lo automaticamente.
      </p>
    </div>

    <!-- Próximos passos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg hover:bg-white/40 hover:border-brand-purple/60 transition-all group cursor-pointer" @click="router.push('/editor/running')">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:play-circle" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-800">Próximo: Executar</p>
            <p class="text-sm text-gray-600 font-light">Aprenda a rodar seu fluxo</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
