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
      <h1 class="text-3xl font-bold text-gray-900 mb-3">Interface do CMS</h1>
      <p class="text-lg text-gray-600">
        Conheça a tela de gerenciamento de conteúdo
      </p>
    </div>

    <!-- Visão Geral -->
    <BaseCard class="mb-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">O que é o CMS?</h2>
      <p class="text-gray-700 mb-4">
        O <strong>CMS (Content Management System)</strong> do Lynt Flow permite que você gerencie
        todo o conteúdo da aplicação de forma visual, sem precisar editar código.
      </p>
      <p class="text-gray-700">
        Você pode criar, editar, organizar e publicar conteúdo de forma simples e rápida.
      </p>
    </BaseCard>

    <!-- Áreas principais -->
    <BaseCard class="mb-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Áreas Principais</h2>
      <div class="space-y-6">

        <!-- Painel Lateral -->
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Icon icon="material-symbols:list" class="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 class="font-bold text-gray-900 mb-1">1. Painel Lateral (esquerda)</h3>
            <p class="text-sm text-gray-700 mb-2">
              Lista de tipos de conteúdo disponíveis. Clique em um tipo para ver todos os itens.
            </p>
            <div class="bg-purple-50 border border-purple-200 rounded p-3">
              <p class="text-xs text-purple-900">
                <strong>Exemplos:</strong> Posts, Páginas, Produtos, etc.
              </p>
            </div>
          </div>
        </div>

        <!-- Área Central -->
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon icon="material-symbols:table" class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 class="font-bold text-gray-900 mb-1">2. Lista de Conteúdo (centro)</h3>
            <p class="text-sm text-gray-700 mb-2">
              Tabela com todos os itens do tipo selecionado. Você pode buscar, filtrar e ordenar.
            </p>
            <div class="bg-blue-50 border border-blue-200 rounded p-3">
              <p class="text-xs text-blue-900">
                <strong>Ações:</strong> Editar, Duplicar, Deletar
              </p>
            </div>
          </div>
        </div>

        <!-- Barra Superior -->
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Icon icon="material-symbols:toolbar" class="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 class="font-bold text-gray-900 mb-1">3. Barra Superior</h3>
            <p class="text-sm text-gray-700 mb-2">
              Botões principais: Criar Novo, Buscar, Filtros
            </p>
            <div class="grid grid-cols-3 gap-2 mt-3">
              <div class="text-center p-2 bg-white rounded border border-green-500">
                <Icon icon="material-symbols:add-circle" class="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p class="text-xs text-gray-600">Criar Novo</p>
              </div>
              <div class="text-center p-2 bg-white rounded border">
                <Icon icon="material-symbols:search" class="w-5 h-5 text-gray-700 mx-auto mb-1" />
                <p class="text-xs text-gray-600">Buscar</p>
              </div>
              <div class="text-center p-2 bg-white rounded border">
                <Icon icon="material-symbols:filter-list" class="w-5 h-5 text-gray-700 mx-auto mb-1" />
                <p class="text-xs text-gray-600">Filtrar</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </BaseCard>

    <!-- Recursos úteis -->
    <BaseCard class="mb-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Recursos Úteis</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
          <div class="flex items-center gap-2 mb-2">
            <Icon icon="material-symbols:search" class="w-5 h-5 text-blue-600" />
            <h3 class="font-bold text-gray-900">Busca</h3>
          </div>
          <p class="text-sm text-gray-700">
            Encontre rapidamente qualquer conteúdo digitando título ou palavras-chave
          </p>
        </div>

        <div class="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div class="flex items-center gap-2 mb-2">
            <Icon icon="material-symbols:filter-list" class="w-5 h-5 text-purple-600" />
            <h3 class="font-bold text-gray-900">Filtros</h3>
          </div>
          <p class="text-sm text-gray-700">
            Filtre por status (publicado, rascunho), data, autor, etc.
          </p>
        </div>

        <div class="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div class="flex items-center gap-2 mb-2">
            <Icon icon="material-symbols:sort" class="w-5 h-5 text-green-600" />
            <h3 class="font-bold text-gray-900">Ordenação</h3>
          </div>
          <p class="text-sm text-gray-700">
            Ordene por data, título, autor ou qualquer campo personalizado
          </p>
        </div>

        <div class="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
          <div class="flex items-center gap-2 mb-2">
            <Icon icon="material-symbols:content-copy" class="w-5 h-5 text-amber-600" />
            <h3 class="font-bold text-gray-900">Duplicar</h3>
          </div>
          <p class="text-sm text-gray-700">
            Clone conteúdo existente para criar variações rapidamente
          </p>
        </div>
      </div>
    </BaseCard>

    <!-- Próximos passos -->
    <BaseCard>
      <h2 class="text-xl font-bold text-gray-900 mb-4">Próximo Passo</h2>
      <p class="text-gray-700 mb-6">
        Agora que você conhece a interface, vamos aprender a criar conteúdo:
      </p>
      <button
        @click="router.push('/cms/creating-content')"
        class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:brightness-110 transition-all group"
      >
        <div class="flex items-center gap-3">
          <Icon icon="material-symbols:add-circle" class="w-6 h-6" />
          <div class="text-left">
            <p class="font-semibold">Criar Conteúdo</p>
            <p class="text-sm opacity-90">Aprenda a adicionar e editar conteúdo</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </BaseCard>
  </div>
</template>
