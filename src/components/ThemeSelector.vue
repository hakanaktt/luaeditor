<template>
  <div class="theme-selector">
    <h3 class="text-lg font-semibold mb-4">{{ $t('settings.theme') }}</h3>
    
    <!-- Theme Grid -->
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div
        v-for="theme in availableThemes"
        :key="theme.id"
        class="theme-card"
        :class="{ 'theme-card-active': currentTheme === theme.id }"
        @click="selectTheme(theme.id)"
      >
        <div class="theme-preview" :class="getThemePreviewClass(theme)">
          <div class="theme-preview-header">
            <div class="theme-preview-dots">
              <div class="dot red"></div>
              <div class="dot yellow"></div>
              <div class="dot green"></div>
            </div>
          </div>
          <div class="theme-preview-content">
            <div class="theme-preview-line keyword">function</div>
            <div class="theme-preview-line string">"Hello World"</div>
            <div class="theme-preview-line comment">-- Comment</div>
            <div class="theme-preview-line number">42</div>
          </div>
        </div>
        <div class="theme-info">
          <h4 class="font-medium">{{ theme.name }}</h4>
          <p class="text-sm text-gray-600">{{ theme.description }}</p>
        </div>
      </div>
    </div>

    <!-- Text Style Controls -->
    <div class="text-style-controls">
      <h4 class="text-md font-semibold mb-3">{{ $t('settings.textStyle') }}</h4>
      
      <div class="grid grid-cols-2 gap-4">
        <!-- Font Size -->
        <div class="control-group">
          <label class="block text-sm font-medium mb-2">{{ $t('settings.fontSize') }}</label>
          <div class="flex items-center space-x-2">
            <button
              @click="decreaseFontSize"
              class="control-button"
              :disabled="currentTextStyle.fontSize <= 10"
            >
              <Minus :size="16" />
            </button>
            <span class="font-mono text-sm min-w-[3rem] text-center">
              {{ currentTextStyle.fontSize }}px
            </span>
            <button
              @click="increaseFontSize"
              class="control-button"
              :disabled="currentTextStyle.fontSize >= 32"
            >
              <Plus :size="16" />
            </button>
          </div>
        </div>

        <!-- Font Family -->
        <div class="control-group">
          <label class="block text-sm font-medium mb-2">{{ $t('settings.fontFamily') }}</label>
          <select
            v-model="selectedFontFamily"
            @change="updateFontFamily"
            class="control-select"
          >
            <option v-for="font in fontFamilies" :key="font" :value="font">
              {{ getFontDisplayName(font) }}
            </option>
          </select>
        </div>

        <!-- Line Height -->
        <div class="control-group">
          <label class="block text-sm font-medium mb-2">{{ $t('settings.lineHeight') }}</label>
          <div class="flex items-center space-x-2">
            <button
              @click="decreaseLineHeight"
              class="control-button"
              :disabled="currentTextStyle.lineHeight <= 1.0"
            >
              <Minus :size="16" />
            </button>
            <span class="font-mono text-sm min-w-[3rem] text-center">
              {{ currentTextStyle.lineHeight.toFixed(1) }}
            </span>
            <button
              @click="increaseLineHeight"
              class="control-button"
              :disabled="currentTextStyle.lineHeight >= 3.0"
            >
              <Plus :size="16" />
            </button>
          </div>
        </div>

        <!-- Letter Spacing -->
        <div class="control-group">
          <label class="block text-sm font-medium mb-2">{{ $t('settings.letterSpacing') }}</label>
          <div class="flex items-center space-x-2">
            <button
              @click="decreaseLetterSpacing"
              class="control-button"
              :disabled="currentTextStyle.letterSpacing <= -1.0"
            >
              <Minus :size="16" />
            </button>
            <span class="font-mono text-sm min-w-[3rem] text-center">
              {{ currentTextStyle.letterSpacing.toFixed(1) }}px
            </span>
            <button
              @click="increaseLetterSpacing"
              class="control-button"
              :disabled="currentTextStyle.letterSpacing >= 3.0"
            >
              <Plus :size="16" />
            </button>
          </div>
        </div>
      </div>

      <!-- Reset Button -->
      <div class="mt-4">
        <button
          @click="resetToDefaults"
          class="reset-button"
        >
          <RotateCcw :size="16" />
          {{ $t('settings.resetToDefaults') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Minus, RotateCcw } from 'lucide-vue-next'
import { colorfulThemeService } from '../services/colorfulThemeService'
import { themeService, FONT_FAMILIES, DEFAULT_TEXT_STYLE } from '../services/themeService'
import type { ColorfulThemeDefinition } from '../services/colorfulThemeService'
import type { TextStyleSettings } from '../services/themeService'

const availableThemes = ref<ColorfulThemeDefinition[]>([])
const currentTheme = ref<string>('vibrant-dark')
const currentTextStyle = ref<TextStyleSettings>({ ...DEFAULT_TEXT_STYLE })
const selectedFontFamily = ref<string>(DEFAULT_TEXT_STYLE.fontFamily)

const fontFamilies = FONT_FAMILIES

onMounted(() => {
  availableThemes.value = colorfulThemeService.getAvailableThemes()
  currentTextStyle.value = themeService.getCurrentTextStyle()
  selectedFontFamily.value = currentTextStyle.value.fontFamily
})

const selectTheme = (themeId: string): void => {
  currentTheme.value = themeId
  colorfulThemeService.applyTheme(themeId)
}

const getThemePreviewClass = (theme: ColorfulThemeDefinition): string => {
  return theme.isDark ? 'theme-preview-dark' : 'theme-preview-light'
}

const getFontDisplayName = (fontFamily: string): string => {
  const firstFont = fontFamily.split(',')[0].replace(/['"]/g, '').trim()
  return firstFont
}

// Font size controls
const increaseFontSize = (): void => {
  const newSize = Math.min(currentTextStyle.value.fontSize + 2, 32)
  themeService.setFontSize(newSize)
  currentTextStyle.value = themeService.getCurrentTextStyle()
}

const decreaseFontSize = (): void => {
  const newSize = Math.max(currentTextStyle.value.fontSize - 2, 10)
  themeService.setFontSize(newSize)
  currentTextStyle.value = themeService.getCurrentTextStyle()
}

// Font family controls
const updateFontFamily = (): void => {
  themeService.setFontFamily(selectedFontFamily.value)
  currentTextStyle.value = themeService.getCurrentTextStyle()
}

// Line height controls
const increaseLineHeight = (): void => {
  const newHeight = Math.min(currentTextStyle.value.lineHeight + 0.1, 3.0)
  themeService.setLineHeight(Number(newHeight.toFixed(1)))
  currentTextStyle.value = themeService.getCurrentTextStyle()
}

const decreaseLineHeight = (): void => {
  const newHeight = Math.max(currentTextStyle.value.lineHeight - 0.1, 1.0)
  themeService.setLineHeight(Number(newHeight.toFixed(1)))
  currentTextStyle.value = themeService.getCurrentTextStyle()
}

// Letter spacing controls
const increaseLetterSpacing = (): void => {
  const newSpacing = Math.min(currentTextStyle.value.letterSpacing + 0.1, 3.0)
  themeService.setLetterSpacing(Number(newSpacing.toFixed(1)))
  currentTextStyle.value = themeService.getCurrentTextStyle()
}

const decreaseLetterSpacing = (): void => {
  const newSpacing = Math.max(currentTextStyle.value.letterSpacing - 0.1, -1.0)
  themeService.setLetterSpacing(Number(newSpacing.toFixed(1)))
  currentTextStyle.value = themeService.getCurrentTextStyle()
}

// Reset to defaults
const resetToDefaults = (): void => {
  themeService.setTextStyle(DEFAULT_TEXT_STYLE)
  currentTextStyle.value = themeService.getCurrentTextStyle()
  selectedFontFamily.value = DEFAULT_TEXT_STYLE.fontFamily
}
</script>

<style scoped>
.theme-selector {
  @apply p-4;
}

.theme-card {
  @apply border-2 border-gray-200 rounded-lg p-3 cursor-pointer transition-all duration-200 hover:border-blue-300;
}

.theme-card-active {
  @apply border-blue-500 bg-blue-50;
}

.theme-preview {
  @apply rounded border mb-2 p-2 text-xs font-mono;
  height: 80px;
}

.theme-preview-dark {
  @apply bg-gray-900 text-gray-100;
}

.theme-preview-light {
  @apply bg-white text-gray-900 border-gray-300;
}

.theme-preview-header {
  @apply flex justify-between items-center mb-1;
}

.theme-preview-dots {
  @apply flex space-x-1;
}

.dot {
  @apply w-2 h-2 rounded-full;
}

.dot.red { @apply bg-red-500; }
.dot.yellow { @apply bg-yellow-500; }
.dot.green { @apply bg-green-500; }

.theme-preview-content {
  @apply space-y-1;
}

.theme-preview-line {
  @apply text-xs;
}

.theme-preview-dark .keyword { @apply text-red-400; }
.theme-preview-dark .string { @apply text-blue-300; }
.theme-preview-dark .comment { @apply text-gray-500; }
.theme-preview-dark .number { @apply text-cyan-400; }

.theme-preview-light .keyword { @apply text-red-600; }
.theme-preview-light .string { @apply text-blue-700; }
.theme-preview-light .comment { @apply text-gray-600; }
.theme-preview-light .number { @apply text-blue-600; }

.theme-info h4 {
  @apply text-sm font-medium;
}

.theme-info p {
  @apply text-xs text-gray-600;
}

.text-style-controls {
  @apply border-t pt-4;
}

.control-group {
  @apply space-y-2;
}

.control-button {
  @apply w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed;
}

.control-select {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.reset-button {
  @apply flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors;
}
</style>
