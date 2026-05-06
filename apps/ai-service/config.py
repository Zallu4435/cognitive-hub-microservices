import os
from dotenv import load_dotenv

load_dotenv("../../.env")

MONGO_URI = os.getenv("MONGO_URI")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
KAFKA_BROKER_URL = os.getenv("KAFKA_BROKER_URL")
KAFKA_SASL_USERNAME = os.getenv("KAFKA_SASL_USERNAME", "")
KAFKA_SASL_PASSWORD = os.getenv("KAFKA_SASL_PASSWORD", "")

JWT_SECRET = os.getenv("JWT_SECRET")

ALLOWED_ORIGINS = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:4000").split(",")
]
