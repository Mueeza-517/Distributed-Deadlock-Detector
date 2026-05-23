import psycopg2

def get_postgres_conn():
    conn = psycopg2.connect(
        host="localhost",
        database="deadlock_db",
        user="postgres",
        password="pass123"
    )
    return conn