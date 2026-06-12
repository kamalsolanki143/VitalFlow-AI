import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

client: MongoClient = MongoClient(MONGODB_URL)
db = client["vitalflow"]

patients_collection = db["patients"]
reports_collection = db["reports"]
escalations_collection = db["escalations"]
followups_collection = db["followups"]
