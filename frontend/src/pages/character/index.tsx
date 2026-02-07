import { useState } from 'react'
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
import { deleteCharacter } from '@/services/character'
import { toast } from 'sonner'
import CreateCharacterModal from '@/components/character/CreateCharacterModal'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

const CharacterPage = () => {
  const [preDeletedId, setPreDeletedId] = useState<number | null>(null)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)

  const navigate = useNavigate()

  // 使用 LiveQuery 自动订阅数据变化
  const characters = useLiveQuery(() =>
    db.characters.orderBy('updated_at').reverse().toArray()
  )
  const isLoading = !characters
  const characterList = characters || []

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
      // LiveQuery 会自动更新，不需要手动 fetch
    } catch (error) {
      console.error('删除角色失败:', error)
    } finally {
      setPreDeletedId(null)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-foreground font-serif text-3xl font-bold">
          角色列表
        </h1>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
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
              className="bg-primary/10 h-50 w-full rounded-xl"
            />
          ))}
        {!isLoading &&
          characterList.map((char) => (
            <Card
              key={char.id}
              onClick={() => handleEnterChat(char.id!)}
              className="group border-border bg-card hover:border-ring relative cursor-pointer overflow-hidden border-2 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>{char.name}</CardTitle>
                  <span className="text-muted-foreground font-mono text-xs">
                    {char.status.current_year || 1991}
                  </span>
                </div>
                <div className="mt-1 flex gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    {char.gender === 'wizard' ? '巫师' : '女巫'}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-ring text-ring"
                  >
                    {char.blood_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground space-y-2 text-sm">
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
                  setPreDeletedId(char.id!)
                }}
                className="bg-destructive/10 text-destructive hover:bg-destructive/20 absolute right-4 bottom-4 rounded-full p-2"
              >
                <Trash2 size={14} />
              </Button>
            </Card>
          ))}
      </div>
      <AlertDialog
        open={!!preDeletedId}
        onOpenChange={(open) => !open && setPreDeletedId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              确认删除
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              此操作将永久删除该角色及其所有进度。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-primary text-primary hover:bg-muted">
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCharacter}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CreateCharacterModal
        isOpen={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
      />
    </div>
  )
}

export default CharacterPage
