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
      <h1 class="text-3xl font-bold text-gray-900 mb-3">Criar Conteúdo</h1>
      <p class="text-lg text-gray-600">
        Aprenda a adicionar e editar conteúdo no CMS
      </p>
    </div>

    <!-- Como criar conteúdo -->
    <BaseCard class="mb-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Como Criar Novo Conteúdo</h2>
      <ol class="space-y-4">
        <li class="flex items-start gap-3">
          <div class="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
          <div>
            <p class="font-semibold text-gray-900">Selecione o tipo de conteúdo</p>
            <p class="text-sm text-gray-600">No painel lateral, clique no tipo que deseja criar (ex: Post, Página)</p>
          </div>
        </li>
        <li class="flex items-start gap-3">
          <div class="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
          <div>
            <p class="font-semibold text-gray-900">Clique em "Criar Novo"</p>
            <p class="text-sm text-gray-600">Botão verde na barra superior</p>
          </div>
        </li>
        <li class="flex items-start gap-3">
          <div class="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
          <div>
            <p class="font-semibold text-gray-900">Preencha os campos</p>
            <p class="text-sm text-gray-600">Título, conteúdo, imagens e outros campos necessários</p>
          </div>
        </li>
        <li class="flex items-start gap-3">
          <div class="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
          <div>
            <p class="font-semibold text-gray-900">Salve ou Publique</p>
            <p class="text-sm text-gray-600">Salvar como rascunho ou publicar imediatamente</p>
          </div>
        </li>
      </ol>
    </BaseCard>

    <!-- Tipos de campos -->
    <BaseCard class="mb-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Tipos de Campos</h2>
      <p class="text-gray-700 mb-4">
        O CMS suporta diferentes tipos de campos para diferentes necessidades:
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="p-3 bg-gray-50 rounded border">
          <div class="flex items-center gap-2 mb-1">
            <Icon icon="material-symbols:text-fields" class="w-4 h-4 text-blue-600" />
            <p class="font-semibold text-sm text-gray-900">Texto</p>
          </div>
          <p class="text-xs text-gray-600">Campos de texto curto (título, nome)</p>
        </div>

        <div class="p-3 bg-gray-50 rounded border">
          <div class="flex items-center gap-2 mb-1">
            <Icon icon="material-symbols:subject" class="w-4 h-4 text-purple-600" />
            <p class="font-semibold text-sm text-gray-900">Texto Longo</p>
          </div>
          <p class="text-xs text-gray-600">Áreas de texto grandes (descrição, conteúdo)</p>
        </div>

        <div class="p-3 bg-gray-50 rounded border">
          <div class="flex items-center gap-2 mb-1">
            <Icon icon="material-symbols:image" class="w-4 h-4 text-green-600" />
            <p class="font-semibold text-sm text-gray-900">Imagem</p>
          </div>
          <p class="text-xs text-gray-600">Upload de imagens e fotos</p>
        </div>

        <div class="p-3 bg-gray-50 rounded border">
          <div class="flex items-center gap-2 mb-1">
            <Icon icon="material-symbols:calendar-month" class="w-4 h-4 text-amber-600" />
            <p class="font-semibold text-sm text-gray-900">Data</p>
          </div>
          <p class="text-xs text-gray-600">Seletor de data e hora</p>
        </div>

        <div class="p-3 bg-gray-50 rounded border">
          <div class="flex items-center gap-2 mb-1">
            <Icon icon="material-symbols:toggle-on" class="w-4 h-4 text-indigo-600" />
            <p class="font-semibold text-sm text-gray-900">Sim/Não</p>
          </div>
          <p class="text-xs text-gray-600">Campo booleano (ativo/inativo)</p>
        </div>

        <div class="p-3 bg-gray-50 rounded border">
          <div class="flex items-center gap-2 mb-1">
            <Icon icon="material-symbols:list" class="w-4 h-4 text-pink-600" />
            <p class="font-semibold text-sm text-gray-900">Seleção</p>
          </div>
          <p class="text-xs text-gray-600">Dropdown com opções predefinidas</p>
        </div>
      </div>
    </BaseCard>

    <!-- Status de publicação -->
    <BaseCard class="mb-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Status de Publicação</h2>
      <div class="space-y-3">
        <div class="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <Icon icon="material-symbols:draft" class="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <p class="font-bold text-gray-900">Rascunho</p>
            <p class="text-sm text-gray-700">Conteúdo salvo mas não visível publicamente. Use para trabalhar em progresso.</p>
          </div>
        </div>

        <div class="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <Icon icon="material-symbols:check-circle" class="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p class="font-bold text-gray-900">Publicado</p>
            <p class="text-sm text-gray-700">Conteúdo ativo e visível para usuários. Aparece no site/aplicação.</p>
          </div>
        </div>

        <div class="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <Icon icon="material-symbols:archive" class="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p class="font-bold text-gray-900">Arquivado</p>
            <p class="text-sm text-gray-700">Conteúdo oculto mas preservado. Use para conteúdo antigo que pode ser reutilizado.</p>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Dicas importantes -->
    <BaseCard class="mb-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">Dicas Importantes</h2>
      <div class="space-y-3">
        <div class="flex items-start gap-3 p-3 bg-blue-50 rounded border border-blue-200">
          <Icon icon="material-symbols:lightbulb" class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm text-blue-900">
              <strong>Salve frequentemente:</strong> Use Ctrl+S ou clique no botão Salvar regularmente
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3 p-3 bg-purple-50 rounded border border-purple-200">
          <Icon icon="material-symbols:preview" class="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm text-purple-900">
              <strong>Pré-visualize:</strong> Sempre visualize antes de publicar para garantir que está correto
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3 p-3 bg-green-50 rounded border border-green-200">
          <Icon icon="material-symbols:label" class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p class="text-sm text-green-900">
              <strong>Campos obrigatórios:</strong> Campos marcados com * devem ser preenchidos antes de salvar
            </p>
          </div>
        </div>
      </div>
    </BaseCard>

    <!-- Próximos passos -->
    <BaseCard>
      <h2 class="text-xl font-bold text-gray-900 mb-4">Próximo Passo</h2>
      <p class="text-gray-700 mb-6">
        Agora que você sabe criar conteúdo, aprenda a gerenciar e organizar:
      </p>
      <button
        @click="router.push('/cms/managing-content')"
        class="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:brightness-110 transition-all group"
      >
        <div class="flex items-center gap-3">
          <Icon icon="material-symbols:folder-managed" class="w-6 h-6" />
          <div class="text-left">
            <p class="font-semibold">Gerenciar Conteúdo</p>
            <p class="text-sm opacity-90">Organize, edite e publique seu conteúdo</p>
          </div>
        </div>
        <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </BaseCard>
  </div>
</template>
