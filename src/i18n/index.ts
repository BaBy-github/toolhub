import i18next from 'i18next'
import I18NextVue from 'i18next-vue'
import LanguageDetector from 'i18next-browser-languagedetector'
import zh from './locales/zh.json'
import en from './locales/en.json'

// 创建i18next实例
const i18n = i18next.createInstance()

// 初始化i18next
i18n
  .use(LanguageDetector)
  .init({
    debug: false,
    fallbackLng: 'zh',
    resources: {
      zh: {
        translation: zh
      },
      en: {
        translation: en
      }
    },
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie']
    }
  })

export { i18n, I18NextVue }