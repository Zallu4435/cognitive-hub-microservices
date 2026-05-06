import os
import sys
from pathlib import Path

# Fix for Protobuf issues on newer Python versions (C-extensions compatibility)
os.environ.setdefault('PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION', 'python')

# Add project root to sys.path to allow importing from 'libs' in a monorepo
root_path = Path(__file__).resolve().parent.parent.parent
if str(root_path) not in sys.path:
    sys.path.append(str(root_path))

import uvicorn
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import structlog

# Config
from config import KAFKA_BROKER_URL, ALLOWED_ORIGINS

# Routes
from routes.events import router as events_router
from routes.insights import router as insights_router
from routes.chat import router as chat_router
from routes.health import router as health_router

# Services
from services.kafka import consume_kafka

# =============================================================================
# Structured JSON Logging
# =============================================================================
structlog.configure(
    processors=[
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
)
log = structlog.get_logger(service_name="ai-service")

# =============================================================================
# FastAPI Lifespan & App
# =============================================================================
_kafka_task: asyncio.Task | None = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global _kafka_task
    if KAFKA_BROKER_URL and KAFKA_BROKER_URL not in ("none", "disabled", ""):
        log.info("kafka_enabled", broker=KAFKA_BROKER_URL)
        _kafka_task = asyncio.create_task(consume_kafka())
    else:
        log.info("kafka_disabled_using_http_fallback")

    # Health check MongoDB
    try:
        from services.db import mongo_client
        await mongo_client.admin.command('ping')
        log.info("mongodb_connected")
    except Exception as e:
        log.error("mongodb_connection_failed", error=str(e))
        raise

    yield

    if _kafka_task and not _kafka_task.done():
        log.info("kafka_consumer_shutting_down")
        _kafka_task.cancel()
        try:
            await _kafka_task
        except asyncio.CancelledError:
            pass

app = FastAPI(title="Knowledge Hub OS - AI Brain", lifespan=lifespan)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(events_router)
app.include_router(insights_router)
app.include_router(chat_router)
app.include_router(health_router)

if __name__ == "__main__":
    ai_port = int(os.getenv("PORT", os.getenv("PORT_AI_SERVICE", "8000")))
    uvicorn.run(app, host="0.0.0.0", port=ai_port)
