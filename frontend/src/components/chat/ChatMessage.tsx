import { cn } from '@/lib/utils'
import Markdown from 'react-markdown'
import type { ChatMessageType } from '@/types/chat'

export interface ChatMessageProps {
  message: ChatMessageType
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const { role, content } = message
  const isUser = role === 'user'

  return (
    <div
      className={cn(
        'markdown-body max-w-[80%] rounded-lg p-3 text-sm',
        // Flex alignment: self-end for user (right), self-start for AI (left)
        isUser
          ? 'bg-primary text-primary-foreground self-end'
          : 'bg-muted text-foreground self-start'
      )}
    >
      <Markdown>{content}</Markdown>
    </div>
  )
}

export default ChatMessage
