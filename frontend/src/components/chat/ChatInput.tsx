import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import { useState } from 'react'

export interface ChatInputProps {
  onSend: (message: string) => void
  isDisabled?: boolean
}
const ChatInput = ({ onSend, isDisabled }: ChatInputProps) => {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim() === '' || isDisabled) {
      return
    }
    onSend(input)
    setInput('')
  }
  const handleKeydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-3 p-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeydown}
        placeholder="Type a message..."
        className="bg-chat-input border-border focus-visible:ring-ring max-h-32 min-h-[50px] w-full resize-none rounded-xl shadow-sm focus-visible:ring-1"
      />
      <Button
        onClick={handleSend}
        disabled={isDisabled || input.trim() === ''}
        className="bg-primary text-primary-foreground hover:bg-chat-send-hover h-[50px] w-[50px] shrink-0 rounded-full shadow-md transition-colors"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  )
}

export default ChatInput
