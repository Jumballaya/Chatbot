import { useState } from "react";
import TextArea from "./TextArea";
import Button from "./Button";

export default function InputBar() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="shrink-0 border-t border-zinc-800 bg-zinc-900 px-4 py-3 w-3/4 m-auto my-4 rounded-xl">
      <div className="flex gap-3">
        <TextArea onChange={(value) => setPrompt(value)} />
        <div className="flex flex-col gap-2">
          <Button variant="primary" label="Send" />
          <Button variant="destructive" label="Clear" />
        </div>
      </div>
    </div>
  );
}
