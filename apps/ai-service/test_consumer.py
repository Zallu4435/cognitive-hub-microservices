import asyncio
from aiokafka import AIOKafkaConsumer

async def main():
    consumer = AIOKafkaConsumer(
        "task.completed",
        bootstrap_servers="localhost:9092",
        group_id="test-group",
        auto_offset_reset="earliest"
    )
    print("starting")
    await consumer.start()
    print("started")
    try:
        async for msg in consumer:
            print(msg)
            break
    finally:
        await consumer.stop()

asyncio.run(main())
