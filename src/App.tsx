import { ChakraProvider } from '@chakra-ui/react'
import { RouterProvider } from 'react-router-dom'
import { theme } from './theme'
import { router } from './routes'
import ReactGA from 'react-ga4'
import { useEffect } from 'react'

export const App = () => {
  useEffect(() => {
    ReactGA.send({
      url: window.location.href,
      pageLoadedTime: Date.now()
    })
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <RouterProvider router={router} />
    </ChakraProvider>
  )
}
