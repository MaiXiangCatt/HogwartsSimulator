import { useLiveQuery } from 'dexie-react-hooks'
import { useChat } from '@/hooks/useChat'
import { useSearchParams } from 'react-router'
import { db } from '@/lib/db'
import ChatArea from '@/components/chat/ChatArea'
import ChatSidebar from '@/components/chat/ChatSidebar'

const ChatPage = () => {
  const [searchParams] = useSearchParams()
  const idStr = searchParams.get('id')
  const characterId = idStr ? parseInt(idStr) : 0
  const {
    messages,
    isLoading,
    sendMessage,
    stopGenerate,
    deleteMessage,
    updateMessage,
  } = useChat(characterId)

  const characterInfo = useLiveQuery(
    () => db.characters.get(characterId),
    [characterId]
  )

  if (!characterId || !characterInfo) {
    return <div className="p-10 text-center">角色不存在</div>
  }
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      <ChatSidebar characterInfo={characterInfo} />
      <div className="mt-8 flex w-4/5 flex-col">
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          onSend={sendMessage}
          onStop={stopGenerate}
          onDelete={deleteMessage}
          onUpdate={updateMessage}
        />
      </div>
    </div>
  )
}
export default ChatPage
