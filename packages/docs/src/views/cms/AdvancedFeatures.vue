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
        Funcionalidades Avançadas
      </h1>
      <p class="text-xl text-gray-600 font-light leading-relaxed">
        Recursos avançados para automatizar e compartilhar seus fluxos.
      </p>
    </div>

    <!-- Flows Públicos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Flows Públicos</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        Compartilhe seus fluxos com a comunidade ou use fluxos criados por outros usuários.
      </p>

      <h3 class="font-medium text-gray-800 mb-3">Como publicar um flow</h3>
      <ol class="space-y-2 text-gray-700 font-light mb-6">
        <li class="flex items-start gap-2">
          <span class="text-brand-purple font-medium">1.</span>
          <span>Acesse a página de edição do flow</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-brand-purple font-medium">2.</span>
          <span>Ative a opção <strong class="font-medium">"Flow Público"</strong></span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-brand-purple font-medium">3.</span>
          <span>O sistema fará uma verificação automática de segurança</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-brand-purple font-medium">4.</span>
          <span>Se aprovado, seu flow aparecerá na Biblioteca</span>
        </li>
      </ol>

      <div class="bg-white/40 rounded-lg p-4 mb-6">
        <h4 class="font-medium text-gray-800 mb-2">Status de Publicação</h4>
        <ul class="space-y-2 text-sm text-gray-700 font-light">
          <li class="flex items-center gap-2">
            <Icon icon="material-symbols:check-circle" class="w-5 h-5 text-green-500" />
            <span><strong>Aprovado:</strong> Flow publicado automaticamente (seguro)</span>
          </li>
          <li class="flex items-center gap-2">
            <Icon icon="material-symbols:pending" class="w-5 h-5 text-orange-500" />
            <span><strong>Em revisão:</strong> Aguardando aprovação manual (suspeito)</span>
          </li>
          <li class="flex items-center gap-2">
            <Icon icon="material-symbols:block" class="w-5 h-5 text-red-500" />
            <span><strong>Bloqueado:</strong> Flow não pode ser publicado (perigoso)</span>
          </li>
        </ul>
      </div>

      <h3 class="font-medium text-gray-800 mb-3">Usando flows públicos</h3>
      <ul class="space-y-2 text-gray-700 font-light">
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:library-books" class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <span>Acesse a <strong class="font-medium">Biblioteca</strong> para ver flows públicos</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:content-copy" class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <span>Clique em <strong class="font-medium">Clonar</strong> para criar uma cópia privada</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:edit" class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <span>Edite a cópia livremente no seu workspace</span>
        </li>
      </ul>
    </div>

    <!-- Scheduler -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Agendamento (Scheduler)</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        Execute seus fluxos automaticamente em horários ou intervalos específicos.
      </p>

      <h3 class="font-medium text-gray-800 mb-3">Tipos de agendamento</h3>
      <div class="space-y-4 mb-6">
        <div class="bg-white/40 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <Icon icon="material-symbols:schedule" class="w-5 h-5 text-blue-600" />
            <h4 class="font-medium text-gray-800">Intervalo</h4>
          </div>
          <p class="text-sm text-gray-600 font-light">Execute a cada X minutos/horas/dias. Mínimo: 5 minutos</p>
        </div>

        <div class="bg-white/40 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <Icon icon="material-symbols:today" class="w-5 h-5 text-green-600" />
            <h4 class="font-medium text-gray-800">Diário</h4>
          </div>
          <p class="text-sm text-gray-600 font-light">Execute todos os dias em um horário específico (ex: 14:30)</p>
        </div>

        <div class="bg-white/40 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <Icon icon="material-symbols:calendar-today" class="w-5 h-5 text-purple-600" />
            <h4 class="font-medium text-gray-800">Semanal</h4>
          </div>
          <p class="text-sm text-gray-600 font-light">Execute em dias específicos da semana (ex: Segunda, Quarta, Sexta às 14:30)</p>
        </div>

        <div class="bg-white/40 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <Icon icon="material-symbols:date-range" class="w-5 h-5 text-orange-600" />
            <h4 class="font-medium text-gray-800">Mensal</h4>
          </div>
          <p class="text-sm text-gray-600 font-light">Execute em um dia específico do mês (ex: dia 15 às 14:30)</p>
        </div>

        <div class="bg-white/40 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <Icon icon="material-symbols:code" class="w-5 h-5 text-pink-600" />
            <h4 class="font-medium text-gray-800">Cron</h4>
          </div>
          <p class="text-sm text-gray-600 font-light">Use expressões cron para agendamentos complexos (ex: <code class="px-1.5 py-0.5 bg-white/60 rounded text-xs">0 14 * * *</code>)</p>
        </div>
      </div>

      <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div class="flex items-start gap-2">
          <Icon icon="material-symbols:info" class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div class="text-sm text-amber-800">
            <strong class="font-medium">Limite:</strong> Você pode ter até 10 agendamentos ativos simultaneamente.
          </div>
        </div>
      </div>
    </div>

    <!-- Histórico e Execuções -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Histórico de Execuções</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        Todas as execuções de flows são registradas automaticamente com logs detalhados.
      </p>

      <h3 class="font-medium text-gray-800 mb-3">O que é registrado</h3>
      <ul class="space-y-2 text-gray-700 font-light mb-6">
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:check-circle" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>Status da execução (sucesso, falha, em andamento)</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:timer" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>Tempo de execução em milissegundos</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:account-tree" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>Nodes executados e seus resultados individuais</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:input" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>Dados de entrada (inputData) usados</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:output" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>Dados de saída (outputData) gerados</span>
        </li>
        <li class="flex items-start gap-2">
          <Icon icon="material-symbols:error" class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <span>Erros com stack trace completo (se houver)</span>
        </li>
      </ul>

      <h3 class="font-medium text-gray-800 mb-3">Origem da execução</h3>
      <ul class="text-sm text-gray-700 font-light space-y-1">
        <li>• <strong class="font-medium">Manual:</strong> Executado diretamente pelo usuário</li>
        <li>• <strong class="font-medium">Schedule:</strong> Disparado por agendamento automático</li>
        <li>• <strong class="font-medium">API:</strong> Chamado via endpoint externo</li>
      </ul>
    </div>

    <!-- Integrações -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-8 mb-8 shadow-lg">
      <h2 class="text-xl font-medium text-gray-800 mb-4">Conexões e Integrações</h2>
      <p class="text-gray-700 font-light leading-relaxed mb-6">
        Conecte seus serviços externos para usar nos fluxos.
      </p>

      <h3 class="font-medium text-gray-800 mb-3">Serviços suportados</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="bg-white/40 rounded-lg p-3 flex items-center gap-3">
          <Icon icon="material-symbols:cloud" class="w-8 h-8 text-blue-600" />
          <div>
            <p class="font-medium text-gray-800 text-sm">Google</p>
            <p class="text-xs text-gray-600 font-light">Sheets, Analytics, Drive, Gmail</p>
          </div>
        </div>
        <div class="bg-white/40 rounded-lg p-3 flex items-center gap-3">
          <Icon icon="material-symbols:campaign" class="w-8 h-8 text-blue-700" />
          <div>
            <p class="font-medium text-gray-800 text-sm">Facebook Ads</p>
            <p class="text-xs text-gray-600 font-light">Campanhas e métricas</p>
          </div>
        </div>
        <div class="bg-white/40 rounded-lg p-3 flex items-center gap-3">
          <Icon icon="material-symbols:work" class="w-8 h-8 text-blue-800" />
          <div>
            <p class="font-medium text-gray-800 text-sm">LinkedIn Ads</p>
            <p class="text-xs text-gray-600 font-light">Anúncios profissionais</p>
          </div>
        </div>
        <div class="bg-white/40 rounded-lg p-3 flex items-center gap-3">
          <Icon icon="material-symbols:share" class="w-8 h-8 text-cyan-600" />
          <div>
            <p class="font-medium text-gray-800 text-sm">Twitter Ads</p>
            <p class="text-xs text-gray-600 font-light">Promoções sociais</p>
          </div>
        </div>
      </div>

      <div class="mt-6 bg-white/40 rounded-lg p-4">
        <h4 class="font-medium text-gray-800 mb-2">Segurança</h4>
        <ul class="text-sm text-gray-700 font-light space-y-2">
          <li class="flex items-start gap-2">
            <Icon icon="material-symbols:lock" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Tokens armazenados com criptografia AES-256-CBC</span>
          </li>
          <li class="flex items-start gap-2">
            <Icon icon="material-symbols:shield" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Auto-desativação após 5 erros consecutivos</span>
          </li>
          <li class="flex items-start gap-2">
            <Icon icon="material-symbols:refresh" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <span>Refresh automático de tokens expirados</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Próximos passos -->
    <div class="backdrop-blur-xl bg-white/30 rounded-2xl border-2 border-brand-purple/40 p-6 shadow-lg hover:bg-white/40 hover:border-brand-purple/60 transition-all group cursor-pointer" @click="router.push('/use-cases/google-sheets')">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:lightbulb" class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="font-medium text-gray-800">Próximo: Casos de Uso</p>
            <p class="text-sm text-gray-600 font-light">Exemplos práticos de automação</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 text-brand-purple group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
</template>
