import { Outlet } from 'react-router'
import Navbar from './navbar'
import { AuthModal } from '@/components/auth/AuthModal'
import { useUserStore } from '@/store/user'

const RootLayout = () => {
  const { isAuthModalOpen, authModalTab, closeAuthModal } = useUserStore()

  return (
    <div className="min-h-screen w-full bg-[#F5E6D3] font-sans text-[#2A1B0A] selection:bg-[#2A1B0A] selection:text-[#F5E6D3]">
      <Navbar />
      <main className="pt-20">
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