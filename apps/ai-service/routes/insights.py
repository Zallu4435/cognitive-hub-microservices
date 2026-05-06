import structlog
from fastapi import APIRouter, Depends
from core.security import verify_token
from services.db import insights_collection

log = structlog.get_logger()

router = APIRouter(prefix="/insights", tags=["insights"])

@router.get("")
async def get_insights(skip: int = 0, limit: int = 20, user_id: str = Depends(verify_token)):
    limit = min(limit, 100) # Maximum 100
    cursor = insights_collection.find({"userId": user_id}).sort("processed_at", -1).skip(skip).limit(limit)
    insights = await cursor.to_list(length=limit)
    for insight in insights:
        insight["_id"] = str(insight["_id"])
        
    total = await insights_collection.count_documents({"userId": user_id})
    log.info("insights_fetched", user_id=user_id, count=len(insights), total=total)
    
    return {
        "insights": insights,
        "meta": {
            "total": total,
            "skip": skip,
            "limit": limit,
            "hasMore": skip + limit < total
        }
    }
