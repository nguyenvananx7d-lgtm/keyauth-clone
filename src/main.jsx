import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div className="aurora">
      <div className="auroraOrb orb1" />
      <div className="auroraOrb orb2" />
      <div className="auroraOrb orb3" />
      <div className="auroraOrb orb4" />
    </div>
    <App />
  </StrictMode>,
)
