import { useEffect } from 'react'
import { router } from './router'
import { RouterProvider } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from './components/ui/tooltip'
import { useUserStore } from './store/user'

const App = () => {
  const { checkAuth } = useUserStore()
  useEffect(() => {
    checkAuth()
  }, [checkAuth])
  return (
    <>
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-center"
          richColors
        />
      </TooltipProvider>
    </>
  )
}

export default App
