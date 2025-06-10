<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">
          {{ $t('about.title') }}
        </h2>
        <button
          @click="closeModal"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X :size="24" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
        <!-- App Info -->
        <div class="text-center mb-6">
          <div class="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-lg flex items-center justify-center">
            <span class="text-white text-2xl font-bold">AL</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {{ $t('app.title') }}
          </h3>
          <p class="text-sm text-gray-600 mb-2">
            {{ $t('about.version') }} {{ appVersion }}
          </p>
          <p class="text-sm text-gray-600">
            {{ $t('about.author') }}: {{ $t('about.authorName') }}
          </p>
        </div>

        <!-- Description -->
        <div class="mb-6">
          <p class="text-gray-700 leading-relaxed">
            {{ $t('about.description') }}
          </p>
        </div>

        <!-- Features -->
        <div class="mb-6">
          <h4 class="text-md font-semibold text-gray-900 mb-3">
            {{ $t('about.features') }}
          </h4>
          <ul class="space-y-2">
            <li
              v-for="(feature, index) in $t('about.featureList')"
              :key="index"
              class="flex items-start"
            >
              <Check :size="16" class="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span class="text-sm text-gray-700">{{ feature }}</span>
            </li>
          </ul>
        </div>

        <!-- Technologies -->
        <div class="mb-6">
          <h4 class="text-md font-semibold text-gray-900 mb-3">
            {{ $t('about.builtWith') }}
          </h4>
          <p class="text-sm text-gray-600">
            {{ $t('about.technologies') }}
          </p>
        </div>

        <!-- Copyright -->
        <div class="text-center pt-4 border-t border-gray-200">
          <p class="text-xs text-gray-500">
            {{ $t('about.copyright') }}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end p-6 border-t border-gray-200">
        <button
          @click="closeModal"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {{ $t('about.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { X, Check } from 'lucide-vue-next'

interface Props {
  isVisible: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'close': []
}>()

// Get version from package.json or tauri config
const appVersion = computed(() => {
  return '1.0.0' // This could be dynamically loaded from package.json
})

const closeModal = () => {
  emit('close')
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
