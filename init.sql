CREATE TABLE IF NOT EXISTS transactions (
    tx_id        SERIAL PRIMARY KEY,
    tx_name      VARCHAR(50) NOT NULL,
    started_at   TIMESTAMP DEFAULT NOW(),
    status       VARCHAR(20) DEFAULT 'active',
    node_id      VARCHAR(20),
    priority     INT DEFAULT 5,
    timeout_ms   INT DEFAULT 30000,
    retry_count  INT DEFAULT 0,
    ended_at     TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lock_history (
    lock_id       SERIAL PRIMARY KEY,
    tx_id         INT REFERENCES transactions(tx_id),
    resource_name VARCHAR(100) NOT NULL,
    lock_type     VARCHAR(20),
    acquired_at   TIMESTAMP DEFAULT NOW(),
    released_at   TIMESTAMP,
    is_waiting    BOOLEAN DEFAULT FALSE,
    wait_duration_ms INT,
    lock_mode     VARCHAR(20) DEFAULT 'exclusive'
);

CREATE TABLE IF NOT EXISTS deadlock_events (
    event_id      SERIAL PRIMARY KEY,
    detected_at   TIMESTAMP DEFAULT NOW(),
    tx_ids_involved INTEGER[],
    resolved_by   VARCHAR(50),
    resolution_time_ms INT,
    severity      VARCHAR(10) DEFAULT 'medium',
    node_count    INT DEFAULT 2,
    cycle_length  INT DEFAULT 2,
    prevention_tip TEXT
);

CREATE TABLE IF NOT EXISTS node_registry (
    node_id     VARCHAR(20) PRIMARY KEY,
    ip_address  VARCHAR(45) NOT NULL,
    port        INT DEFAULT 8000,
    status      VARCHAR(20) DEFAULT 'active',
    joined_at   TIMESTAMP DEFAULT NOW(),
    last_seen   TIMESTAMP DEFAULT NOW(),
    total_tx    INT DEFAULT 0,
    location    VARCHAR(100) DEFAULT 'Karachi, PK'
);

CREATE TABLE IF NOT EXISTS audit_log (
    audit_id    SERIAL PRIMARY KEY,
    table_name  VARCHAR(50) NOT NULL,
    operation   VARCHAR(10) NOT NULL,
    record_id   INT,
    changed_at  TIMESTAMP DEFAULT NOW(),
    node_id     VARCHAR(20),
    old_data    JSONB,
    new_data    JSONB
);

INSERT INTO node_registry (node_id, ip_address, port, location) VALUES
    ('node-1', '127.0.0.1', 8001, 'Karachi, PK'),
    ('node-2', '127.0.0.1', 8002, 'Lahore, PK'),
    ('node-3', '127.0.0.1', 8003, 'Islamabad, PK')
ON CONFLICT DO NOTHING;