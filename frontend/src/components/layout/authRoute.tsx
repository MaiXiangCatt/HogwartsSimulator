import type { ReactNode } from 'react'
import { useNavigate } from "react-router";
import { useUserStore } from "@/store/user";
import { toast } from "sonner";

const AuthRoute = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading } = useUserStore()
  if (isLoading) return null

  if (!isAuthenticated) {
    toast.error('还未登陆, 请先登录')
    navigate('/')
    return null
  }

  return children
}

export default AuthRoute