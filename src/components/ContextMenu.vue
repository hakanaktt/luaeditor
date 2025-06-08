<template>
  <div
    v-if="visible"
    ref="menuRef"
    class="fixed bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 min-w-48"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @click.stop
  >
    <template v-for="(item, index) in menuItems" :key="index">
      <div
        v-if="item.type === 'separator'"
        class="border-t border-gray-200 my-1"
      ></div>
      <button
        v-else
        @click="handleItemClick(item)"
        :disabled="item.disabled"
        class="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        :class="{ 'text-red-600': item.danger }"
      >
        <component :is="item.icon" v-if="item.icon" :size="16" />
        <span v-if="item.label">{{ item.label }}</span>
        <span v-if="item.shortcut" class="ml-auto text-xs text-gray-400">{{ item.shortcut }}</span>
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import type { Component } from 'vue'

export interface ContextMenuItem {
  id: string
  label?: string
  icon?: Component
  shortcut?: string
  disabled?: boolean
  danger?: boolean
  type?: 'item' | 'separator'
  action?: () => void
}

interface Props {
  visible: boolean
  position: { x: number; y: number }
  menuItems: ContextMenuItem[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'item-click': [itemId: string]
  'close': []
}>()

const menuRef = ref<HTMLElement>()

const handleItemClick = (item: ContextMenuItem) => {
  if (item.disabled) return
  
  if (item.action) {
    item.action()
  } else {
    emit('item-click', item.id)
  }
  
  emit('close')
}

const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    emit('close')
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

const adjustPosition = async () => {
  await nextTick()
  
  if (!menuRef.value) return
  
  const menu = menuRef.value
  const rect = menu.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  let { x, y } = props.position
  
  // Adjust horizontal position if menu would overflow
  if (x + rect.width > viewportWidth) {
    x = viewportWidth - rect.width - 10
  }
  
  // Adjust vertical position if menu would overflow
  if (y + rect.height > viewportHeight) {
    y = viewportHeight - rect.height - 10
  }
  
  // Ensure menu doesn't go off-screen
  x = Math.max(10, x)
  y = Math.max(10, y)
  
  menu.style.left = x + 'px'
  menu.style.top = y + 'px'
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeyDown)
  adjustPosition()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeyDown)
})
</script>
