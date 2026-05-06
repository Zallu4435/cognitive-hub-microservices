import asyncio
from services.db import users_collection

async def main():
    docs = await users_collection.find().to_list(10)
    for d in docs:
        print(d)

asyncio.run(main())
