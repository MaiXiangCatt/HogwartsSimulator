import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Character } from '@/types/character'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Save } from 'lucide-react'

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

const formSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  house: z.string(),
  gender: z.string(),
  blood_status: z.string(),
  wand: z.string(),
  patronus: z.string(),
  status: statusSchema,
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
    },
  })

  const { control, handleSubmit } = form

  const onSubmit = async (values: FormValues) => {
    if (!character.id) return

    try {
      const updates: Partial<Character> = {
        name: values.name,
        house: values.house,
        gender: values.gender,
        blood_status: values.blood_status,
        wand: values.wand,
        patronus: values.patronus,
        status: values.status,
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

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-card flex max-h-[90vh] max-w-2xl flex-col">
        <DialogHeader>
          <DialogTitle
            font-serif
            text-2xl
            font-bold
          >
            数据修正
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <Tabs
              defaultValue="basic"
              className="flex flex-1 flex-col overflow-hidden"
            >
              <TabsList className="bg-muted/80 grid w-full grid-cols-2">
                <TabsTrigger value="basic">基础信息</TabsTrigger>
                <TabsTrigger value="status">状态属性</TabsTrigger>
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
                            <Input
                              {...field}
                            />
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
