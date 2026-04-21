import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0d1528',
              color: '#f0f4ff',
              border: '1px solid rgba(201,162,39,0.4)',
              borderRadius: '12px',
              fontFamily: 'Outfit, sans-serif'
            },
            success: { iconTheme: { primary: '#c9a227', secondary: '#070b14' } },
            error: { iconTheme: { primary: '#ff4444', secondary: '#f0f4ff' } }
          }}
        />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)
