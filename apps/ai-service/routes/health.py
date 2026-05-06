import datetime
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health():
    return {"status": "ok", "service": "ai-service", "timestamp": datetime.datetime.utcnow().isoformat()}
