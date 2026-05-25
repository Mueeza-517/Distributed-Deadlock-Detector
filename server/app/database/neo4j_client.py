import os
from neo4j import GraphDatabase
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

NEO4J_URI = os.getenv("NEO4J_URI", "neo4j://127.0.0.1:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "test1234")
NEO4J_DATABASE = os.getenv("NEO4J_DATABASE", "deadlockdb")


class Neo4jClient:
    
    def __init__(self):
        self._driver = None

    def connect(self):
        try:
            self._driver = GraphDatabase.driver(
                NEO4J_URI,
                auth=(NEO4J_USER, NEO4J_PASSWORD)
            )
            self._driver.verify_connectivity()
            print(f"[NEO4J] Connected successfully to {NEO4J_URI}")
            print(f"[NEO4J] Using database: {NEO4J_DATABASE}")
        except Exception as e:
            print(f"[NEO4J] Connection failed: {e}")
            raise

    def close(self):
        if self._driver:
            self._driver.close()
            self._driver = None
            print("[NEO4J] Connection closed.")

    def _session(self):
        if not self._driver:
            self.connect()
        return self._driver.session(database=NEO4J_DATABASE)

    def add_transaction_node(self, tx_id: int, tx_name: str, node_id: str):
        query = """
            MERGE (t:Transaction {tx_id: $tx_id})
            SET t.tx_name = $tx_name,
                t.node_id = $node_id
        """
        with self._session() as s:
            s.run(query, tx_id=tx_id, tx_name=tx_name, node_id=node_id)
        print(f"[NEO4J] Transaction node added: {tx_name} (ID: {tx_id})")

    def add_resource_node(self, resource_name: str):
        query = """
            MERGE (r:Resource {name: $name})
        """
        with self._session() as s:
            s.run(query, name=resource_name)
        print(f"[NEO4J] Resource node added: {resource_name}")

    def add_holds_edge(self, tx_id: int, resource_name: str):
        query = """
            MATCH (t:Transaction {tx_id: $tx_id})
            MATCH (r:Resource {name: $resource_name})
            MERGE (t)-[:HOLDS]->(r)
        """
        with self._session() as s:
            s.run(query, tx_id=tx_id, resource_name=resource_name)
        print(f"[NEO4J] HOLDS relationship: Tx({tx_id}) → {resource_name}")

    def add_waits_for_edge(self, tx_id: int, resource_name: str):
        query = """
            MATCH (t:Transaction {tx_id: $tx_id})
            MATCH (r:Resource {name: $resource_name})
            MERGE (t)-[:WAITS_FOR]->(r)
        """
        with self._session() as s:
            s.run(query, tx_id=tx_id, resource_name=resource_name)
        print(f"[NEO4J] WAITS_FOR relationship: Tx({tx_id}) → {resource_name}")

    def remove_transaction(self, tx_id: int):
        query = """
            MATCH (t:Transaction {tx_id: $tx_id})
            DETACH DELETE t
        """
        with self._session() as s:
            s.run(query, tx_id=tx_id)
        print(f"[NEO4J] Transaction removed: Tx({tx_id})")

    def clear_all_test_data(self):
        with self._session() as s:
            s.run("MATCH (n) DETACH DELETE n")
        print("[NEO4J] All graph data cleared.")

    def get_full_graph(self) -> dict:
        query = """
            MATCH (n)
            OPTIONAL MATCH (n)-[r]->(m)
            RETURN
                id(n) AS source_id,
                labels(n)[0] AS source_type,
                CASE WHEN n:Transaction THEN n.tx_name
                     ELSE n.name END AS source_label,
                type(r) AS rel_type,
                id(m) AS target_id,
                labels(m)[0] AS target_type,
                CASE WHEN m:Transaction THEN m.tx_name
                     ELSE m.name END AS target_label
        """
        nodes_seen = set()
        nodes = []
        edges = []

        with self._session() as s:
            result = s.run(query)
            for record in result:
                sid = record["source_id"]
                if sid not in nodes_seen:
                    nodes_seen.add(sid)
                    nodes.append({
                        "id": sid,
                        "type": record["source_type"],
                        "label": record["source_label"]
                    })
                if record["target_id"] is not None:
                    tid = record["target_id"]
                    if tid not in nodes_seen:
                        nodes_seen.add(tid)
                        nodes.append({
                            "id": tid,
                            "type": record["target_type"],
                            "label": record["target_label"]
                        })
                    edges.append({
                        "source": sid,
                        "target": tid,
                        "type": record["rel_type"]
                    })

        return {"nodes": nodes, "edges": edges}


_neo4j_client = None

def get_neo4j_client() -> Neo4jClient:
    global _neo4j_client
    if _neo4j_client is None:
        _neo4j_client = Neo4jClient()
        _neo4j_client.connect()
    return _neo4j_client


if __name__ == "__main__":
    print("=" * 60)
    print("NEO4J CLIENT TEST")
    print("=" * 60)
    
    client = Neo4jClient()
    client.connect()

    client.add_resource_node("Table_Orders")
    client.add_resource_node("Table_Users")
    client.add_transaction_node(1, "Tx_Test1", "node-1")
    client.add_transaction_node(2, "Tx_Test2", "node-2")

    client.add_holds_edge(1, "Table_Orders")
    client.add_waits_for_edge(1, "Table_Users")
    client.add_holds_edge(2, "Table_Users")
    client.add_waits_for_edge(2, "Table_Orders")

    graph = client.get_full_graph()
    print(f"\n[NEO4J] Graph Summary: {len(graph['nodes'])} nodes, {len(graph['edges'])} edges")

    client.close()
    print("\n[NEO4J] Test completed successfully.")