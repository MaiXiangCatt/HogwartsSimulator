import ChatInput from '@/components/chat/ChatInput'
import MessageList from '@/components/chat/MessageList'
import type { ChatLog } from '@/types/chat'

interface ChatAreaProps {
  messages: ChatLog[]
  isLoading: boolean
  onSend: (message: string) => void
  onStop?: () => void
  onDelete?: (id: number) => void
  onUpdate?: (id: number, content: string) => void
}
const ChatArea = ({
  messages,
  isLoading,
  onSend,
  onDelete,
  onUpdate,
}: ChatAreaProps) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-between">
      <MessageList
        messages={messages}
        onDelete={onDelete}
        onUpdate={onUpdate}
      />
      <div className="mt-2 mb-6 w-2/3">
        <ChatInput
          onSend={onSend}
          isDisabled={isLoading}
        />
      </div>
    </div>
  )
}

export default ChatArea
