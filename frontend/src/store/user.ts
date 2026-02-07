import { create } from 'zustand'
import { getUserInfo } from '@/services/auth'
import { toast } from 'sonner'

export interface UserInfo {
  user_id: number
  username: string
  email: string
}

type AuthTab = 'login' | 'register'

interface UserStore {
  // 用户信息
  user: UserInfo | null
  isAuthenticated: boolean
  isLoading: boolean
  // 登录弹窗状态
  isAuthModalOpen: boolean
  authModalTab: AuthTab

  login: (userData: UserInfo, token: string) => void
  logout: () => void
  checkAuth: () => Promise<void>

  openAuthModal: (tab?: AuthTab) => void
  closeAuthModal: () => void
  setAuthModalTab: (tab: AuthTab) => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  isAuthModalOpen: false,
  authModalTab: 'login',

  login: (userData: UserInfo, token: string) => {
    localStorage.setItem('jwtToken', token)
    set({ user: userData, isAuthenticated: true, isLoading: false })
  },
  logout: () => {
    localStorage.removeItem('jwtToken')
    set({ user: null, isAuthenticated: false })
    toast.success('已成功登出')
  },
  checkAuth: async () => {
    const token = localStorage.getItem('jwtToken')
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false })
      return
    }
    try {
      const userData = await getUserInfo()
      set({ user: userData, isAuthenticated: true, isLoading: false })
    } catch (error) {
      console.error('Error checking authentication:', error)
      set({ user: null, isAuthenticated: false, isLoading: false })
      localStorage.removeItem('jwtToken')
    }
  },

  openAuthModal: (tab = 'login') =>
    set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setAuthModalTab: (tab) => set({ authModalTab: tab }),
}))
