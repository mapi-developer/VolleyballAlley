from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import create_db_and_tables
from app.api.routes import users, events, rsvps, reports

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up VolleyballAlley Backend...")
    create_db_and_tables() 
    yield
    print("Shutting down...")

app = FastAPI(
    title="VolleyballAlley API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Register Modular Routers ---

app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(rsvps.router, prefix="/api/rsvps", tags=["RSVPs"])
app.include_router(reports.router, prefix="/api/reports", tags=["Behavior Reports"])

@app.get("/")
async def root():
    return {
        "message": "VolleyballAlley API is online",
        "docs": "/docs",
        "status": "connected"
    }