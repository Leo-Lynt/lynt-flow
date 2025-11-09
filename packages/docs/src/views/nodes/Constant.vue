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
        Constant
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Node para definir valores fixos que serão usados no fluxo.
      </p>
    </div>

    <!-- O que é -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">O que é</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        O <strong class="font-medium">Constant</strong> node permite definir valores fixos que podem ser usados em qualquer parte do fluxo.
        Diferente do Input (que recebe valores externos), o Constant armazena valores que você define diretamente no editor.
      </p>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Quando usar</h2>
      <ul class="space-y-2 text-gray-700 font-light">
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:check-circle" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>Valores que não mudam durante a execução</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:check-circle" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>Configurações ou constantes do sistema</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:check-circle" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>Dados mock para testes</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:check-circle" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>Valores padrão em operações matemáticas</span>
        </li>
      </ul>
    </div>

    <!-- Tipos suportados -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Tipos de dados suportados</h2>

      <div class="space-y-4">
        <div class="bg-white/40 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <Icon icon="material-symbols:numbers" class="w-5 h-5 text-blue-600" />
            <h3 class="font-medium text-gray-800">Number (Número)</h3>
          </div>
          <p class="text-sm text-gray-600 font-light">Inteiros ou decimais. Exemplo: <code class="px-1.5 py-0.5 bg-white/60 rounded text-xs">42</code> ou <code class="px-1.5 py-0.5 bg-white/60 rounded text-xs">3.14</code></p>
        </div>

        <div class="bg-white/40 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <Icon icon="material-symbols:text-fields" class="w-5 h-5 text-green-600" />
            <h3 class="font-medium text-gray-800">String (Texto)</h3>
          </div>
          <p class="text-sm text-gray-600 font-light">Qualquer texto. Exemplo: <code class="px-1.5 py-0.5 bg-white/60 rounded text-xs">"Olá Mundo"</code></p>
        </div>

        <div class="bg-white/40 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <Icon icon="material-symbols:toggle-on" class="w-5 h-5 text-purple-600" />
            <h3 class="font-medium text-gray-800">Boolean (Lógico)</h3>
          </div>
          <p class="text-sm text-gray-600 font-light">Verdadeiro ou falso. Exemplo: <code class="px-1.5 py-0.5 bg-white/60 rounded text-xs">true</code> ou <code class="px-1.5 py-0.5 bg-white/60 rounded text-xs">false</code></p>
        </div>

        <div class="bg-white/40 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <Icon icon="material-symbols:data-array" class="w-5 h-5 text-orange-600" />
            <h3 class="font-medium text-gray-800">Array (Lista)</h3>
          </div>
          <p class="text-sm text-gray-600 font-light">Lista de valores. Exemplo: <code class="px-1.5 py-0.5 bg-white/60 rounded text-xs">[1, 2, 3, 4, 5]</code></p>
        </div>

        <div class="bg-white/40 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <Icon icon="material-symbols:data-object" class="w-5 h-5 text-pink-600" />
            <h3 class="font-medium text-gray-800">Object (Objeto)</h3>
          </div>
          <p class="text-sm text-gray-600 font-light">Estrutura de dados complexa. Exemplo: <code class="px-1.5 py-0.5 bg-white/60 rounded text-xs">{"nome": "João", "idade": 25}</code></p>
        </div>
      </div>
    </div>

    <!-- Playground -->
    <PlaygroundEmbed
      tutorial-id="constant-types"
      title="Playground: Tipos de Constant"
      height="450px"
    />

    <!-- Constant vs Input -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Constant vs Input</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white/40 rounded-lg p-4">
          <h3 class="font-medium text-gray-800 mb-2 flex items-center gap-2">
            <Icon icon="material-symbols:deployed-code" class="w-5 h-5 text-purple-600" />
            Constant
          </h3>
          <ul class="text-sm text-gray-600 font-light space-y-1">
            <li>• Valor fixo definido no editor</li>
            <li>• Não muda durante execução</li>
            <li>• Ideal para configurações</li>
            <li>• Não aceita valores externos</li>
          </ul>
        </div>

        <div class="bg-white/40 rounded-lg p-4">
          <h3 class="font-medium text-gray-800 mb-2 flex items-center gap-2">
            <Icon icon="material-symbols:input" class="w-5 h-5 text-blue-600" />
            Input
          </h3>
          <ul class="text-sm text-gray-600 font-light space-y-1">
            <li>• Valor vem de fora (API, usuário)</li>
            <li>• Pode mudar a cada execução</li>
            <li>• Ideal para dados dinâmicos</li>
            <li>• Aceita parâmetros externos</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Dicas -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Dicas</h2>
      <ul class="space-y-3 text-gray-700 font-light">
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:lightbulb" class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <span>Use Constant para valores que você sabe de antemão e não mudarão</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:lightbulb" class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <span>Para arrays e objetos complexos, você pode usar JSON válido</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:lightbulb" class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <span>Constants são úteis para testes antes de conectar fontes de dados reais</span>
        </li>
      </ul>
    </div>

    <!-- Próximos passos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg hover:bg-white/40 hover:border-brand-purple/60 transition-all group cursor-pointer" @click="router.push('/nodes/variable')">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:variable-add" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-800">Próximo: Variable</p>
            <p class="text-sm text-gray-600 font-light">Armazenar e reutilizar dados no fluxo</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
