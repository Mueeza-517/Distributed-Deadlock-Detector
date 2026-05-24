# postgres_client.py — replace kar do puri file
from psycopg2 import pool

# Ek baar pool banao — reuse karo
_connection_pool = None

def get_pool():
    global _connection_pool
    if _connection_pool is None:
        _connection_pool = pool.SimpleConnectionPool(
            minconn=2,
            maxconn=10,
            host="localhost",
            database="deadlock_db",
            user="postgres",
            password="pass123"
        )
        print("✅ PostgreSQL connection pool created!")
    return _connection_pool

def get_postgres_conn():
    return get_pool().getconn()

def release_conn(conn):
    get_pool().putconn(conn)