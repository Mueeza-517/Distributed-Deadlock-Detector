# test_insert.py

from database import get_postgres_conn, get_mongo_db
from datetime import datetime

# PostgreSQL mein sample data
conn = get_postgres_conn()
cur = conn.cursor()

cur.execute("""
    INSERT INTO transactions (tx_name, status, node_id)
    VALUES ('Tx_Alpha', 'active', 'node-1'),
           ('Tx_Beta', 'active', 'node-2')
""")

cur.execute("""
    INSERT INTO lock_history (tx_id, resource_name, lock_type, is_waiting)
    VALUES (1, 'Table_Orders', 'exclusive', false),
           (2, 'Table_Users', 'exclusive', false),
           (1, 'Table_Users', 'exclusive', true),   -- Tx1 is waiting
           (2, 'Table_Orders', 'exclusive', true)   -- Tx2 is waiting = DEADLOCK!
""")

conn.commit()
cur.close()
conn.close()
print("✅ PostgreSQL test data inserted!")

# MongoDB mein sample log
db = get_mongo_db()
db.raw_logs.insert_many([
    {
        "timestamp": datetime.now(),
        "node_id": "node-1",
        "log_level": "WARNING",
        "message": "Tx_Alpha waiting for lock on Table_Users",
        "tx_name": "Tx_Alpha"
    },
    {
        "timestamp": datetime.now(),
        "node_id": "node-2", 
        "log_level": "ERROR",
        "message": "Potential deadlock detected between Tx_Alpha and Tx_Beta",
        "tx_ids": [1, 2]
    }
])
print("✅ MongoDB test data inserted!")