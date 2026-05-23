import psycopg2
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

# PostgreSQL connection
def get_postgres_conn():
    conn = psycopg2.connect(
        host="localhost",
        database="deadlock_db",
        user="postgres",
        password="pass123"
    )
    return conn

# MongoDB connection  
def get_mongo_db():
    client = MongoClient("mongodb://localhost:27017/")
    db = client["deadlock_logs"]
    return db

# Test karo
if __name__ == "__main__":
    # PostgreSQL test
    try:
        conn = get_postgres_conn()
        print("✅ PostgreSQL connected!")
        conn.close()
    except Exception as e:
        print(f"❌ PostgreSQL error: {e}")
    
    # MongoDB test
    try:
        db = get_mongo_db()
        db.test.insert_one({"test": "hello"})
        print("✅ MongoDB connected!")
    except Exception as e:
        print(f"❌ MongoDB error: {e}")