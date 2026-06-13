import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// @ts-ignore
import '@fontsource/geist'
import './index.css'
import App from './App'

// Initialize language before React renders to prevent flash
;(() => {
  const langRaw = localStorage.getItem('tissuepro-lang')
  const lang = langRaw ? (JSON.parse(langRaw)?.state?.lang as string) : 'id'
  document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = lang || 'id'
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
