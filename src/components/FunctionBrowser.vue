<template>
  <div class="function-browser">
    <!-- Search and Filter Header -->
    <div class="search-header">
      <div class="search-box">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search functions..."
          class="search-input"
          @input="onSearchChange"
        />
        <Search class="search-icon" />
      </div>
      
      <div class="filters">
        <select v-model="selectedCategory" @change="onCategoryChange" class="filter-select">
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category.name" :value="category.name">
            {{ category.icon }} {{ category.name }}
          </option>
        </select>
        
        <select v-model="selectedComplexity" @change="onFilterChange" class="filter-select">
          <option value="">All Levels</option>
          <option value="basic">Basic</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
    </div>

    <!-- Category Navigation -->
    <div v-if="!searchTerm && !selectedCategory" class="category-grid">
      <div
        v-for="category in categories"
        :key="category.name"
        class="category-card"
        @click="selectCategory(category.name)"
      >
        <div class="category-icon">{{ category.icon }}</div>
        <div class="category-name">{{ category.name }}</div>
        <div class="category-description">{{ category.description }}</div>
        <div class="function-count">
          {{ getFunctionCount(category.name) }} functions
        </div>
      </div>
    </div>

    <!-- Subcategory Navigation -->
    <div v-if="selectedCategory && !searchTerm" class="subcategory-nav">
      <button
        v-for="subcategory in getSubcategories(selectedCategory)"
        :key="subcategory.name"
        class="subcategory-btn"
        :class="{ active: selectedSubcategory === subcategory.name }"
        @click="selectedSubcategory = subcategory.name"
      >
        {{ subcategory.name }}
        <span class="count">({{ subcategory.functions.length }})</span>
      </button>
    </div>

    <!-- Function List -->
    <div class="function-list">
      <div
        v-for="func in filteredFunctions"
        :key="func.name"
        class="function-item"
        :class="{ selected: selectedFunction?.name === func.name }"
        @click="selectFunction(func)"
      >
        <div class="function-header">
          <span class="function-name">{{ func.name }}</span>
          <span class="complexity-badge" :class="func.complexity">
            {{ func.complexity }}
          </span>
        </div>
        <div class="function-description">{{ func.description }}</div>
        <div class="function-signature">
          {{ getFunctionSignature(func) }}
        </div>
        <div class="function-tags">
          <span v-for="tag in func.tags.slice(0, 3)" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- Function Details Panel -->
    <div v-if="selectedFunction" class="function-details">
      <div class="details-header">
        <h3>{{ selectedFunction.name }}</h3>
        <button class="insert-btn" @click="insertFunction">
          <Plus /> Insert Function
        </button>
      </div>
      
      <div class="details-content">
        <p class="description">{{ selectedFunction.description }}</p>
        
        <div class="parameters-section">
          <h4>Parameters</h4>
          <div v-for="param in selectedFunction.parameters" :key="param.name" class="parameter">
            <span class="param-name">{{ param.name }}</span>
            <span class="param-type">{{ param.type }}</span>
            <span v-if="param.optional" class="param-optional">optional</span>
            <p class="param-description">{{ param.description }}</p>
          </div>
        </div>

        <div class="returns-section">
          <h4>Returns</h4>
          <span class="return-type">{{ selectedFunction.returnType }}</span>
          <p class="return-description">{{ selectedFunction.returnDescription }}</p>
        </div>

        <div class="example-section">
          <h4>Example</h4>
          <pre class="code-example">{{ selectedFunction.example }}</pre>
        </div>

        <div v-if="selectedFunction.usage" class="usage-section">
          <h4>Usage</h4>
          <p>{{ selectedFunction.usage }}</p>
        </div>

        <div v-if="relatedFunctions.length > 0" class="related-section">
          <h4>Related Functions</h4>
          <div class="related-functions">
            <button
              v-for="related in relatedFunctions"
              :key="related.name"
              class="related-function"
              @click="selectFunction(related)"
            >
              {{ related.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search, Plus } from 'lucide-vue-next'
import { AdekoFunction, FunctionCategory, FunctionFilter } from '../types'
import { functionService } from '../services/functionService'

// Props
interface Props {
  onInsertFunction?: (functionCall: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  onInsertFunction: () => {}
})

// Reactive state
const searchTerm = ref('')
const selectedCategory = ref('')
const selectedSubcategory = ref('')
const selectedComplexity = ref('')
const selectedFunction = ref<AdekoFunction | null>(null)

// Data
const categories = ref<FunctionCategory[]>(functionService.getCategories())
const relatedFunctions = ref<AdekoFunction[]>([])

// Computed
const filteredFunctions = computed(() => {
  const filter: FunctionFilter = {
    searchTerm: searchTerm.value,
    category: selectedCategory.value || undefined,
    subcategory: selectedSubcategory.value || undefined,
    complexity: selectedComplexity.value as any || undefined
  }
  
  return functionService.searchFunctions(filter)
})

// Methods
const onSearchChange = () => {
  if (searchTerm.value) {
    selectedCategory.value = ''
    selectedSubcategory.value = ''
  }
}

const onCategoryChange = () => {
  selectedSubcategory.value = ''
  if (selectedCategory.value) {
    searchTerm.value = ''
  }
}

const onFilterChange = () => {
  // Trigger reactivity
}

const selectCategory = (categoryName: string) => {
  selectedCategory.value = categoryName
  searchTerm.value = ''
}

const selectFunction = (func: AdekoFunction) => {
  selectedFunction.value = func
  relatedFunctions.value = functionService.getRelatedFunctions(func.name)
}

const getFunctionCount = (categoryName: string) => {
  return functionService.getFunctionsByCategory(categoryName).length
}

const getSubcategories = (categoryName: string) => {
  const category = categories.value.find(c => c.name === categoryName)
  return category?.subcategories || []
}

const getFunctionSignature = (func: AdekoFunction) => {
  const params = func.parameters.map(p => 
    `${p.name}${p.optional ? '?' : ''}: ${p.type}`
  ).join(', ')
  return `${func.name}(${params}): ${func.returnType}`
}

const insertFunction = () => {
  if (!selectedFunction.value) return
  
  const func = selectedFunction.value
  const paramPlaceholders = func.parameters.map((p, i) => 
    `${p.name}`
  ).join(', ')
  
  const functionCall = `ADekoLib.${func.name}(${paramPlaceholders})`
  props.onInsertFunction(functionCall)
}

// Watch for function selection changes
watch(selectedFunction, (newFunc) => {
  if (newFunc) {
    relatedFunctions.value = functionService.getRelatedFunctions(newFunc.name)
  }
})
</script>

<style scoped>
.function-browser {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
  color: #d4d4d4;
}

.search-header {
  padding: 1rem;
  border-bottom: 1px solid #3e3e3e;
}

.search-box {
  position: relative;
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  background: #2d2d2d;
  border: 1px solid #3e3e3e;
  border-radius: 4px;
  color: #d4d4d4;
  font-size: 0.9rem;
}

.search-icon {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1rem;
  height: 1rem;
  color: #888;
}

.filters {
  display: flex;
  gap: 0.5rem;
}

.filter-select {
  flex: 1;
  padding: 0.5rem;
  background: #2d2d2d;
  border: 1px solid #3e3e3e;
  border-radius: 4px;
  color: #d4d4d4;
  font-size: 0.85rem;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.category-card {
  padding: 1rem;
  background: #2d2d2d;
  border: 1px solid #3e3e3e;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.category-card:hover {
  background: #3e3e3e;
  border-color: #007acc;
}

.category-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.category-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.category-description {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 0.5rem;
}

.function-count {
  font-size: 0.8rem;
  color: #007acc;
}

.subcategory-nav {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid #3e3e3e;
  overflow-x: auto;
}

.subcategory-btn {
  padding: 0.5rem 1rem;
  background: #2d2d2d;
  border: 1px solid #3e3e3e;
  border-radius: 4px;
  color: #d4d4d4;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.subcategory-btn:hover,
.subcategory-btn.active {
  background: #007acc;
  border-color: #007acc;
}

.function-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.function-item {
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: #2d2d2d;
  border: 1px solid #3e3e3e;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.function-item:hover,
.function-item.selected {
  background: #3e3e3e;
  border-color: #007acc;
}

.function-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.function-name {
  font-weight: 600;
  color: #4fc3f7;
}

.complexity-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.complexity-badge.basic { background: #4caf50; color: white; }
.complexity-badge.intermediate { background: #ff9800; color: white; }
.complexity-badge.advanced { background: #f44336; color: white; }

.function-description {
  font-size: 0.9rem;
  color: #d4d4d4;
  margin-bottom: 0.5rem;
}

.function-signature {
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 0.5rem;
}

.function-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.1rem 0.4rem;
  background: #007acc;
  border-radius: 10px;
  font-size: 0.7rem;
  color: white;
}

.function-details {
  width: 400px;
  border-left: 1px solid #3e3e3e;
  background: #252526;
  overflow-y: auto;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #3e3e3e;
}

.details-header h3 {
  margin: 0;
  color: #4fc3f7;
}

.insert-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #007acc;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
}

.insert-btn:hover {
  background: #005a9e;
}

.details-content {
  padding: 1rem;
}

.description {
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.parameters-section,
.returns-section,
.example-section,
.usage-section,
.related-section {
  margin-bottom: 1.5rem;
}

.parameters-section h4,
.returns-section h4,
.example-section h4,
.usage-section h4,
.related-section h4 {
  margin: 0 0 0.75rem 0;
  color: #4fc3f7;
  font-size: 1rem;
}

.parameter {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #1e1e1e;
  border-radius: 4px;
}

.param-name {
  font-weight: 600;
  color: #9cdcfe;
}

.param-type {
  margin-left: 0.5rem;
  color: #4ec9b0;
  font-style: italic;
}

.param-optional {
  margin-left: 0.5rem;
  color: #888;
  font-size: 0.8rem;
}

.param-description {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  color: #d4d4d4;
}

.return-type {
  color: #4ec9b0;
  font-weight: 600;
}

.return-description {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
}

.code-example {
  background: #1e1e1e;
  padding: 1rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #d4d4d4;
  overflow-x: auto;
  margin: 0;
}

.related-functions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.related-function {
  padding: 0.4rem 0.8rem;
  background: #2d2d2d;
  border: 1px solid #3e3e3e;
  border-radius: 4px;
  color: #4fc3f7;
  cursor: pointer;
  font-size: 0.85rem;
}

.related-function:hover {
  background: #3e3e3e;
  border-color: #007acc;
}

.count {
  color: #888;
  font-size: 0.8rem;
}
</style>
