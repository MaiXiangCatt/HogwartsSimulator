import { useNavigate } from 'react-router'
import { Scroll, Dices, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/store/user'
import dayjs from 'dayjs'

const LandingPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, openAuthModal, user } = useUserStore()

  const currentHour = dayjs().hour()
  const getGreeting = () => {
    if (currentHour >= 5 && currentHour < 11) {
      return '早上好'
    } else if (currentHour >= 11 && currentHour < 14) {
      return '中午好'
    } else if (currentHour >= 14 && currentHour < 18) {
      return '下午好'
    } else if (currentHour >= 18 && currentHour < 23) {
      return '晚上好'
    } else {
      return '夜深了'
    }
  }

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/character')
    } else {
      openAuthModal('login')
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div className="animate-in fade-in zoom-in max-w-3xl space-y-8 duration-1000">
          <h1 className="font-serif text-5xl leading-tight font-bold tracking-tight md:text-7xl">
            霍格沃茨沉浸式模拟器
          </h1>
          <p className="font-serif text-xl italic opacity-80 md:text-2xl">
            "猫头鹰已启程，你的传奇即将开始。"
          </p>
          {isAuthenticated && (
            <p>
              {getGreeting()}，{user?.username}，欢迎回家~
            </p>
          )}
          <div className="pt-8">
            <button
              onClick={handleStart}
              className="rounded-lg bg-[#2A1B0A] px-8 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#3D2810]"
            >
              开始体验
            </button>
          </div>
        </div>

        {/* Scroll Indicator (Optional but nice) */}
        <div className="absolute bottom-8 animate-bounce opacity-50">
          <div className="h-12 w-0.5 bg-[#2A1B0A]/30"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#2A1B0A]/5 px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Card 1 */}
            <Card className="group border-2 border-[#2A1B0A]/10 bg-transparent transition-all hover:border-[#2A1B0A]/30 hover:bg-[#F5E6D3]">
              <CardHeader>
                <div className="mb-4 inline-flex w-fit items-center justify-center rounded-full bg-[#2A1B0A]/10 p-3 text-[#2A1B0A] transition-colors group-hover:bg-[#2A1B0A] group-hover:text-[#F5E6D3]">
                  <Scroll size={24} />
                </div>
                <CardTitle className="font-serif text-xl font-bold">
                  高自由度
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed opacity-80">
                  极高自由度。你的选择可以引发蝴蝶效应，重写魔法史。你可以深度参与主线改写结局，也可以默默旁观，创造自己的故事。
                </p>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="group border-2 border-[#2A1B0A]/10 bg-transparent transition-all hover:border-[#2A1B0A]/30 hover:bg-[#F5E6D3]">
              <CardHeader>
                <div className="mb-4 inline-flex w-fit items-center justify-center rounded-full bg-[#2A1B0A]/10 p-3 text-[#2A1B0A] transition-colors group-hover:bg-[#2A1B0A] group-hover:text-[#F5E6D3]">
                  <Dices size={24} />
                </div>
                <CardTitle className="font-serif text-xl font-bold">
                  高真实性
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed opacity-80">
                  没有主角光环，只有严格的检定系统和逻辑性。没有上帝视角，所有信息都需要通过角色去获取，你可能会失败，也可能会死亡。
                </p>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="group border-2 border-[#2A1B0A]/10 bg-transparent transition-all hover:border-[#2A1B0A]/30 hover:bg-[#F5E6D3]">
              <CardHeader>
                <div className="mb-4 inline-flex w-fit items-center justify-center rounded-full bg-[#2A1B0A]/10 p-3 text-[#2A1B0A] transition-colors group-hover:bg-[#2A1B0A] group-hover:text-[#F5E6D3]">
                  <BookOpen size={24} />
                </div>
                <CardTitle className="font-serif text-xl font-bold">
                  高沉浸感
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed opacity-80">
                  AI担任GM，使用Multi-Agent技术，减少AI违反规则及上下文错误的可能，提供更高的沉浸感。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
