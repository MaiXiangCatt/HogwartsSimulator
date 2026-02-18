import { createBrowserRouter } from 'react-router'
import ChatPage from '@/pages/chat'
import LandingPage from '@/pages/landing'
import CharacterPage from '@/pages/character'
import RootLayout from '@/components/layout'

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
        element: <CharacterPage />,
      },
      {
        path: '/chat',
        element: <ChatPage />,
      },
    ],
  },
])
