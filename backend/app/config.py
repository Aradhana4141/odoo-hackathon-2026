from functools import lru_cache
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseModel):
    app_name: str = "TransitOps API"
    api_prefix: str = "/api"
    pb_api_url: str = (os.getenv("PB_API_URL") or os.getenv("PB_BASE_URL", "https://db-clarity.arinji.com/api")).rstrip("/")
    pb_admin_token: str = os.getenv("PB_ADMIN_TOKEN") or os.getenv("SKILLSWAP_API_KEY", "")
    cors_origins: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")
    auth_collection: str = os.getenv("PB_AUTH_COLLECTION", "users")
    pb_batch_enabled: bool = os.getenv("PB_BATCH_ENABLED", "false").lower() in {"1", "true", "yes"}
    gps_refresh_seconds: int = int(os.getenv("GPS_REFRESH_SECONDS", "5"))
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    revenue_rate_per_km: float = float(os.getenv("REVENUE_RATE_PER_KM", "50"))

    @property
    def origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
