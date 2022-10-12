import '@fontsource/apfel-grotezk/400.css'
import '@fontsource/apfel-grotezk/700.css'

import React from 'react'
import {initialize, pageview} from 'react-ga'
import { ChakraProvider } from '@chakra-ui/react'
import * as ReactDOM from 'react-dom/client'
import { App } from './App'
import { theme } from "./theme";

initialize('UA-40596528-1')
pageview(
    `${window.location.pathname}${window.location.search}`
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ChakraProvider theme={theme}>
            <App />
        </ChakraProvider>
    </React.StrictMode>
)
