export const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000"
    : "http://stable-diffusion:8000"; // used when running inside container (optional)

type GenerateImageResponse = {
  $mem_usage: number;
  $timings: {
    loadModel: number;
    inference: number;
  };
  image_base64: string;
};

export type GenerateImageRequest = {
  description: string;
  style: string;
  artist: string;
  mood: string;
  colors: string[];
  aspect_ratio: string;
};

const genPrompt = (req: GenerateImageRequest) =>
  `A(n) ${req.style} scene of ${req.description}, inspired by ${
    req.artist
  }, in a ${req.mood} tone, with dominant colors ${req.colors.join(", ")}.`;

export async function generateImage(
  request: GenerateImageRequest
): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000); // 10 minutes

  console.log("Generating Image...");

  try {
    const response = await fetch("http://localhost:8000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        modelInputs: {
          prompt: genPrompt(request),
          num_inference_steps: 10,
        },
        callInputs: {
          MODEL_ID: "CompVis/stable-diffusion-v1-4",
          PIPELINE: "StableDiffusionPipeline",
          SCHEDULER: "DPMSolverMultistepScheduler",
          safety_checker: false,
        },
      }),
    });

    console.log("Image generated");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: GenerateImageResponse = await response.json();
    return data.image_base64;
  } catch (err) {
    console.error("Image generation error:", err);
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
