import asyncio
from services.db import insights_collection

async def main():
    docs = await insights_collection.find({"userId": "a14c69ad-3033-464f-acc7-0d02b82e9d23"}).to_list(10)
    for d in docs:
        d.pop("embedding", None)
        print(d)

asyncio.run(main())
