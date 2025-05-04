from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
from sse_starlette.sse import EventSourceResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from fastapi import FastAPI
from PIL import Image
import numpy as np
import asyncio
import torch
import uuid
import glob
import os
import json

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

# Load pipeline once on startup
device = "cuda" if torch.cuda.is_available() else "cpu"
dtype = torch.float16 if device == "cuda" else torch.float32

pipe = StableDiffusionPipeline.from_pretrained(
    "stabilityai/stable-diffusion-2-1-base",
    torch_dtype=dtype,
    revision="fp16" if device == "cuda" else "main"
)
pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
pipe = pipe.to(device)

def decode_latents(latents):
    latents = 1 / 0.18215 * latents
    with torch.no_grad():
        image = pipe.vae.decode(latents).sample

    image = (image / 2 + 0.5).clamp(0, 1)
    image = image.cpu().permute(0, 2, 3, 1).numpy()[0]
    image = (image * 255).astype(np.uint8)
    return Image.fromarray(image)

# Input model
class GenerateRequest(BaseModel):
    prompt: str
    num_inference_steps: int = 25

    @app.get("/generate/stream")
    async def generate_stream(prompt: str, steps: int = 25):
        print(f"Streaming image for prompt: {prompt}")
        guidance_scale = 7.5
        every_n_steps = 5
        id = uuid.uuid4().hex[:8]

        # Encode prompt
        text_input = pipe.tokenizer(prompt, padding="max_length", max_length=pipe.tokenizer.model_max_length, return_tensors="pt")
        text_embeddings = pipe.text_encoder(text_input.input_ids.to(device))[0]

        # Unconditional guidance
        max_length = text_input.input_ids.shape[-1]
        uncond_input = pipe.tokenizer([""] * 1, padding="max_length", max_length=max_length, return_tensors="pt")
        uncond_embeddings = pipe.text_encoder(uncond_input.input_ids.to(device))[0]
        embeddings = torch.cat([uncond_embeddings, text_embeddings])

        # Timesteps and latents
        pipe.scheduler.set_timesteps(steps, device=device)
        timesteps = pipe.scheduler.timesteps
        latents = torch.randn((1, pipe.unet.in_channels, 64, 64), device=device, dtype=dtype)
        latents = latents * pipe.scheduler.init_noise_sigma

        async def event_generator():
            for i, t in enumerate(timesteps):
                latent_model_input = torch.cat([latents] * 2)
                latent_model_input = pipe.scheduler.scale_model_input(latent_model_input, t)

                with torch.no_grad():
                    noise_pred = pipe.unet(latent_model_input, t, encoder_hidden_states=embeddings).sample

                noise_pred_uncond, noise_pred_text = noise_pred.chunk(2)
                noise_pred = noise_pred_uncond + guidance_scale * (noise_pred_text - noise_pred_uncond)
                latents = pipe.scheduler.step(noise_pred, t, latents).prev_sample

                if i % every_n_steps == 0 or i == len(timesteps) - 1:
                    image = decode_latents(latents)
                    preview_path = f"static/img-preview-{id}-{i}.png"
                    image.save(preview_path)
                    print(f"Saved step {i} → {preview_path}")
                    yield {
                        "event": "update",
                        "data": json.dumps({
                            "step": i,
                            "image_url": f"/static/img-preview-{id}-{i}.png"
                        })
                    }
                    await asyncio.sleep(0.01)  # Prevent tight loop

            # Final image save
            final_name = f"img-{id}.png"
            final_path = f"static/{final_name}"
            image.save(final_path)
            print(f"Saved final → {final_path}")
            yield {
                "event": "done",
                "data": json.dumps({
                    "image_url": f"/static/{final_name}"
                })
            }

            # Optional: cleanup previews
            for path in glob.glob(f"static/img-preview-{id}-*.png"):
                try:
                    os.remove(path)
                except:
                    pass

        return EventSourceResponse(event_generator())

@app.post("/generate")
async def generate(data: GenerateRequest):
    print("Generating image")
    print(data)

    prompt = data.prompt
    num_inference_steps = data.num_inference_steps
    guidance_scale = 7.5  # Classic SD value
    every_n_steps = 5     # Save every N steps

    # Encode prompt
    text_input = pipe.tokenizer(prompt, padding="max_length", max_length=pipe.tokenizer.model_max_length, return_tensors="pt")
    text_embeddings = pipe.text_encoder(text_input.input_ids.to(device))[0]

    # Add unconditional guidance
    max_length = text_input.input_ids.shape[-1]
    uncond_input = pipe.tokenizer([""] * 1, padding="max_length", max_length=max_length, return_tensors="pt")
    uncond_embeddings = pipe.text_encoder(uncond_input.input_ids.to(device))[0]

    # Concatenate for classifier-free guidance
    embeddings = torch.cat([uncond_embeddings, text_embeddings])

    # Get scheduler timesteps
    pipe.scheduler.set_timesteps(num_inference_steps, device=device)
    timesteps = pipe.scheduler.timesteps

    # Init latents
    latents = torch.randn((1, pipe.unet.in_channels, 64, 64), device=device, dtype=dtype)
    latents = latents * pipe.scheduler.init_noise_sigma

    # Denoising loop
    for i, t in enumerate(timesteps):
        latent_model_input = torch.cat([latents] * 2)
        latent_model_input = pipe.scheduler.scale_model_input(latent_model_input, t)

        with torch.no_grad():
            noise_pred = pipe.unet(latent_model_input, t, encoder_hidden_states=embeddings).sample

        # CFG guidance
        noise_pred_uncond, noise_pred_text = noise_pred.chunk(2)
        noise_pred = noise_pred_uncond + guidance_scale * (noise_pred_text - noise_pred_uncond)

        # Scheduler step
        latents = pipe.scheduler.step(noise_pred, t, latents).prev_sample

        # Save preview image
        if i % every_n_steps == 0 or i == len(timesteps) - 1:
            image = decode_latents(latents)
            preview_path = f"static/img-preview-{i}.png"
            image.save(preview_path)
            print(f"Saved step {i} → {preview_path}")

    # Save final
    file_id = f"img-{uuid.uuid4().hex[:8]}.png"
    final_path = f"static/{file_id}"
    image.save(final_path)
    print("Saving final: " + final_path)

    for path in glob.glob("static/img-preview-*.png"):
        try:
            os.remove(path)
            print(f"Deleted preview: {path}")
        except Exception as e:
            print(f"Failed to delete {path}: {e}")

    return {"image_url": f"/static/{file_id}"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)