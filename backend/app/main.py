from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic: e.g., Initialize aiogram bot webhook or polling here later
    print("Starting up Sports TMA Backend...")
    yield
    # Shutdown logic: Close database connections, stop bot
    print("Shutting down...")

app = FastAPI(
    title="Sports Event TMA API",
    description="Backend for Telegram Mini App Sports Management",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for the frontend Mini App
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Sports TMA API is running."}