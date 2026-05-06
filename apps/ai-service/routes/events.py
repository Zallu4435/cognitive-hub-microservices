import asyncio
import structlog
from fastapi import APIRouter
from pydantic import BaseModel
from services.event_processor import _process_task_event

log = structlog.get_logger()
router = APIRouter(prefix="/events", tags=["events"])

class TaskEventPayload(BaseModel):
    eventId: str
    timestamp: str
    data: dict

@router.post("/task-completed")
async def http_task_event(payload: TaskEventPayload):
    log.info("http_task_event_received", event_id=payload.eventId)
    asyncio.create_task(_process_task_event(payload.model_dump()))
    return {"status": "accepted", "eventId": payload.eventId}
