import { useRef, useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { useLiveQuery } from 'dexie-react-hooks'
import { toast } from 'sonner'
import { parseAndUpdateState } from '@/lib/utils'
import type { ChatResponseData } from '@/types/chat'
import { summarizeStory } from '@/services/ai'

export function useChat(characterId: number) {
  const messages =
    useLiveQuery(
      () => db.logs.where({ character_id: characterId }).sortBy('timestamp'),
      [characterId]
    ) || []
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isSummarizingRef = useRef(false)

  // 自动总结检测
  useEffect(() => {
    const checkAndSummarize = async () => {
      if (isLoading || isSummarizingRef.current || !characterId) return

      try {
        const character = await db.characters.get(characterId)
        if (!character) return

        const lastTime = character.last_summary_timestamp || 0
        const newLogsCount = await db.logs
          .where('character_id')
          .equals(characterId)
          .filter((log) => log.timestamp > lastTime)
          .count()
        console.log('当前已积累未总结对话数:', newLogsCount)

        // 30轮对话 = 60条消息
        if (newLogsCount >= 60) {
          isSummarizingRef.current = true

          const newLogs = await db.logs
            .where('character_id')
            .equals(characterId)
            .filter((log) => log.timestamp > lastTime)
            .sortBy('timestamp')

          if (newLogs.length === 0) {
            isSummarizingRef.current = false
            return
          }

          const apiKey = localStorage.getItem('hogwarts_api_key') || ''
          const model =
            localStorage.getItem('hogwarts_model') || 'deepseek-reasoner'

          if (!apiKey) {
            isSummarizingRef.current = false
            return
          }

          const apiMessages = newLogs.map((log) => ({
            role: log.role,
            content: log.content,
          }))

          const res = await summarizeStory({
            messages: apiMessages,
            api_key: apiKey,
            model: model,
          })

          if (res && res.summary) {
            const currentSummary = character.summary || []
            await db.characters.update(characterId, {
              summary: [...currentSummary, res.summary],
              last_summary_timestamp: newLogs[newLogs.length - 1].timestamp,
            })
            toast.success('剧情已自动归档', {
              description: '系统已生成新的剧情摘要',
            })
          }
        }
      } catch (error) {
        console.error('自动总结失败:', error)
      } finally {
        isSummarizingRef.current = false
      }
    }

    checkAndSummarize()
  }, [isLoading, characterId])

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
        .limit(50)
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
              let displayContent = rawAIContent
              displayContent = displayContent.replace(
                /<state_update>[\s\S]*?<\/state_update>/g,
                ''
              )
              const openTagIndex = displayContent.indexOf('<state_update>')
              if (openTagIndex !== -1) {
                displayContent = displayContent.slice(0, openTagIndex)
              }
              if (cleanAIContent !== displayContent) {
                cleanAIContent = displayContent
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
