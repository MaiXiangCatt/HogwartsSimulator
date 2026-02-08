import { cn } from '@/lib/utils'
import Markdown from 'react-markdown'
import type { ChatLog } from '@/types/chat'
import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Copy,
  MoreHorizontal,
  Pencil,
  Sparkle,
  Trash,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export interface ChatMessageProps {
  message: ChatLog
  onDelete?: (id: number) => void
  onUpdate?: (id: number, content: string) => void
}

const ChatMessage = ({ message, onDelete, onUpdate }: ChatMessageProps) => {
  const { role, content, reasoning_content, id } = message
  const isUser = role === 'user'
  const [isThinkingOpen, setIsThinkingOpen] = useState(false)

  // 编辑和删除状态
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [editContent, setEditContent] = useState(content)

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content)
    toast.success('复制成功')
  }
  const handleUpdate = () => {
    if (onUpdate && id) {
      onUpdate(id, editContent)
      setIsEditDialogOpen(false)
    }
  }

  const handleDelete = () => {
    if (onDelete && id) {
      onDelete(id)
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div
      className={cn(
        'group flex w-full items-start gap-2',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Actions Menu (Left side for User) */}
      {isUser && (
        <MessageActions
          isUser={isUser}
          onCopy={() => {
            handleCopy(message.content)
          }}
          onEdit={() => {
            setEditContent(content)
            setIsEditDialogOpen(true)
          }}
          onDelete={() => setIsDeleteDialogOpen(true)}
        />
      )}

      {/* Message Bubble */}
      <div
        className={cn(
          'markdown-body max-w-[80%] rounded-lg p-3 text-sm shadow-sm transition-all',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card text-card-foreground border'
        )}
      >
        {/* Reasoning Section (Only for Assistant) */}
        {!isUser && reasoning_content && (
          <div className="border-border/50 mb-3 border-b pb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsThinkingOpen(!isThinkingOpen)}
              className="text-muted-foreground hover:text-foreground h-auto w-full justify-start p-0 text-xs font-medium hover:bg-transparent"
            >
              <Sparkle className="mr-1.5 h-3.5 w-3.5" />
              <span>深度思考</span>
              {isThinkingOpen ? (
                <ChevronUp className="ml-auto h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="ml-auto h-3.5 w-3.5" />
              )}
            </Button>

            {isThinkingOpen && (
              <div className="text-muted-foreground bg-muted/30 animate-in fade-in slide-in-from-top-1 border-border/30 mt-2 rounded-md border p-2 text-xs duration-200">
                <Markdown>{reasoning_content}</Markdown>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <Markdown>{content}</Markdown>
      </div>

      {/* Actions Menu (Right side for Assistant) */}
      {!isUser && (
        <MessageActions
          isUser={isUser}
          onCopy={() => {
            handleCopy(message.content)
          }}
          onEdit={() => {
            setEditContent(content)
            setIsEditDialogOpen(true)
          }}
          onDelete={() => setIsDeleteDialogOpen(true)}
        />
      )}

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑消息</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="max-h-50 min-h-25 overflow-auto"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleUpdate}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除?</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除该消息，无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

const MessageActions = ({
  isUser,
  onEdit,
  onDelete,
  onCopy,
}: {
  isUser: boolean
  onEdit: () => void
  onDelete: () => void
  onCopy: () => void
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <MoreHorizontal className="text-muted-foreground h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side={isUser ? 'bottom' : 'right'}
      >
        <DropdownMenuItem onClick={onCopy}>
          <Copy className="mr-2 h-4 w-4" />
          <span>复制</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          <span>编辑</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash className="mr-2 h-4 w-4" />
          <span>删除</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ChatMessage
