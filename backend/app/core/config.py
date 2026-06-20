from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    MONGODB_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "feedback_intelligence"

    class Config:
        env_file = ".env"

settings = Settings()
