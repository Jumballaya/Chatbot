import { useState } from "react";
import TextArea from "./TextArea";
import Button from "./Button";
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
    <div className="shrink-0 border-t border-zinc-800 bg-zinc-900 px-4 py-3 w-3/4 m-auto my-4 rounded-xl">
      <div className="flex gap-3">
        <TextArea
          value={prompt}
          onChange={(value) => setPrompt(value)}
          disabled={loading}
        />
        <div className="flex flex-col gap-2">
          <Button
            variant={loading ? "disabled" : "primary"}
            label="Send"
            onClick={handleSend}
            disabled={loading}
          />
          <Button variant="destructive" label="Clear" disabled={true} />
        </div>
      </div>
    </div>
  );
}
