import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem('hogwarts_api_key') || ''
  )
  const [model, setModel] = useState(
    () => localStorage.getItem('hogwarts_model') || 'deepseek-reasoner'
  )

  const handleSave = () => {
    localStorage.setItem('hogwarts_api_key', apiKey)
    localStorage.setItem('hogwarts_model', model)
    toast.success('设置已保存')
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="border border-[#D4C5B0] bg-[#FAF5EF] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-bold text-[#2A1B0A]">
            API连接设置
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label
              htmlFor="model"
              className="text-[#2A1B0A]"
            >
              模型
            </Label>
            <Select
              value={model}
              onValueChange={setModel}
            >
              <SelectTrigger className="border-[#2A1B0A]/20 bg-white">
                <SelectValue placeholder="选择模型" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="deepseek-reasoner">
                  deepseek-reasoner
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label
              htmlFor="apiKey"
              className="text-[#2A1B0A]"
            >
              API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="border-[#2A1B0A]/20 bg-white"
            />
            <p className="text-sm text-[#2A1B0A]/60">
              您的 Key 仅存储在本地浏览器中，不会上传服务器，请放心使用。
            </p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            className="bg-[#2A1B0A] text-[#F5E6D3] hover:bg-[#3D2810]"
          >
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsDialog
