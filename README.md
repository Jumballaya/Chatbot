# Chatbot

Simple chatbot with a web interface

## Running

To start the application locally, you will need docker installed. After pulling down the code, run the following commands:

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
