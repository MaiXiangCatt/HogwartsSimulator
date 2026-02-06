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
    <div className="flex items-center gap-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeydown}
        placeholder="Type a message..."
        className="max-h-32 resize-none pr-12"
      />
      <Button
        size="icon-lg"
        variant="ghost"
        className="rounded-full"
      >
        <Send className="h-6 w-6" />
      </Button>
    </div>
  )
}

export default ChatInput
