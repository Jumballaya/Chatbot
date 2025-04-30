const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:11434"
    : "http://ollama:11434"; // used when running inside container (optional)

type LlamaResponse = {
  model: string;
  created_at: string;
  response: string;
  done: true;
  done_reason: string;
  context: number[];
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
  prompt_eval_duration: number;
  eval_count: number;
  eval_duration: number;
};

export async function sendPrompt(prompt: string): Promise<LlamaResponse> {
  const res = await fetch(`${baseURL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemma3:1b",
      prompt: prompt,
      stream: false,
    }),
  });
  return res.json();
}
