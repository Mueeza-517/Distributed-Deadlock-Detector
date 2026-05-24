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


def save_system_metric(node_id: str, cpu_percent: float,
                       memory_percent: float, 
                       active_tx_count: int):
    """
    Node ka system metric save karo — real-time monitoring
    """
    db = get_mongo_db()
    db.system_metrics.insert_one({
        "timestamp": datetime.now(),
        "node_id": node_id,
        "cpu_percent": cpu_percent,
        "memory_percent": memory_percent,
        "active_tx_count": active_tx_count,
        "status": "healthy" if cpu_percent < 80 else "stressed"
    })


def save_deadlock_snapshot(event_id: int, 
                           transactions: list,
                           locks: list,
                           llm_explanation: str):
    """
    Deadlock ke waqt poora state save karo
    """
    db = get_mongo_db()
    db.deadlock_snapshots.insert_one({
        "event_id": event_id,
        "captured_at": datetime.now(),
        "transactions_involved": transactions,
        "lock_state": locks,
        "llm_explanation": llm_explanation,
        "graph_data": {
            "nodes": [t["tx_name"] for t in transactions],
            "edges": [
                {"from": l["tx_name"], 
                 "to": l["resource_name"]}
                for l in locks if l.get("is_waiting")
            ]
        }
    })


def get_hourly_deadlock_stats() -> list:
    """
    Aggregation pipeline — dashboard chart ke liye
    """
    db = get_mongo_db()

    pipeline = [
        # Sirf ERROR logs lo
        {"$match": {"log_level": "ERROR"}},

        # Hour ke hisaab se group karo
        {"$group": {
            "_id": {
                "hour": {"$hour": "$timestamp"},
                "node": "$node_id"
            },
            "count": {"$sum": 1},
            "latest": {"$max": "$timestamp"}
        }},

        # Sort by hour
        {"$sort": {"_id.hour": 1}},

        # Clean format
        {"$project": {
            "_id": 0,
            "hour": "$_id.hour",
            "node": "$_id.node",
            "deadlock_count": "$count",
            "latest": 1
        }}
    ]

    return list(db.raw_logs.aggregate(pipeline))


def get_node_health_summary() -> list:
    """
    Har node ka health status — dashboard ke liye
    """
    db = get_mongo_db()

    pipeline = [
        # Latest metrics per node
        {"$sort": {"timestamp": -1}},
        {"$group": {
            "_id": "$node_id",
            "latest_cpu": {"$first": "$cpu_percent"},
            "latest_memory": {"$first": "$memory_percent"},
            "active_tx": {"$first": "$active_tx_count"},
            "status": {"$first": "$status"},
            "last_seen": {"$first": "$timestamp"}
        }},
        {"$project": {
            "_id": 0,
            "node_id": "$_id",
            "cpu": "$latest_cpu",
            "memory": "$latest_memory",
            "active_transactions": "$active_tx",
            "status": 1,
            "last_seen": 1
        }}
    ]

    return list(db.system_metrics.aggregate(pipeline))


def detect_anomaly(node_id: str) -> dict:
    """
    Simple anomaly detection —
    agar last 5 min mein 3+ errors aaye toh alert
    """
    db = get_mongo_db()
    from datetime import timedelta

    five_min_ago = datetime.now() - timedelta(minutes=5)

    error_count = db.raw_logs.count_documents({
        "node_id": node_id,
        "log_level": "ERROR",
        "timestamp": {"$gte": five_min_ago}
    })

    return {
        "node_id": node_id,
        "error_count_last_5min": error_count,
        "anomaly_detected": error_count >= 3,
        "alert": f"⚠️ {error_count} errors in last 5 min!"
                 if error_count >= 3 else "✅ Normal"
    }