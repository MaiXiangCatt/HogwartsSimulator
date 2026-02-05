import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import type { ChatMessageType } from "@/types/chat";

export interface ChatMessageProps {
  message: ChatMessageType;
}

function ChatMessage({ message }: ChatMessageProps) {
  const { role, content } = message;
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "max-w-[80%] p-3 rounded-lg text-sm markdown-body",
        // Flex alignment: self-end for user (right), self-start for AI (left)
        isUser
          ? "self-end bg-primary text-primary-foreground"
          : "self-start bg-muted text-foreground",
      )}
    >
      <Markdown>{content}</Markdown>
    </div>
  );
}

export default ChatMessage;
