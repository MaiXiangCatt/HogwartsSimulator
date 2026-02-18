import { Outlet } from 'react-router'
import Navbar from './Navbar'
import { AuthModal } from '@/components/auth/AuthModal'
import { useUserStore } from '@/store/user'

const RootLayout = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal } = useUserStore()

  return (
    <div className="min-h-screen w-full font-sans">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        defaultTab={authModalTab}
      />
    </div>
  )
}

export default RootLayout
