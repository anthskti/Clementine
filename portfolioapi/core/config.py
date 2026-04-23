from pydantic_settings import BaseSettings
from core.config import settings


class Settings(BaseSettings):
    gemini_api_key: str = ""
    questrade_token_url: str = "https://login.questrade.com/oauth2/token"
    frontend_origin: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()