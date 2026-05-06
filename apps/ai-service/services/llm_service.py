import logging
import structlog
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from tenacity import retry, retry_if_exception_type, wait_exponential, stop_after_attempt, before_sleep_log
from config import GEMINI_API_KEY

log = structlog.get_logger()

# =============================================================================
# Embeddings Model
# =============================================================================
embeddings_model = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=GEMINI_API_KEY,
    max_retries=0,  # We handle retries manually for better control
)

class EmbeddingsWrapper:
    """Wrapper to add robustness and logging to embedding calls."""
    async def aembed_query(self, text: str):
        try:
            return await invoke_with_retry(
                lambda inputs: embeddings_model.aembed_query(inputs["text"]),
                {"text": text}
            )
        except Exception as e:
            log.error("embedding_failed", error=str(e))
            raise

embeddings = EmbeddingsWrapper()

# =============================================================================
# LLM Initialization Helper
# =============================================================================
def make_llm() -> ChatGoogleGenerativeAI:
    # Using Gemma 3 (open-source model) — has separate quota from Gemini models
    # Switch to "models/gemini-2.0-flash" once you have a fresh API key/project
    return ChatGoogleGenerativeAI(
        model="models/gemini-flash-latest",
        temperature=0.7,
        google_api_key=GEMINI_API_KEY,
        max_retries=0,   # Disable built-in retries so our custom retry handler can manage 429s correctly
        timeout=20,      # 20 second HTTP timeout
    )

# =============================================================================
# Exponential Backoff Retry (only for transient errors, NOT quota)
# =============================================================================
class TransientAPIError(Exception):
    pass

@retry(
    retry=retry_if_exception_type(TransientAPIError),
    wait=wait_exponential(multiplier=1, min=2, max=8),
    stop=stop_after_attempt(2),  # Only 1 retry (2 attempts total) to stay within timeout
    before_sleep=before_sleep_log(log, logging.WARNING),
    reraise=True,
)
async def invoke_with_retry(func_or_chain, inputs: dict):
    """Unified retry handler for both LangChain chains and raw functions."""
    try:
        if hasattr(func_or_chain, "ainvoke"):
            return await func_or_chain.ainvoke(inputs)
        return await func_or_chain(inputs)
    except Exception as e:
        err_str = str(e).lower()
        # Quota errors should NOT be retried — they waste time and will fail again
        if any(code in err_str for code in ["429", "quota", "rate limit", "too many requests"]):
            raise  # Re-raise immediately, let chat.py handle it gracefully
        # Only retry on genuine transient errors (503, 500, overloaded)
        if any(code in err_str for code in ["503", "500", "overloaded", "temporarily", "deadline exceeded"]):
            raise TransientAPIError(str(e)) from e
        raise
