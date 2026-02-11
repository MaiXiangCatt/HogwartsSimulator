import { useNavigate } from 'react-router'
import { Scroll, Dices, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUserStore } from '@/store/user'
import dayjs from 'dayjs'

const LandingPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useUserStore()

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
    navigate('/character')
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
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-8 py-4 text-lg font-bold shadow-lg transition-all hover:scale-105"
            >
              开始体验
            </button>
          </div>
        </div>

        {/* Scroll Indicator (Optional but nice) */}
        <div className="absolute bottom-8 animate-bounce opacity-50">
          <div className="bg-primary/30 h-12 w-0.5"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-primary/5 px-6 py-24 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Card 1 */}
            <Card className="group border-primary/10 hover:border-primary/30 hover:bg-secondary border-2 bg-transparent transition-all">
              <CardHeader>
                <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-4 inline-flex w-fit items-center justify-center rounded-full p-3 transition-colors">
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
            <Card className="group border-primary/10 hover:border-primary/30 hover:bg-secondary border-2 bg-transparent transition-all">
              <CardHeader>
                <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-4 inline-flex w-fit items-center justify-center rounded-full p-3 transition-colors">
                  <Dices size={24} />
                </div>
                <CardTitle className="font-serif text-xl font-bold">
                  本地优先
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed opacity-80">
                  采用本地优先的存储方式，从APIKey到你的角色和对话数据都存在于本地，不会上传至服务器。
                </p>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="group border-primary/10 hover:border-primary/30 hover:bg-secondary border-2 bg-transparent transition-all">
              <CardHeader>
                <div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground mb-4 inline-flex w-fit items-center justify-center rounded-full p-3 transition-colors">
                  <BookOpen size={24} />
                </div>
                <CardTitle className="font-serif text-xl font-bold">
                  高沉浸感
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed opacity-80">
                  AI担任GM，使用多Agent技术（实验性，开发中），减少AI数值计算错误，提供更高的沉浸感。
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
