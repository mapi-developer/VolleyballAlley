import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine, StaticPool
from app.main import app
from app.db.database import get_session
from app.api.deps import get_current_user, get_current_organizer, get_current_admin
from app.db.models import User, UserRole

sqlite_url = "sqlite://"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False}, poolclass=StaticPool)

@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(name="client")
def client_fixture(session: Session):
    # Global state for tests to override user data
    test_user_data = {"id": 12345, "role": UserRole.ORGANIZER}

    def get_session_override():
        return session
    
    def get_mock_user():
        user = session.get(User, test_user_data["id"])
        if not user:
            user = User(id=test_user_data["id"], first_name="Test User", role=test_user_data["role"])
            session.add(user)
            session.commit()
            session.refresh(user)
        # Ensure role is updated if changed between tests
        if user.role != test_user_data["role"]:
            user.role = test_user_data["role"]
            session.add(user)
            session.commit()
            session.refresh(user)
        return user

    app.dependency_overrides[get_session] = get_session_override
    app.dependency_overrides[get_current_user] = get_mock_user
    
    client = TestClient(app)
    client.test_user_data = test_user_data # Attach helper for tests to change roles
    yield client
    app.dependency_overrides.clear()