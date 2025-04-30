import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

// const baseURL =
//   window.location.hostname === "localhost"
//     ? "http://localhost:11434"
//     : "http://ollama:11434"; // used when running inside container (optional)

// fetch(`${baseURL}/api/generate`, {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({
//     model: "gemma3:1b",
//     prompt: "why is the sky blue? give your answer in markdown",
//     stream: false,
//   }),
// })
//   .then((res) => res.json())
//   .then(console.log);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
