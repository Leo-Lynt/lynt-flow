<script setup>
import { useRouter } from 'vue-router'
import Icon from '../../components/Icon.vue'
import BaseCard from '../../components/BaseCard.vue'

const router = useRouter()
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-3">Gerenciar Conteúdo</h1>
      <p class="text-lg text-gray-600">
        Organize, edite e publique seu conteúdo de forma eficiente
      </p>
    </div>

    <!-- Ações principais -->
    <BaseCard class="mb-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Ações Principais</h2>
      <div class="space-y-4">

        <div class="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Icon icon="material-symbols:edit" class="w-5 h-5 text-white" />
            </div>
            <h3 class="font-bold text-gray-900">Editar</h3>
          </div>
          <p class="text-sm text-gray-700 mb-2">
            Clique no botão de editar (ícone de lápis) em qualquer item para modificá-lo.
          </p>
          <p class="text-xs text-gray-600 bg-white/50 p-2 rounded">
            Ou clique diretamente na linha do item para abrir o editor
          </p>
        </div>

        <div class="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <Icon icon="material-symbols:content-copy" class="w-5 h-5 text-white" />
            </div>
            <h3 class="font-bold text-gray-900">Duplicar</h3>
          </div>
          <p class="text-sm text-gray-700 mb-2">
            Crie uma cópia de um item existente para reutilizar estrutura e conteúdo.
          </p>
          <p class="text-xs text-gray-600 bg-white/50 p-2 rounded">
            Útil para criar variações de conteúdo similar
          </p>
        </div>

        <div class="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Icon icon="material-symbols:delete" class="w-5 h-5 text-white" />
            </div>
            <h3 class="font-bold text-gray-900">Deletar</h3>
          </div>
          <p class="text-sm text-gray-700 mb-2">
            Remove permanentemente um item. Esta ação não pode ser desfeita.
          </p>
          <p class="text-xs text-red-900 bg-white/50 p-2 rounded font-semibold">
            ⚠️ Atenção: Sempre confirme antes de deletar
          </p>
        </div>

      </div>
    </BaseCard>

    <!-- Busca e filtros -->
    <BaseCard class="mb-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Busca e Filtros</h2>

      <div class="mb-6">
        <h3 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Icon icon="material-symbols:search" class="w-5 h-5 text-blue-600" />
          Buscar Conteúdo
        </h3>
        <p class="text-sm text-gray-700 mb-3">
          Use a barra de busca para encontrar rapidamente qualquer item por título ou conteúdo.
        </p>
        <div class="bg-gray-50 rounded p-3 border">
          <p class="text-xs text-gray-600">
            💡 <strong>Dica:</strong> A busca funciona em tempo real - os resultados aparecem conforme você digita
          </p>
        </div>
      </div>

      <div>
        <h3 class="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Icon icon="material-symbols:filter-list" class="w-5 h-5 text-purple-600" />
          Filtrar por Status
        </h3>
        <p class="text-sm text-gray-700 mb-3">
          Use os filtros para visualizar apenas itens de um status específico:
        </p>
        <div class="grid grid-cols-3 gap-2">
          <div class="text-center p-3 bg-amber-50 rounded border border-amber-200">
            <p class="text-xs font-semibold text-amber-900">Rascunhos</p>
          </div>
          <div class="text-center p-3 bg-green-50 rounded border border-green-200">
            <p class="text-xs font-semibold text-green-900">Publicados</p>
          </div>
          <div class="text-center p-3 bg-gray-50 rounded border border-gray-200">
            <p class="text-xs font-semibold text-gray-900">Arquivados</p>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Organização -->
    <BaseCard class="mb-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Organização</h2>

      <div class="space-y-4">
        <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div class="flex items-center gap-2 mb-2">
            <Icon icon="material-symbols:sort" class="w-5 h-5 text-blue-600" />
            <h3 class="font-bold text-gray-900">Ordenação</h3>
          </div>
          <p class="text-sm text-gray-700 mb-3">
            Clique nos cabeçalhos das colunas para ordenar por:
          </p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div class="text-xs p-2 bg-white rounded border text-center">Título</div>
            <div class="text-xs p-2 bg-white rounded border text-center">Data</div>
            <div class="text-xs p-2 bg-white rounded border text-center">Autor</div>
            <div class="text-xs p-2 bg-white rounded border text-center">Status</div>
          </div>
        </div>

        <div class="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div class="flex items-center gap-2 mb-2">
            <Icon icon="material-symbols:folder" class="w-5 h-5 text-purple-600" />
            <h3 class="font-bold text-gray-900">Categorias e Tags</h3>
          </div>
          <p class="text-sm text-gray-700">
            Organize conteúdo usando categorias e tags para facilitar navegação e busca.
          </p>
        </div>
      </div>
    </BaseCard>

    <!-- Publicação em lote -->
    <BaseCard class="mb-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Ações em Lote</h2>
      <p class="text-gray-700 mb-4">
        Selecione múltiplos itens para executar ações em lote:
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="p-3 bg-green-50 rounded border border-green-200">
          <Icon icon="material-symbols:publish" class="w-5 h-5 text-green-600 mb-2" />
          <p class="font-semibold text-sm text-gray-900">Publicar Vários</p>
          <p class="text-xs text-gray-600">Publique múltiplos rascunhos de uma vez</p>
        </div>

        <div class="p-3 bg-amber-50 rounded border border-amber-200">
          <Icon icon="material-symbols:archive" class="w-5 h-5 text-amber-600 mb-2" />
          <p class="font-semibold text-sm text-gray-900">Arquivar Vários</p>
          <p class="text-xs text-gray-600">Arquive conteúdo antigo em lote</p>
        </div>

        <div class="p-3 bg-red-50 rounded border border-red-200">
          <Icon icon="material-symbols:delete" class="w-5 h-5 text-red-600 mb-2" />
          <p class="font-semibold text-sm text-gray-900">Deletar Vários</p>
          <p class="text-xs text-gray-600">Remova múltiplos itens de uma vez</p>
        </div>
      </div>
    </BaseCard>

    <!-- Boas práticas -->
    <BaseCard class="mb-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Boas Práticas</h2>
      <div class="space-y-3">
        <div class="flex items-start gap-3 p-3 bg-blue-50 rounded border border-blue-200">
          <Icon icon="material-symbols:schedule" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm text-blue-900">
              <strong>Revise regularmente:</strong> Faça revisões periódicas do conteúdo para manter informações atualizadas
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3 p-3 bg-purple-50 rounded border border-purple-200">
          <Icon icon="material-symbols:backup" class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm text-purple-900">
              <strong>Arquive ao invés de deletar:</strong> Mantenha histórico arquivando conteúdo antigo
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3 p-3 bg-green-50 rounded border border-green-200">
          <Icon icon="material-symbols:label" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm text-green-900">
              <strong>Use tags consistentes:</strong> Mantenha padrão de nomenclatura para facilitar busca
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3 p-3 bg-amber-50 rounded border border-amber-200">
          <Icon icon="material-symbols:groups" class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm text-amber-900">
              <strong>Comunique mudanças:</strong> Avise a equipe sobre alterações importantes no conteúdo
            </p>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Próximos passos -->
    <BaseCard>
      <h2 class="text-xl font-bold text-gray-900 mb-4">Continue Aprendendo</h2>
      <p class="text-gray-700 mb-6">
        Explore outros tópicos da documentação:
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          @click="router.push('/introduction/what-is')"
          class="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
        >
          <div class="flex items-center gap-3 mb-2">
            <Icon icon="material-symbols:info" class="w-6 h-6 text-blue-600" />
            <h3 class="font-bold text-gray-900">Voltar ao Início</h3>
          </div>
          <p class="text-sm text-gray-600">Conheça mais sobre Lynt Flow</p>
        </button>

        <button
          @click="router.push('/use-cases/google-sheets')"
          class="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
        >
          <div class="flex items-center gap-3 mb-2">
            <Icon icon="material-symbols:lightbulb" class="w-6 h-6 text-amber-600" />
            <h3 class="font-bold text-gray-900">Casos de Uso</h3>
          </div>
          <p class="text-sm text-gray-600">Veja exemplos práticos de uso</p>
        </button>
      </div>
    </BaseCard>
  </div>
</template>
