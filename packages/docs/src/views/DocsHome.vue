<script setup>
import { useRouter } from 'vue-router'
import Icon from '../components/Icon.vue'

const router = useRouter()

const sections = [
  {
    title: 'Introdução',
    description: 'Aprenda o que é Lynt Flow e como funciona',
    icon: 'material-symbols:info',
    color: 'blue',
    route: '/introduction/what-is'
  },
  {
    title: 'Usando o Editor',
    description: 'Conheça a interface e como criar fluxos',
    icon: 'material-symbols:edit-square',
    color: 'cyan',
    route: '/editor/interface'
  },
  {
    title: 'Nodes',
    description: 'Explore todos os nodes disponíveis',
    icon: 'material-symbols:extension',
    color: 'blue',
    route: '/nodes/input-output'
  },
  {
    title: 'CMS',
    description: 'Gerencie conteúdo visualmente',
    icon: 'material-symbols:dashboard-customize',
    color: 'cyan',
    route: '/cms/interface'
  }
]
</script>

<template>
  <div class="max-w-6xl mx-auto flex flex-col justify-center min-h-[calc(100vh-200px)]">

    <!-- Header com Badge -->
    <div class="text-center mb-12">
      <h1 class="text-5xl font-light text-gray-800 mb-4 tracking-wide">
        Lynt Flow
      </h1>
      <p class="text-xl text-gray-600 font-light">
        Crie fluxos de automação sem código
      </p>
    </div>

    <!-- Cards em Grid 2x2 - mais visual -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <button
        v-for="section in sections"
        :key="section.route"
        @click="router.push(section.route)"
        class="group relative backdrop-blur-xl bg-white/30 rounded-2xl border border-white/20 p-6 text-center hover:bg-white/40 hover:border-white/40 hover:shadow-lg transition-all duration-300"
      >
        <!-- Ícone grande no topo -->
        <div class="mb-6 flex justify-center">
          <div
            :class="[
              'w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300',
              section.color === 'blue' && 'bg-gradient-to-br from-blue-500 to-blue-600 group-hover:scale-110',
              section.color === 'cyan' && 'bg-gradient-to-br from-cyan-500 to-cyan-600 group-hover:scale-110'
            ]"
          >
            <Icon
              :icon="section.icon"
              class="w-10 h-10 text-white"
            />
          </div>
        </div>

        <!-- Título -->
        <h3 class="text-lg font-light text-gray-800 mb-2 tracking-wide">
          {{ section.title }}
        </h3>

        <!-- Descrição -->
        <p class="text-sm text-gray-600 mb-4 font-light">
          {{ section.description }}
        </p>

        <!-- Arrow -->
        <div class="flex items-center justify-center gap-1 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <span class="text-xs font-medium">Explorar</span>
          <Icon
            icon="material-symbols:arrow-forward"
            class="w-4 h-4"
          />
        </div>
      </button>
    </div>

    <!-- Quick Start Section -->
    <div class="grid md:grid-cols-2 gap-6 mb-12">
      <!-- Primeira vez -->
      <div class="backdrop-blur-xl bg-white/30 rounded-2xl p-8 border-2 border-blue-500/40 hover:bg-white/40 hover:border-blue-500/60 transition-all shadow-lg group cursor-pointer" @click="router.push('/introduction/what-is')">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Icon icon="material-symbols:rocket-launch" class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-2xl font-light text-gray-800 tracking-wide">Começar Agora</h3>
        </div>
        <p class="text-gray-600 mb-6 leading-relaxed font-light">
          Novo no Lynt Flow? Comece pela introdução e aprenda os conceitos fundamentais em minutos.
        </p>
        <div class="flex items-center gap-2 text-blue-600 font-medium">
          <span>Ir para Introdução</span>
          <Icon icon="material-symbols:arrow-forward" class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      <!-- Navegação Rápida -->
      <div class="backdrop-blur-xl bg-white/30 rounded-2xl p-8 border border-white/20 hover:bg-white/40 hover:border-white/40 transition-all shadow-lg">
        <h3 class="text-xl font-light text-gray-800 mb-6 tracking-wide">Acesso Rápido</h3>
        <div class="space-y-3">
          <button
            @click="router.push('/nodes/filter')"
            class="w-full flex items-center justify-between p-3 backdrop-blur-xl bg-white/40 rounded-lg border border-white/30 hover:bg-white/60 hover:border-white/50 transition-all text-left group"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-blue-100/80 rounded-lg flex items-center justify-center backdrop-blur">
                <Icon icon="material-symbols:filter-alt" class="w-4 h-4 text-blue-600" />
              </div>
              <span class="font-medium text-gray-800">Node Filter</span>
            </div>
            <Icon icon="material-symbols:arrow-forward" class="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </button>

          <button
            @click="router.push('/nodes/data-connector')"
            class="w-full flex items-center justify-between p-3 backdrop-blur-xl bg-white/40 rounded-lg border border-white/30 hover:bg-white/60 hover:border-white/50 transition-all text-left group"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-cyan-100/80 rounded-lg flex items-center justify-center backdrop-blur">
                <Icon icon="material-symbols:cable" class="w-4 h-4 text-cyan-600" />
              </div>
              <span class="font-medium text-gray-800">Data Connector</span>
            </div>
            <Icon icon="material-symbols:arrow-forward" class="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </button>

          <button
            @click="router.push('/faq')"
            class="w-full flex items-center justify-between p-3 backdrop-blur-xl bg-white/40 rounded-lg border border-white/30 hover:bg-white/60 hover:border-white/50 transition-all text-left group"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-blue-100/80 rounded-lg flex items-center justify-center backdrop-blur">
                <Icon icon="material-symbols:help" class="w-4 h-4 text-blue-600" />
              </div>
              <span class="font-medium text-gray-800">FAQ</span>
            </div>
            <Icon icon="material-symbols:arrow-forward" class="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
