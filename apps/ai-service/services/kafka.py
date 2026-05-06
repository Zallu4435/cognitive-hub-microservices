import json
import asyncio
import traceback
import structlog
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from tenacity import RetryError

from config import KAFKA_BROKER_URL, KAFKA_SASL_USERNAME, KAFKA_SASL_PASSWORD
from services.db import insights_collection
from libs.event_schemas.task_completed_event import TaskCompletedEvent
from langchain_core.prompts import PromptTemplate
from services.llm_service import make_llm, embeddings, invoke_with_retry

log = structlog.get_logger()

async def publish_to_dlq(producer: AIOKafkaProducer, original_value: bytes, dlq_topic: str, error: Exception):
    error_headers = [
        ("error_message", str(error).encode("utf-8")),
        ("error_traceback", traceback.format_exc().encode("utf-8")),
    ]
    await producer.send_and_wait(
        dlq_topic,
        value=original_value,
        headers=error_headers,
    )
    log.warning("dlq_published", topic=dlq_topic, error=str(error))

async def consume_kafka():
    coach_prompt = PromptTemplate.from_template(
        "You are an energetic AI productivity coach. "
        "The user just completed the task '{task}' which is part of their overarching goal: '{goal}'. "
        "Give them a short, punchy high-five acknowledging their specific work, and a 1-sentence tip on maintaining momentum."
    )

    _kafka_security_protocol = "SASL_SSL" if KAFKA_SASL_USERNAME else "PLAINTEXT"
    _kafka_sasl_mechanism   = "SCRAM-SHA-256" if KAFKA_SASL_USERNAME else "PLAIN"

    consumer = AIOKafkaConsumer(
        "task.completed",
        bootstrap_servers=KAFKA_BROKER_URL,
        group_id="ai-service-group",
        security_protocol=_kafka_security_protocol,
        sasl_mechanism=_kafka_sasl_mechanism,
        sasl_plain_username=KAFKA_SASL_USERNAME,
        sasl_plain_password=KAFKA_SASL_PASSWORD,
        auto_offset_reset="latest",
    )
    
    dlq_producer = AIOKafkaProducer(
        bootstrap_servers=KAFKA_BROKER_URL,
        security_protocol=_kafka_security_protocol,
        sasl_mechanism=_kafka_sasl_mechanism,
        sasl_plain_username=KAFKA_SASL_USERNAME,
        sasl_plain_password=KAFKA_SASL_PASSWORD,
    )

    while True:
        try:
            await consumer.start()
            await dlq_producer.start()
            log.info("kafka_connected", broker=KAFKA_BROKER_URL)
            break
        except Exception as e:
            log.warning("kafka_connection_failed_retrying", error=str(e), delay=5)
            await asyncio.sleep(5)

    try:
        log.info("kafka_consumer_started", topics=["task.completed"])

        async for msg in consumer:
            log.info("kafka_message_received", topic=msg.topic, partition=msg.partition, offset=msg.offset)
            raw_data = json.loads(msg.value.decode("utf-8"))
            insight_data = None
            event_id = raw_data.get("eventId")

            if event_id:
                existing = await insights_collection.find_one({"eventId": event_id})
                if existing:
                    log.info("duplicate_event_skipped", event_id=event_id, topic=msg.topic)
                    continue

            if msg.topic == "task.completed":
                try:
                    event = TaskCompletedEvent(**raw_data)
                    log.info("processing_task_event", task=event.data.taskTitle, event_id=event_id)

                    coach_chain = coach_prompt | make_llm()
                    ai_response = await invoke_with_retry(
                        coach_chain,
                        {"task": event.data.taskTitle, "goal": event.data.goalTitle},
                    )

                    insight_data = {
                        "eventId": event_id,
                        "userId": event.data.userId,
                        "type": "productivity_insight",
                        "goal": event.data.goalTitle,
                        "task": event.data.taskTitle,
                        "ai_summary": ai_response.content,
                        "processed_at": event.timestamp,
                    }
                except RetryError as e:
                    log.error("max_retries_exceeded", topic=msg.topic, event_id=event_id, error=str(e))
                    await publish_to_dlq(dlq_producer, msg.value, "dlq.task.completed", e)
                    continue
                except Exception as e:
                    log.error("task_event_processing_error", error=str(e), event_id=event_id)
                    await publish_to_dlq(dlq_producer, msg.value, "dlq.task.completed", e)
                    continue

            if insight_data:
                try:
                    vector = await embeddings.aembed_query(insight_data["ai_summary"])
                    insight_data["embedding"] = vector
                except Exception as e:
                    log.error("embedding_failed_continuing", error=str(e), event_id=event_id)
                    # We still save the insight so it appears in the UI, even if RAG won't find it later
                    insight_data["embedding"] = []

                try:
                    result = await insights_collection.insert_one(insight_data)
                    log.info("insight_saved", mongo_id=str(result.inserted_id), event_id=event_id)
                except Exception as e:
                    log.error("mongo_save_failed", error=str(e), event_id=event_id)

    finally:
        await consumer.stop()
        await dlq_producer.stop()
