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
        Input / Output
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Entrada e saída de dados do fluxo.
      </p>
    </div>

    <!-- Conteúdo principal -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Input Node</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-4">
        Define os parâmetros de entrada do fluxo. Você pode criar múltiplos parâmetros,
        cada um com seu tipo (string, number, boolean, etc) e valor padrão.
      </p>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        <strong class="font-medium">Uso:</strong> Configure os parâmetros no painel de propriedades.
        Ao executar o fluxo, esses valores estarão disponíveis como saídas do Input node.
      </p>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Output Node</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-4">
        Define o que o fluxo retorna como resultado final. Conecte os valores que você quer exportar
        às entradas do Output node.
      </p>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        <strong class="font-medium">Importante:</strong> Todo fluxo deve ter pelo menos um Output node.
        Ele não pode ser deletado.
      </p>

      <PlaygroundEmbed
        tutorial-id="input-output"
        title="Playground: Input → Output"
        height="450px"
      />
    </div>

    <!-- Próximos passos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg hover:bg-white/40 hover:border-brand-purple/60 transition-all group cursor-pointer" @click="router.push('/nodes/data-connector')">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:cable" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-800">Próximo: Data Connector</p>
            <p class="text-sm text-gray-600 font-light">Conecte fontes de dados externas</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
