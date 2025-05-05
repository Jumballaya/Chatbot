# Chatbot

Simple chatbot with a web interface

## Running

```bash
docker compose up -d --build
docker exec -it ollama ollama pull gemma3:4b
```

In your browser navigate to:

```
http://localhost:5173/
```

Wait for ollama and stable-diffusion to finish setting up:

```bash
docker logs ollama
docker logs image-server
```
