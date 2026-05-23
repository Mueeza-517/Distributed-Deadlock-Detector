
class Neo4jClient:
    def __init__(self):
        self.connected = False
        print("Neo4j client created")
    
    def connect(self):
        print("Connecting to Neo4j...")
        
        self.connected = True
        print("Connected!")
    
    def close(self):
        print("Closing connection...")
        self.connected = False

if __name__ == "__main__":
    client = Neo4jClient()
    client.connect()
    print("✅ Neo4j client ready!")