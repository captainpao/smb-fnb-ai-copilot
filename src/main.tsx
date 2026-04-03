import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { FluentProvider, createLightTheme, type BrandVariants } from '@fluentui/react-components'

const brand: BrandVariants = {
  10:  '#eef4ff',
  20:  '#d5e6fd',
  30:  '#a8cdfb',
  40:  '#7ab4f9',
  50:  '#4d9bf7',
  60:  '#2082f5',
  70:  '#0473ea',
  80:  '#0362c8',
  90:  '#0251a6',
  100: '#014184',
  110: '#013062',
  120: '#022040',
  130: '#021535',
  140: '#020e28',
  150: '#01081b',
  160: '#01040e',
}

const lightTheme = createLightTheme(brand)
import { AppProvider } from './context/AppContext'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <FluentProvider theme={lightTheme}>
        <AppProvider>
          <App />
        </AppProvider>
      </FluentProvider>
    </HashRouter>
  </React.StrictMode>
)
