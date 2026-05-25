import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..'))

from server.app.database.neo4j_client import Neo4jClient

NEO4J_URI = "neo4j://127.0.0.1:7687"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "test1234"
NEO4J_DATABASE = "deadlockdb"


class DeadlockDetector:

    def __init__(self):
        self.client = Neo4jClient()
        self.client.connect()

    def add_deadlock_scenario(
        self,
        tx1_id: int,
        tx1_name: str,
        tx2_id: int,
        tx2_name: str,
        resource1: str,
        resource2: str,
        node_id: str = "node-1"
    ):
        c = self.client

        c.add_transaction_node(tx1_id, tx1_name, node_id)
        c.add_transaction_node(tx2_id, tx2_name, node_id)
        c.add_resource_node(resource1)
        c.add_resource_node(resource2)

        c.add_holds_edge(tx1_id, resource1)
        c.add_waits_for_edge(tx1_id, resource2)
        c.add_holds_edge(tx2_id, resource2)
        c.add_waits_for_edge(tx2_id, resource1)

    def detect_cycles(self) -> list:
        cypher = """
            MATCH
                (t1:Transaction)-[:WAITS_FOR]->(r1:Resource),
                (t2:Transaction)-[:HOLDS]    ->(r1),
                (t2)-[:WAITS_FOR]            ->(r2:Resource),
                (t1)-[:HOLDS]               ->(r2)
            WHERE t1 <> t2
              AND t1.tx_id < t2.tx_id
            RETURN
                t1.tx_id   AS tx1_id,
                t1.tx_name AS tx1_name,
                t2.tx_id   AS tx2_id,
                t2.tx_name AS tx2_name,
                r1.name    AS resource_1,
                r2.name    AS resource_2
        """

        deadlocks = []

        with self.client._session() as session:
            result = session.run(cypher)
            for record in result:
                deadlocks.append({
                    "tx1_id": record["tx1_id"],
                    "tx1_name": record["tx1_name"],
                    "tx2_id": record["tx2_id"],
                    "tx2_name": record["tx2_name"],
                    "resource_1": record["resource_1"],
                    "resource_2": record["resource_2"],
                })

        return deadlocks

    def print_results(self, deadlocks: list):
        if not deadlocks:
            print("✅ No deadlocks found")
        else:
            print(f"🚨 {len(deadlocks)} deadlock(s) found:")
            for d in deadlocks:
                print(f"   {d['tx1_name']} ↔ {d['tx2_name']} (via {d['resource_1']} / {d['resource_2']})")

    def close(self):
        self.client.close()


if __name__ == "__main__":

    detector = DeadlockDetector()

    detector.client.clear_all_test_data()

    detector.add_deadlock_scenario(
        tx1_id=1, tx1_name="Tx_Alpha",
        tx2_id=2, tx2_name="Tx_Beta",
        resource1="Table_Orders",
        resource2="Table_Users"
    )

    deadlocks = detector.detect_cycles()
    detector.print_results(deadlocks)

    detector.client.clear_all_test_data()

    detector.client.add_transaction_node(3, "Tx_Solo", "node-1")
    detector.client.add_resource_node("Table_Products")
    detector.client.add_holds_edge(3, "Table_Products")

    deadlocks2 = detector.detect_cycles()
    detector.print_results(deadlocks2)

    detector.client.clear_all_test_data()
    detector.close()