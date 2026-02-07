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
import { createCharacter } from '@/services/character'
import { toast } from 'sonner'

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
    'border-[#D4C5B0] bg-white text-[#2A1B0A] placeholder-[#2A1B0A]/40 focus-visible:ring-[#8B5E3C]'
  const labelClass = 'text-[#2A1B0A]'

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="border border-[#D4C5B0] bg-[#FAF5EF] sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-bold text-[#2A1B0A]">
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
                        <SelectItem value="wizard">巫师 (Wizard)</SelectItem>
                        <SelectItem value="witch">女巫 (Witch)</SelectItem>
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
                        <SelectItem value="pure_blood">
                          纯血 (Pure-blood)
                        </SelectItem>
                        <SelectItem value="half_blood">
                          混血 (Half-blood)
                        </SelectItem>
                        <SelectItem value="muggle_born">
                          麻瓜 (Muggle-born)
                        </SelectItem>
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
                  <FormLabel className={labelClass}>魔杖</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例如：10¾英寸，葡萄藤木，龙心弦"
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
                  <FormLabel className={labelClass}>守护神</FormLabel>
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
                  className="border-[#2A1B0A] text-[#2A1B0A] hover:bg-[#F0E6D8]"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="bg-[#2A1B0A] text-white hover:bg-[#3D2810]"
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
