import type { Notification } from '@/components/NotificationSystem.vue'

interface NotificationBus {
  listeners: Array<{ event: string; callback: (data: any) => void }>
  emit: (event: string, data: any) => void
  on: (event: string, callback: (data: any) => void) => void
  off: (event: string, callback: (data: any) => void) => void
}

// Global notification bus
const getNotificationBus = (): NotificationBus => {
  if (!(window as any).notificationBus) {
    ;(window as any).notificationBus = {
      listeners: [],
      emit: (event: string, data: any) => {
        ;(window as any).notificationBus.listeners.forEach((listener: any) => {
          if (listener.event === event) {
            listener.callback(data)
          }
        })
      },
      on: (event: string, callback: (data: any) => void) => {
        ;(window as any).notificationBus.listeners.push({ event, callback })
      },
      off: (event: string, callback: (data: any) => void) => {
        ;(window as any).notificationBus.listeners = (window as any).notificationBus.listeners.filter(
          (listener: any) => !(listener.event === event && listener.callback === callback)
        )
      }
    }
  }
  return (window as any).notificationBus
}

export const useNotifications = () => {
  const bus = getNotificationBus()

  const notify = (notification: Omit<Notification, 'id'>) => {
    bus.emit('notification', notification)
  }

  const success = (message: string, title?: string, details?: string) => {
    notify({
      type: 'success',
      message,
      title,
      details,
      duration: 3000
    })
  }

  const error = (message: string, title?: string, details?: string) => {
    notify({
      type: 'error',
      message,
      title,
      details,
      duration: 0, // Errors don't auto-dismiss
      dismissible: true
    })
  }

  const warning = (message: string, title?: string, details?: string) => {
    notify({
      type: 'warning',
      message,
      title,
      details,
      duration: 5000
    })
  }

  const info = (message: string, title?: string, details?: string) => {
    notify({
      type: 'info',
      message,
      title,
      details,
      duration: 4000
    })
  }

  // Specific notifications for common actions
  const fileOpened = (fileName: string) => {
    success(`File opened: ${fileName}`, 'File Operation')
  }

  const fileSaved = (fileName: string) => {
    success(`File saved: ${fileName}`, 'File Operation')
  }

  const fileCreated = (fileName: string) => {
    success(`File created: ${fileName}`, 'File Operation')
  }

  const scriptExecutionStarted = (fileName: string) => {
    info(`Executing script: ${fileName}`, 'Script Execution')
  }

  const scriptExecutionCompleted = (fileName: string, executionTime: number) => {
    success(
      `Script executed successfully`,
      'Script Execution',
      `File: ${fileName}, Time: ${executionTime}ms`
    )
  }

  const scriptExecutionFailed = (fileName: string, errorMessage: string) => {
    error(
      `Script execution failed`,
      'Script Execution Error',
      `File: ${fileName}, Error: ${errorMessage}`
    )
  }

  const luaNotAvailable = () => {
    warning(
      'Lua interpreter not found. Using JavaScript fallback.',
      'Lua Execution',
      'Install Lua for better performance and full turtle graphics support.'
    )
  }

  const debugModeEnabled = () => {
    info('Debug mode enabled', 'Debug', 'Turtle graphics and debug libraries loaded')
  }

  const functionInserted = (functionName: string) => {
    success(`Function inserted: ${functionName}`, 'Code Assistance')
  }

  const syntaxError = (errorMessage: string) => {
    error('Syntax error detected', 'Code Validation', errorMessage)
  }

  const settingsSaved = () => {
    success('Settings saved successfully', 'Configuration')
  }

  const libraryPathUpdated = (path: string) => {
    info(`Library path updated: ${path}`, 'Configuration')
  }

  return {
    // Core notification methods
    notify,
    success,
    error,
    warning,
    info,

    // Specific action notifications
    fileOpened,
    fileSaved,
    fileCreated,
    scriptExecutionStarted,
    scriptExecutionCompleted,
    scriptExecutionFailed,
    luaNotAvailable,
    debugModeEnabled,
    functionInserted,
    syntaxError,
    settingsSaved,
    libraryPathUpdated
  }
}
