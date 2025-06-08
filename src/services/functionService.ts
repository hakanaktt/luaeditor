import { AdekoFunction, FunctionCategory, FunctionFilter, IntelliSenseSuggestion } from '../types'
import { adekoFunctions, functionCategories } from '../data/adekoFunctions'

/**
 * FunctionService - Core service for managing AdekoLib function catalog and IntelliSense features
 *
 * This service provides comprehensive functionality for:
 * - Function discovery and search
 * - IntelliSense suggestions and auto-completion
 * - Function documentation and help
 * - Category-based organization
 * - Related function recommendations
 *
 * @example
 * ```typescript
 * // Search for geometric functions
 * const geometricFunctions = functionService.searchFunctions({
 *   category: 'Geometric Transformations'
 * })
 *
 * // Get IntelliSense suggestions
 * const suggestions = functionService.getIntelliSenseSuggestions(
 *   'ADekoLib.rot', 10, 'ADekoLib.rot'
 * )
 * ```
 */
export class FunctionService {
  private functions: AdekoFunction[] = adekoFunctions
  private categories: FunctionCategory[] = functionCategories

  /**
   * Search and filter functions based on multiple criteria
   *
   * Provides powerful search capabilities across the entire function catalog.
   * Supports filtering by category, subcategory, complexity, tags, and free-text search.
   *
   * @param filter - Filter criteria object
   * @param filter.category - Filter by specific category name
   * @param filter.subcategory - Filter by specific subcategory name
   * @param filter.complexity - Filter by complexity level (basic/intermediate/advanced)
   * @param filter.tags - Array of tags to match (OR logic)
   * @param filter.searchTerm - Free-text search across name, description, and parameters
   *
   * @returns Array of functions matching the filter criteria
   *
   * @example
   * ```typescript
   * // Find all basic geometric functions
   * const basicGeometric = functionService.searchFunctions({
   *   category: 'Geometric Transformations',
   *   complexity: 'basic'
   * })
   *
   * // Search for functions related to circles
   * const circleFunctions = functionService.searchFunctions({
   *   searchTerm: 'circle'
   * })
   *
   * // Find functions with specific tags
   * const machineFunctions = functionService.searchFunctions({
   *   tags: ['machining', 'cutting']
   * })
   * ```
   */
  searchFunctions(filter: FunctionFilter): AdekoFunction[] {
    return this.functions.filter(func => {
      // Category filter
      if (filter.category && func.category !== filter.category) {
        return false
      }

      // Subcategory filter
      if (filter.subcategory && func.subcategory !== filter.subcategory) {
        return false
      }

      // Complexity filter
      if (filter.complexity && func.complexity !== filter.complexity) {
        return false
      }

      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => 
          func.tags.some(funcTag => funcTag.toLowerCase().includes(tag.toLowerCase()))
        )
        if (!hasMatchingTag) {
          return false
        }
      }

      // Search term filter
      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase()
        const searchableText = [
          func.name,
          func.description,
          func.category,
          func.subcategory || '',
          ...func.tags,
          ...func.parameters.map(p => p.name + ' ' + p.description)
        ].join(' ').toLowerCase()

        if (!searchableText.includes(term)) {
          return false
        }
      }

      return true
    })
  }

  /**
   * Get a specific function by its name
   *
   * @param name - The exact function name to search for
   * @returns The function definition or undefined if not found
   *
   * @example
   * ```typescript
   * const rotateFunc = functionService.getFunction('rotate')
   * if (rotateFunc) {
   *   console.log(rotateFunc.description)
   *   console.log(rotateFunc.parameters)
   * }
   * ```
   */
  getFunction(name: string): AdekoFunction | undefined {
    return this.functions.find(func => func.name === name)
  }

  /**
   * Get all available function categories
   *
   * Returns the complete category structure including subcategories
   * and metadata for building navigation interfaces.
   *
   * @returns Array of all function categories with their subcategories
   *
   * @example
   * ```typescript
   * const categories = functionService.getCategories()
   * categories.forEach(cat => {
   *   console.log(`${cat.icon} ${cat.name}: ${cat.description}`)
   *   cat.subcategories?.forEach(sub => {
   *     console.log(`  - ${sub.name} (${sub.functions.length} functions)`)
   *   })
   * })
   * ```
   */
  getCategories(): FunctionCategory[] {
    return this.categories
  }

  /**
   * Get all functions belonging to a specific category
   *
   * @param categoryName - The name of the category to filter by
   * @returns Array of functions in the specified category
   *
   * @example
   * ```typescript
   * const shapeFunctions = functionService.getFunctionsByCategory('Shape Generation')
   * console.log(`Found ${shapeFunctions.length} shape functions`)
   * ```
   */
  getFunctionsByCategory(categoryName: string): AdekoFunction[] {
    return this.functions.filter(func => func.category === categoryName)
  }

  /**
   * Get functions belonging to a specific subcategory
   *
   * @param categoryName - The parent category name
   * @param subcategoryName - The subcategory name
   * @returns Array of functions in the specified subcategory
   *
   * @example
   * ```typescript
   * const basicShapes = functionService.getFunctionsBySubcategory(
   *   'Shape Generation',
   *   'Basic Shapes'
   * )
   * ```
   */
  getFunctionsBySubcategory(categoryName: string, subcategoryName: string): AdekoFunction[] {
    return this.functions.filter(func =>
      func.category === categoryName && func.subcategory === subcategoryName
    )
  }

  /**
   * Generate IntelliSense suggestions based on current editor input
   *
   * Analyzes the current line of code and cursor position to provide
   * contextually relevant function suggestions with rich documentation.
   *
   * @param _currentText - The full text content (unused but kept for API compatibility)
   * @param cursorPosition - Current cursor position in the line
   * @param lineText - The current line of text being edited
   * @returns Array of IntelliSense suggestions with documentation
   *
   * @example
   * ```typescript
   * // User types "ADekoLib.rot" at position 13
   * const suggestions = functionService.getIntelliSenseSuggestions(
   *   fullText, 13, "ADekoLib.rot"
   * )
   * // Returns suggestions for 'rotate' function with parameter hints
   * ```
   */
  getIntelliSenseSuggestions(
    _currentText: string,
    cursorPosition: number,
    lineText: string
  ): IntelliSenseSuggestion[] {
    const suggestions: IntelliSenseSuggestion[] = []

    // Extract the current word being typed
    const beforeCursor = lineText.substring(0, cursorPosition)
    const wordMatch = beforeCursor.match(/ADekoLib\.(\w*)$/)
    
    if (wordMatch) {
      const partialFunction = wordMatch[1].toLowerCase()
      
      // Filter functions that match the partial input
      const matchingFunctions = this.functions.filter(func =>
        func.name.toLowerCase().startsWith(partialFunction)
      )

      matchingFunctions.forEach((func, index) => {
        const parameterList = func.parameters
          .map(p => `${p.name}${p.optional ? '?' : ''}`)
          .join(', ')

        const insertText = `${func.name}(${func.parameters.map((p, i) => 
          `\${${i + 1}:${p.name}}`
        ).join(', ')})`

        suggestions.push({
          label: func.name,
          kind: 'function',
          detail: `${func.name}(${parameterList}) → ${func.returnType}`,
          documentation: this.formatDocumentation(func),
          insertText,
          filterText: func.name,
          sortText: String(index).padStart(3, '0') + func.name
        })
      })
    }

    return suggestions
  }

  /**
   * Format comprehensive function documentation for IntelliSense display
   *
   * Creates rich markdown documentation including function signature,
   * parameter details, return information, examples, and related functions.
   *
   * @param func - The function to format documentation for
   * @returns Formatted markdown documentation string
   *
   * @private
   * @example
   * ```typescript
   * const doc = this.formatDocumentation(rotateFunction)
   * // Returns formatted markdown with parameters, examples, etc.
   * ```
   */
  private formatDocumentation(func: AdekoFunction): string {
    let doc = `**${func.name}**\n\n${func.description}\n\n`
    
    if (func.parameters.length > 0) {
      doc += '**Parameters:**\n'
      func.parameters.forEach(param => {
        const optional = param.optional ? ' (optional)' : ''
        const defaultVal = param.defaultValue !== undefined ? ` = ${param.defaultValue}` : ''
        doc += `- \`${param.name}\` (${param.type}${defaultVal})${optional}: ${param.description}\n`
      })
      doc += '\n'
    }

    doc += `**Returns:** ${func.returnType} - ${func.returnDescription}\n\n`
    
    if (func.example) {
      doc += `**Example:**\n\`\`\`lua\n${func.example}\n\`\`\`\n\n`
    }

    if (func.usage) {
      doc += `**Usage:** ${func.usage}\n\n`
    }

    if (func.tags.length > 0) {
      doc += `**Tags:** ${func.tags.join(', ')}\n\n`
    }

    if (func.seeAlso && func.seeAlso.length > 0) {
      doc += `**See also:** ${func.seeAlso.join(', ')}`
    }

    return doc
  }

  /**
   * Get formatted function signature for hover tooltips and documentation
   *
   * Creates a properly formatted function signature showing parameter types
   * and return type, suitable for display in hover tooltips.
   *
   * @param functionName - Name of the function to get signature for
   * @returns Formatted function signature or undefined if function not found
   *
   * @example
   * ```typescript
   * const signature = functionService.getFunctionSignature('rotate')
   * // Returns: "ADekoLib.rotate(polygon: table, reference: table, theta: number): table"
   * ```
   */
  getFunctionSignature(functionName: string): string | undefined {
    const func = this.getFunction(functionName)
    if (!func) return undefined

    const params = func.parameters
      .map(p => `${p.name}: ${p.type}${p.optional ? '?' : ''}`)
      .join(', ')

    return `ADekoLib.${func.name}(${params}): ${func.returnType}`
  }

  /**
   * Get concise help text for quick reference
   *
   * Provides a brief description and example for quick tooltips
   * and inline help displays.
   *
   * @param functionName - Name of the function to get help for
   * @returns Quick help text or undefined if function not found
   *
   * @example
   * ```typescript
   * const help = functionService.getQuickHelp('circle')
   * // Returns: "Creates a circle using bulge values...\n\nExample: ADekoLib.circle({50, 50}, 25)"
   * ```
   */
  getQuickHelp(functionName: string): string | undefined {
    const func = this.getFunction(functionName)
    if (!func) return undefined

    return `${func.description}\n\nExample: ${func.example}`
  }

  /**
   * Get alphabetically sorted list of all function names
   *
   * Useful for basic autocomplete implementations and function listings.
   *
   * @returns Sorted array of all function names
   *
   * @example
   * ```typescript
   * const allFunctions = functionService.getAllFunctionNames()
   * console.log(`Total functions: ${allFunctions.length}`)
   * ```
   */
  getAllFunctionNames(): string[] {
    return this.functions.map(func => func.name).sort()
  }

  /**
   * Filter functions by complexity level
   *
   * Helps users find functions appropriate for their skill level.
   *
   * @param complexity - The complexity level to filter by
   * @returns Array of functions matching the complexity level
   *
   * @example
   * ```typescript
   * const beginnerFunctions = functionService.getFunctionsByComplexity('basic')
   * const advancedFunctions = functionService.getFunctionsByComplexity('advanced')
   * ```
   */
  getFunctionsByComplexity(complexity: 'basic' | 'intermediate' | 'advanced'): AdekoFunction[] {
    return this.functions.filter(func => func.complexity === complexity)
  }

  /**
   * Get functions related to a given function based on similarity analysis
   *
   * Uses multiple factors to determine function similarity:
   * - Same category/subcategory (higher weight)
   * - Common tags (medium weight)
   * - Explicit "see also" references (highest weight)
   *
   * @param functionName - Name of the function to find related functions for
   * @param limit - Maximum number of related functions to return (default: 5)
   * @returns Array of related functions sorted by relevance score
   *
   * @example
   * ```typescript
   * const related = functionService.getRelatedFunctions('rotate', 3)
   * // Returns functions like 'translate', 'mirror', etc.
   *
   * related.forEach(func => {
   *   console.log(`Related: ${func.name} - ${func.description}`)
   * })
   * ```
   */
  getRelatedFunctions(functionName: string, limit: number = 5): AdekoFunction[] {
    const func = this.getFunction(functionName)
    if (!func) return []

    const related = this.functions
      .filter(f => f.name !== functionName)
      .map(f => ({
        function: f,
        score: this.calculateSimilarityScore(func, f)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.function)

    return related
  }

  /**
   * Calculate similarity score between two functions
   *
   * Scoring algorithm:
   * - Same category: +3 points
   * - Same subcategory: +2 points
   * - Each common tag: +1 point
   * - Explicit "see also" reference: +5 points
   *
   * @param func1 - First function to compare
   * @param func2 - Second function to compare
   * @returns Numerical similarity score (higher = more similar)
   *
   * @private
   * @example
   * ```typescript
   * const score = this.calculateSimilarityScore(rotateFunc, translateFunc)
   * // Returns score based on shared category, tags, etc.
   * ```
   */
  private calculateSimilarityScore(func1: AdekoFunction, func2: AdekoFunction): number {
    let score = 0

    // Same category
    if (func1.category === func2.category) score += 3

    // Same subcategory
    if (func1.subcategory === func2.subcategory) score += 2

    // Common tags
    const commonTags = func1.tags.filter(tag => func2.tags.includes(tag))
    score += commonTags.length

    // See also references
    if (func1.seeAlso?.includes(func2.name) || func2.seeAlso?.includes(func1.name)) {
      score += 5
    }

    return score
  }
}

/**
 * Singleton instance of FunctionService
 *
 * Pre-configured service instance ready for use throughout the application.
 * Provides access to all AdekoLib functions and IntelliSense capabilities.
 *
 * @example
 * ```typescript
 * import { functionService } from './services/functionService'
 *
 * // Search for functions
 * const results = functionService.searchFunctions({ searchTerm: 'circle' })
 *
 * // Get IntelliSense suggestions
 * const suggestions = functionService.getIntelliSenseSuggestions(text, pos, line)
 *
 * // Get function documentation
 * const func = functionService.getFunction('rotate')
 * ```
 */
export const functionService = new FunctionService()
