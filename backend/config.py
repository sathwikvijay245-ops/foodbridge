import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FoodBridge Surplus Food Redistribution Platform"
    HACKATHON_CODE: str = "HACK-P197"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./food_donation.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "hack-p197-super-secret-key-foodbridge-2026-secure-jwt")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days for demo ease

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
