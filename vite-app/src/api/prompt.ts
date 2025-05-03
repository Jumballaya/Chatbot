import { ChatRole } from "../state/chatStore";

const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:11434"
    : "http://ollama:11434"; // used when running inside container (optional)

export async function* initiatePrompt(
  messages: Array<{ role: ChatRole; content: string }>,
  model = "gemma3:1b"
): AsyncGenerator<string, string, void> {
  const res = await fetch(`${baseURL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, stream: true, messages }),
  });

  if (!res.ok) {
    throw new Error(`Ollama response error: ${res.statusText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("ReadableStream not available in response body");
  }

  const decoder = new TextDecoder();
  let fullContent = "";

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    let buffer = decoder.decode(value, { stream: true });
    buffer = buffer.split("\n")[0];

    const lines = buffer.trim().replaceAll(`}{`, `}%"%{`).split('%"%');
    for (const line of lines) {
      try {
        const json = JSON.parse(line.trim());
        if (json.done) continue;
        fullContent += json.message?.content || "";
        yield fullContent;
      } catch (err) {
        console.warn(
          `Failed to parse streamed JSON: ${line.trim()}`,
          `Error: ${err}`
        );
        break;
      }
    }
  }

  return fullContent;
}
