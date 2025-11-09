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
        Executar Fluxo
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Como rodar e testar seu fluxo.
      </p>
    </div>

    <!-- Conteúdo principal -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Executar</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        Clique no botão verde "Execute" na toolbar ou use <kbd class="px-2 py-1 bg-white/60 border border-white/40 rounded text-xs font-mono">Ctrl + Enter</kbd>.
        O fluxo será executado do início ao fim, passando dados entre os nodes conectados.
      </p>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Acompanhar Execução</h2>
      <ul class="space-y-4 text-gray-700 font-light">
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1 font-medium">•</span>
          <div>
            <strong class="font-medium">Nodes ficam destacados:</strong> Durante a execução,
            nodes ativos ficam com borda colorida.
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1 font-medium">•</span>
          <div>
            <strong class="font-medium">Ver resultados:</strong> Clique em um node após executar
            para ver os valores de saída no painel de propriedades.
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple mt-1 font-medium">•</span>
          <div>
            <strong class="font-medium">Erros:</strong> Se houver erro, o node problemático
            fica destacado em vermelho. Verifique as configurações.
          </div>
        </li>
      </ul>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Salvar</h2>
      <p class="text-gray-700 font-light leading-relaxed">
        Use <kbd class="px-2 py-1 bg-white/60 border border-white/40 rounded text-xs font-mono">Ctrl + S</kbd> ou
        clique no botão "Save" na toolbar. O status de sincronização aparece ao lado.
      </p>
    </div>

    <!-- Próximos passos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg hover:bg-white/40 hover:border-brand-purple/60 transition-all group cursor-pointer" @click="router.push('/nodes/input-output')">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:extension" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-800">Próximo: Nodes</p>
            <p class="text-sm text-gray-600 font-light">Conheça os nodes disponíveis</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
