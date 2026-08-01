import { RouterProvider } from 'react-router'
import { router } from './routes'
import { AppProviders } from './providers'

export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}

export default App
