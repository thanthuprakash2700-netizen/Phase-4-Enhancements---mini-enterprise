from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "sqlite:///./app.db"

    JWT_SECRET_KEY: str = "change-me-in-env"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    GOOGLE_CLIENT_ID: str = "mock-google-client-id"
    REDIS_URL: str = "redis://localhost:6379"

    # comma-separated
    CORS_ORIGINS: str = "http://127.0.0.1:5173,http://localhost:5173"
    FRONTEND_URL: str = "http://localhost:5173"

settings = Settings()
