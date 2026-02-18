export interface ChatMessageType {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatLog {
  id?: number
  character_id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  reasoning_content?: string
  timestamp: number
}

export interface ChatResponseData {
  type: string
  content: string
}