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
        Conexões
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Entenda como funcionam as conexões entre nodes.
      </p>
    </div>

    <!-- Conteúdo principal -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Dois Tipos de Conexão</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        As conexões têm finalidades diferentes no fluxo:
      </p>

      <ul class="space-y-4 text-gray-700 font-light mb-8">
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1 font-medium">•</span>
          <div>
            <strong class="font-medium">Execução (cinza, animada):</strong> Define ordem de execução dos nodes.
            Sem conexão de execução, o node não roda. Linha grossa com animação.
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1 font-medium">•</span>
          <div>
            <strong class="font-medium">Dados (colorida):</strong> Transfere valores entre nodes.
            Cada cor representa um tipo de dado. Linha fina sem animação.
          </div>
        </li>
      </ul>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Regras de Compatibilidade</h2>
      <ul class="space-y-3 text-gray-700 font-light">
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1">•</span>
          <div>Execução só conecta com execução</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1">•</span>
          <div>Dados só conectam com dados compatíveis (mesmo tipo ou tipo genérico)</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1">•</span>
          <div>Um input de dados aceita apenas uma conexão por vez</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1">•</span>
          <div>Um output pode ter múltiplas conexões</div>
        </li>
      </ul>
    </div>

    <!-- Playground -->
    <PlaygroundEmbed
      tutorial-id="flow-connections"
      title="Playground: Conexões de Fluxo e Dados"
      height="450px"
    />

    <!-- Próximos passos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg hover:bg-white/40 hover:border-brand-purple/60 transition-all group cursor-pointer" @click="router.push('/flows/data-flow')">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:waterfall-chart" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-800">Próximo: Fluxo de Dados</p>
            <p class="text-sm text-gray-600 font-light">Como os dados fluem entre nodes</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
