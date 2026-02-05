import { useState } from 'react'
import type { ChatMessageType } from '@/types/chat'

export function useChat() {
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const sendMessage = async (message: string) => {
    if (!message.trim()) {
      return
    }
    const newUserMessage: ChatMessageType = { role: 'user', content: message }
    setMessages((prevMessages) => [...prevMessages, newUserMessage])
    setIsLoading(true)
    try {
      const response = await fetch(
        `http://localhost:8080/api/game/chat?message=${encodeURIComponent(message)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      if (!response.ok || !response.body) {
        throw new Error('Network response was not ok')
      }
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'ai', content: '' },
      ])

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const message = line.slice(6).trim()
            setMessages((prevMessages) => {
              const lastMsg = prevMessages[prevMessages.length - 1]
              if (lastMsg && lastMsg.role === 'ai') {
                return [
                  ...prevMessages.slice(0, -1),
                  { ...lastMsg, content: lastMsg.content + message },
                ]
              }
              return prevMessages
            })
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'ai', content: '猫头鹰迷路了...' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return { messages, isLoading, sendMessage }
}
