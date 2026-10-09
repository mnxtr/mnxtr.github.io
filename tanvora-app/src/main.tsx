import React from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/bodoni-moda/index.css'
import '@fontsource-variable/manrope/index.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/components/components.css'
import './styles/gallery.css'
import App from './app/App'

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)
