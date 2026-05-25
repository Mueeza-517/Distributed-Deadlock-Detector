from neo4j import GraphDatabase
from dotenv import load_dotenv, find_dotenv
import os

load_dotenv(find_dotenv())

class Neo4jClient:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            os.getenv("NEO4J_URI", "bolt://localhost:7687"),
            auth=(
                os.getenv("NEO4J_USER", "neo4j"),
                os.getenv("NEO4J_PASSWORD", "neo4j123")
            )
        )

    def connect(self):
        self.driver.verify_connectivity()
        print("✅ Neo4j connected!")

    def close(self):
        self.driver.close()

    def get_session(self):
        return self.driver.session()


_client = None

def get_neo4j_client():
    global _client
    if _client is None:
        _client = Neo4jClient()
        _client.connect()
    return _client


if __name__ == "__main__":
    client = Neo4jClient()
    client.connect()
    client.close()