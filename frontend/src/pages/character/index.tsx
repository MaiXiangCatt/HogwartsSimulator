import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Wand2, Sparkle, Trash2 } from 'lucide-react'
import { getCharacterList, deleteCharacter } from '@/services/character'
import type { Character } from '@/types/character'
import { toast } from 'sonner'
import CreateCharacterModal from '@/components/character/CreateCharacterModal'

const CharacterPage = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [characterList, setCharacterList] = useState<Character[]>([])
  const [preDeletedId, setPreDeletedId] = useState<number | null>(null)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)

  const navigate = useNavigate()

  const fetchCharacterList = async () => {
    setIsLoading(true)
    try {
      const data = await getCharacterList()
      setCharacterList(data.characterList)
    } catch (error) {
      console.error('获取角色列表失败:', error)
    } finally {
      setIsLoading(false)
    }
  }
  useEffect(() => {
    fetchCharacterList()
  }, [])

  const handleEnterChat = (characterId: number) => {
    navigate(`/chat?id=${characterId}`)
  }

  const handleDeleteCharacter = async () => {
    if (!preDeletedId) {
      return
    }
    try {
      await deleteCharacter(preDeletedId)
      toast.success('删除角色成功')
      fetchCharacterList()
    } catch (error) {
      console.error('删除角色失败:', error)
    } finally {
      setPreDeletedId(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-[#2A1B0A]">
          角色列表
        </h1>
        <Button
          className="gap-2 bg-[#2A1B0A] text-[#F5E6D3] hover:bg-[#3D2810]"
          onClick={() => setIsCreateModalVisible(true)}
        >
          创建角色
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-50 w-full rounded-xl bg-[#2A1B0A]/10"
            />
          ))}
        {!isLoading &&
          characterList.map((char) => (
            <Card
              key={char.ID}
              onClick={() => handleEnterChat(char.ID)}
              className="group relative cursor-pointer overflow-hidden border-2 border-[#D4C5B0] bg-[#FAF5EF] transition-all hover:-translate-y-1 hover:border-[#8B5E3C] hover:shadow-lg"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{char.name}</CardTitle>
                  <span className="font-mono text-xs text-[#2A1B0A]/40">
                    {char.status.current_year || 1991}
                  </span>
                </div>
                <div className="mt-1 flex gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-[#E6D5BC] text-[#2A1B0A] hover:bg-[#D4C5B0]"
                  >
                    {char.gender === 'male' ? '巫师' : '女巫'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-[#8B5E3C] text-[#8B5E3C]"
                  >
                    {char.blood_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-[#2A1B0A]/70">
                  <div className="flex items-center gap-2">
                    <Wand2 size={14} />
                    <span>魔杖: {char.wand}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkle size={14} />
                    <span>守护神: {char.patronus}</span>
                  </div>
                </div>
              </CardContent>
              <Button
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  setPreDeletedId(char.ID)
                }}
                className="absolute right-4 bottom-4 rounded-full bg-red-100 p-2 text-red-600 hover:bg-red-200"
              >
                <Trash2 size={14} />
              </Button>
            </Card>
          ))}
      </div>
      <AlertDialog
        open={!!preDeletedId}
        onOpenChange={() => setPreDeletedId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定要删除该角色吗？</AlertDialogTitle>
            <AlertDialogDescription>
              删除角色将无法恢复，请谨慎操作。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCharacter}
              className="bg-red-700 hover:bg-red-800"
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateCharacterModal
        isOpen={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onSuccess={() => fetchCharacterList()}
      />
    </div>
  )
}

export default CharacterPage
