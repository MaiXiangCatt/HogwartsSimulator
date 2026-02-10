import request from '@/lib/request'

export const summarizeStory = (data: {
  messages: { role: string; content: string }[]
  api_key: string
  model: string
}) => {
  return request.post<{ summary: string }>('/api/ai/summarize', data)
}
