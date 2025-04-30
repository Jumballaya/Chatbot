import { MarkdownViewer } from "../MarkdownViewer";
import { useChatStore } from "../state/chatStore";

const $main =
  "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-zinc-950 scrollbar-thumb-gray-600 scrollbar-track-gray-800 scrollbar-thumb-zinc-700";

export default function ChatHistory() {
  const responses = useChatStore((s) => s.responses);

  return (
    <main className={$main}>
      {responses.map((res) => (
        <article
          key={crypto.randomUUID()}
          className="prose prose-invert max-w-6xl m-auto"
        >
          <MarkdownViewer content={res} />
        </article>
      ))}
    </main>
  );
}
