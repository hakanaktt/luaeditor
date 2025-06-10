import { ref, computed } from 'vue'
import type { SplitLayout, EditorGroup, EditorFile } from '@/types'

export function useEditorState() {
  const layout = ref<SplitLayout>({
    groups: [],
    splitDirection: null,
    activeGroupId: null
  })

  // Generate unique IDs
  const generateId = (prefix: string = 'id') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Get active file across all groups
  const activeFile = computed(() => {
    const activeGroup = layout.value.groups.find(g => g.id === layout.value.activeGroupId)
    if (!activeGroup || !activeGroup.activeFileId) return null
    return activeGroup.files.find(f => f.id === activeGroup.activeFileId) || null
  })

  // Get all open files across all groups
  const allFiles = computed(() => {
    const files: EditorFile[] = []
    layout.value.groups.forEach(group => {
      files.push(...group.files)
    })
    return files
  })

  // Check if any file is modified
  const hasModifiedFiles = computed(() => {
    return allFiles.value.some(file => file.isModified)
  })

  // Initialize with a default group
  const initializeEditor = () => {
    if (layout.value.groups.length === 0) {
      const defaultGroup: EditorGroup = {
        id: generateId('group'),
        activeFileId: null,
        files: []
      }
      
      layout.value = {
        groups: [defaultGroup],
        splitDirection: null,
        activeGroupId: defaultGroup.id
      }
    }
  }

  // Create a new file
  const createNewFile = (groupId?: string, content: string = '-- New Lua file\n-- Add your code here\n\n') => {
    const targetGroupId = groupId || layout.value.activeGroupId
    if (!targetGroupId) {
      initializeEditor()
      return createNewFile(layout.value.activeGroupId!, content)
    }

    const group = layout.value.groups.find(g => g.id === targetGroupId)
    if (!group) return null

    const newFile: EditorFile = {
      id: generateId('file'),
      path: '',
      name: 'Untitled',
      content,
      isModified: true,
      isUntitled: true,
      cursorLine: 1,
      cursorColumn: 1,
      scrollTop: 0,
      scrollLeft: 0
    }

    group.files.push(newFile)
    group.activeFileId = newFile.id
    layout.value.activeGroupId = targetGroupId

    return newFile
  }

  // Open an existing file
  const openFile = (filePath: string, content: string, groupId?: string) => {
    const targetGroupId = groupId || layout.value.activeGroupId
    if (!targetGroupId) {
      initializeEditor()
      return openFile(filePath, content, layout.value.activeGroupId!)
    }

    const group = layout.value.groups.find(g => g.id === targetGroupId)
    if (!group) return null

    // Check if file is already open in this group
    const existingFile = group.files.find(f => f.path === filePath)
    if (existingFile) {
      group.activeFileId = existingFile.id
      layout.value.activeGroupId = targetGroupId
      return existingFile
    }

    // Check if file is open in another group
    const fileInOtherGroup = allFiles.value.find(f => f.path === filePath)
    if (fileInOtherGroup) {
      // Clone the file to the target group
      const clonedFile: EditorFile = {
        ...fileInOtherGroup,
        id: generateId('file')
      }
      group.files.push(clonedFile)
      group.activeFileId = clonedFile.id
      layout.value.activeGroupId = targetGroupId
      return clonedFile
    }

    // Create new file
    const fileName = filePath.split(/[/\\]/).pop() || 'Unknown'
    console.log('Creating new file:', fileName, 'with content length:', content?.length || 0)
    console.log('Content preview:', content?.substring(0, 100) + '...')

    const newFile: EditorFile = {
      id: generateId('file'),
      path: filePath,
      name: fileName,
      content,
      isModified: false,
      isUntitled: false,
      cursorLine: 1,
      cursorColumn: 1,
      scrollTop: 0,
      scrollLeft: 0
    }

    group.files.push(newFile)
    group.activeFileId = newFile.id
    layout.value.activeGroupId = targetGroupId

    return newFile
  }

  // Update file content
  const updateFileContent = (groupId: string, fileId: string, content: string) => {
    const group = layout.value.groups.find(g => g.id === groupId)
    if (!group) return

    const file = group.files.find(f => f.id === fileId)
    if (!file) return

    file.content = content
    file.isModified = true
  }

  // Update cursor position
  const updateCursorPosition = (groupId: string, fileId: string, line: number, column: number) => {
    const group = layout.value.groups.find(g => g.id === groupId)
    if (!group) return

    const file = group.files.find(f => f.id === fileId)
    if (!file) return

    file.cursorLine = line
    file.cursorColumn = column
  }

  // Save file (mark as not modified)
  const saveFile = (fileId: string, newPath?: string) => {
    const file = allFiles.value.find(f => f.id === fileId)
    if (!file) return

    if (newPath) {
      file.path = newPath
      file.name = newPath.split(/[/\\]/).pop() || 'Unknown'
      file.isUntitled = false
    }

    file.isModified = false
  }

  // Close file
  const closeFile = (groupId: string, fileId: string) => {
    const group = layout.value.groups.find(g => g.id === groupId)
    if (!group) return

    const fileIndex = group.files.findIndex(f => f.id === fileId)
    if (fileIndex === -1) return

    group.files.splice(fileIndex, 1)

    // Update active file
    if (group.activeFileId === fileId) {
      if (group.files.length > 0) {
        const newIndex = Math.min(fileIndex, group.files.length - 1)
        group.activeFileId = group.files[newIndex].id
      } else {
        group.activeFileId = null
      }
    }

    // Remove empty groups (except if it's the last group)
    if (group.files.length === 0 && layout.value.groups.length > 1) {
      const groupIndex = layout.value.groups.findIndex(g => g.id === groupId)
      layout.value.groups.splice(groupIndex, 1)

      // Update active group
      if (layout.value.activeGroupId === groupId) {
        layout.value.activeGroupId = layout.value.groups[0]?.id || null
      }

      // Reset split direction if only one group remains
      if (layout.value.groups.length === 1) {
        layout.value.splitDirection = null
      }
    }
  }

  // Split editor vertically
  const splitEditor = (sourceGroupId: string) => {
    const sourceGroup = layout.value.groups.find(g => g.id === sourceGroupId)
    if (!sourceGroup || !sourceGroup.activeFileId) return

    const activeFile = sourceGroup.files.find(f => f.id === sourceGroup.activeFileId)
    if (!activeFile) return

    // Create new group with cloned active file
    const newGroup: EditorGroup = {
      id: generateId('group'),
      activeFileId: generateId('file'),
      files: [{
        ...activeFile,
        id: generateId('file')
      }]
    }

    layout.value.groups.push(newGroup)
    layout.value.splitDirection = 'vertical'
    layout.value.activeGroupId = newGroup.id

    return newGroup
  }

  // Get file by ID
  const getFileById = (fileId: string) => {
    return allFiles.value.find(f => f.id === fileId) || null
  }

  // Get group by ID
  const getGroupById = (groupId: string) => {
    return layout.value.groups.find(g => g.id === groupId) || null
  }

  return {
    layout,
    activeFile,
    allFiles,
    hasModifiedFiles,
    generateId,
    initializeEditor,
    createNewFile,
    openFile,
    updateFileContent,
    updateCursorPosition,
    saveFile,
    closeFile,
    splitEditor,
    getFileById,
    getGroupById
  }
}
