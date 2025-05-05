from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
from server.pipeline import pipe, decode_latents
import asyncio, torch, json, uuid, os, glob

router = APIRouter()

@router.get("/generate/stream")
async def generate_stream(prompt: str, steps: int = 25):
    print(prompt, steps)

    guidance_scale = 15.5
    every_n_steps = 5
    id = uuid.uuid4().hex[:8]

    text_input = pipe.tokenizer(prompt, padding="max_length", truncation=True, max_length=pipe.tokenizer.model_max_length, return_tensors="pt")
    text_embeddings = pipe.text_encoder(text_input.input_ids.to(pipe.device))[0]
    uncond_input = pipe.tokenizer([""], padding="max_length", truncation=True, max_length=text_input.input_ids.shape[-1], return_tensors="pt")
    uncond_embeddings = pipe.text_encoder(uncond_input.input_ids.to(pipe.device))[0]
    embeddings = torch.cat([uncond_embeddings, text_embeddings])

    pipe.scheduler.set_timesteps(steps, device=pipe.device)
    timesteps = pipe.scheduler.timesteps
    latents = torch.randn((1, pipe.unet.in_channels, 64, 64), device=pipe.device, dtype=pipe.dtype)
    latents *= pipe.scheduler.init_noise_sigma

    async def event_generator():
        nonlocal latents
        for i, t in enumerate(timesteps):
            latent_input = torch.cat([latents] * 2)
            latent_input = pipe.scheduler.scale_model_input(latent_input, t)
            with torch.no_grad():
                noise_pred = pipe.unet(latent_input, t, encoder_hidden_states=embeddings).sample
            uncond, text = noise_pred.chunk(2)
            latents = pipe.scheduler.step(uncond + guidance_scale * (text - uncond), t, latents).prev_sample

            if i % every_n_steps == 0 or i == len(timesteps) - 1:
                img = decode_latents(latents)
                path = f"static/img-preview-{id}-{i}.png"
                img.save(path)
                yield f"{json.dumps({'step': i, 'image_url': '/' + path})}\n\n"
                await asyncio.sleep(0.01)

        final_path = f"static/img-{id}.png"
        img.save(final_path)
        yield f"{json.dumps({'done': True, 'image_url': '/' + final_path})}\n\n"
        for p in glob.glob(f"static/img-preview-{id}-*.png"):
            try: os.remove(p)
            except: pass

    return EventSourceResponse(event_generator())