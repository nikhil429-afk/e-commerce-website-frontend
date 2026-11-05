import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { ThemeProvider } from './theme/ThemeContext.tsx'
import { GOOGLE_CLIENT_ID } from './auth/googleConfig.ts'
import BASE_URL from './utils/baseapi.tsx'
import './index.css'

// Wake the API up (free hosting puts it to sleep) while the page is still loading.
fetch(`${BASE_URL}/health`, { cache: 'no-store' }).catch(() => {})

const app = (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      {GOOGLE_CLIENT_ID ? <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{app}</GoogleOAuthProvider> : app}
    </ThemeProvider>
  </StrictMode>,
)
