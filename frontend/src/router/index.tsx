import { createBrowserRouter } from 'react-router'
import ChatPage from '@/pages/chat'
import LandingPage from '@/pages/landing'
import CharacterPage from '@/pages/character'
import RootLayout from '@/components/layout'
import AuthRoute from '@/components/layout/authRoute'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/character',
        element: (
          <AuthRoute>
            <CharacterPage />
          </AuthRoute>
        ),
      },
      {
        path: '/chat',
        element: (
          <AuthRoute>
            <ChatPage />
          </AuthRoute>
        ),
      },
    ],
  },
])
