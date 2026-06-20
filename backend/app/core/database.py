from pymongo import MongoClient
from app.core.config import settings

_client = None

def get_db():
    global _client
    if _client is None:
        _client = MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=3000)
    return _client[settings.DB_NAME]
