export const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:11434"
    : "http://ollama:11434"; // used when running inside container (optional)
