from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    bot_token: str
    database_url: str
    web_app_url: str  # URL for the Frontend (Next.js)
    backend_url: str  # URL for the Backend (FastAPI)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()