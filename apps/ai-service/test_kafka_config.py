import asyncio
from aiokafka import AIOKafkaConsumer

async def main():
    try:
        consumer = AIOKafkaConsumer(
            "task.completed",
            bootstrap_servers="localhost:9092",
            group_id="ai-service-group",
            security_protocol="PLAINTEXT",
            sasl_mechanism="PLAIN",
            sasl_plain_username="",
            sasl_plain_password="",
            auto_offset_reset="latest",
        )
        await consumer.start()
        print("Consumer started successfully!")
        await consumer.stop()
    except Exception as e:
        print("Error:", repr(e))

asyncio.run(main())
