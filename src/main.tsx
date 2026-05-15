import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Privacy from './Privacy.tsx'

const isPrivacyRoute = window.location.pathname === '/privacy' || window.location.pathname === '/privacy/';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isPrivacyRoute ? <Privacy /> : <App />}
  </StrictMode>,
)
