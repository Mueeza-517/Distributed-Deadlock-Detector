from pymongo import MongoClient, ASCENDING, DESCENDING
import os  

def get_mongo_db():
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/") 
    client = MongoClient(MONGO_URI)
    db = client["deadlock_logs"]
    return db

def setup_mongo_indexes():
    db = get_mongo_db()

   
    db.raw_logs.create_index(
        [("timestamp", ASCENDING)],
        expireAfterSeconds=30 * 24 * 60 * 60,
        name="ttl_raw_logs_30d"
    )
    db.raw_logs.create_index(
        [("node_id", ASCENDING), ("timestamp", DESCENDING)],
        name="idx_node_timestamp"
    )
    db.raw_logs.create_index(
        [("log_level", ASCENDING)],
        name="idx_log_level"
    )

   
    db.llm_explanations.create_index(
        [("event_id", ASCENDING)],
        unique=True,
        name="idx_event_unique"
    )


    db.system_metrics.create_index(
        [("timestamp", ASCENDING)],
        expireAfterSeconds=7 * 24 * 60 * 60,
        name="ttl_metrics_7d"
    )

    print("✅ MongoDB indexes ready!")

def setup_mongo_schema_validation():
    db = get_mongo_db()

    db.command({
        "collMod": "raw_logs",
        "validator": {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["timestamp", "node_id",
                             "log_level", "message"],
                "properties": {
                    "log_level": {
                        "bsonType": "string",
                        "enum": ["INFO", "WARNING", "ERROR"]
                    },
                    "node_id": {
                        "bsonType": "string"
                    },
                    "message": {
                        "bsonType": "string",
                        "minLength": 5
                    }
                }
            }
        },
        "validationLevel": "moderate"
    })

    print("✅ Schema validation ready!")

def setup_mongo():
    """Yeh ek function sab kuch karta hai — sirf ise call karo"""
    setup_mongo_indexes()
    setup_mongo_schema_validation()

if __name__ == "__main__":
    setup_mongo()