import type { AdekoFunction, FunctionCategory } from '@/types'
import { allAdekoFunctions as completeAdekoFunctions } from './adekoFunctionsComplete'

// Function categories for organization - Complete set for all 137 functions
export const functionCategories: FunctionCategory[] = [
  {
    name: 'Geometric Transformations',
    icon: '🔄',
    description: 'Functions for rotating, translating, mirroring, and scaling shapes'
  },
  {
    name: 'Point & Vector Operations',
    icon: '📐',
    description: 'Functions for point calculations, distances, angles, and vector operations'
  },
  {
    name: 'Shape Generation',
    icon: '⭕',
    description: 'Functions for creating basic and complex geometric shapes'
  },
  {
    name: 'Polyline Operations',
    icon: '📏',
    description: 'Functions for creating, modifying, and manipulating polylines and paths'
  },
  {
    name: 'Machining Operations',
    icon: '🔧',
    description: 'Functions for creating machining operations like holes, grooves, and pockets'
  },
  {
    name: 'Analysis & Testing',
    icon: '🔍',
    description: 'Functions for geometric analysis, collision detection, and validation'
  },
  {
    name: 'Utilities',
    icon: '🛠️',
    description: 'Utility functions for sorting, organizing, and data manipulation'
  }
]

// Export the complete function catalog - all 137 functions from adekoFunctionsComplete.ts
export const adekoFunctions: AdekoFunction[] = completeAdekoFunctions

// Export default as the main function array
export default adekoFunctions

