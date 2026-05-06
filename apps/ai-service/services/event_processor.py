import structlog
from langchain_core.prompts import PromptTemplate
from services.llm_service import make_llm, embeddings, invoke_with_retry
from services.db import insights_collection

log = structlog.get_logger()

async def _process_task_event(raw_data: dict):
    event_id = raw_data.get("eventId")
    try:
        existing = await insights_collection.find_one({"eventId": event_id})
        if existing:
            log.info("duplicate_event_skipped", event_id=event_id)
            return
            
        from libs.event_schemas.task_completed_event import TaskCompletedEvent
        event = TaskCompletedEvent(**raw_data)
        llm = make_llm()
        coach_prompt = PromptTemplate.from_template(
            "You are an energetic AI productivity coach. "
            "The user just completed the task '{task}' which is part of their overarching goal: '{goal}'. "
            "Give them a short, punchy high-five acknowledging their specific work, and a 1-sentence tip on maintaining momentum."
        )
        ai_response = await invoke_with_retry(coach_prompt | llm, {"task": event.data.taskTitle, "goal": event.data.goalTitle})
        vector = await embeddings.aembed_query(ai_response.content)
        await insights_collection.insert_one({
            "eventId": event_id,
            "userId": event.data.userId,
            "type": "productivity_insight",
            "goal": event.data.goalTitle,
            "task": event.data.taskTitle,
            "ai_summary": ai_response.content,
            "embedding": vector,
            "processed_at": event.timestamp,
        })
        log.info("task_insight_saved", event_id=event_id)
    except Exception as e:
        log.error("task_event_processing_error", error=str(e), event_id=event_id)
