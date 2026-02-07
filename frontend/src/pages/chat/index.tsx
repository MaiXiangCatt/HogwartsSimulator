import { useChat } from '@/hooks/useChat'
import { useSearchParams } from 'react-router'
import ChatArea from '@/components/chat/ChatArea'

const ChatPage = () => {
  const [searchParams] = useSearchParams()
  const idStr = searchParams.get('id')
  const characterId = idStr ? parseInt(idStr) : 0
  const { messages, isLoading, sendMessage, stopGenerate } =
    useChat(characterId)
  if (!characterId) {
    return <div className="p-10 text-center">角色不存在</div>
  }
  return (
    <div className="flex h-screen w-full">
      <div className="w-1/5 bg-gray-200">我是sidebar占位</div>
      <div className="flex w-4/5 flex-col">
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          onSend={sendMessage}
          onStop={stopGenerate}
        />
      </div>
    </div>
  )
}
export default ChatPage
