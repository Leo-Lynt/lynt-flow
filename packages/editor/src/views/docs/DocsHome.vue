<script setup>
import { useRouter } from 'vue-router'
import Icon from '../../components/Icon.vue'

const router = useRouter()

const quickLinks = [
  {
    title: 'Primeiros Passos',
    description: 'Aprenda o básico sobre o Lynt Flow e como criar seu primeiro flow',
    icon: 'material-symbols:rocket-launch',
    color: 'bg-emerald-500',
    route: '/docs/getting-started'
  },
  {
    title: 'Explorar Nodes',
    description: 'Veja todos os nodes disponíveis e como utilizá-los',
    icon: 'material-symbols:extension',
    color: 'bg-blue-500',
    route: '/docs/nodes'
  },
  {
    title: 'Tutoriais',
    description: 'Guias passo-a-passo para cenários comuns',
    icon: 'material-symbols:school',
    color: 'bg-purple-500',
    route: '/docs/tutorials'
  },
  {
    title: 'Playground',
    description: 'Teste nodes em um ambiente sandbox interativo',
    icon: 'material-symbols:science',
    color: 'bg-amber-500',
    route: '/docs/playground'
  }
]

function navigateTo(route) {
  router.push(route)
}
</script>

<template>
  <div class="docs-home">
    <!-- Hero Section -->
    <section class="mb-12">
      <h1 class="text-4xl font-bold text-flow-text dark:text-flow-text-dark mb-4">
        Bem-vindo à Documentação do Lynt Flow
      </h1>
      <p class="text-lg text-flow-text-secondary dark:text-flow-text-secondary-dark max-w-2xl">
        Aprenda a criar automações poderosas e integrações com ferramentas externas usando nodes visuais.
      </p>
    </section>

    <!-- Quick Links Grid -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-flow-text dark:text-flow-text-dark mb-6">
        Comece Por Aqui
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          v-for="link in quickLinks"
          :key="link.route"
          @click="navigateTo(link.route)"
          class="group p-6 rounded-xl border-2 border-flow-border dark:border-flow-border-dark hover:border-primary dark:hover:border-primary bg-flow-surface dark:bg-flow-surface-dark transition-all hover:shadow-lg text-left"
        >
          <div class="flex items-start gap-4">
            <div :class="['p-3 rounded-lg', link.color]">
              <Icon :icon="link.icon" class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-flow-text dark:text-flow-text-dark mb-2 group-hover:text-primary transition-colors">
                {{ link.title }}
              </h3>
              <p class="text-sm text-flow-text-secondary dark:text-flow-text-secondary-dark">
                {{ link.description }}
              </p>
            </div>
            <Icon
              icon="material-symbols:arrow-forward"
              class="w-5 h-5 text-flow-text-secondary dark:text-flow-text-secondary-dark group-hover:text-primary group-hover:translate-x-1 transition-all"
            />
          </div>
        </button>
      </div>
    </section>

    <!-- Popular Nodes Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-flow-text dark:text-flow-text-dark mb-6">
        Nodes Mais Usados
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          @click="navigateTo('/docs/nodes/connector')"
          class="p-4 rounded-lg border border-flow-border dark:border-flow-border-dark hover:border-primary bg-flow-surface dark:bg-flow-surface-dark transition-all text-left group"
        >
          <div class="flex items-center gap-3 mb-2">
            <Icon icon="material-symbols:cable" class="w-5 h-5 text-emerald-500" />
            <span class="font-medium text-flow-text dark:text-flow-text-dark group-hover:text-primary transition-colors">
              Data Connector
            </span>
          </div>
          <p class="text-sm text-flow-text-secondary dark:text-flow-text-secondary-dark">
            Conecta com APIs e serviços externos
          </p>
        </button>

        <button
          @click="navigateTo('/docs/nodes/math-operation')"
          class="p-4 rounded-lg border border-flow-border dark:border-flow-border-dark hover:border-primary bg-flow-surface dark:bg-flow-surface-dark transition-all text-left group"
        >
          <div class="flex items-center gap-3 mb-2">
            <Icon icon="material-symbols:calculate" class="w-5 h-5 text-blue-500" />
            <span class="font-medium text-flow-text dark:text-flow-text-dark group-hover:text-primary transition-colors">
              Math Operation
            </span>
          </div>
          <p class="text-sm text-flow-text-secondary dark:text-flow-text-secondary-dark">
            Realiza operações matemáticas
          </p>
        </button>

        <button
          @click="navigateTo('/docs/nodes/array-filter')"
          class="p-4 rounded-lg border border-flow-border dark:border-flow-border-dark hover:border-primary bg-flow-surface dark:bg-flow-surface-dark transition-all text-left group"
        >
          <div class="flex items-center gap-3 mb-2">
            <Icon icon="material-symbols:filter-list" class="w-5 h-5 text-purple-500" />
            <span class="font-medium text-flow-text dark:text-flow-text-dark group-hover:text-primary transition-colors">
              Array Filter
            </span>
          </div>
          <p class="text-sm text-flow-text-secondary dark:text-flow-text-secondary-dark">
            Filtra arrays por condições
          </p>
        </button>
      </div>
    </section>

    <!-- Help Section -->
    <section class="p-6 rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/20">
      <div class="flex items-start gap-4">
        <Icon icon="material-symbols:info" class="w-6 h-6 text-primary flex-shrink-0 mt-1" />
        <div>
          <h3 class="text-lg font-semibold text-flow-text dark:text-flow-text-dark mb-2">
            Precisa de Ajuda?
          </h3>
          <p class="text-flow-text-secondary dark:text-flow-text-secondary-dark mb-4">
            Se você não encontrar o que procura, comece pelos Primeiros Passos ou explore a lista completa de nodes.
          </p>
          <button
            @click="navigateTo('/docs/getting-started')"
            class="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors"
          >
            Ver Primeiros Passos
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Smooth hover effects */
button {
  @apply transition-all duration-200;
}
</style>
