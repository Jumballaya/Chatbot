import { useEffect, useRef } from "react";
import { MarkdownViewer } from "../MarkdownViewer";
import {
  ChatRole,
  ChatStatus,
  ChatType,
  useChatStore,
} from "../state/chatStore";
import Image from "./Image";

const $main =
  "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-zinc-950 scrollbar-thumb-gray-600 scrollbar-track-gray-800 scrollbar-thumb-zinc-700";

function ChatEntry(props: {
  role: ChatRole;
  content: string;
  status?: ChatStatus;
  type: ChatType;
}) {
  const bgColor = props.role === "user" ? "bg-indigo-500" : "bg-gray-900";
  const width = props.role === "user" ? "" : "w-full";
  const padding = props.role === "user" ? "px-6 py-3" : "px-8 py-6";
  return (
    <article className="m-auto max-w-4xl w-4xl my-5 py-2">
      <div className="flex justify-end">
        <div className={`rounded-md ${bgColor} text-white ${padding} ${width}`}>
          {props.type === "text" ? (
            <MarkdownViewer
              content={
                props.content + (props.status === "streaming" ? "▌" : "")
              }
            />
          ) : (
            <Image src={`data:image/jpeg;base64, ${props.content}`} />
          )}
        </div>
      </div>
    </article>
  );
}

export default function ChatHistory() {
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isUserNearBottom = useRef(true);

  const responses = useChatStore((s) => s.responses);

  function handleScroll() {
    const el = chatContainerRef.current;
    if (!el) return;
    const threshold = 250;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isUserNearBottom.current = distFromBottom < threshold;
  }

  useEffect(() => {
    if (isUserNearBottom.current) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      });
    }
  }, [responses]);

  return (
    <main className={$main} ref={chatContainerRef} onScroll={handleScroll}>
      {responses.map((res) => (
        <ChatEntry
          key={`${res.id}-${res.role}-${res.timestamp}`}
          role={res.role}
          content={res.content}
          status={res.status}
          type={res.type}
        />
      ))}
      <div ref={bottomRef} />
    </main>
  );
}
