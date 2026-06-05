#  Distributed Deadlock Detector

A full-stack distributed database monitoring and visualization system that simulates, detects, analyzes, and resolves deadlocks using a hybrid multi-database architecture. The project combines PostgreSQL, MongoDB, Neo4j, FastAPI, React, and AI-powered analysis to provide an interactive environment for studying distributed deadlock management.

---

##  Table of Contents

- Overview
- System Architecture
- Features
- Concepts Demonstrated
- Tech Stack
- Project Structure
- Getting Started
  - Prerequisites
  - Docker Setup
  - Manual Setup
- Environment Variables
- API Endpoints
- How It Works
- Database Responsibilities
- Future Enhancements
- Team

---

#  Overview

Distributed systems frequently encounter resource contention where multiple transactions compete for shared resources. When transactions wait indefinitely for one another, a deadlock occurs.

The **Distributed Deadlock Detector** demonstrates how deadlocks are created, detected, visualized, analyzed, and resolved within a distributed database environment.

The system integrates:

- PostgreSQL for transaction and lock management
- MongoDB for event logging and auditing
- Neo4j for wait-for graph visualization
- FastAPI for backend orchestration
- React for interactive dashboards
- Hugging Face LLMs for AI-generated deadlock explanations

This project was developed as part of the **Advanced Database Management Systems (ADBMS)** course and showcases practical implementation of distributed deadlock detection techniques.

---

#  System Architecture

```text
                    ┌─────────────────┐
                    │  React Frontend │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ FastAPI Backend │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼

 ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
 │ PostgreSQL     │ │ MongoDB        │ │ Neo4j          │
 │ Transactions   │ │ Event Logs     │ │ Wait-For Graph │
 │ Lock Records   │ │ Audit Trails   │ │ Cycle Analysis │
 └────────────────┘ └────────────────┘ └────────────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ Hugging Face LLM    │
                  │ Deadlock Analysis   │
                  └─────────────────────┘
```

---

#  Features

###  Distributed Deadlock Simulation

Generate realistic deadlock scenarios involving multiple transactions and shared resources.

###  AI-Powered Root Cause Analysis

Automatically generate natural language explanations of deadlock situations using Hugging Face LLMs.

###  Hybrid Multi-Database Architecture

Utilizes three database paradigms:

- Relational Database (PostgreSQL)
- Document Database (MongoDB)
- Graph Database (Neo4j)

###  Real-Time Dashboard

Monitor:

- Active transactions
- Waiting locks
- Deadlock history
- Resolution statistics

###  Wait-For Graph Visualization

Visualize transaction dependencies and deadlock cycles using Neo4j.

###  Analytics & Reporting

Analyze:

- Deadlock frequency
- Resolution rates
- Resource contention patterns
- Transaction trends


###  Automatic API Documentation

Interactive Swagger documentation provided by FastAPI.

---

# Concepts Demonstrated

This project demonstrates several advanced database concepts:

- Distributed Transactions
- Two-Phase Locking (2PL)
- Wait-For Graphs
- Deadlock Detection
- Deadlock Resolution
- Victim Selection Algorithms
- Resource Contention Management
- Distributed Database Systems
- Graph Databases
- AI-Assisted System Analysis

---

#  Tech Stack

| Layer | Technology |
|---------|------------|
| Frontend | React 18, Vite, Recharts |
| Backend | FastAPI, Python 3.11, Uvicorn |
| Relational Database | PostgreSQL 17 |
| Document Database | MongoDB 7 |
| Graph Database | Neo4j 5 |
| AI Analysis | Hugging Face Inference API |
| Containerization | Docker, Docker Compose |

---

#  Project Structure

```text
Distributed-Deadlock-Detector/

│
├── docker-compose.yml
├── init.sql
├── .env
│
├── server/
│   │
│   ├── Dockerfile
│   ├── requirements.txt
│   │
│   └── app/
│       │
│       ├── database/
│       │   ├── postgres_client.py
│       │   ├── mongo_client.py
│       │   └── neo4j_client.py
│       │
│       ├── services/
│       │   ├── postgres_service.py
│       │   ├── mongo_service.py
│       │   ├── neo4j_service.py
│       │   └── deadlock_service.py
│       │
│       └── server/
│           └── main.py
│
└── client/
    │
    ├── package.json
    │
    └── src/
        │
        ├── App.jsx
        ├── services/
        ├── hooks/
        └── components/
```

---

#  Getting Started

## Prerequisites

Install the following software:

- Docker Desktop
- Node.js 18+
- Git
- Hugging Face Account

---

#  Docker Setup (Recommended)

### Clone Repository

```bash
git clone https://github.com/your-username/Distributed-Deadlock-Detector.git

cd Distributed-Deadlock-Detector
```

### Create Environment File

```env
HF_TOKEN=your_huggingface_token
```

### Start Services

```bash
docker-compose up --build
```

Wait until Neo4j starts completely.

### Run Frontend

```bash
cd client

npm install

npm run dev
```

---

#  Manual Setup

## PostgreSQL

Create database:

```sql
CREATE DATABASE deadlock_db;
```

Run:

```sql
init.sql
```

## MongoDB

Start MongoDB on:

```text
localhost:27017
```

## Neo4j

Default Ports:

```text
7474
7687
```

Password:

```text
neo4j123
```

## Backend

```bash
cd server

pip install -r requirements.txt

uvicorn app.server.main:app --reload
```

## Frontend

```bash
cd client

npm install

npm run dev
```

---

#  Environment Variables

```env
PG_HOST=postgres
PG_DB=deadlock_db
PG_USER=postgres
PG_PASSWORD=postgres

MONGO_URI=mongodb://mongodb:27017/

NEO4J_URI=bolt://neo4j:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=neo4j123

HF_TOKEN=your_huggingface_token
```

---

#  API Endpoints

Base URL:

```text
http://localhost:8000/api/v1
```

| Method | Endpoint | Description |
|----------|----------|-------------|
| GET | /health | Backend health check |
| GET | /deadlocks | Fetch all deadlocks |
| POST | /deadlocks/simulate | Generate deadlock |
| GET | /transactions | List transactions |
| GET | /locks | List locks |
| GET | /graph | Neo4j graph data |
| GET | /logs | MongoDB logs |
| GET | /stats | System statistics |
| GET | /analytics | Analytics dashboard |

Swagger Documentation:

```text
http://localhost:8000/docs
```

---

#  How It Works

```text
User clicks Simulate
          │
          ▼
Generate Transactions
(Tx_A and Tx_B)
          │
          ▼
Acquire Resources
          │
          ▼
Circular Wait Created
          │
          ▼
Deadlock Detected
          │
          ▼
Wait-For Graph Updated
          │
          ▼
Victim Selected
          │
          ▼
Deadlock Resolved
          │
          ▼
AI Analysis Generated
          │
          ▼
Dashboard Updated
```

---

# Database Responsibilities

| Database | Responsibility |
|------------|---------------|
| PostgreSQL | Transactions, locks, deadlock metadata |
| MongoDB | Event logs, audit trails |
| Neo4j | Wait-for graph, cycle detection |

---

#  Future Enhancements

- Multi-node distributed cluster simulation
- Real-time PostgreSQL lock monitoring
- Machine learning based deadlock prediction
- Kafka event streaming
- Kubernetes deployment
- Distributed consensus simulation
- Advanced victim selection strategies
- Historical deadlock forecasting

---

#  Team 

| Name | Roll Number |
|---------|------------|
| Musfirah Zainab | 2024-CS-21 |
| Aiman Rehman | 2024-CS-17 |
| Mueeza Akbar | 2024-CS-34 |

# Contributors

| Musfirah Zainab | https://github.com/Musfirah-999 |
| Mueeza Akbar | https://github.com/Mueeza-517 |
| Aiman Rehman | https://github.com/AIMAN2244 |

---

### University

University of Engineering and Technology (UET), Lahore

### Session

2024 – 2028

### Course

Advanced Database Management Systems (ADBMS)

