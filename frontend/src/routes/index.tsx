import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { RootLayout } from '@/layouts/RootLayout'
import { ROUTES } from '@/constants/routes'

// Lazy-loaded pages for optimal bundle splitting
const ExplorePage = lazy(() => import('@/features/weather/pages/ExplorePage'))
const HistoryPage = lazy(() => import('@/features/weather/pages/HistoryPage'))
const AnalyticsPage = lazy(() => import('@/features/weather/pages/AnalyticsPage'))
const SettingsPage = lazy(() => import('@/features/weather/pages/SettingsPage'))
const NotFoundPage = lazy(() => import('./NotFoundPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.EXPLORE} replace />,
      },
      {
        path: ROUTES.EXPLORE,
        element: <ExplorePage />,
      },
      {
        path: ROUTES.HISTORY,
        element: <HistoryPage />,
      },
      {
        path: ROUTES.ANALYTICS,
        element: <AnalyticsPage />,
      },
      {
        path: ROUTES.SETTINGS,
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
