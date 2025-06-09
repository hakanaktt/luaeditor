<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden"
      @click.stop
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">
          {{ $t('keyboardShortcuts.title') }}
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            v-for="category in shortcutCategories"
            :key="category.name"
            class="space-y-4"
          >
            <h3 class="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
              {{ $t(`keyboardShortcuts.categories.${category.name.toLowerCase()}`) }}
            </h3>
            
            <div class="space-y-2">
              <div
                v-for="shortcut in category.shortcuts"
                :key="shortcut.action"
                class="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50"
              >
                <span class="text-sm text-gray-700">
                  {{ shortcut.description }}
                </span>
                <kbd class="shortcut-key">
                  {{ formatShortcut(shortcut) }}
                </kbd>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div class="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 class="text-sm font-medium text-blue-900 mb-2">
            {{ $t('keyboardShortcuts.tips.title') }}
          </h4>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>• {{ $t('keyboardShortcuts.tips.editorFocus') }}</li>
            <li>• {{ $t('keyboardShortcuts.tips.globalShortcuts') }}</li>
            <li>• {{ $t('keyboardShortcuts.tips.menuAccess') }}</li>
          </ul>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end p-6 border-t border-gray-200">
        <button
          @click="closeModal"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {{ $t('common.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { X } from 'lucide-vue-next'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

interface Props {
  isVisible: boolean
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { getShortcutsByCategory, formatShortcut } = useKeyboardShortcuts()

const shortcutCategories = computed(() => getShortcutsByCategory())

const closeModal = () => {
  emit('close')
}

// Handle escape key to close modal
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isVisible) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.shortcut-key {
  @apply inline-flex items-center px-2 py-1 text-xs font-mono font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded;
  min-width: 60px;
  justify-content: center;
}

.shortcut-key:before {
  content: '';
}

/* Custom scrollbar for the content area */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
