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
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { secureStorage } from '@/lib/storage'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SettingsDialog = ({ open, onOpenChange }: SettingsDialogProps) => {
  const [apiKey, setApiKey] = useState(
    () => secureStorage.getItem('hogwarts_api_key') || ''
  )
  const [model, setModel] = useState(
    () => localStorage.getItem('hogwarts_model') || 'deepseek-reasoner'
  )
  const [useMultiAgent, setUseMultiAgent] = useState(
    () => localStorage.getItem('hogwarts_use_multi_agent') === 'true'
  )

  const handleSave = () => {
    secureStorage.setItem('hogwarts_api_key', apiKey)
    localStorage.setItem('hogwarts_model', model)
    localStorage.setItem('hogwarts_use_multi_agent', String(useMultiAgent))
    toast.success('设置已保存')
    onOpenChange(false)
  }

  const inputClass =
    'border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring'
  const labelClass = 'text-foreground'

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-card sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl font-bold">
            API连接设置
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label
              htmlFor="model"
              className={labelClass}
            >
              模型
            </Label>
            <Select
              value={model}
              onValueChange={setModel}
            >
              <SelectTrigger className={inputClass}>
                <SelectValue placeholder="选择模型" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="deepseek-reasoner">
                  deepseek-reasoner
                </SelectItem>
                <SelectItem value="gemini-3-pro-preview">
                  gemini-3-pro
                </SelectItem>
                <SelectItem value="gemini-2.5-pro">gemini-2.5-pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label
              htmlFor="apiKey"
              className={labelClass}
            >
              API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className={inputClass}
            />
            <p className="text-muted-foreground text-sm">
              您的 Key
              仅存储在本地浏览器中，绝不会上传到我们的服务器，请放心使用。
            </p>
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label
              htmlFor="multi-agent-mode"
              className={labelClass}
            >
              多 Agent 模式 (实验性)
            </Label>
            <Switch
              id="multi-agent-mode"
              checked={useMultiAgent}
              onCheckedChange={setUseMultiAgent}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>保存</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsDialog
