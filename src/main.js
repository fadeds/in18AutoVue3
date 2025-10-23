import { createApp } from 'vue'
import App from './App.vue'
import { createI18n } from 'vue-i18n'
import zh from '../locales/zh-source.json'
import en from '../locales/en.json'
import router from './router'

const i18n = createI18n({
  locale: 'zh',
  messages: { zh, en },
})

createApp(App).use(i18n).use(router).mount('#app')
