import type { Character } from '@/types/character'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Scroll,
  Backpack,
  Calendar,
  Users,
  Coins,
  Heart,
  MapPin,
  Zap,
  Activity,
  UserPen,
} from 'lucide-react'
import { GENDER_MAP, BLOOD_STATUS_MAP } from '@/constant'
import { useState } from 'react'
import { db } from '@/lib/db'
import { toast } from 'sonner'

interface ChatSidebarProps {
  characterInfo: Character
}

const InfoRow = ({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) => (
  <div className="my-2 flex items-center justify-between gap-4 text-sm">
    <span className="text-muted-foreground shrink-0">{label}</span>
    <span className="truncate text-right font-medium">{value}</span>
  </div>
)

const SectionTitle = ({ title }: { title: string }) => (
  <div className="text-muted-foreground mt-6 mb-2 text-xs font-bold tracking-wider uppercase">
    {title}
  </div>
)

const ChatSidebar = ({ characterInfo }: ChatSidebarProps) => {
  const { status, inventory, spells, relationships, persona, id } =
    characterInfo
  const [personaInput, setPersonaInput] = useState(persona || '')
  const [isPersonaDialogOpen, setIsPersonaDialogOpen] = useState(false)

  const handleSavePersona = async () => {
    if (!id) return
    try {
      await db.characters.update(id, { persona: personaInput })
      toast.success('人设更新成功')
      setIsPersonaDialogOpen(false)
    } catch (error) {
      toast.error('人设更新失败了...')
      console.error(error)
    }
  }

  return (
    <div className="bg-sidebar flex h-full w-1/5 flex-col overflow-auto border-r">
      <div className="border-b p-4">
        <h2 className="text-center font-serif text-xl font-bold">角色档案</h2>
      </div>

      <ScrollArea className="flex-1 px-4 py-2">
        <div className="flex flex-col pb-4">
          {/* 基本信息 */}
          <SectionTitle title="基本信息" />
          <InfoRow
            label="姓名"
            value={characterInfo.name}
          />
          <InfoRow
            label="性别"
            value={GENDER_MAP[characterInfo.gender] || characterInfo.gender}
          />
          <InfoRow
            label="学院"
            value={characterInfo.house || '暂未分院'}
          />
          <InfoRow
            label="血统"
            value={
              BLOOD_STATUS_MAP[characterInfo.blood_status] ||
              characterInfo.blood_status
            }
          />
          <InfoRow
            label="魔杖"
            value={characterInfo.wand || '暂未配备'}
          />
          <InfoRow
            label="守护神"
            value={characterInfo.patronus || '未掌握'}
          />

          {/* 人设 */}
          <div className="my-2 flex items-center justify-between gap-4">
            <span className="text-muted-foreground text-sm">角色人设</span>
            <Dialog
              open={isPersonaDialogOpen}
              onOpenChange={setIsPersonaDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2"
                  onClick={() => setPersonaInput(persona || '')}
                >
                  <UserPen size={14} />
                  <span>编辑</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>编辑角色人设</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Textarea
                    value={personaInput}
                    onChange={(e) => setPersonaInput(e.target.value)}
                    placeholder="输入角色的性格、动机、缺点甚至家庭背景等详细设定...人设不是必须的, 设定后有助于AI输出更符合您预期的剧情, 提高沉浸感。"
                    className="max-h-80 min-h-50 overflow-auto"
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsPersonaDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button onClick={handleSavePersona}>保存</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* 状态 */}
          {status && (
            <>
              <SectionTitle title="当前状态" />
              <InfoRow
                label="生命值 (HP)"
                value={
                  <div className="flex items-center gap-1 text-red-600">
                    <Heart size={14} />
                    <span>{status.hp}/100</span>
                  </div>
                }
              />
              <InfoRow
                label="魔力值 (MP)"
                value={
                  <div className="flex items-center gap-1 text-blue-600">
                    <Zap size={14} />
                    <span>
                      {status.mp}/{status.max_mp}
                    </span>
                  </div>
                }
              />
              <InfoRow
                label="行动点 (AP)"
                value={
                  <div className="flex items-center gap-1 text-green-600">
                    <Activity size={14} />
                    <span>
                      {status.ap}/{status.max_ap}
                    </span>
                  </div>
                }
              />
              <InfoRow
                label="加隆"
                value={
                  <div className="flex items-center gap-1 text-yellow-600">
                    <Coins size={14} />
                    <span>{status.gold}</span>
                  </div>
                }
              />
              <InfoRow
                label="当前时间"
                value={
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar size={14} />
                    <span>{`${status.current_year}年${status.current_month}月第${status.current_week}周`}</span>
                  </div>
                }
              />
              <InfoRow
                label="当前位置"
                value={
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin size={14} />
                    <span>{status.location || '未知'}</span>
                  </div>
                }
              />

              {/* 属性 */}
              <SectionTitle title="属性" />
              <InfoRow
                label="知识"
                value={status.knowledge}
              />
              <InfoRow
                label="体能"
                value={status.athletics}
              />
              <InfoRow
                label="魅力"
                value={status.charm}
              />
              <InfoRow
                label="道德"
                value={status.morality}
              />
              <InfoRow
                label="精神力"
                value={status.mental}
              />
            </>
          )}

          {/* 更多详情 (弹窗) */}
          <SectionTitle title="更多详情" />

          {/* 咒语 */}
          <div className="my-2 flex items-center justify-between gap-4">
            <span className="text-muted-foreground text-sm">已掌握咒语</span>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2"
                >
                  <Scroll size={14} />
                  <span>查看</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>咒语列表</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] w-full pr-4">
                  <div className="flex flex-col gap-2">
                    {spells && Object.entries(spells).length > 0 ? (
                      Object.entries(spells).map(([name, info]) => (
                        <div
                          key={name}
                          className="bg-background/50 flex flex-col gap-1 rounded-md border p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{name}</span>
                            <Badge variant="secondary">Lv.{info.level}</Badge>
                          </div>
                          {info.desc && (
                            <p className="text-muted-foreground text-xs">
                              {info.desc}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground py-8 text-center">
                        暂无已掌握的咒语
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>

          {/* 物品 */}
          <div className="my-2 flex items-center justify-between gap-4">
            <span className="text-muted-foreground text-sm">背包物品</span>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2"
                >
                  <Backpack size={14} />
                  <span>查看</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>物品清单</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] w-full pr-4">
                  <div className="flex flex-col gap-2">
                    {inventory && Object.keys(inventory).length > 0 ? (
                      Object.entries(inventory).map(([name, info]) => (
                        <div
                          key={name}
                          className="bg-background/50 flex items-center justify-between gap-4 rounded-md border p-3"
                        >
                          <span className="shrink-0 font-medium">{name}</span>
                          <span className="text-muted-foreground line-clamp-2 text-right text-xs">
                            {info.desc}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground py-8 text-center">
                        背包是空的
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>

          {/* 关系 */}
          <div className="my-2 flex items-center justify-between gap-4">
            <span className="text-muted-foreground text-sm">人际关系</span>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-2"
                >
                  <Users size={14} />
                  <span>查看</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>人际关系</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] w-full pr-4">
                  <div className="flex flex-col gap-2">
                    {relationships &&
                    Object.entries(relationships).length > 0 ? (
                      Object.entries(relationships).map(([name, info]) => (
                        <div
                          key={name}
                          className="bg-background/50 flex flex-col gap-1 rounded-md border p-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{name}</span>
                            <Badge
                              variant={
                                info.level > 0 ? 'default' : 'destructive'
                              }
                            >
                              {info.tag} (Lv.{info.level})
                            </Badge>
                          </div>
                          {info.desc && (
                            <p className="text-muted-foreground text-xs">
                              {info.desc}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground py-8 text-center">
                        暂无建立的关系
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

export default ChatSidebar
