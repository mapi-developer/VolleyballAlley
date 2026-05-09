from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import create_db_and_tables

# Lifespan context manager to handle startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up... Creating database tables.")
    create_db_and_tables()
    yield
    print("Shutting down...")

# Initialize the FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# Configure CORS for the Telegram Mini App (Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {
        "status": "online", 
        "message": "VolleyballAlley API is running!"
    }

from app.api.routes import users, events, rsvps

app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(rsvps.router, prefix="/api/rsvps", tags=["RSVPs"])
