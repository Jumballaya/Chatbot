import { MarkdownViewer } from "../MarkdownViewer";
import { useChatStore } from "../state/chatStore";

const $main =
  "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-zinc-950 scrollbar-thumb-gray-600 scrollbar-track-gray-800 scrollbar-thumb-zinc-700";

function UserChatEntry(props: { entry: string }) {
  return (
    <article
      key={crypto.randomUUID()}
      className="prose prose-invert m-auto mt-5 mb-6 max-w-4xl w-4xl"
    >
      <div className="flex justify-end">
        <div className="rounded-md bg-indigo-500 text-white px-4 py-3 max-w-xl">
          <p className="text-sm leading-relaxed">{props.entry}</p>
        </div>
      </div>
    </article>
  );
}

function AIChatEntry(props: { entry: string }) {
  return (
    <article
      key={crypto.randomUUID()}
      className="prose prose-invert m-auto max-w-4xl w-4xl"
    >
      <div className="flex justify-end">
        <div className="rounded-md bg-gray-900 text-white px-5 pb-4 pt-6">
          <MarkdownViewer content={props.entry} />
        </div>
      </div>
    </article>
  );
}

export default function ChatHistory() {
  const responses = useChatStore((s) => s.responses);

  return (
    <main className={$main}>
      {responses.map((res) =>
        res.isUser ? (
          <UserChatEntry key={crypto.randomUUID()} entry={res.entry} />
        ) : (
          <AIChatEntry key={crypto.randomUUID()} entry={res.entry} />
        )
      )}
    </main>
  );
}
