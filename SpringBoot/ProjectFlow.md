# NetWatch – Real-Time Network Monitoring & Control System

## 1️⃣ Project Stages

### Beginner Stage – Local Packet Capture & Visualization
**Goal:** Learn basic networking, sockets, and traffic analysis.

**Features:**
- Capture network packets using:
    - Python: `scapy`
    - Java: `pcap4j`
- Parse IP, TCP/UDP headers.
- Store captured data in a local DB (SQLite or PostgreSQL).
- Display traffic in a simple CLI or basic HTML page:
    - Protocol
    - Source/Destination IP
    - Packet size

**Tech Stack:**
- Language: Python or Java
- DB: SQLite/PostgreSQL
- UI: Minimal HTML or CLI

**Milestone:** See real traffic data (ping, HTTP requests) captured from your own machine.

---

### Intermediate Stage – Distributed Monitoring with Alerts
**Goal:** Learn microservices, APIs, and real-time streaming.

**Features:**
- Multiple agents run on different machines capturing local packets.
- Agents send data to a central collector via REST or gRPC.
- Introduce Kafka for real-time streaming of packet events.
- Web Dashboard (React + Tailwind) shows:
    - Live traffic charts
    - Top talkers
    - Alerts for suspicious ports or traffic spikes
- Authentication via OAuth2/Keycloak

**Tech Stack:**
- Backend: Spring Boot + Kafka
- Agents: Python (scapy) or Java (pcap4j)
- Frontend: React + Tailwind
- DB: PostgreSQL
- Auth: Keycloak

**Milestone:** Real-time traffic from multiple machines in one dashboard with alerts.

---

### Advanced Stage – AI-Driven Network Security Platform
**Goal:** Build a secure, intelligent system deployable in production.

**Features:**
- ML-based anomaly detection:
    - Train model on normal traffic
    - Detect DDoS, port scanning
- Deployment with Docker & Kubernetes
- Role-based access control via Keycloak
- Remote control:
    - Block suspicious IPs via firewall
    - Trigger alerts (Slack/Email)
- Historical analytics:
    - Traffic trends by day/week/month
- Multi-tenant support

**Tech Stack:**
- Backend: Spring Boot (microservices)
- ML: Python (scikit-learn / PyTorch)
- Messaging: Kafka
- DB: PostgreSQL + TimescaleDB
- Auth: Keycloak
- Deployment: Docker + Kubernetes
- Visualization: Grafana or custom React dashboard

**Milestone:** Full network monitoring and security platform with real-time + historical analytics and AI alerts.

---

## 2️⃣ Layers and Data Extracted

| Layer | Data Extracted | Example / Purpose |
|-------|----------------|-----------------|
| **Ethernet** | `srcMAC`, `dstMAC` | Physical addresses of devices in local network |
| **IP** | `srcIp`, `dstIp`, `protocol`, `ttl`, `ip_flags` | Source/destination IP addresses, protocol, TTL, IP flags |
| **TCP** | `srcPort`, `dstPort`, `seq`, `tcp_flags` | Port numbers, sequence number, SYN/ACK/FIN flags |
| **UDP** | `srcPort`, `dstPort`, `udp_len` | Port numbers and length for connectionless traffic |
| **ICMP** | `icmp_type`, `icmp_code` | Ping requests/replies, errors |
| **ARP** | `arp_op`, `arp_src_ip`, `arp_dst_ip` | Mapping IP to MAC addresses (who-has / is-at) |
| **DNS** | `dns_query_name`, `dns_query_type`, `dns_answer` | Queries and responses for domain names |
| **Raw / App Layer** | `payload`, `http_info`, `tls_info` | HTTP GET/POST headers, TLS handshake detection, first 200 chars of payload |
| **Packet Type** | `packetType` | Derived from layers present (“IP”, “ARP”, “TCP”, etc.) |

---

## 3️⃣ Flow of Data

1. **Capture** – Python sniffer captures packets live from the network interface.
2. **Parse & Process** – `process_packet()` inspects each layer and extracts fields.
3. **Post to API** – Data is sent to Spring Boot REST API:

```python
requests.post("http://localhost:9394/api/v1/packets", json=packet_data)
