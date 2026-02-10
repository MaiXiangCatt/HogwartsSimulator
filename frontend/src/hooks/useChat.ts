import { useRef, useState } from 'react'
import { db } from '@/lib/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { toast } from 'sonner'
import { parseAndUpdateState } from '@/lib/utils'
import type { ChatResponseData } from '@/types/chat'

export function useChat(characterId: number) {
  const messages =
    useLiveQuery(
      () => db.logs.where({ character_id: characterId }).sortBy('timestamp'),
      [characterId]
    ) || []
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = async (message: string) => {
    if (!message.trim()) {
      return
    }
    setIsLoading(true)
    try {
      const apiKey = localStorage.getItem('hogwarts_api_key')
      if (!apiKey) {
        toast.error('请先填写 API Key')
        setIsLoading(false)
        return
      }
      const character = await db.characters.get(characterId)
      if (!character) {
        toast.error('角色不存在')
        setIsLoading(false)
        return
      }
      await db.logs.add({
        character_id: characterId,
        role: 'user',
        content: message,
        timestamp: Date.now(),
      })
      const recentHistory = await db.logs
        .where({ character_id: characterId })
        .reverse()
        .limit(20)
        .toArray()
      const payloadMessages = recentHistory.reverse().map((log) => ({
        role: log.role,
        content: log.content,
      }))
      abortControllerRef.current = new AbortController()
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: payloadMessages,
          summary: character.summary,
          persona: character.persona || '',
          game_state: {
            profile: {
              name: character.name,
              gender: character.gender,
              house: character.house || '未分院',
              blood_status: character.blood_status,
              wand: character.wand,
              patronus: character.patronus,
            },
            status: character.status,
            inventory: character.inventory || {},
            spells: character.spells || {},
            relationships: character.relationships || {},
            world_log: character.world_log || [],
          },
          api_key: apiKey,
          model: localStorage.getItem('hogwarts_model') || 'deepseek-reasoner',
        }),
        signal: abortControllerRef.current.signal,
      })
      if (!response.ok || !response.body) {
        throw new Error('Network response was not ok')
      }
      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      const aiMessageId = await db.logs.add({
        character_id: characterId,
        role: 'assistant',
        content: '',
        reasoning_content: '',
        timestamp: Date.now() + 1,
      })
      let rawAIContent = ''
      let cleanAIContent = ''
      let reasoningContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const jsonStr = line.slice(5).trim()
            if (!jsonStr) {
              continue
            }
            const data = JSON.parse(jsonStr) as ChatResponseData
            const type = data.type
            const message = data.content
            if (!message) {
              continue
            }
            if (type === 'thought') {
              reasoningContent += message
              await db.logs.update(aiMessageId, {
                reasoning_content: reasoningContent,
                content: cleanAIContent,
              })
            } else {
              rawAIContent += message
              const tagIndex = rawAIContent.indexOf('<state_update>')
              if (tagIndex !== -1) {
                cleanAIContent = rawAIContent.substring(0, tagIndex)
                await db.logs.update(aiMessageId, { content: cleanAIContent })
              } else {
                cleanAIContent += message
                await db.logs.update(aiMessageId, { content: cleanAIContent })
              }
            }
          }
        }
      }
      await parseAndUpdateState(characterId, rawAIContent)
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return
      }
      console.error('Error:', error)
      toast.error(error.message || '猫头鹰迷路了...')
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const stopGenerate = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }

  const deleteMessage = async (id: number) => {
    await db.logs.delete(id)
    toast.success('消息删除成功')
  }

  const updateMessage = async (id: number, content: string) => {
    await db.logs.update(id, { content })
    toast.success('消息更新成功')
  }

  return {
    messages,
    isLoading,
    sendMessage,
    stopGenerate,
    deleteMessage,
    updateMessage,
  }
}
