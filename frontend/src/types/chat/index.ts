export interface ChatMessageType {
  role: 'user' | 'ai'
  content: string
}

export interface ChatLog {
  id?: number
  character_id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}
