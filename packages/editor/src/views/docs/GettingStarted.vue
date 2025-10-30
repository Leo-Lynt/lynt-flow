<script setup>
import Icon from '../../components/Icon.vue'
</script>

<template>
  <div class="getting-started">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-4xl font-bold text-flow-text dark:text-flow-text-dark mb-4">
        Primeiros Passos
      </h1>
      <p class="text-lg text-flow-text-secondary dark:text-flow-text-secondary-dark">
        Aprenda os conceitos básicos do Lynt Flow e crie seu primeiro flow em minutos.
      </p>
    </div>

    <!-- What is Lynt Flow -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-flow-text dark:text-flow-text-dark mb-4">
        O que é o Lynt Flow?
      </h2>
      <p class="text-flow-text-secondary dark:text-flow-text-secondary-dark mb-4">
        Lynt Flow é uma plataforma de automação visual que permite criar integrações e processos complexos
        sem escrever código. Conecte diferentes serviços, processe dados e automatize tarefas usando uma
        interface intuitiva de arrastar e soltar.
      </p>
    </section>

    <!-- Key Concepts -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-flow-text dark:text-flow-text-dark mb-6">
        Conceitos Principais
      </h2>

      <div class="space-y-6">
        <!-- Concept: Nodes -->
        <div class="p-6 rounded-xl border border-flow-border dark:border-flow-border-dark bg-flow-surface dark:bg-flow-surface-dark">
          <div class="flex items-start gap-4">
            <div class="p-3 rounded-lg bg-emerald-500">
              <Icon icon="material-symbols:extension" class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-flow-text dark:text-flow-text-dark mb-2">
                Nodes (Nós)
              </h3>
              <p class="text-flow-text-secondary dark:text-flow-text-secondary-dark mb-3">
                Nodes são blocos funcionais que executam ações específicas. Cada node tem um propósito:
                buscar dados, processar informações, realizar cálculos, ou enviar saídas.
              </p>
              <p class="text-sm text-flow-text-secondary dark:text-flow-text-secondary-dark">
                <strong>Exemplos:</strong> Data Connector, Math Operation, Array Filter, Condition
              </p>
            </div>
          </div>
        </div>

        <!-- Concept: Connections -->
        <div class="p-6 rounded-xl border border-flow-border dark:border-flow-border-dark bg-flow-surface dark:bg-flow-surface-dark">
          <div class="flex items-start gap-4">
            <div class="p-3 rounded-lg bg-blue-500">
              <Icon icon="material-symbols:cable" class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-flow-text dark:text-flow-text-dark mb-2">
                Conexões
              </h3>
              <p class="text-flow-text-secondary dark:text-flow-text-secondary-dark mb-3">
                Conexões ligam nodes entre si e definem o fluxo de execução e dados. Existem dois tipos:
              </p>
              <ul class="list-disc list-inside space-y-2 text-flow-text-secondary dark:text-flow-text-secondary-dark">
                <li><strong>Conexões de Execução (cinza):</strong> Controlam a ordem de execução dos nodes</li>
                <li><strong>Conexões de Dados (coloridas):</strong> Transferem dados entre nodes</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Concept: Handles -->
        <div class="p-6 rounded-xl border border-flow-border dark:border-flow-border-dark bg-flow-surface dark:bg-flow-surface-dark">
          <div class="flex items-start gap-4">
            <div class="p-3 rounded-lg bg-purple-500">
              <Icon icon="material-symbols:circle" class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-flow-text dark:text-flow-text-dark mb-2">
                Handles (Pontos de Conexão)
              </h3>
              <p class="text-flow-text-secondary dark:text-flow-text-secondary-dark mb-3">
                Handles são os pontos nas laterais dos nodes onde você conecta as linhas:
              </p>
              <ul class="list-disc list-inside space-y-2 text-flow-text-secondary dark:text-flow-text-secondary-dark">
                <li><strong>Inputs (esquerda):</strong> Recebem dados ou triggers de execução</li>
                <li><strong>Outputs (direita):</strong> Enviam dados ou continuam a execução</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Concept: Execution -->
        <div class="p-6 rounded-xl border border-flow-border dark:border-flow-border-dark bg-flow-surface dark:bg-flow-surface-dark">
          <div class="flex items-start gap-4">
            <div class="p-3 rounded-lg bg-amber-500">
              <Icon icon="material-symbols:play-arrow" class="w-6 h-6 text-white" />
            </div>
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-flow-text dark:text-flow-text-dark mb-2">
                Execução
              </h3>
              <p class="text-flow-text-secondary dark:text-flow-text-secondary-dark">
                Quando você executa um flow, o sistema segue as conexões de execução em ordem,
                processando cada node e passando dados entre eles até completar o fluxo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Create Your First Flow -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold text-flow-text dark:text-flow-text-dark mb-6">
        Criando Seu Primeiro Flow
      </h2>

      <div class="space-y-6">
        <!-- Step 1 -->
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            1
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-flow-text dark:text-flow-text-dark mb-2">
              Adicione um Node de Entrada
            </h3>
            <p class="text-flow-text-secondary dark:text-flow-text-secondary-dark">
              No editor, clique em um node no painel lateral esquerdo (por exemplo, "Input") e ele será adicionado ao canvas.
            </p>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            2
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-flow-text dark:text-flow-text-dark mb-2">
              Adicione um Node de Processamento
            </h3>
            <p class="text-flow-text-secondary dark:text-flow-text-secondary-dark">
              Adicione um node que processa dados, como "Math Operation" ou "String Operation".
            </p>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            3
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-flow-text dark:text-flow-text-dark mb-2">
              Conecte os Nodes
            </h3>
            <p class="text-flow-text-secondary dark:text-flow-text-secondary-dark">
              Arraste do handle de output de um node até o handle de input de outro. Conecte tanto a execução quanto os dados.
            </p>
          </div>
        </div>

        <!-- Step 4 -->
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            4
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-flow-text dark:text-flow-text-dark mb-2">
              Configure os Nodes
            </h3>
            <p class="text-flow-text-secondary dark:text-flow-text-secondary-dark">
              Clique em um node para abrir o painel de propriedades à direita e configure seus valores.
            </p>
          </div>
        </div>

        <!-- Step 5 -->
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            5
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-flow-text dark:text-flow-text-dark mb-2">
              Execute o Flow
            </h3>
            <p class="text-flow-text-secondary dark:text-flow-text-secondary-dark">
              Clique no botão "Play" na barra superior para executar seu flow e ver os resultados.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Next Steps -->
    <section class="p-6 rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/20">
      <h2 class="text-xl font-semibold text-flow-text dark:text-flow-text-dark mb-4">
        Próximos Passos
      </h2>
      <ul class="space-y-3">
        <li class="flex items-center gap-3 text-flow-text-secondary dark:text-flow-text-secondary-dark">
          <Icon icon="material-symbols:check-circle" class="w-5 h-5 text-primary flex-shrink-0" />
          <span>Explore a <router-link to="/docs/nodes" class="text-primary hover:underline font-medium">lista completa de nodes</router-link></span>
        </li>
        <li class="flex items-center gap-3 text-flow-text-secondary dark:text-flow-text-secondary-dark">
          <Icon icon="material-symbols:check-circle" class="w-5 h-5 text-primary flex-shrink-0" />
          <span>Conecte com APIs externas usando o <router-link to="/docs/nodes/connector" class="text-primary hover:underline font-medium">Data Connector</router-link></span>
        </li>
        <li class="flex items-center gap-3 text-flow-text-secondary dark:text-flow-text-secondary-dark">
          <Icon icon="material-symbols:check-circle" class="w-5 h-5 text-primary flex-shrink-0" />
          <span>Teste nodes no <router-link to="/docs/playground" class="text-primary hover:underline font-medium">Playground</router-link></span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
/* Smooth transitions */
a {
  @apply transition-colors duration-200;
}
</style>
