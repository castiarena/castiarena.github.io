import '@fontsource/apfel-grotezk/400.css'
import '@fontsource/apfel-grotezk/700.css'

import React from 'react'
import ReactGA from 'react-ga4'
import { ChakraProvider } from '@chakra-ui/react'
import * as ReactDOM from 'react-dom/client'
import { App } from './App'
import { theme } from './theme'

ReactGA.initialize('G-Q75G2QZ283')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)
