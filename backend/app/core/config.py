from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "VolleyballAlley API"
    DATABASE_URL: str
    BOT_TOKEN: str
    WEB_APP_URL: str

    # This tells Pydantic to read from the .env file
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# Instantiate the settings object to be used across the app
settings = Settings()