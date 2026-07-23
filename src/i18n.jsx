import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const supportedLanguages = ['zh', 'en', 'fr']
const languageMeta = {
  zh: { short: '中', label: '中文', htmlLang: 'zh-CN', title: '法国研学第一组导游地图' },
  en: { short: 'EN', label: 'English', htmlLang: 'en', title: 'France Study Tour Group 1 Guide Map' },
  fr: { short: 'FR', label: 'Français', htmlLang: 'fr', title: 'Carte-guide du groupe 1 – Voyage d’étude en France' },
}

const LanguageContext = createContext(null)

function getInitialLanguage() {
  const saved = window.localStorage.getItem('paris-guide-language')
  if (supportedLanguages.includes(saved)) return saved
  const browserLanguage = navigator.language?.toLowerCase() || ''
  if (browserLanguage.startsWith('fr')) return 'fr'
  if (browserLanguage.startsWith('en')) return 'en'
  return 'zh'
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage)

  useEffect(() => {
    window.localStorage.setItem('paris-guide-language', language)
    document.documentElement.lang = languageMeta[language].htmlLang
    document.title = languageMeta[language].title
  }, [language])

  const tr = useCallback(
    (zh, en, fr) => {
      if (language === 'en') return en
      if (language === 'fr') return fr
      return zh
    },
    [language],
  )

  const value = useMemo(
    () => ({ language, setLanguage, tr, languageMeta }),
    [language, tr],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider')
  return context
}
