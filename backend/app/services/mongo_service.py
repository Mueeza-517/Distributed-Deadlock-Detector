from app.database.mongo_client import get_mongo_db
from datetime import datetime

# ─────────────────────────────────────────
# RAW LOGS FUNCTIONS
# ─────────────────────────────────────────

def save_raw_log(node_id: str, log_level: str,
                 message: str, extra_data: dict = None):
    """
    Raw log MongoDB mein save karo
    log_level: 'INFO', 'WARNING', 'ERROR'
    """
    db = get_mongo_db()

    log = {
        "timestamp": datetime.now(),
        "node_id": node_id,
        "log_level": log_level,
        "message": message,
    }

    if extra_data:
        log["extra_data"] = extra_data

    result = db.raw_logs.insert_one(log)
    print(f"✅ Log saved: [{log_level}] {message}")
    return str(result.inserted_id)


def get_recent_logs(limit: int = 20) -> list:
    """
    Recent logs fetch karo — latest pehle
    """
    db = get_mongo_db()

    logs = list(
        db.raw_logs
        .find({}, {"_id": 0})
        .sort("timestamp", -1)
        .limit(limit)
    )

    return logs


def get_error_logs() -> list:
    """
    Sirf ERROR level logs fetch karo
    """
    db = get_mongo_db()

    logs = list(
        db.raw_logs
        .find({"log_level": "ERROR"}, {"_id": 0})
        .sort("timestamp", -1)
    )

    return logs


# ─────────────────────────────────────────
# LLM EXPLANATION FUNCTIONS
# ─────────────────────────────────────────

def save_llm_explanation(event_id: int, deadlock_summary: str,
                         llm_response: str, suggested_fix: str):
    """
    LLM ki explanation MongoDB mein save karo
    """
    db = get_mongo_db()

    doc = {
        "event_id": event_id,
        "deadlock_summary": deadlock_summary,
        "llm_response": llm_response,
        "suggested_fix": suggested_fix,
        "generated_at": datetime.now()
    }

    result = db.llm_explanations.insert_one(doc)
    print(f"✅ LLM explanation saved for event {event_id}")
    return str(result.inserted_id)


def get_explanation_by_event(event_id: int) -> dict:
    """
    Specific event ki LLM explanation fetch karo
    """
    db = get_mongo_db()

    doc = db.llm_explanations.find_one(
        {"event_id": event_id},
        {"_id": 0}
    )

    return doc if doc else {}