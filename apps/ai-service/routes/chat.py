import asyncio
import structlog
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from langchain_core.prompts import PromptTemplate
from core.security import verify_token
from services.db import insights_collection
from services.llm_service import make_llm, embeddings, invoke_with_retry

log = structlog.get_logger()
router = APIRouter(prefix="/insights", tags=["chat"])

# =============================================================================
# Models
# =============================================================================

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000, description="The user question")
    stream: bool = Field(default=False, description="Whether to stream the response")

class Source(BaseModel):
    id: str
    summary: str

# =============================================================================
# Prompt Template
# =============================================================================

CHAT_PROMPT = PromptTemplate.from_template(
    "You are the AI Assistant for Knowledge Hub OS, a platform for personalized learning and productivity.\n\n"
    "### 🎯 CORE MISSION\n"
    "Provide helpful, accurate, and data-driven responses. Your goal is to guide the user through their learning journey.\n\n"
    "### 🛠 DECISION LOGIC\n"
    "1. **General Knowledge:** If the question is conceptual (e.g., \"Explain Docker\"), provide a clear, technical explanation. Ignore {history}.\n"
    "2. **Personalized Progress:** If the user asks about their status, goals, or \"what's next,\" you MUST analyze the `{history}` block.\n"
    "3. **Data Integrity:** \n"
    "   - If `{history}` is empty: \"I don't see any active goals or progress in your profile yet. Let's start by creating a roadmap!\"\n"
    "   - If `{history}` only shows a roadmap: Treat it as a plan, NOT as completed work.\n"
    "   - Never \"hallucinate\" progress or congratulate the user for tasks not explicitly marked as complete.\n\n"
    "### 🎭 TONE & STYLE\n"
    "- **Grounded:** Be encouraging but strictly honest. No \"fake\" praise.\n"
    "- **Concise:** Use bullet points for steps or roadmaps.\n"
    "- **Professional:** Technical yet accessible.\n\n"
    "---\n"
    "### 📚 USER HISTORY (RAG Context)\n"
    "{history}\n\n"
    "---\n"
    "### ❓ USER QUESTION\n"
    "{question}\n\n"
    "---\n"
    "### 💡 ASSISTANT RESPONSE\n"
)

# =============================================================================
# Helpers
# =============================================================================

async def get_rag_context(user_id: str, message: str):
    """Retrieve relevant insights from MongoDB using vector search."""
    context = "No past productivity data found."
    sources = []
    try:
        # 1. Generate embedding
        query_vector = await asyncio.wait_for(
            embeddings.aembed_query(message),
            timeout=15.0,
        )

        # 2. Vector Search
        pipeline = [
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": query_vector,
                    "numCandidates": 50,
                    "limit": 5,
                    "filter": {"userId": {"$eq": user_id}},
                }
            },
            {"$project": {"ai_summary": 1, "score": {"$meta": "vectorSearchScore"}}},
        ]
        
        results = await insights_collection.aggregate(pipeline).to_list(length=5)
        
        if results:
            context_parts = []
            for doc in results:
                summary = doc.get("ai_summary", "")
                score = doc.get("score", 0)
                # Only include high-confidence matches (simple heuristic)
                if score > 0.6:
                    context_parts.append(f"- {summary}")
                    sources.append({"id": str(doc["_id"]), "summary": summary})
            
            if context_parts:
                context = "\n".join(context_parts)
        
        return context, sources
        
    except Exception as e:
        log.warning("rag_failed", error=str(e), fallback="plain_chat")
        return context, []

# =============================================================================
# Routes
# =============================================================================

@router.post("/chat")
async def chat_with_ai(request: ChatRequest, user_id: str = Depends(verify_token)):
    """Unified chat endpoint supporting both blocking and streaming responses."""
    log.info("chat_request", user_id=user_id, stream=request.stream)

    context, sources = await get_rag_context(user_id, request.message)
    llm = make_llm()
    chain = CHAT_PROMPT | llm

    if request.stream:
        return StreamingResponse(
            generate_chat_stream(chain, context, request.message, user_id),
            media_type="text/event-stream"
        )

    try:
        ai_reply = await asyncio.wait_for(
            invoke_with_retry(chain, {"history": context, "question": request.message}),
            timeout=25.0,
        )
        return {
            "reply": ai_reply.content,
            "sources": sources
        }
    except asyncio.TimeoutError:
        log.warning("llm_timeout", user_id=user_id)
        return {"reply": "⏳ The AI is taking a bit longer than usual. Please try again in a moment."}
    except Exception as e:
        return handle_llm_error(e, user_id)

async def generate_chat_stream(chain, context, question, user_id):
    """Generator for SSE streaming."""
    try:
        async for chunk in chain.astream({"history": context, "question": question}):
            if chunk.content:
                yield f"data: {chunk.content}\n\n"
        yield "data: [DONE]\n\n"
    except Exception as e:
        log.error("stream_failed", error=str(e))
        yield f"data: Error: {str(e)}\n\n"

def handle_llm_error(e: Exception, user_id: str):
    err_str = str(e).lower()
    if any(code in err_str for code in ["429", "quota", "rate limit"]):
        log.warning("quota_exceeded", user_id=user_id)
        return {"reply": "⏳ Quota exceeded. Please wait 60 seconds."}
    
    log.error("generation_failed", error=str(e))
    raise HTTPException(status_code=500, detail="AI Brain is currently offline.")
