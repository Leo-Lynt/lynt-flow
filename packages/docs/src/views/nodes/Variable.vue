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
        Variable
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Node para armazenar e reutilizar dados durante a execução do fluxo.
      </p>
    </div>

    <!-- O que é -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">O que é</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        O <strong class="font-medium">Variable</strong> node permite armazenar valores temporariamente durante a execução do fluxo.
        Você pode guardar um valor (SET) em um ponto do fluxo e recuperá-lo (GET) em outro ponto.
      </p>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Quando usar</h2>
      <ul class="space-y-2 text-gray-700 font-light">
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:check-circle" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>Armazenar resultado de um cálculo para usar depois</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:check-circle" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>Reutilizar o mesmo valor em múltiplos lugares</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:check-circle" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>Compartilhar dados entre ramificações (branches)</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:check-circle" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>Manter estado temporário durante a execução</span>
        </li>
      </ul>
    </div>

    <!-- Modos de operação -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Modos de operação</h2>

      <div class="space-y-4">
        <div class="bg-white/40 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <Icon icon="material-symbols:save" class="w-5 h-5 text-blue-600" />
            <h3 class="font-medium text-gray-800">SET (Definir)</h3>
          </div>
          <p class="text-sm text-gray-600 font-light mb-2">Armazena um valor na variável. Precisa de:</p>
          <ul class="text-sm text-gray-600 font-light ml-4 space-y-1">
            <li>• <strong class="font-medium">Nome da variável:</strong> Identificador único (ex: "total", "resultado")</li>
            <li>• <strong class="font-medium">Valor:</strong> Dados a serem armazenados (conectado de outro node)</li>
            <li>• <strong class="font-medium">Exec-in:</strong> Conexão de fluxo para executar o SET</li>
          </ul>
        </div>

        <div class="bg-white/40 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <Icon icon="material-symbols:download" class="w-5 h-5 text-green-600" />
            <h3 class="font-medium text-gray-800">GET (Obter)</h3>
          </div>
          <p class="text-sm text-gray-600 font-light mb-2">Recupera o valor armazenado na variável. Precisa de:</p>
          <ul class="text-sm text-gray-600 font-light ml-4 space-y-1">
            <li>• <strong class="font-medium">Nome da variável:</strong> Mesmo nome usado no SET</li>
            <li>• <strong class="font-medium">Saída de dados:</strong> Conecte a outros nodes para usar o valor</li>
          </ul>
        </div>
      </div>

      <div class="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div class="flex items-start gap-2">
          <Icon icon="material-symbols:info" class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div class="text-sm text-amber-800">
            <strong class="font-medium">Importante:</strong> O SET deve ser executado antes do GET. Se você tentar fazer GET de uma variável que ainda não foi definida, o valor será <code class="px-1 py-0.5 bg-white/60 rounded text-xs">undefined</code>.
          </div>
        </div>
      </div>
    </div>

    <!-- Playground -->
    <PlaygroundEmbed
      tutorial-id="variable-get-set"
      title="Playground: SET e GET de variável"
      height="450px"
    />

    <!-- Escopo -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Escopo e comportamento</h2>

      <div class="space-y-4 text-gray-700 font-light">
        <div>
          <h3 class="font-medium text-gray-800 mb-2">Escopo do fluxo</h3>
          <p>Variáveis existem apenas durante a execução do fluxo. Quando o fluxo termina, todas as variáveis são limpas.</p>
        </div>

        <div>
          <h3 class="font-medium text-gray-800 mb-2">Nome único</h3>
          <p>Cada variável é identificada por seu nome. Se você fazer SET duas vezes na mesma variável, o segundo valor sobrescreve o primeiro.</p>
        </div>

        <div>
          <h3 class="font-medium text-gray-800 mb-2">Múltiplos GETs</h3>
          <p>Você pode fazer GET da mesma variável quantas vezes quiser. O valor não é consumido ou alterado.</p>
        </div>

        <div>
          <h3 class="font-medium text-gray-800 mb-2">Tipo de dado</h3>
          <p>Variáveis podem armazenar qualquer tipo de dado: números, textos, objetos, arrays, etc.</p>
        </div>
      </div>
    </div>

    <!-- Exemplo prático -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Exemplo prático</h2>

      <div class="bg-white/40 rounded-lg p-4">
        <h3 class="font-medium text-gray-800 mb-3">Cenário: Calcular e reutilizar um desconto</h3>

        <div class="space-y-2 text-sm text-gray-700 font-light">
          <div class="flex items-start gap-2">
            <span class="text-brand-purple font-medium">1.</span>
            <span>Input recebe o valor do produto: R$ 100</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-brand-purple font-medium">2.</span>
            <span>Math Multiply calcula desconto de 10%: R$ 10</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-brand-purple font-medium">3.</span>
            <span><strong class="font-medium">Variable SET</strong> armazena o desconto na variável "desconto"</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-brand-purple font-medium">4.</span>
            <span><strong class="font-medium">Variable GET</strong> recupera o valor e usa em Math Subtract: R$ 100 - R$ 10 = R$ 90</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-brand-purple font-medium">5.</span>
            <span><strong class="font-medium">Variable GET</strong> (de novo!) recupera o desconto para mostrar no Output</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Dicas -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Dicas</h2>
      <ul class="space-y-3 text-gray-700 font-light">
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:lightbulb" class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <span>Use nomes descritivos para suas variáveis: "precoTotal", "usuarioLogado", "resultadoFiltro"</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:lightbulb" class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <span>Variáveis são essenciais em fluxos com ramificações (branches) para unificar resultados</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:lightbulb" class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <span>Sempre faça SET antes de GET na ordem de execução do fluxo</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:lightbulb" class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <span>Use Debug Viewer para verificar o valor da variável durante o desenvolvimento</span>
        </li>
      </ul>
    </div>

    <!-- Próximos passos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg hover:bg-white/40 hover:border-brand-purple/60 transition-all group cursor-pointer" @click="router.push('/nodes/filter')">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:filter-alt" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-800">Próximo: Filter</p>
            <p class="text-sm text-gray-600 font-light">Filtrar arrays por condições</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
