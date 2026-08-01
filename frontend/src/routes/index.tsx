import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/layouts/RootLayout'

// Lazy-loaded core dashboard & fallback
const ExplorePage = lazy(() => import('@/features/weather/pages/ExplorePage'))
const NotFoundPage = lazy(() => import('./NotFoundPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <ExplorePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
