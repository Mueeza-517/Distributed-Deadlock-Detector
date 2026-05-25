import sys
import os
from pathlib import Path

# Project root find karo (Distributed-Deadlock-Detector folder)
project_root = Path(__file__).parent.parent.parent.parent

# Server folder add karo path mein
server_folder = project_root / "server"
sys.path.insert(0, str(server_folder))
sys.path.insert(0, str(project_root))

# Ab import kaam karega
from app.database.neo4j_client import get_neo4j_client


def create_transaction_node(tx_id: int, tx_name: str, node_id: str):
    """
    Transaction ka node banao Neo4j mein
    """
    client = get_neo4j_client()
    with client.get_session() as session:
        session.run("""
            MERGE (t:Transaction {tx_id: $tx_id})
            SET t.tx_name = $tx_name,
                t.node_id = $node_id,
                t.status  = 'active'
        """, tx_id=tx_id, tx_name=tx_name, node_id=node_id)
    print(f"✅ Neo4j node created: {tx_name}")


def create_waits_for_edge(tx_id_from: int, tx_id_to: int,
                          resource: str):
    """
    Wait-for edge banao — deadlock detection ke liye
    tx_id_from → WAITS_FOR → tx_id_to
    """
    client = get_neo4j_client()
    with client.get_session() as session:
        session.run("""
            MATCH (a:Transaction {tx_id: $from_id})
            MATCH (b:Transaction {tx_id: $to_id})
            MERGE (a)-[r:WAITS_FOR {resource: $resource}]->(b)
        """, from_id=tx_id_from, to_id=tx_id_to,
             resource=resource)
    print(f"✅ Edge: Tx {tx_id_from} WAITS_FOR Tx {tx_id_to} "
          f"on {resource}")


def detect_deadlock_cycle() -> list:
    """
    Cypher query — cycle detect karo wait-for graph mein
    Returns: list of cycles (each cycle = list of tx_ids)
    """
    client = get_neo4j_client()
    with client.get_session() as session:
        result = session.run("""
            MATCH path = (t:Transaction)-[:WAITS_FOR*2..10]->(t)
            WITH nodes(path) AS cycle_nodes
            RETURN [n IN cycle_nodes | n.tx_id]  AS cycle,
                   [n IN cycle_nodes | n.tx_name] AS names
            LIMIT 5
        """)
        cycles = []
        for record in result:
            cycles.append({
                "tx_ids":   record["cycle"],
                "tx_names": record["names"]
            })
        return cycles


def get_wait_for_graph() -> dict:
    """
    Poora wait-for graph fetch karo — frontend visualization ke liye
    """
    client = get_neo4j_client()
    with client.get_session() as session:
        result = session.run("""
            MATCH (a:Transaction)-[r:WAITS_FOR]->(b:Transaction)
            RETURN a.tx_id   AS from_id,
                   a.tx_name AS from_name,
                   b.tx_id   AS to_id,
                   b.tx_name AS to_name,
                   r.resource AS resource
        """)
        nodes = {}
        edges = []
        for record in result:
            nodes[record["from_id"]] = record["from_name"]
            nodes[record["to_id"]]   = record["to_name"]
            edges.append({
                "from":     record["from_id"],
                "to":       record["to_id"],
                "resource": record["resource"]
            })
        return {
            "nodes": [{"id": k, "name": v}
                      for k, v in nodes.items()],
            "edges": edges
        }


def clear_resolved_transaction(tx_id: int):
    """
    Resolved transaction ka node aur edges delete karo
    """
    client = get_neo4j_client()
    with client.get_session() as session:
        session.run("""
            MATCH (t:Transaction {tx_id: $tx_id})
            DETACH DELETE t
        """, tx_id=tx_id)
    print(f"✅ Neo4j: Tx {tx_id} removed from graph")


if __name__ == "__main__":
    # Test karo
    create_transaction_node(101, "Tx_Test1", "node-1")
    create_transaction_node(102, "Tx_Test2", "node-2")

    create_waits_for_edge(101, 102, "Table_Orders")
    create_waits_for_edge(102, 101, "Table_Users")

    print("\n🔍 Detecting cycles...")
    cycles = detect_deadlock_cycle()
    if cycles:
        print(f"⚠️  Deadlock found: {cycles}")
    else:
        print("✅ No deadlock detected")

    print("\n📊 Wait-for graph:")
    graph = get_wait_for_graph()
    print(graph)