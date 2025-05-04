// extract image details

import { ChatModel } from "../state/chatStore";
import { baseURL } from "./apis";
import { GenerateImageRequest } from "./generateImage";

const system = `You are a precise JSON generator for visual art prompts. For each user request, extract and generate a JSON object with the following fields:

- description: Rewrite the user's prompt into a terse, vivid, standalone image description. Remove all conversational or non-visual phrasing.
- style: Choose the closest matching value from the list: [realistic, oil painting, cartoon, sci-fi, fantasy, cyberpunk, ink sketch, watercolor].
- artist: Pick a known artist relevant to the scene, tone, or aesthetic. If none fits, return a stylistically appropriate one.
- mood: Extract the emotional or atmospheric tone of the prompt.
- colors: Infer a list of dominant colors from the scene. Use artistic judgment.
- aspect_ratio: Choose based on the implied composition, defaulting to 1:1.

Respond only with a valid JSON object.
`;

export async function extractImageDetails(
  prompt: string,
  model: ChatModel
): Promise<GenerateImageRequest> {
  try {
    const body = {
      model,
      stream: false,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      format: {
        type: "object",
        properties: {
          description: {
            type: "string",
          },
          style: {
            type: "string",
            enum: [
              "realistic",
              "oil painting",
              "cartoon",
              "sci-fi",
              "fantasy",
              "cyberpunk",
              "ink sketch",
              "watercolor",
            ],
            default: "realistic",
          },
          artist: {
            type: "string",
          },
          mood: {
            type: "string",
          },
          colors: {
            type: "array",
            items: {
              type: "string",
            },
            description: "Optional list of dominant colors",
          },
          aspect_ratio: {
            type: "string",
            enum: ["1:1", "4:3", "16:9", "2:3", "3:2"],
            default: "1:1",
          },
        },
        required: [
          "description",
          "style",
          "artist",
          "mood",
          "colors",
          "aspect_ratio",
        ],
      },
    };
    console.log(body);
    const res = await fetch(`${baseURL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log(res);

    if (!res.ok) {
      throw new Error(`Ollama response error: ${res.statusText}`);
    }
    const json = (await res.json()) as { message: { content: string } };
    return JSON.parse(json.message.content) as GenerateImageRequest;
  } catch (e) {
    console.log(e);
    throw new Error((e as Error).message);
  }
}
