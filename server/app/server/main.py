import sys
sys.path.append('backend')

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import string
from datetime import datetime

from app.services.postgres_service import (
    insert_transaction,
    insert_lock,
    save_deadlock_event,
    get_recent_deadlocks,
    get_all_transactions,
    get_waiting_locks,
    get_node_info          # ← yeh add karo
)

from app.services.postgres_service import (
    insert_transaction,
    insert_lock,
    save_deadlock_event,
    get_recent_deadlocks,
    get_all_transactions,
    get_waiting_locks
)
from app.services.mongo_service import (
    save_raw_log,
    save_llm_explanation,
    get_recent_logs,
    get_error_logs,
    get_explanation_by_event
)
from app.llm_client import explain_deadlock

app = FastAPI(
    title="Distributed Deadlock Detector API",
    description="AI-powered deadlock detection system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "online",
        "message": "Deadlock Detector API is running!",
        "timestamp": str(datetime.now()),
        "version": "1.0.0"
    }

@app.get("/api/v1/deadlocks")
def get_deadlocks():
    try:
        events = get_recent_deadlocks(limit=20)
        deadlocks = []
        for event in events:
            # Real node info fetch karo
            node_id = "node-1"
            node_info = get_node_info(node_id)
            
            deadlocks.append({
                "id": event["event_id"],
                "timestamp": event["detected_at"],
                "transactions": event["tx_ids_involved"],
                "resolved_by": event["resolved_by"],
                "resolution_time_ms": event["resolution_time_ms"],
                "status": "resolved",
                "node": node_info["node_id"],
                "server_location": node_info["location"]  # ← DB se aa raha hai
            })
        return {"deadlocks": deadlocks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/deadlocks/simulate")
def simulate_deadlock():
    try:
        # Random transaction names
        suffix1 = ''.join(random.choices(string.ascii_uppercase, k=3))
        suffix2 = ''.join(random.choices(string.ascii_uppercase, k=3))
        tx1_name = f"Tx_{suffix1}"
        tx2_name = f"Tx_{suffix2}"

        # Random resources
        resources = [
            ("Table_Orders", "Table_Users"),
            ("Table_Products", "Table_Inventory"),
            ("Table_Accounts", "Table_Payments"),
        ]
        res1, res2 = random.choice(resources)

        # PostgreSQL mein save karo
        tx1_id = insert_transaction(tx1_name, "node-1")
        tx2_id = insert_transaction(tx2_name, "node-2")

        insert_lock(tx1_id, res1, "exclusive", False)
        insert_lock(tx2_id, res2, "exclusive", False)
        insert_lock(tx1_id, res2, "exclusive", True)
        insert_lock(tx2_id, res1, "exclusive", True)

        # MongoDB mein log karo
        save_raw_log("node-1", "WARNING",
                     f"{tx1_name} waiting for {res2}")
        save_raw_log("node-2", "ERROR",
                     f"Deadlock detected between {tx1_name} and {tx2_name}",
                     extra_data={"tx_ids": [tx1_id, tx2_id]})

        # LLM explanation lo
        deadlock_info = {
            "tx1_name": tx1_name,
            "tx1_holding": res1,
            "tx1_waiting": res2,
            "tx2_name": tx2_name,
            "tx2_holding": res2,
            "tx2_waiting": res1
        }
        llm_response = explain_deadlock(deadlock_info)

        # Deadlock event save karo
        event_id = save_deadlock_event(
            tx_ids=[tx1_id, tx2_id],
            resolved_by=f"killed_{tx2_name}",
            resolution_time_ms=random.randint(100, 500)
        )

        # LLM explanation MongoDB mein save karo
        save_llm_explanation(
            event_id=event_id,
            deadlock_summary=(
                f"{tx1_name} held {res1}, waited {res2}. "
                f"{tx2_name} held {res2}, waited {res1}."
            ),
            llm_response=llm_response,
            suggested_fix=f"Kill {tx2_name} to break the cycle."
        )

        node_info = get_node_info("node-1")
        return {
            "success": True,
            "deadlock": {
                "id": event_id,
                "timestamp": str(datetime.now()),
                "transactions": [tx1_name, tx2_name],
                "llm_explanation": llm_response,
                "suggested_fix": f"Kill {tx2_name} to break the cycle.",
                "status": "resolved",
                "node": node_info["node_id"],
                "server_location": node_info["location"]
            }
        }
        

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/logs")
def get_logs():
    try:
        logs = get_recent_logs(limit=50)
        return {"logs": logs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/transactions")
def get_transactions():
    try:
        transactions = get_all_transactions()
        return {"transactions": transactions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/locks/waiting")
def get_waiting():
    try:
        locks = get_waiting_locks()
        return {"waiting_locks": locks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/v1/nodes")
def get_nodes():
    try:
        node_ids = ["node-1", "node-2", "node-3"]
        nodes = [get_node_info(n) for n in node_ids]
        return {"nodes": nodes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))