import { useEffect, useRef } from 'react'
import ChatMessage from '@/components/chat/ChatMessage'
import type { ChatLog } from '@/types/chat'

interface MessageListProps {
  messages: ChatLog[]
  onDelete?: (id: number) => void
  onUpdate?: (id: number, content: string) => void
}

const MessageList = ({ messages, onDelete, onUpdate }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      const distanceToBottom = scrollHeight - scrollTop - clientHeight
      isAtBottomRef.current = distanceToBottom < 100
    }
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current && isAtBottomRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex w-2/3 flex-col space-y-4 overflow-y-auto p-4"
    >
      {messages.map((msg, index) => (
        <ChatMessage
          key={msg.role + index}
          message={msg}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}
export default MessageList
