from app.database.postgres_client import get_postgres_conn, release_conn
from datetime import datetime


def insert_transaction(tx_name: str, node_id: str) -> int:
    conn = get_postgres_conn()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO transactions (tx_name, status, node_id)
            VALUES (%s, 'active', %s)
            RETURNING tx_id
        """, (tx_name, node_id))
        tx_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        print(f"✅ Transaction inserted: {tx_name} (ID: {tx_id})")
        return tx_id
    finally:
        release_conn(conn)


def update_transaction_status(tx_id: int, status: str):
    """
    Transaction ka status update karo
    status: 'active', 'committed', 'aborted'
    """
    conn = get_postgres_conn()
    cur = conn.cursor()

    cur.execute("""
        UPDATE transactions
        SET status = %s
        WHERE tx_id = %s
    """, (status, tx_id))

    conn.commit()
    cur.close()
    conn.close()
    print(f"✅ Transaction {tx_id} status updated to: {status}")


def get_all_transactions() -> list:
    """
    Saari transactions fetch karo
    """
    conn = get_postgres_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT tx_id, tx_name, started_at, status, node_id
        FROM transactions
        ORDER BY started_at DESC
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    transactions = []
    for row in rows:
        transactions.append({
            "tx_id": row[0],
            "tx_name": row[1],
            "started_at": str(row[2]),
            "status": row[3],
            "node_id": row[4]
        })

    return transactions


# ─────────────────────────────────────────
# LOCK FUNCTIONS
# ─────────────────────────────────────────

def insert_lock(tx_id: int, resource_name: str,
                lock_type: str, is_waiting: bool) -> int:
    """
    Lock insert karo
    Returns: lock_id (int)
    """
    conn = get_postgres_conn()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO lock_history
            (tx_id, resource_name, lock_type, is_waiting)
        VALUES (%s, %s, %s, %s)
        RETURNING lock_id
    """, (tx_id, resource_name, lock_type, is_waiting))

    lock_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    print(f"✅ Lock inserted on {resource_name} "
          f"by Tx {tx_id} (waiting: {is_waiting})")
    return lock_id


def get_waiting_locks() -> list:
    """
    Sirf waiting locks fetch karo — deadlock detection ke liye
    """
    conn = get_postgres_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT l.lock_id, l.tx_id, t.tx_name,
               l.resource_name, l.lock_type, l.acquired_at
        FROM lock_history l
        JOIN transactions t ON l.tx_id = t.tx_id
        WHERE l.is_waiting = TRUE
        ORDER BY l.acquired_at ASC
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    locks = []
    for row in rows:
        locks.append({
            "lock_id": row[0],
            "tx_id": row[1],
            "tx_name": row[2],
            "resource_name": row[3],
            "lock_type": row[4],
            "acquired_at": str(row[5])
        })

    return locks


# ─────────────────────────────────────────
# DEADLOCK FUNCTIONS
# ─────────────────────────────────────────

def save_deadlock_event(tx_ids: list, resolved_by: str,
                        resolution_time_ms: int) -> int:
    conn = get_postgres_conn()
    try:
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO deadlock_events
                (tx_ids_involved, resolved_by, resolution_time_ms)
            VALUES (%s, %s, %s)
            RETURNING event_id
        """, (tx_ids, resolved_by, resolution_time_ms))
        event_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        print(f"✅ Deadlock event saved (ID: {event_id})")
        return event_id
    finally:
        release_conn(conn)


def get_recent_deadlocks(limit: int = 10) -> list:
    """
    Recent deadlock events fetch karo
    """
    conn = get_postgres_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT event_id, detected_at,
               tx_ids_involved, resolved_by, resolution_time_ms
        FROM deadlock_events
        ORDER BY detected_at DESC
        LIMIT %s
    """, (limit,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    events = []
    for row in rows:
        events.append({
            "event_id": row[0],
            "detected_at": str(row[1]),
            "tx_ids_involved": row[2],
            "resolved_by": row[3],
            "resolution_time_ms": row[4]
        })

    return events

def get_recent_deadlocks(limit: int = 10) -> list:
    conn = get_postgres_conn()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT event_id, detected_at,
                   tx_ids_involved, resolved_by, resolution_time_ms
            FROM deadlock_events
            ORDER BY detected_at DESC
            LIMIT %s
        """, (limit,))
        rows = cur.fetchall()
        cur.close()
        events = []
        for row in rows:
            events.append({
                "event_id": row[0],
                "detected_at": str(row[1]),
                "tx_ids_involved": row[2],
                "resolved_by": row[3],
                "resolution_time_ms": row[4]
            })
        return events
    finally:
        release_conn(conn)
        
def get_node_info(node_id: str = "node-1") -> dict:
    conn = get_postgres_conn()
    try:
        cur = conn.cursor()
        cur.execute("""
            SELECT node_id, ip_address, port,
                   status, last_seen, total_tx, location
            FROM node_registry
            WHERE node_id = %s
        """, (node_id,))
        row = cur.fetchone()
        cur.close()
        if row:
            return {
                "node_id": row[0],
                "ip_address": row[1],
                "port": row[2],
                "status": row[3],
                "last_seen": str(row[4]),
                "total_tx": row[5],
                "location": row[6]
            }
        return {"node_id": node_id, "location": "Karachi, PK"}
    finally:
        release_conn(conn)