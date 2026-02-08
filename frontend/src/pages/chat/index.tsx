import { getCharacter } from '@/services/character'
import { useState, useEffect } from 'react'
import { useChat } from '@/hooks/useChat'
import { useSearchParams } from 'react-router'
import ChatArea from '@/components/chat/ChatArea'
import ChatSidebar from '@/components/chat/ChatSidebar'
import type { Character } from '@/types/character'

const ChatPage = () => {
  const [characterInfo, setCharacterInfo] = useState<Character>()
  const [searchParams] = useSearchParams()
  const idStr = searchParams.get('id')
  const characterId = idStr ? parseInt(idStr) : 0
  const { messages, isLoading, sendMessage, stopGenerate } =
    useChat(characterId)

  useEffect(() => {
    const fetchCharacterInfo = async () => {
      const char = await getCharacter(characterId)
      if (char) {
        setCharacterInfo(char)
      }
    }
    fetchCharacterInfo()
  }, [characterId])
  if (!characterId || !characterInfo) {
    return <div className="p-10 text-center">角色不存在</div>
  }
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      <ChatSidebar characterInfo={characterInfo} />
      <div className="flex w-4/5 flex-col mt-8">
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          onSend={sendMessage}
          onStop={stopGenerate}
        />
      </div>
    </div>
  )
}
export default ChatPage
