import psycopg2
from psycopg2 import pool
import os
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())

_connection_pool = None

def get_pool():
    global _connection_pool
    if _connection_pool is None:
        _connection_pool = pool.SimpleConnectionPool(
            minconn=2,
            maxconn=10,
            host=os.getenv("PG_HOST", "localhost"),
            database=os.getenv("PG_DB", "deadlock_db"),
            user=os.getenv("PG_USER", "postgres"),
            password=os.getenv("PG_PASSWORD", "pass123")
        )
        print("✅ PostgreSQL connection pool created!")
    return _connection_pool

def get_postgres_conn():
    return get_pool().getconn()

def release_conn(conn):
    get_pool().putconn(conn)