export const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "http://image-server:8000"; // used when running inside container (optional)

export type GenerateImageRequest = {
  description: string;
  style: string;
  artist: string;
  mood: string;
  colors: string[];
  aspect_ratio: string;
};

type GenerateImageResponse = {
  step: number;
  image_url: string;
  done?: boolean;
};

const genPrompt = (req: GenerateImageRequest) =>
  `A(n) ${req.style} scene of ${req.description}, inspired by ${
    req.artist
  }, in a ${req.mood} tone, with dominant colors ${req.colors.join(", ")}.`;

export async function* generateImage(
  request: GenerateImageRequest
): AsyncGenerator<GenerateImageResponse, void, void> {
  const params = new URLSearchParams();
  params.append("prompt", genPrompt(request));
  params.append("steps", "75");

  const url = new URL(`${baseURL}/generate/stream?${params.toString()}`);
  const evt = new EventSource(url.toString());

  try {
    while (true) {
      const message = await new Promise<GenerateImageResponse>((res, rej) => {
        evt.onmessage = (e) => {
          const data: GenerateImageResponse = JSON.parse(e.data);
          data.image_url = `http://localhost:8000${data.image_url}`;
          if (data.done) evt.close();
          res(data);
        };
        evt.onerror = (err) => rej(err);
      });
      yield message;
      if (message.done) break;
    }
  } finally {
    evt.close();
  }
}
