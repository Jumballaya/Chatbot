# Chatbot

Simple chatbot with a web interface

## Running

#### You need to generate a Hugging Face API key

If you don't have an account, you need to sign up for one first, then create a read-only API key.

After you create your key, create a file called `.env` at the root, next to the `docker-compose.yml` file. In this file add:

```bash
HF_AUTH_TOKEN=....
```

Then run:

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
docker logs stable-diffusion
```
