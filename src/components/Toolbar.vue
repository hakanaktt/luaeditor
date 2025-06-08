<template>
  <div class="h-12 bg-white border-b border-gray-200 flex items-center px-4 space-x-2">
    <!-- File Operations -->
    <button 
      @click="$emit('new-file')"
      class="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
    >
      <FileText :size="16" />
      <span>New</span>
    </button>
    
    <button 
      @click="$emit('open-file')"
      class="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
    >
      <FolderOpen :size="16" />
      <span>Open</span>
    </button>
    
    <button 
      @click="$emit('save-file')"
      class="flex items-center space-x-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
    >
      <Save :size="16" />
      <span>Save</span>
    </button>
    
    <button
      @click="$emit('save-as')"
      class="flex items-center space-x-1 px-3 py-1.5 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
    >
      <Save :size="16" />
      <span>Save As</span>
    </button>
    
    <!-- Separator -->
    <div class="w-px h-6 bg-gray-300"></div>
    
    <!-- Editor Actions -->
    <button
      @click="$emit('toggle-settings')"
      class="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 rounded hover:bg-gray-100 transition-colors"
    >
      <Settings :size="16" />
      <span>Settings</span>
    </button>
    
    <!-- Title -->
    <div class="flex-1 text-center">
      <h1 class="text-lg font-semibold text-gray-800">Lua Macro Editor</h1>
    </div>
    
    <!-- Help -->
    <button 
      @click="showHelp"
      class="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 rounded hover:bg-gray-100 transition-colors"
    >
      <HelpCircle :size="16" />
      <span>Help</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { FileText, FolderOpen, Save, Settings, HelpCircle } from 'lucide-vue-next'

// Define emits
defineEmits<{
  'new-file': []
  'open-file': []
  'save-file': []
  'save-as': []
  'toggle-settings': []
}>()

const showHelp = (): void => {
  // TODO: Implement help modal
  console.log('Help clicked')
}
</script>
