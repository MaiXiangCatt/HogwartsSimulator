import ChatInput from '@/components/chat/ChatInput'
import MessageList from '@/components/chat/MessageList'
import { useChat } from '@/hooks/useChat'
function ChatArea() {
  const { messages, isLoading, sendMessage } = useChat()
  return (
    <div className="flex h-11/12 w-full flex-col items-center justify-between">
      <MessageList messages={messages} />
      <div className="mt-2 mb-6 w-1/2">
        <ChatInput
          onSend={sendMessage}
          isDisabled={isLoading}
        />
      </div>
    </div>
  )
}

export default ChatArea
