<script setup>
import { ref, onMounted, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { usePublicFlows } from '../composables/usePublicFlows.js'

const props = defineProps({
  flowId: {
    type: String,
    required: true
  },
  userReview: Object
})

const { listReviews, createReview, updateReview, deleteReview, markReviewHelpful, loading } = usePublicFlows()

const reviews = ref([])
const sortBy = ref('helpful')
const minRating = ref(null)
const showReviewForm = ref(false)
const editingReview = ref(null)

const reviewForm = ref({
  rating: 5,
  title: '',
  comment: ''
})

const error = ref('')

const hasUserReview = computed(() => !!props.userReview)

onMounted(async () => {
  await loadReviews()
})

async function loadReviews() {
  const result = await listReviews(props.flowId, {
    sortBy: sortBy.value,
    minRating: minRating.value,
    limit: 20
  })

  if (result.success) {
    reviews.value = result.reviews || []
  }
}

async function handleSubmitReview() {
  error.value = ''

  if (reviewForm.value.comment.length < 20) {
    error.value = 'Comentário deve ter pelo menos 20 caracteres'
    return
  }

  let result
  if (editingReview.value) {
    result = await updateReview(editingReview.value._id, reviewForm.value)
  } else {
    result = await createReview(props.flowId, reviewForm.value)
  }

  if (result.success) {
    showReviewForm.value = false
    editingReview.value = null
    reviewForm.value = { rating: 5, title: '', comment: '' }
    await loadReviews()
  } else {
    error.value = result.error
  }
}

async function handleEditReview() {
  if (props.userReview) {
    editingReview.value = props.userReview
    reviewForm.value = {
      rating: props.userReview.rating,
      title: props.userReview.title || '',
      comment: props.userReview.comment
    }
    showReviewForm.value = true
  }
}

async function handleDeleteReview() {
  if (!confirm('Tem certeza que deseja deletar sua avaliação?')) return

  const result = await deleteReview(props.userReview._id)
  if (result.success) {
    await loadReviews()
  }
}

async function handleMarkHelpful(reviewId) {
  const result = await markReviewHelpful(reviewId)
  if (result.success) {
    // Atualizar localmente
    const review = reviews.value.find(r => r._id === reviewId)
    if (review) {
      if (result.data.marked) {
        review.helpful = result.data.helpful
      } else {
        review.helpful = result.data.helpful
      }
    }
  }
}

function cancelReviewForm() {
  showReviewForm.value = false
  editingReview.value = null
  reviewForm.value = { rating: 5, title: '', comment: '' }
  error.value = ''
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getStars(rating) {
  return Array.from({ length: 5 }, (_, i) => i < rating)
}
</script>

<template>
  <div class="space-y-6">
    <!-- User's Review / Write Review Button -->
    <div v-if="hasUserReview && !showReviewForm" class="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h4 class="font-semibold text-blue-900 mb-1">Sua Avaliação</h4>
          <div class="flex items-center gap-2 mb-2">
            <div class="flex gap-1">
              <Icon
                v-for="(filled, index) in getStars(userReview.rating)"
                :key="index"
                icon="lucide:star"
                :class="['w-4 h-4', filled ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300']"
              />
            </div>
            <span class="text-sm text-blue-800">{{ userReview.rating }}/5</span>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="handleEditReview"
            class="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Icon icon="lucide:edit" class="w-4 h-4" />
            Editar
          </button>
          <button
            @click="handleDeleteReview"
            class="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
          >
            <Icon icon="lucide:trash-2" class="w-4 h-4" />
            Deletar
          </button>
        </div>
      </div>
      <p v-if="userReview.title" class="font-medium text-gray-900 mb-2">{{ userReview.title }}</p>
      <p class="text-gray-700">{{ userReview.comment }}</p>
    </div>

    <div v-else-if="!showReviewForm" class="text-center py-6 bg-gray-50 border border-gray-200 rounded-lg">
      <p class="text-gray-600 mb-4">Você ainda não avaliou este flow</p>
      <button
        @click="showReviewForm = true"
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
      >
        <Icon icon="lucide:star" class="w-4 h-4" />
        Escrever Avaliação
      </button>
    </div>

    <!-- Review Form -->
    <div v-if="showReviewForm" class="bg-white border border-gray-200 rounded-lg p-6">
      <h4 class="font-semibold text-gray-900 mb-4">
        {{ editingReview ? 'Editar Avaliação' : 'Nova Avaliação' }}
      </h4>

      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
        {{ error }}
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Classificação *
          </label>
          <div class="flex gap-2">
            <button
              v-for="star in 5"
              :key="star"
              @click="reviewForm.rating = star"
              type="button"
              class="focus:outline-none"
            >
              <Icon
                icon="lucide:star"
                :class="[
                  'w-8 h-8 transition-colors',
                  star <= reviewForm.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 hover:text-yellow-400'
                ]"
              />
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Título (opcional)
          </label>
          <input
            v-model="reviewForm.title"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Resuma sua experiência"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Comentário *
          </label>
          <textarea
            v-model="reviewForm.comment"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Compartilhe sua experiência com este flow..."
          ></textarea>
          <p class="mt-1 text-xs text-gray-500">{{ reviewForm.comment.length }} / 1000 caracteres (mínimo 20)</p>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            @click="cancelReviewForm"
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="handleSubmitReview"
            type="button"
            :disabled="loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Icon :icon="loading ? 'lucide:loader-2' : 'lucide:send'" :class="['w-4 h-4', { 'animate-spin': loading }]" />
            {{ loading ? 'Salvando...' : (editingReview ? 'Atualizar' : 'Publicar') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-4">
      <select
        v-model="sortBy"
        @change="loadReviews"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="helpful">Mais úteis</option>
        <option value="recent">Mais recentes</option>
        <option value="rating_high">Maior classificação</option>
        <option value="rating_low">Menor classificação</option>
      </select>

      <select
        v-model="minRating"
        @change="loadReviews"
        class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option :value="null">Todas as classificações</option>
        <option :value="5">5 estrelas</option>
        <option :value="4">4+ estrelas</option>
        <option :value="3">3+ estrelas</option>
      </select>
    </div>

    <!-- Reviews List -->
    <div v-if="reviews.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
      <Icon icon="lucide:message-circle" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p class="text-gray-600">Nenhuma avaliação ainda</p>
      <p class="text-sm text-gray-500">Seja o primeiro a avaliar este flow!</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="review in reviews"
        :key="review._id"
        class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
      >
        <!-- Review Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {{ review.userId?.name?.charAt(0)?.toUpperCase() || '?' }}
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <p class="font-medium text-gray-900">{{ review.userId?.name || 'Usuário' }}</p>
                <Icon
                  v-if="review.userId?.publicProfile?.isVerifiedCreator"
                  icon="lucide:shield-check"
                  class="w-4 h-4 text-blue-500"
                  title="Criador Verificado"
                />
              </div>
              <div class="flex items-center gap-2">
                <div class="flex gap-0.5">
                  <Icon
                    v-for="(filled, index) in getStars(review.rating)"
                    :key="index"
                    icon="lucide:star"
                    :class="['w-4 h-4', filled ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300']"
                  />
                </div>
                <span class="text-sm text-gray-500">{{ formatDate(review.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Review Content -->
        <div class="mb-4">
          <p v-if="review.title" class="font-medium text-gray-900 mb-2">{{ review.title }}</p>
          <p class="text-gray-700">{{ review.comment }}</p>
        </div>

        <!-- Review Footer -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            @click="handleMarkHelpful(review._id)"
            class="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Icon icon="lucide:thumbs-up" class="w-4 h-4" />
            <span>Útil ({{ review.helpful || 0 }})</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
