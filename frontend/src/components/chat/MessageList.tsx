import { useEffect, useRef } from 'react'
import ChatMessage from '@/components/chat/ChatMessage'
import type { ChatLog } from '@/types/chat'

interface MessageListProps {
  messages: ChatLog[]
}

const MessageList = ({ messages }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div
      ref={scrollRef}
      className="flex w-2/3 flex-col space-y-4 overflow-y-auto p-4"
    >
      {messages.map((msg, index) => (
        <ChatMessage
          key={msg.role + index}
          message={msg}
        />
      ))}
    </div>
  )
}
export default MessageList
