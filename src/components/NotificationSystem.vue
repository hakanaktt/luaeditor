<template>
  <div class="notification-container">
    <TransitionGroup name="notification" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        :class="[
          `notification-${notification.type}`,
          { 'notification-dismissible': notification.dismissible }
        ]"
      >
        <div class="notification-icon">
          <CheckCircle v-if="notification.type === 'success'" :size="20" />
          <AlertCircle v-else-if="notification.type === 'error'" :size="20" />
          <AlertTriangle v-else-if="notification.type === 'warning'" :size="20" />
          <Info v-else :size="20" />
        </div>
        
        <div class="notification-content">
          <div class="notification-title" v-if="notification.title">
            {{ notification.title }}
          </div>
          <div class="notification-message">
            {{ notification.message }}
          </div>
          <div class="notification-details" v-if="notification.details">
            {{ notification.details }}
          </div>
        </div>
        
        <button
          v-if="notification.dismissible"
          @click="dismissNotification(notification.id)"
          class="notification-dismiss"
        >
          <X :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  details?: string
  duration?: number
  dismissible?: boolean
}

const notifications = ref<Notification[]>([])
let notificationId = 0

const addNotification = (notification: Omit<Notification, 'id'>) => {
  const id = `notification-${++notificationId}`
  const newNotification: Notification = {
    id,
    dismissible: true,
    duration: 5000,
    ...notification
  }
  
  notifications.value.push(newNotification)
  
  // Auto-dismiss after duration
  if (newNotification.duration && newNotification.duration > 0) {
    setTimeout(() => {
      dismissNotification(id)
    }, newNotification.duration)
  }
  
  return id
}

const dismissNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const clearAll = () => {
  notifications.value = []
}

// Convenience methods
const showSuccess = (message: string, title?: string, details?: string) => {
  return addNotification({ type: 'success', message, title, details })
}

const showError = (message: string, title?: string, details?: string) => {
  return addNotification({ 
    type: 'error', 
    message, 
    title, 
    details,
    duration: 0 // Errors don't auto-dismiss
  })
}

const showWarning = (message: string, title?: string, details?: string) => {
  return addNotification({ type: 'warning', message, title, details })
}

const showInfo = (message: string, title?: string, details?: string) => {
  return addNotification({ type: 'info', message, title, details })
}

// Global notification bus
let eventBus: any = null

onMounted(() => {
  // Listen for global notification events
  eventBus = (window as any).notificationBus
  if (!eventBus) {
    eventBus = {
      listeners: [],
      emit: (event: string, data: any) => {
        eventBus.listeners.forEach((listener: any) => {
          if (listener.event === event) {
            listener.callback(data)
          }
        })
      },
      on: (event: string, callback: (data: any) => void) => {
        eventBus.listeners.push({ event, callback })
      },
      off: (event: string, callback: (data: any) => void) => {
        eventBus.listeners = eventBus.listeners.filter((listener: any) => 
          !(listener.event === event && listener.callback === callback)
        )
      }
    }
    ;(window as any).notificationBus = eventBus
  }
  
  eventBus.on('notification', addNotification)
})

onUnmounted(() => {
  if (eventBus) {
    eventBus.off('notification', addNotification)
  }
})

// Expose methods for parent components
defineExpose({
  addNotification,
  dismissNotification,
  clearAll,
  showSuccess,
  showError,
  showWarning,
  showInfo
})
</script>

<style scoped>
.notification-container {
  @apply fixed top-16 right-4 z-50 space-y-2;
  max-width: 400px;
}

.notification {
  @apply flex items-start space-x-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm;
  @apply bg-white/95 border-gray-200;
}

.notification-success {
  @apply border-green-200 bg-green-50/95;
}

.notification-success .notification-icon {
  @apply text-green-600;
}

.notification-error {
  @apply border-red-200 bg-red-50/95;
}

.notification-error .notification-icon {
  @apply text-red-600;
}

.notification-warning {
  @apply border-yellow-200 bg-yellow-50/95;
}

.notification-warning .notification-icon {
  @apply text-yellow-600;
}

.notification-info {
  @apply border-blue-200 bg-blue-50/95;
}

.notification-info .notification-icon {
  @apply text-blue-600;
}

.notification-content {
  @apply flex-1 min-w-0;
}

.notification-title {
  @apply font-semibold text-sm text-gray-900 mb-1;
}

.notification-message {
  @apply text-sm text-gray-700;
}

.notification-details {
  @apply text-xs text-gray-500 mt-1;
}

.notification-dismiss {
  @apply flex-shrink-0 p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors;
}

/* Transition animations */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>
