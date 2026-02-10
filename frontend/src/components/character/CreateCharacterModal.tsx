import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { createCharacter } from '@/services/character'
import { toast } from 'sonner'
import { CircleHelp, ExternalLink } from 'lucide-react'

export interface CreateCharacterModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const createCharacterSchema = z.object({
  name: z.string().min(1, '请输入角色名'),
  gender: z.enum(['wizard', 'witch'], { error: '请选择性别' }),
  blood_status: z.enum(['pure_blood', 'half_blood', 'muggle_born'], {
    error: '请选择血统',
  }),
  wand: z.string().min(1, '请输入魔杖详情'),
  patronus: z.string().min(1, '请输入守护神'),
})

const CreateCharacterModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateCharacterModalProps) => {
  const form = useForm<z.infer<typeof createCharacterSchema>>({
    resolver: zodResolver(createCharacterSchema),
    defaultValues: {
      name: '',
      gender: undefined,
      blood_status: undefined,
      wand: '',
      patronus: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof createCharacterSchema>) => {
    try {
      await createCharacter(values)
      toast.success('角色创建成功')
      onClose()
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error(error)
      toast.error('创建角色失败')
    }
  }

  // Styles matching AuthModal vintage theme
  const inputClass =
    'border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring'
  const labelClass = 'text-foreground'

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="bg-card sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-bold">
            创建角色
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>角色名</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="请输入角色名"
                      {...field}
                      className={inputClass}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>性别</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={inputClass}>
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
                control={form.control}
                name="blood_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClass}>血统</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className={inputClass}>
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
            </div>

            <FormField
              control={form.control}
              name="wand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${labelClass} flex items-center gap-2`}
                  >
                    魔杖
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full"
                          type="button"
                        >
                          <CircleHelp className="h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <p className="text-muted-foreground text-sm">
                            每一根魔杖都是独一无二的。如果你不知道怎么填，建议去官网进行测试。
                          </p>
                          <a
                            href="https://www.harrypotter.com/wand"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary flex items-center text-sm hover:underline"
                          >
                            前往英文官网测试{' '}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                          <a
                            href="https://wizard-tool.com/tests/wand.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary flex items-center text-sm hover:underline"
                          >
                            前往魔法工具集中文测试{' '}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例如：10¾英寸，葡萄藤木，龙心弦，不易弯曲"
                      {...field}
                      className={inputClass}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="patronus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className={`${labelClass} flex items-center gap-2`}
                  >
                    守护神
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 rounded-full"
                          type="button"
                        >
                          <CircleHelp className="h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <p className="text-muted-foreground text-sm">
                            守护神有很多种。如果你不知道怎么填，建议去官网进行测试。
                          </p>
                          <a
                            href="https://www.harrypotter.com/patronus"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary flex items-center text-sm hover:underline"
                          >
                            前往英文官网测试{' '}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                          <a
                            href="https://wizard-tool.com/tests/shouhushen.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary flex items-center text-sm hover:underline"
                          >
                            前往魔法工具集中文测试{' '}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例如：水獭"
                      {...field}
                      className={inputClass}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6 sm:gap-0">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="border-primary text-primary hover:bg-secondary"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  创建
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateCharacterModal
