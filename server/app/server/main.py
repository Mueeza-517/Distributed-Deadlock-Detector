import sys
sys.path.append('server')

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import random
import string

from app.services.postgres_service import (
    insert_transaction,
    insert_lock,
    save_deadlock_event,
    get_recent_deadlocks,
    get_all_transactions,
    get_waiting_locks,
    get_node_info
)
from app.services.mongo_service import (
    save_raw_log,
    save_llm_explanation,
    get_recent_logs,
    get_error_logs,
    get_explanation_by_event
)
from app.llm_client import explain_deadlock, get_prevention_tip

app = FastAPI(
    title="Distributed Deadlock Detector API",
    description="AI-powered deadlock detection system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from app.services.neo4j_service import (
    create_transaction_node,
    create_waits_for_edge,
    detect_deadlock_cycle,
    get_wait_for_graph,
    clear_resolved_transaction
)

# ─────────────────────────────────────────
# 1. HEALTH CHECK
# ─────────────────────────────────────────
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "message": "Deadlock Detector API is running!",
        "timestamp": str(datetime.now()),
        "version": "1.0.0"
    }

# ─────────────────────────────────────────
# 2. GET ALL DEADLOCKS
# ─────────────────────────────────────────
@app.get("/api/v1/deadlocks")
def get_deadlocks():
    try:
        events = get_recent_deadlocks(limit=20)
        node_info = get_node_info("node-1")
        deadlocks = []
        for event in events:
            deadlocks.append({
                "id": event["event_id"],
                "timestamp": event["detected_at"],
                "transactions": event["tx_ids_involved"],
                "resolved_by": event["resolved_by"],
                "resolution_time_ms": event["resolution_time_ms"],
                "status": "resolved",
                "node": node_info["node_id"],
                "server_location": node_info["location"]
            })
        return {"deadlocks": deadlocks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────
# 3. SIMULATE DEADLOCK
# ─────────────────────────────────────────
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

        # Prevention tip lo
        prevention_tip = get_prevention_tip(res1, res2)

        # Deadlock event save karo
        event_id = save_deadlock_event(
            tx_ids=[tx1_id, tx2_id],
            resolved_by=f"killed_{tx2_name}",
            resolution_time_ms=random.randint(100, 500)
        )
        # Neo4j mein graph update karo
        create_transaction_node(tx1_id, tx1_name, "node-1")
        create_transaction_node(tx2_id, tx2_name, "node-2")
        create_waits_for_edge(tx1_id, tx2_id, res2)
        create_waits_for_edge(tx2_id, tx1_id, res1)

        # Cycle detect karo
        cycles = detect_deadlock_cycle()

        # Resolved transaction clean karo
        clear_resolved_transaction(tx2_id)

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

        # Node info fetch karo
        node_info = get_node_info("node-1")

        return {
            "success": True,
            "deadlock": {
                "id": event_id,
                "timestamp": str(datetime.now()),
                "transactions": [tx1_name, tx2_name],
                "resources_involved": [res1, res2],
                "llm_explanation": llm_response,
                "prevention_tip": prevention_tip,
                "suggested_fix": f"Kill {tx2_name} to break the cycle.",
                "status": "resolved",
                "node": node_info["node_id"],
                "server_location": node_info["location"],
                "graph_cycle_detected": len(cycles) > 0,
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    # ─────────────────────────────────────────
# 10. WAIT-FOR GRAPH (Neo4j)
# ─────────────────────────────────────────
@app.get("/api/v1/graph")
def get_graph():
    try:
        graph = get_wait_for_graph()
        return graph
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────
# 11. DETECT CYCLE (Neo4j)
# ─────────────────────────────────────────
@app.get("/api/v1/detect")
def detect_cycle():
    try:
        cycles = detect_deadlock_cycle()
        return {
            "cycles_found": len(cycles),
            "deadlock_detected": len(cycles) > 0,
            "cycles": cycles
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────
# 4. GET LOGS
# ─────────────────────────────────────────
@app.get("/api/v1/logs")
def get_logs():
    try:
        logs = get_recent_logs(limit=50)
        return {"logs": logs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────
# 5. GET ALL TRANSACTIONS
# ─────────────────────────────────────────
@app.get("/api/v1/transactions")
def get_transactions():
    try:
        transactions = get_all_transactions()
        return {"transactions": transactions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────
# 6. GET WAITING LOCKS
# ─────────────────────────────────────────
@app.get("/api/v1/locks/waiting")
def get_waiting():
    try:
        locks = get_waiting_locks()
        return {"waiting_locks": locks}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────
# 7. GET NODES
# ─────────────────────────────────────────
@app.get("/api/v1/nodes")
def get_nodes():
    try:
        node_ids = ["node-1", "node-2", "node-3"]
        nodes = [get_node_info(n) for n in node_ids]
        return {"nodes": nodes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────
# 8. STATS
# ─────────────────────────────────────────
@app.get("/api/v1/stats")
def get_stats():
    try:
        events = get_recent_deadlocks(limit=100)
        total = len(events)

        avg_ms = 0
        if total > 0:
            avg_ms = sum(
                e["resolution_time_ms"]
                for e in events
                if e["resolution_time_ms"]
            ) / total

        waiting = get_waiting_locks()
        top_resource = "N/A"
        if waiting:
            top_resource = waiting[0]["resource_name"]

        return {
            "total_deadlocks": total,
            "avg_resolution_ms": round(avg_ms, 2),
            "most_affected_resource": top_resource,
            "resolved_percentage": 100,
            "active_nodes": 3
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ─────────────────────────────────────────
# 9. GET LLM EXPLANATION BY EVENT ID
# ─────────────────────────────────────────
@app.get("/api/v1/explanation/{event_id}")
def get_explanation(event_id: int):
    try:
        explanation = get_explanation_by_event(event_id)
        if not explanation:
            raise HTTPException(
                status_code=404,
                detail=f"No explanation found for event {event_id}"
            )
        return explanation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))