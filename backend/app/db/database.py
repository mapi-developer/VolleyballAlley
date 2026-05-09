from sqlmodel import create_engine, Session, SQLModel
from app.core.config import settings

# Create the engine using the URL from our config
engine = create_engine(settings.DATABASE_URL, echo=True)

def create_db_and_tables():
    """Initializes the database schema based on SQLModel definitions."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency generator for database sessions."""
    with Session(engine) as session:
        yield session