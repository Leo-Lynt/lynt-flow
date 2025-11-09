<script setup>
import { ref } from 'vue'
import Icon from '../components/Icon.vue'

const expandedQuestions = ref([])

const faqs = [
  {
    id: 1,
    question: 'Como faço para conectar minha conta do Google Sheets?',
    answer: 'No Data Connector node, selecione "Google Sheets" como fonte. Clique em "Connect" e autorize o Lynt Flow a acessar suas planilhas. Depois disso, você poderá selecionar qualquer planilha da sua conta nos dropdowns.'
  },
  {
    id: 2,
    question: 'Posso deletar os nodes Input e Output?',
    answer: 'Não. Esses nodes são obrigatórios em todo fluxo. Input define os parâmetros de entrada e Output define o que será retornado. Tentar deletá-los não terá efeito.'
  },
  {
    id: 3,
    question: 'Por que meu fluxo não executa?',
    answer: 'Verifique se todos os nodes têm conexões de execução (linhas cinza grossas e animadas). Sem essas conexões, o node não será executado. Também confirme que não há erros de tipo nas conexões de dados coloridas.'
  },
  {
    id: 4,
    question: 'Como vejo os dados passando entre nodes?',
    answer: 'Clique em qualquer conexão colorida (dados) durante ou após a execução. O console do navegador mostrará o valor sendo transferido. Use F12 para abrir o Developer Tools e ver os logs.'
  },
  {
    id: 5,
    question: 'Posso usar o mesmo node mais de uma vez?',
    answer: 'Sim! Você pode adicionar quantos nodes quiser do mesmo tipo. Cada um terá sua própria configuração independente. Isso é útil para fazer múltiplas operações do mesmo tipo.'
  },
  {
    id: 6,
    question: 'Como salvo meu fluxo?',
    answer: 'Use Ctrl+S ou clique no botão "Save" na toolbar. O fluxo é salvo automaticamente na nuvem. O ícone de sincronização ao lado do botão Save mostra o status (salvo, salvando, ou mudanças não salvas).'
  },
  {
    id: 7,
    question: 'O que são as cores das conexões?',
    answer: 'Cada cor representa um tipo de dado: azul (any), verde (string), laranja (number), roxo (boolean), rosa (array), ciano (object). Cinza representa conexões de execução (fluxo de controle).'
  },
  {
    id: 8,
    question: 'Como faço para debugar erros?',
    answer: 'Use o node Debug Viewer para visualizar valores em tempo real. Abra o console do navegador (F12) para ver logs detalhados de execução. Nodes com erro ficam destacados em vermelho após executar.'
  },
  {
    id: 9,
    question: 'Posso usar APIs externas?',
    answer: 'Sim! Use o Data Connector node e selecione "API" como fonte. Informe a URL do endpoint REST (GET) e o node fará a requisição retornando os dados em JSON para você processar.'
  },
  {
    id: 10,
    question: 'Como adiciono um node ao canvas?',
    answer: 'Arraste da lista lateral (sidebar) ou aperte Espaço para abrir o menu rápido. Você pode buscar nodes pelo nome na barra de busca da sidebar. Nodes estão organizados em categorias.'
  },
  {
    id: 11,
    question: 'Como conecto dois nodes?',
    answer: 'Clique e arraste de um ponto de saída (direita do node) até um ponto de entrada (esquerda de outro node). Certifique-se de conectar tipos compatíveis (execução com execução, dados com dados).'
  },
  {
    id: 12,
    question: 'Posso desfazer ações no editor?',
    answer: 'Sim! Use Ctrl+Z para desfazer e Ctrl+Y para refazer. Os botões de Undo/Redo também estão disponíveis na toolbar.'
  }
]

function toggleQuestion(id) {
  const index = expandedQuestions.value.indexOf(id)
  if (index > -1) {
    expandedQuestions.value.splice(index, 1)
  } else {
    expandedQuestions.value.push(id)
  }
}

function isExpanded(id) {
  return expandedQuestions.value.includes(id)
}
</script>

<template>
  <div class="max-w-3xl mx-auto">
    <!-- Header -->
    <div class="mb-12">
      <h1 class="text-4xl font-light text-gray-800 tracking-wide mb-4">
        Perguntas Frequentes
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Respostas para dúvidas comuns sobre o Lynt Flow.
      </p>
    </div>

    <!-- FAQ List -->
    <div class="space-y-3">
      <div
        v-for="faq in faqs"
        :key="faq.id"
        class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 overflow-hidden shadow-lg hover:bg-white/40 transition-all"
      >
        <!-- Question -->
        <button
          @click="toggleQuestion(faq.id)"
          class="w-full px-6 py-4 flex items-center justify-between text-left group"
        >
          <span class="text-gray-800 font-medium pr-4">{{ faq.question }}</span>
          <Icon
            :icon="isExpanded(faq.id) ? 'material-symbols:expand-less' : 'material-symbols:expand-more'"
            class="w-6 h-6 text-brand-purple flex-shrink-0 transition-transform"
          />
        </button>

        <!-- Answer -->
        <div
          v-show="isExpanded(faq.id)"
          class="px-6 pb-4 text-gray-700 font-light leading-relaxed border-t border-white/20"
        >
          <div class="pt-4">
            {{ faq.answer }}
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-12 backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
          <Icon icon="material-symbols:contact-support" class="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 class="font-medium text-gray-800 mb-2">Não encontrou sua dúvida?</h3>
          <p class="text-gray-700 font-light leading-relaxed">
            Entre em contato com nosso suporte ou consulte a documentação completa nas seções anteriores.
            Estamos sempre melhorando e adicionando novos recursos.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
