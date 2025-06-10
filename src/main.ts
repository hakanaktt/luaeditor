import { createApp } from 'vue'
import './style.css'
import './monaco-env' // Configure Monaco Editor environment before any Monaco imports
// Import Monaco Editor CSS
import 'monaco-editor/min/vs/editor/editor.main.css'
import App from './App.vue'
import i18n from './i18n'

const app = createApp(App)
app.use(i18n)
app.mount('#app')
