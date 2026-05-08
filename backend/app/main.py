from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from aiogram import Bot, Dispatcher
from app.core.config import settings
# Make sure you have created backend/app/bot/handlers.py
from app.bot.handlers import router as bot_router 

# Initialize Bot and Dispatcher
bot = Bot(token=settings.bot_token)
dp = Dispatcher()
dp.include_router(bot_router)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up Sports TMA Backend...")
    # This starts the bot listening for messages
    polling_task = asyncio.create_task(dp.start_polling(bot))
    yield
    print("Shutting down...")
    polling_task.cancel()
    await bot.session.close()

app = FastAPI(
    title="Sports Event TMA API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}