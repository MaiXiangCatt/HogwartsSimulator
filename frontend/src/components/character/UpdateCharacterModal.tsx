import { useForm, type Resolver, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type {
  Character,
  InventoryItemInfo,
  SpellInfo,
  RelationInfo,
} from '@/types/character'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { updateCharacter } from '@/services/character'
import { toast } from 'sonner'
import { Save, Plus, Trash2 } from 'lucide-react'

// --- Zod Schema ---

const statusSchema = z.object({
  hp: z.coerce.number(),
  mp: z.coerce.number(),
  max_mp: z.coerce.number(),
  gold: z.coerce.number(),
  ap: z.coerce.number(),
  max_ap: z.coerce.number(),
  knowledge: z.coerce.number(),
  athletics: z.coerce.number(),
  charm: z.coerce.number(),
  morality: z.coerce.number(),
  mental: z.coerce.number(),
  current_year: z.coerce.number(),
  current_month: z.coerce.number(),
  current_week: z.coerce.number(),
  current_weekday: z.coerce.number(),
  location: z.string(),
  game_mode: z.string(),
})

const inventoryItemSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  desc: z.string(),
})

const spellItemSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  level: z.coerce.number(),
  desc: z.string(),
})

const relationItemSchema = z.object({
  name: z.string().min(1, '名称不能为空'),
  level: z.coerce.number(),
  tag: z.string(),
  desc: z.string(),
})

const summaryItemSchema = z.object({
  content: z.string().min(1, '内容不能为空'),
})

const formSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  house: z.string(),
  gender: z.string(),
  blood_status: z.string(),
  wand: z.string(),
  patronus: z.string(),
  status: statusSchema,
  inventoryList: z.array(inventoryItemSchema),
  spellsList: z.array(spellItemSchema),
  relationshipsList: z.array(relationItemSchema),
  summaryList: z.array(summaryItemSchema),
})

type FormValues = z.infer<typeof formSchema>

interface UpdateCharacterModalProps {
  character: Character
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const STATUS_LABEL_MAP = {
  hp: '生命值',
  mp: '魔力值',
  max_mp: '最大魔力值',
  gold: '加隆',
  ap: '行动点',
  max_ap: '最大行动点',
  knowledge: '知识',
  athletics: ' 体能',
  charm: '魅力',
  morality: '道德',
  mental: '精神力',
  current_year: '当前年份',
  current_month: '当前月份',
  current_week: '当前周数',
  current_weekday: '当前星期几',
  location: '当前位置',
  game_mode: '游戏模式',
}

export default function UpdateCharacterModal({
  character,
  open,
  onOpenChange,
  onSuccess,
}: UpdateCharacterModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    values: {
      name: character.name,
      house: character.house,
      gender: character.gender,
      blood_status: character.blood_status,
      wand: character.wand,
      patronus: character.patronus,
      status: character.status,
      inventoryList: Object.entries(character.inventory || {}).map(
        ([key, value]) => ({
          name: key,
          desc: value.desc,
        })
      ),
      spellsList: Object.entries(character.spells || {}).map(
        ([key, value]) => ({
          name: key,
          level: value.level,
          desc: value.desc,
        })
      ),
      relationshipsList: Object.entries(character.relationships || {}).map(
        ([key, value]) => ({
          name: key,
          level: value.level,
          tag: value.tag,
          desc: value.desc,
        })
      ),
      summaryList: (character.summary || []).map((item) => ({
        content: item,
      })),
    },
  })

  const { control, handleSubmit } = form

  const {
    fields: inventoryFields,
    append: appendInventory,
    remove: removeInventory,
  } = useFieldArray({
    control,
    name: 'inventoryList',
  })

  const {
    fields: spellFields,
    append: appendSpell,
    remove: removeSpell,
  } = useFieldArray({
    control,
    name: 'spellsList',
  })

  const {
    fields: relationFields,
    append: appendRelation,
    remove: removeRelation,
  } = useFieldArray({
    control,
    name: 'relationshipsList',
  })

  const {
    fields: summaryFields,
    append: appendSummary,
    remove: removeSummary,
  } = useFieldArray({
    control,
    name: 'summaryList',
  })

  const onSubmit = async (values: FormValues) => {
    if (!character.id) return

    try {
      const inventory: Record<string, InventoryItemInfo> = {}
      values.inventoryList.forEach((item) => {
        inventory[item.name] = { desc: item.desc }
      })

      const spells: Record<string, SpellInfo> = {}
      values.spellsList.forEach((item) => {
        spells[item.name] = { level: item.level, desc: item.desc }
      })

      const relationships: Record<string, RelationInfo> = {}
      values.relationshipsList.forEach((item) => {
        relationships[item.name] = {
          level: item.level,
          tag: item.tag,
          desc: item.desc,
        }
      })

      const updates: Partial<Character> = {
        name: values.name,
        house: values.house,
        gender: values.gender,
        blood_status: values.blood_status,
        wand: values.wand,
        patronus: values.patronus,
        status: values.status,
        inventory,
        spells,
        relationships,
        summary: values.summaryList.map((item) => item.content),
      }

      await updateCharacter(character.id, updates)
      toast.success('角色数据已修正')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error('保存失败')
    }
  }

  const onInvalid = (errors: any) => {
    console.error('Form validation errors:', errors)
    toast.error('请检查表单填写是否完整')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-card flex max-h-[90vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-bold">
            数据修正
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <Tabs
              defaultValue="basic"
              className="flex flex-1 flex-col overflow-hidden"
            >
              <TabsList className="bg-muted/80 grid w-full grid-cols-6">
                <TabsTrigger value="basic">基础</TabsTrigger>
                <TabsTrigger value="status">状态</TabsTrigger>
                <TabsTrigger value="inventory">物品</TabsTrigger>
                <TabsTrigger value="spells">技能</TabsTrigger>
                <TabsTrigger value="relationships">关系</TabsTrigger>
                <TabsTrigger value="summary">剧情</TabsTrigger>
              </TabsList>

              <ScrollArea className="bg-muted/20 mt-2 flex-1 rounded-md border p-4">
                {/* Basic Info */}
                <TabsContent
                  value="basic"
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>姓名</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="house"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>学院</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>性别</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择性别" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent position="popper">
                              <SelectItem value="wizard">巫师</SelectItem>
                              <SelectItem value="witch">女巫</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="blood_status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>血统</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择血统" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent position="popper">
                              <SelectItem value="pure_blood">纯血</SelectItem>
                              <SelectItem value="half_blood">混血</SelectItem>
                              <SelectItem value="muggle_born">麻瓜</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="col-span-2">
                      <FormField
                        control={control}
                        name="wand"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>魔杖</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        control={control}
                        name="patronus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>守护神</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Status */}
                <TabsContent
                  value="status"
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      {(
                        ['hp', 'mp', 'max_mp', 'ap', 'max_ap', 'gold'] as const
                      ).map((key) => (
                        <FormField
                          key={key}
                          control={control}
                          name={`status.${key}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="uppercase">
                                {STATUS_LABEL_MAP[key]}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-5 gap-2">
                      {(
                        [
                          'knowledge',
                          'athletics',
                          'charm',
                          'morality',
                          'mental',
                        ] as const
                      ).map((key) => (
                        <FormField
                          key={key}
                          control={control}
                          name={`status.${key}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="capitalize">
                                {STATUS_LABEL_MAP[key]}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      {(
                        [
                          'current_year',
                          'current_month',
                          'current_week',
                          'current_weekday',
                          'location',
                          'game_mode',
                        ] as const
                      ).map((key) => (
                        <FormField
                          key={key}
                          control={control}
                          name={`status.${key}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="capitalize">
                                {STATUS_LABEL_MAP[key]}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type={
                                    ['location', 'game_mode'].includes(key)
                                      ? 'text'
                                      : 'number'
                                  }
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Inventory */}
                <TabsContent
                  value="inventory"
                  className="space-y-4"
                >
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        appendInventory({ name: '新物品', desc: '物品描述...' })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" /> 添加物品
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {inventoryFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-start gap-2"
                      >
                        <FormField
                          control={control}
                          name={`inventoryList.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="flex-2">
                              <FormControl>
                                <Input
                                  placeholder="物品名称"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`inventoryList.${index}.desc`}
                          render={({ field }) => (
                            <FormItem className="flex-3">
                              <FormControl>
                                <Input
                                  placeholder="描述"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeInventory(index)}
                        >
                          <Trash2 className="text-destructive h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Spells */}
                <TabsContent
                  value="spells"
                  className="space-y-4"
                >
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        appendSpell({
                          name: '新技能',
                          level: 1,
                          desc: '技能效果...',
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" /> 添加技能
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {spellFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex flex-col gap-2 rounded-md border p-3"
                      >
                        <div className="flex gap-2">
                          <FormField
                            control={control}
                            name={`spellsList.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    placeholder="技能名称"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name={`spellsList.${index}.level`}
                            render={({ field }) => (
                              <FormItem className="w-24">
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="等级"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSpell(index)}
                          >
                            <Trash2 className="text-destructive h-4 w-4" />
                          </Button>
                        </div>
                        <FormField
                          control={control}
                          name={`spellsList.${index}.desc`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="技能效果描述"
                                  {...field}
                                  className="h-16 resize-none"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Relationships */}
                <TabsContent
                  value="relationships"
                  className="space-y-4"
                >
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        appendRelation({
                          name: '新角色',
                          level: 0,
                          tag: '普通',
                          desc: '关系描述...',
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" /> 添加关系
                    </Button>
                  </div>
                  <div className="max-h-100 space-y-4 overflow-auto">
                    {relationFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="bg-card flex flex-col gap-2 rounded-md border p-3"
                      >
                        <div className="flex gap-2">
                          <FormField
                            control={control}
                            name={`relationshipsList.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    placeholder="角色名称"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name={`relationshipsList.${index}.level`}
                            render={({ field }) => (
                              <FormItem className="w-24">
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="好感度"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={control}
                            name={`relationshipsList.${index}.tag`}
                            render={({ field }) => (
                              <FormItem className="w-32">
                                <FormControl>
                                  <Input
                                    placeholder="标签 (如: 友善)"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRelation(index)}
                          >
                            <Trash2 className="text-destructive h-4 w-4" />
                          </Button>
                        </div>
                        <FormField
                          control={control}
                          name={`relationshipsList.${index}.desc`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="关系描述"
                                  {...field}
                                  className="h-16 resize-none"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Summary */}
                <TabsContent
                  value="summary"
                  className="space-y-4"
                >
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => appendSummary({ content: '' })}
                    >
                      <Plus className="mr-2 h-4 w-4" /> 添加总结
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {summaryFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex flex-col gap-2 rounded-md border p-3"
                      >
                        <div className="flex gap-2">
                          <FormField
                            control={control}
                            name={`summaryList.${index}.content`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Textarea
                                    placeholder="输入剧情总结..."
                                    className="min-h-[100px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSummary(index)}
                          >
                            <Trash2 className="text-destructive h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                取消
              </Button>
              <Button
                type="submit"
                className="gap-2"
              >
                <Save className="h-4 w-4" /> 保存
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
