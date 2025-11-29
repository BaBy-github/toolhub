import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { i18n, I18NextVue } from './i18n'
import './style.css'

;(self as any).MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'json') {
      return new Worker(new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url), { type: 'module' })
    }
    return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' })
  },
}

createApp(App).use(router).use(I18NextVue, { i18next: i18n }).mount('#app')
