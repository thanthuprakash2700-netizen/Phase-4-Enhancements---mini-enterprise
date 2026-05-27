# backend/app/main.py

"""Application entry point.

Creates the FastAPI app, includes routers, and sets up CORS middleware.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi_pagination import add_pagination
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.backends.inmemory import InMemoryBackend
from redis import asyncio as aioredis
import contextlib

from app.core.config import settings
from app.api.deps import limiter
from app.api.routers import auth, users, tasks, approvals, dashboard, documents, audit_logs, notifications, ws, billing


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize cache
    try:
        redis = aioredis.from_url(settings.REDIS_URL, encoding="utf8", decode_responses=True)
        # Test connection
        await redis.ping()
        FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")
    except Exception as e:
        print(f"Failed to connect to Redis, using InMemoryBackend: {e}")
        FastAPICache.init(InMemoryBackend(), prefix="fastapi-cache")
    yield

app = FastAPI(title="Mini Enterprise Collaboration", version="0.1.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS (allow all for development; adjust for production)
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(approvals.router)
app.include_router(dashboard.router)
app.include_router(documents.router, prefix="/documents", tags=["documents"])
app.include_router(audit_logs.router, prefix="/audit-logs", tags=["audit-logs"])
app.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
app.include_router(ws.router)
app.include_router(billing.router)

add_pagination(app)
