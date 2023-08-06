import { createBrowserRouter } from 'react-router-dom'
import { Root } from './Root'
import { Cv } from './Cv'
import { ErrorRoute } from './ErrorRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorRoute />,
  },
  {
    path: '/cv',
    element: <Cv />,
  },
])
