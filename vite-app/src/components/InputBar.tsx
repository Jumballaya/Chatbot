import { useState } from "react";
import TextArea from "./TextArea";
import { useChatStore } from "../state/chatStore";

export default function InputBar() {
  const [prompt, setPrompt] = useState("");
  const fetchResponse = useChatStore((s) => s.fetchResponse);
  const loading = useChatStore((s) => s.loading);

  const handleSend = () => {
    if (!prompt.trim()) return;
    fetchResponse(prompt);
    setPrompt("");
  };

  return (
    <div className="shrink-0 bg-zinc-300 dark:bg-zinc-900 p-2 w-2/3 m-auto my-4 rounded-xl">
      <div className="flex gap-3">
        <TextArea
          value={prompt}
          onChange={(value) => setPrompt(value)}
          onSubmit={handleSend}
          disabled={loading}
        />
      </div>
    </div>
  );
}
