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
  "flex-1 overflow-y-auto scrollbar-thin dark:scrollbar-thumb-zinc-400 dark:scrollbar-track-zinc-950 dark:scrollbar-thumb-zinc-600 dark:scrollbar-track-zinc-800 dark:scrollbar-thumb-zinc-700";

function ChatEntry(props: {
  role: ChatRole;
  content: string;
  status?: ChatStatus;
  type: ChatType;
}) {
  const bgColor =
    props.role === "user"
      ? "dark:bg-indigo-500 bg-indigo-100"
      : "dark:bg-zinc-900 bg-zinc-200";
  const width = props.role === "user" ? "max-w-md" : "w-auto max-w-5/6";
  const padding = props.role === "user" ? "px-6 py-3" : "px-8 py-6";
  const side = props.role === "user" ? "justify-end" : "justify-start";
  return (
    <article className="m-auto max-w-4xl w-4xl my-5 py-2">
      <div className={`flex ${side}`}>
        <div className={`rounded-md ${bgColor} text-white ${padding} ${width}`}>
          {props.type === "text" ? (
            <MarkdownViewer
              content={
                props.content + (props.status === "streaming" ? "▌" : "")
              }
            />
          ) : (
            <Image src={props.content} />
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
