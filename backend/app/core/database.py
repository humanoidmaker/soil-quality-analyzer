from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    await db.users.create_index("email", unique=True)
    await db.analyses.create_index("user_id")
    await db.analyses.create_index("created_at")
    print(f"Connected to MongoDB: {settings.DATABASE_NAME}")


async def close_db():
    global client
    if client:
        client.close()
        print("MongoDB connection closed")


def get_db():
    return db


# Alias for compatibility
init_db = connect_db
