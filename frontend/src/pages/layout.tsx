import ChatArea from '@/components/chat/ChatArea'

function Layout() {
  return (
    <div className="flex h-screen w-full">
      <div className="w-1/5 bg-gray-200">我是sidebar占位</div>
      <div className="flex w-4/5 flex-col">
        <div className="h-1/12 w-full bg-gray-300">我是header占位</div>
        <ChatArea />
      </div>
    </div>
  )
}
export default Layout
