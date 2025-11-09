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
        Calcular Total de Vendas
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Como usar Map, Variables e Math para somar valores de produtos.
      </p>
    </div>

    <!-- Conteúdo principal -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Objetivo</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        Neste exemplo mais avançado, temos uma lista de produtos com seus valores. Vamos usar o <strong class="font-medium">Map</strong> node para iterar sobre cada produto, extrair o campo "valor", e usar <strong class="font-medium">Variables</strong> + <strong class="font-medium">Add</strong> para acumular o total. Este exemplo demonstra o poder de loops e variáveis no Lynt Flow.
      </p>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Conceitos Demonstrados</h2>
      <ul class="space-y-2 text-gray-700 font-light ml-6">
        <li class="flex items-start gap-2">
          <span class="text-brand-purple mt-1">•</span>
          <div><strong class="font-medium">Constant</strong>: Definir array de produtos com valores</div>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-brand-purple mt-1">•</span>
          <div><strong class="font-medium">Map</strong>: Iterar sobre cada item do array</div>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-brand-purple mt-1">•</span>
          <div><strong class="font-medium">Variable (Get)</strong>: Ler valor atual do total</div>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-brand-purple mt-1">•</span>
          <div><strong class="font-medium">Add</strong>: Somar valor atual + novo valor</div>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-brand-purple mt-1">•</span>
          <div><strong class="font-medium">Variable (Set)</strong>: Atualizar total acumulado</div>
        </li>
      </ul>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Como Funciona</h2>
      <ol class="space-y-3 text-gray-700 font-light">
        <li class="flex items-start gap-3">
          <span class="text-brand-purple font-medium">1.</span>
          <div>Uma <strong class="font-medium">Constant</strong> define array de produtos: Notebook (R$ 3500), Mouse (R$ 80), Teclado (R$ 250), Monitor (R$ 1200)</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple font-medium">2.</span>
          <div>Outra <strong class="font-medium">Constant</strong> define zero (0) como valor inicial</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple font-medium">3.</span>
          <div>O <strong class="font-medium">Map</strong> itera sobre cada produto e extrai o campo "valor"</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple font-medium">4.</span>
          <div>Para cada item:
            <ul class="mt-2 ml-4 space-y-1 text-sm">
              <li>• <strong>Variable Get</strong> lê o total atual da variável "totalVendas"</li>
              <li>• <strong>Add</strong> soma o total atual + valor do produto</li>
              <li>• <strong>Variable Set</strong> atualiza "totalVendas" com o novo total</li>
            </ul>
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple font-medium">5.</span>
          <div>Após o loop, <strong class="font-medium">Variable Get</strong> final lê o total acumulado</div>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-brand-purple font-medium">6.</span>
          <div>O <strong class="font-medium">Output</strong> exibe o total: R$ 5030</div>
        </li>
      </ol>

      <h2 class="text-xl font-medium text-gray-800 mb-4 mt-8">Resultado</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-4">
        O fluxo calcula automaticamente a soma de todos os valores (3500 + 80 + 250 + 1200 = 5030) usando um loop com acumulador.
      </p>
      <p class="text-gray-700 font-light leading-relaxed">
        Este padrão é muito útil quando você precisa processar arrays e manter estado entre iterações.
      </p>
    </div>

    <!-- Playground -->
    <PlaygroundEmbed
      tutorial-id="usecase-calculations"
      title="Playground: Calcular Total de Vendas"
      height="550px"
    />

    <!-- Próximos passos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg hover:bg-white/40 hover:border-brand-purple/60 transition-all group cursor-pointer" @click="router.push('/faq')">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:help" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-800">Próximo: FAQ</p>
            <p class="text-sm text-gray-600 font-light">Perguntas frequentes</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
