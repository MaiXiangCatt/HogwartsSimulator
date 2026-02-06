import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { register, login } from '@/services/auth'
import { useNavigate } from 'react-router'
import { useUserStore, type UserInfo } from '@/store/user'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: 'login' | 'register'
}

const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
})

const registerSchema = z.object({
  username: z.string().min(2, '用户名至少2个字符'),
  email: z.email('请输入有效的邮箱'),
  password: z.string().min(6, '密码至少6个字符'),
})

const LoginForm = ({
  onSwitch,
  onLogin,
}: {
  onSwitch: () => void
  onLogin: (userData: UserInfo, token: string) => void
}) => {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    const res = await login(values)
    const { user_id, username, email } = res
    if (res) {
      onLogin({ user_id, username, email }, res.token)
    } else {
      toast.error('登录出错')
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#2A1B0A]">用户名</FormLabel>
                <FormControl>
                  <Input
                    placeholder="请输入用户名"
                    {...field}
                    className="border-[#D4C5B0] bg-white text-[#2A1B0A] placeholder-[#2A1B0A]/40 focus-visible:ring-[#8B5E3C]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#2A1B0A]">密码</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="请输入密码"
                    {...field}
                    className="border-[#D4C5B0] bg-white text-[#2A1B0A] placeholder-[#2A1B0A]/40 focus-visible:ring-[#8B5E3C]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-[#2A1B0A] text-white transition-all hover:scale-[1.02] hover:bg-[#3D2810]"
          >
            登录
          </Button>
        </form>
      </Form>
      <div className="text-center text-xs text-[#2A1B0A]/60">
        <p>
          还没有账号？{' '}
          <button
            onClick={onSwitch}
            className="font-bold underline hover:text-[#2A1B0A]"
          >
            注册
          </button>
        </p>
      </div>
    </div>
  )
}

const RegisterForm = ({
  onSwitch,
  onRegister,
}: {
  onSwitch: () => void
  onRegister: () => void
}) => {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    const res = await register(values)
    if (res) {
      onRegister()
    } else {
      toast.error('注册出错')
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#2A1B0A]">用户名</FormLabel>
                <FormControl>
                  <Input
                    placeholder="请输入用户名"
                    {...field}
                    className="border-[#D4C5B0] bg-white text-[#2A1B0A] placeholder-[#2A1B0A]/40 focus-visible:ring-[#8B5E3C]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#2A1B0A]">密码</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="请输入密码"
                    {...field}
                    className="border-[#D4C5B0] bg-white text-[#2A1B0A] placeholder-[#2A1B0A]/40 focus-visible:ring-[#8B5E3C]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#2A1B0A]">邮箱</FormLabel>
                <FormControl>
                  <Input
                    placeholder="请输入邮箱"
                    {...field}
                    className="border-[#D4C5B0] bg-white text-[#2A1B0A] placeholder-[#2A1B0A]/40 focus-visible:ring-[#8B5E3C]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-[#2A1B0A] text-white transition-all hover:scale-[1.02] hover:bg-[#3D2810]"
          >
            注册
          </Button>
        </form>
      </Form>
      <div className="text-center text-xs text-[#2A1B0A]/60">
        <p>
          已经有账号了？{' '}
          <button
            onClick={onSwitch}
            className="font-bold underline hover:text-[#2A1B0A]"
          >
            登录
          </button>
        </p>
      </div>
    </div>
  )
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab)
  const navigate = useNavigate()
  const { login } = useUserStore()

  const handleLogin = (userData: UserInfo, token: string) => {
    login(userData, token)
    navigate('/character')
    onClose()
    toast.success('登录成功')
  }

  const handleRegister = () => {
    onClose()
    toast.success('注册成功')
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="overflow-hidden border border-[#D4C5B0] bg-[#FAF5EF] p-0 sm:max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>认证</DialogTitle>
        </DialogHeader>

        <div className="flex border-b border-[#D4C5B0]">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-4 text-center font-serif text-lg font-bold transition-colors ${
              activeTab === 'login'
                ? 'bg-[#FAF5EF] text-[#2A1B0A]'
                : 'bg-[#F0E6D8] text-[#2A1B0A]/60 hover:bg-[#F5EBE0]'
            }`}
          >
            登录
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-4 text-center font-serif text-lg font-bold transition-colors ${
              activeTab === 'register'
                ? 'bg-[#FAF5EF] text-[#2A1B0A]'
                : 'bg-[#F0E6D8] text-[#2A1B0A]/60 hover:bg-[#F5EBE0]'
            }`}
          >
            注册
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'login' ? (
            <LoginForm
              onSwitch={() => setActiveTab('register')}
              onLogin={handleLogin}
            />
          ) : (
            <RegisterForm
              onSwitch={() => setActiveTab('login')}
              onRegister={handleRegister}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
