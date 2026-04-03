import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { FluentProvider, webDarkTheme } from '@fluentui/react-components'
import { AppProvider } from './context/AppContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <FluentProvider theme={webDarkTheme}>
        <AppProvider>
          <App />
        </AppProvider>
      </FluentProvider>
    </HashRouter>
  </React.StrictMode>
)
