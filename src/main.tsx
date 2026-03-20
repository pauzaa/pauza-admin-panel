import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <div className="flex h-screen items-center justify-center bg-surface text-on-surface font-sans">
      <p className="text-lg">Pauza Admin Panel</p>
    </div>
  </StrictMode>,
)
