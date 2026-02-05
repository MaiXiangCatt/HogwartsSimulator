import { useEffect, useRef } from "react";
import ChatMessage from "@/components/chat/ChatMessage";
import type { ChatMessageType } from "@/types/chat";

interface MessageListProps {
  messages: ChatMessageType[];
}

export function MessageList({ messages }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="w-1/2 overflow-y-auto p-4 space-y-4 flex flex-col"
    >
      {messages.map((msg, index) => (
        <ChatMessage
          key={msg.role + index}
          message={msg}
        />
      ))}
    </div>
  );
}
export default MessageList;
