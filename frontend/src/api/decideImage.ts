import { ChatModel } from "../state/chatStore";
import { baseURL } from "./apis";

const genPrompt = (
  p: string
) => `in your answers: 1.0 means a strong 100% yes and 0.0 means a strong 0% no.
answer only in a number 0.0 to 1.0 to this question: Is the following prompt asking for an image to be created?

${p}`;

export async function decideImage(
  prompt: string,
  model: ChatModel
): Promise<boolean> {
  console.log(`${baseURL}/api/generate`);

  try {
    const res = await fetch(`${baseURL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, stream: false, prompt: genPrompt(prompt) }),
    });

    console.log(res);

    if (!res.ok) {
      throw new Error(`Ollama response error: ${res.statusText}`);
    }
    const json = (await res.json()) as { response: string };
    const n = parseFloat(json.response);
    if (!isNaN(n) && n >= 0.0 && n <= 1.0) {
      console.log(`Image Decision: ${n}`);
      return n >= 0.5;
    }
    return false;
  } catch (e) {
    console.log(e);
    throw new Error((e as Error).message);
  }
}
