// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import "./index.css";
// import App from "./App.tsx";

// createRoot(document.getElementById("root")!).render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// );


async function main() {
  const img = new Image();
  document.body.appendChild(img);

  for await (const res of generateImage("Photorealistic neon street-samurai in a futuristic Tokyo, 4k, lens-flare, atmospheric lighting, intense")) {
    const preload = new Image();
    preload.onload = () => {
        img.src = preload.src;
      };
      preload.src = res.image_url;
  }
}
main();

  
  
  
  type ImageGenerationResponse = {
    step: number; image_url: string; done?: boolean;
  };
  
  async function* generateImage(prompt: string): AsyncGenerator<ImageGenerationResponse, void, void> {
    const params = new URLSearchParams();
    params.append("prompt", prompt);
    params.append("steps", "75");
    
    const baseURL = "http://localhost:8000"
  const url = new URL(`${baseURL}/generate/stream?${params.toString()}`);
  const evt = new EventSource(url.toString());
  
  try {    
    while (true) {
      const message = await new Promise<ImageGenerationResponse>((res, rej) => {
        evt.onmessage = (e) => {
          const data: ImageGenerationResponse = JSON.parse(e.data);
          data.image_url = `http://localhost:8000${data.image_url}`;
          if (data.done) evt.close()
          res(data);
        };
        evt.onerror = err => rej(err);
      });
      yield message;
      if (message.done) break;
    }
  } finally {
    evt.close();
  }
}



