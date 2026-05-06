from motor.motor_asyncio import AsyncIOMotorClient
import structlog
import sys
from config import MONGO_URI

log = structlog.get_logger()

# Fail fast if MONGO_URI is missing
if not MONGO_URI:
    log.error("mongo_uri_missing")
    sys.exit(1)

mongo_client = AsyncIOMotorClient(MONGO_URI)
db = mongo_client["knowledge_hub"]
insights_collection = db["user_insights"]
