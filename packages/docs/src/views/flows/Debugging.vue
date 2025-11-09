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
        Debugging
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Como encontrar e corrigir erros no fluxo.
      </p>
    </div>

    <!-- Conteúdo principal -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Ferramentas de Debug</h2>
      <ul class="space-y-4 text-gray-700 font-light mb-8">
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1 font-medium">•</span>
          <div>
            <strong class="font-medium">Console do Navegador:</strong> Abra o Developer Tools (F12).
            O Lynt Flow loga informações detalhadas sobre execução e erros.
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1 font-medium">•</span>
          <div>
            <strong class="font-medium">Debug Viewer Node:</strong> Adicione este node especial
            para visualizar valores durante execução. Mostra dados em tempo real.
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1 font-medium">•</span>
          <div>
            <strong class="font-medium">Clique em conexões:</strong> Clique nas linhas coloridas
            para ver os valores sendo transferidos. Log aparece no console.
          </div>
        </li>
      </ul>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Erros Comuns</h2>
      <ul class="space-y-3 text-gray-700 font-light">
        <li class="flex items-start gap-3">
          <span class="text-red-500 mt-1 font-bold">✕</span>
          <div><strong class="font-medium">Tipo incompatível:</strong> Conectou number em input que espera string</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-red-500 mt-1 font-bold">✕</span>
          <div><strong class="font-medium">Campo não existe:</strong> Tentou acessar propriedade que não está no objeto</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-red-500 mt-1 font-bold">✕</span>
          <div><strong class="font-medium">Falta conexão:</strong> Node sem conexão de execução não roda</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-red-500 mt-1 font-bold">✕</span>
          <div><strong class="font-medium">API falhou:</strong> Data Connector com URL errada ou sem autenticação</div>
        </li>
      </ul>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Dica</h2>
      <p class="text-gray-700 font-light leading-relaxed">
        Execute o fluxo passo a passo: adicione breakpoints usando Debug Viewer nodes.
        Verifique se os valores estão corretos antes de prosseguir.
      </p>
    </div>

    <!-- Playground -->
    <PlaygroundEmbed
      tutorial-id="flow-debugging"
      title="Playground: Debugging com Debug Viewer"
      height="450px"
    />

    <!-- Próximos passos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg hover:bg-white/40 hover:border-brand-purple/60 transition-all group cursor-pointer" @click="router.push('/use-cases/google-sheets')">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:lightbulb" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-800">Próximo: Casos de Uso</p>
            <p class="text-sm text-gray-600 font-light">Exemplos práticos de fluxos</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
