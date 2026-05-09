from sqlmodel import SQLModel, Session, create_engine
from app.core.config import settings

# Create the synchronous database engine
# echo=True prints all SQL queries to the terminal (helpful for debugging during development)
engine = create_engine(settings.DATABASE_URL, echo=True)

def create_db_and_tables():
    """
    Creates all tables defined in your SQLModel schemas.
    Note: For a production app, you would eventually use Alembic for migrations,
    but this is perfect for getting the MVP running quickly.
    """
    # Import models here to ensure they are registered with SQLModel's metadata
    from app.db import models 
    SQLModel.metadata.create_all(engine)

def get_session():
    """
    FastAPI dependency to provide a database session per request.
    It automatically closes the session after the request is done.
    """
    with Session(engine) as session:
        yield session