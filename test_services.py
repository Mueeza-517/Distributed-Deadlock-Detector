import sys
sys.path.append('backend')

from app.services.postgres_service import (
    insert_transaction,
    insert_lock,
    save_deadlock_event,
    get_waiting_locks,
    get_recent_deadlocks,
    get_all_transactions
)
from app.services.mongo_service import (
    save_raw_log,
    save_llm_explanation,
    get_recent_logs,
    get_error_logs,
    get_explanation_by_event
)

print("\n" + "="*50)
print("   TESTING POSTGRESQL FUNCTIONS")
print("="*50)

tx1_id = insert_transaction("Tx_Gamma", "node-1")
tx2_id = insert_transaction("Tx_Delta", "node-2")


insert_lock(tx1_id, "Table_Products", "exclusive", False)
insert_lock(tx2_id, "Table_Inventory", "exclusive", False)
insert_lock(tx1_id, "Table_Inventory", "exclusive", True)
insert_lock(tx2_id, "Table_Products", "exclusive", True)


print("\n📋 Waiting Locks:")
waiting = get_waiting_locks()
for lock in waiting:
    print(f"  → {lock['tx_name']} waiting for {lock['resource_name']}")


event_id = save_deadlock_event(
    tx_ids=[tx1_id, tx2_id],
    resolved_by=f"killed_tx_{tx2_id}",
    resolution_time_ms=150
)


print("\n📋 Recent Deadlocks:")
deadlocks = get_recent_deadlocks()
for d in deadlocks:
    print(f"  → Event {d['event_id']}: {d['resolved_by']}")

print("\n" + "="*50)
print("   TESTING MONGODB FUNCTIONS")
print("="*50)


save_raw_log("node-1", "WARNING",
             "Tx_Gamma waiting for Table_Inventory")
save_raw_log("node-2", "ERROR",
             "Deadlock detected between Tx_Gamma and Tx_Delta",
             extra_data={"tx_ids": [tx1_id, tx2_id]})


save_llm_explanation(
    event_id=event_id,
    deadlock_summary="Tx_Gamma held Products, waited Inventory. "
                     "Tx_Delta held Inventory, waited Products.",
    llm_response="Circular wait detected. Kill Tx_Delta.",
    suggested_fix="Always lock tables in alphabetical order."
)


print("\n📋 Recent Logs:")
logs = get_recent_logs(5)
for log in logs:
    print(f"  → [{log['log_level']}] {log['message']}")

print("\n📋 Error Logs Only:")
errors = get_error_logs()
for e in errors:
    print(f"  → {e['message']}")

print(f"\n📋 LLM Explanation for Event {event_id}:")
explanation = get_explanation_by_event(event_id)
if explanation:
    print(f"  → {explanation['suggested_fix']}")

print("\n✅ Day 3 Complete! Sab functions working hain!")