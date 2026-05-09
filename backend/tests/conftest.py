import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, StaticPool
from app.main import app
from app.db.database import get_session
from app.api.deps import get_current_user, get_current_organizer
from app.db.models import User, UserRole

# Use an in-memory SQLite for testing
sqlite_url = "sqlite://"
engine = create_engine(
    sqlite_url,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="client")
def client_fixture(session: Session):
    # Override production session with test session
    def get_session_override():
        return session
    
    # Mock authenticated user (Organizer)
    def get_current_user_override():
        user = User(id=12345, first_name="Test Host", role=UserRole.ORGANIZER)
        session.add(user)
        session.commit()
        return user

    app.dependency_overrides[get_session] = get_session_override
    app.dependency_overrides[get_current_user] = get_current_user_override
    app.dependency_overrides[get_current_organizer] = get_current_user_override
    
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()