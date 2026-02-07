import ChatInput from '@/components/chat/ChatInput'
import MessageList from '@/components/chat/MessageList'
import type { ChatLog } from '@/types/chat'

interface ChatAreaProps {
  messages: ChatLog[]
  isLoading: boolean
  onSend: (message: string) => void
  onStop?: () => void
}
const ChatArea = ({ messages, isLoading, onSend }: ChatAreaProps) => {
  return (
    <div className="flex h-11/12 w-full flex-col items-center justify-between">
      <MessageList messages={messages} />
      <div className="mt-2 mb-6 w-1/2">
        <ChatInput
          onSend={onSend}
          isDisabled={isLoading}
        />
      </div>
    </div>
  )
}

export default ChatArea
