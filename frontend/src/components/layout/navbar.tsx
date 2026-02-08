import { Link } from 'react-router'
import { useUserStore } from '@/store/user'
import { LogOut, User as UserIcon, Settings, Cloud } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useState } from 'react'
import SettingsDialog from './SettingsDialog'

const Navbar = () => {
  const { isAuthenticated, user, openAuthModal, logout } = useUserStore()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <nav className="bg-navbar text-navbar-foreground fixed top-0 right-0 left-0 z-40 flex h-16 items-center justify-between px-6 py-4 shadow-md transition-all">
      <Link
        to="/"
        className="font-serif text-xl font-bold tracking-tight hover:opacity-80"
      >
        霍格沃茨沉浸式模拟器
      </Link>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-1 text-sm font-semibold decoration-2 underline-offset-4 hover:underline"
        >
          <Settings size={16} />
          <span>设置</span>
        </button>

        {isAuthenticated ? (
          <>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <UserIcon size={16} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <span>{user?.username}</span>
              </TooltipContent>
            </Tooltip>
            <button
              onClick={logout}
              className="flex items-center gap-1 text-sm font-semibold decoration-2 underline-offset-4 hover:underline"
            >
              <LogOut size={16} />
              <span>退出</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="flex items-center gap-1 text-sm font-semibold decoration-2 underline-offset-4 hover:underline"
          >
            <Cloud size={16} />
            <span>云端同步</span>
          </button>
        )}
      </div>

      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </nav>
  )
}

export default Navbar
