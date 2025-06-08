import { AdekoFunction, FunctionCategory, FunctionFilter, IntelliSenseSuggestion } from '../types'
import { adekoFunctions, functionCategories } from '../data/adekoFunctions'

export class FunctionService {
  private functions: AdekoFunction[] = adekoFunctions
  private categories: FunctionCategory[] = functionCategories

  /**
   * Search functions based on filter criteria
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
   * Get function by name
   */
  getFunction(name: string): AdekoFunction | undefined {
    return this.functions.find(func => func.name === name)
  }

  /**
   * Get all categories
   */
  getCategories(): FunctionCategory[] {
    return this.categories
  }

  /**
   * Get functions by category
   */
  getFunctionsByCategory(categoryName: string): AdekoFunction[] {
    return this.functions.filter(func => func.category === categoryName)
  }

  /**
   * Get functions by subcategory
   */
  getFunctionsBySubcategory(categoryName: string, subcategoryName: string): AdekoFunction[] {
    return this.functions.filter(func => 
      func.category === categoryName && func.subcategory === subcategoryName
    )
  }

  /**
   * Generate IntelliSense suggestions based on current input
   */
  getIntelliSenseSuggestions(
    currentText: string, 
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
   * Format function documentation for IntelliSense
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
   * Get function signature for hover information
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
   * Get quick help text for a function
   */
  getQuickHelp(functionName: string): string | undefined {
    const func = this.getFunction(functionName)
    if (!func) return undefined

    return `${func.description}\n\nExample: ${func.example}`
  }

  /**
   * Get all function names for basic autocomplete
   */
  getAllFunctionNames(): string[] {
    return this.functions.map(func => func.name).sort()
  }

  /**
   * Get functions by complexity level
   */
  getFunctionsByComplexity(complexity: 'basic' | 'intermediate' | 'advanced'): AdekoFunction[] {
    return this.functions.filter(func => func.complexity === complexity)
  }

  /**
   * Get related functions based on tags
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
   * Calculate similarity score between two functions based on tags and category
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

// Export singleton instance
export const functionService = new FunctionService()
