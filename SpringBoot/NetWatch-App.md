# 📡 Netwatch – Live Network Monitoring App

Netwatch is a **real-time network monitoring and visualization platform**.  
It captures live network traffic, processes packets, and streams insights via **REST APIs, WebSockets, and SSE**.  
With its **agent-based architecture**, Netwatch can monitor traffic across multiple machines and aggregate results centrally.

---

👉 Data will flow straight from Python → Kafka → Spring Boot → WebSocket → React. 🚀

---
## 🏗️ Tech Stack

### 🔹 Frontend
- ⚛️ **React** – UI framework
- ⚡ **Vite** – fast build tool
- 🎨 **Tailwind CSS** – utility-first styling
- 🎨 **UnoCSS** – on-demand atomic CSS
- 🎭 **Lucide-React** – modern icons
- 📊 **Recharts** – charts & graphs
- 🔌 **EventSource Polyfill** – SSE client support
- 🔑 **JWT Authentication** with Keycloak

### 🔹 Backend
- ☕ **Spring Boot** – core backend services
- 🔄 **Spring WebFlux (Reactor)** – reactive APIs using `Flux` & `Sinks`
- 📨 **Kafka** – event streaming backbone
- 🗄️ **PostgreSQL** – relational storage
- 🛠️ **Swagger / OpenAPI** – API documentation
- 🐍 **Python** – optional packet decoding utilities
- 📊 **Kafka UI** – topic monitoring
- 🐘 **PgAdmin** – DB management

### 🔹 Networking & Security
- 📡 **Npcap** – packet capture driver (Windows)
- 🧩 **Pcap4j / Libpcap** – low-level packet sniffing
- 🌐 **REST APIs** – data queries & dashboards
- 🔗 **WebSockets** – bi-directional data streams
- 📡 **Server-Sent Events (SSE)** – one-way push streams
- 🔐 **Keycloak** – OAuth2 / OIDC security provider

---

## 📊 Features

- ✅ **Real-time packet capture** (Npcap/Pcap4j)
- ✅ **Packet classification** by:
    - Source/Destination IP
    - Source/Destination Port
    - MAC address
    - Protocols (TCP, UDP, ICMP, …)
- ✅ **Analytics dashboards**
    - Top Talkers (active IPs)
    - Top Ports
    - Protocol Distribution
- ✅ **Multi-Agent monitoring** across machines
- ✅ **Search & Filtering** (frontend + backend)
- ✅ **Streaming**
    - REST → snapshots
    - SSE → continuous push
    - WebSocket → interactive dashboards
- ✅ **Security**
    - Keycloak + JWT authentication

---

## 🔄 Architecture & Data Flow

```mermaid
flowchart LR
    A[Agent - Npcap/Pcap4j] -->|Packets| B[Spring Boot Backend]
    B -->|Publish| C[Kafka - live-packet-events]
    C --> D[PostgreSQL Storage]
    C --> E[Sinks.Many → Flux Stream]

    E -->|SSE| F[React Charts]
    E -->|WebSocket| G[Dashboards]
    D -->|REST| H[PacketTable]

    subgraph Agents
        A1[Agent1] --> B
        A2[Agent2] --> B
        A3[Agent3] --> B
    end

# 🖥️ Multi-Agent Setup

### Agents
- Agents deployed on different machines  
- Each agent captures traffic using **Npcap**  
- Metadata sent to backend:
  - Agent ID  
  - Hostname  
  - Interface  

➡️ Central backend aggregates → dashboards show **distributed traffic**

---

# 📡 Streaming Model

### Backend (Spring Boot WebFlux)
```java
@GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<Packet> liveStream() {
    return packetService.streamPackets();
}

public Flux<Packet> streamPackets() {
    return sink.asFlux(); // Sinks.Many → Flux
}

➡️ Frontend (React with SSE)

```import { EventSourcePolyfill } from "event-source-polyfill";

const source = new EventSourcePolyfill("/api/stream", {
  headers: { Authorization: `Bearer ${token}` }
});

source.onmessage = (event) => {
  const packet = JSON.parse(event.data);
  updateCharts(packet);
};
```
# 🔑 Security Flow

- User logs in via Keycloak → receives JWT
- Frontend attaches JWT to every API / SSE / WebSocket request
- Backend validates JWT against Keycloak public keys
- Role-based access controls secure resources

``` 
  sequenceDiagram
    participant U as User
    participant F as React Frontend
    participant K as Keycloak
    participant B as Spring Boot

    U->>F: Login request
    F->>K: Authenticate
    K-->>F: JWT token
    F->>B: API / SSE / WS request + JWT
    B->>K: Validate token
    K-->>B: Token valid
    B-->>F: Data response
```

# 🛠️ APIs

## REST

- GET /api/packets → fetch packet list (filters supported)
- GET /api/dashboard → summary stats
- GET /api/agents → agent registry
- POST /api/auth/* → login, refresh

## Streaming

- GET /api/stream → SSE live packets
- WS /api/ws → WebSocket channel

## Kafka

- Topic: live-packet-events
- Partitioning: by srcIp

```
  kafka:
    bootstrap-servers: 192.168.29.215:39092
    admin:
      auto-create: true
    topic:
      live-packet-events: packet-events
      live-netWatch-alerts: netwatch-alerts
      live-top-ports: netwatch.top-ports
      live-protocol-stats: netwatch.protocol-stats
      live-top-talkers: netwatch.top-talkers
      live-agent-heartbeat: netwatch.agent-heartbeat
      live-raw-packets: netwatch.raw-packets
```
# 🚀 Future Enhancements

- 🤖 ML/AI anomaly detection
- 📂 Packet replay & drill-downs
- 📊 Prometheus + Grafana monitoring
- ☁️ Cloud-native deployment (Kubernetes)
- 🕰️ Historical analysis with TimescaleDB

# 📌 Summary

- Netwatch = Npcap + Agents → Spring Boot + Kafka + Postgres → React Dashboards

- ✅ Capture packets in real-time
- ✅ Stream via SSE / WebSocket
- ✅ Visualize with charts & dashboards
- ✅ Secure with Keycloak & JWT
- ✅ Scale with multi-agent architecture

# 1️⃣ If you’re using springdoc-openapi (recommended)

- Most modern Spring Boot projects use springdoc-openapi-ui
- Add this dependency in pom.xml:

```<dependency>
      <groupId>org.springdoc</groupId>
      <artifactId>springdoc-openapi-starter-webflux-ui</artifactId>
      <version>2.5.0</version> <!-- latest -->
    </dependency>
```

- After starting your Spring Boot app, Swagger UI is available at:

```
http://localhost:9394/swagger-ui.html
 or
 http://localhost:9394/swagger-ui/index.html
 
 The OpenAPI JSON spec is available at:

 http://localhost:9394/v3/api-docs
```

# 2️⃣ If you’re using Springfox Swagger (older)

- Some projects still use springfox-boot-starter.

```Dependency:

<dependency>
  <groupId>io.springfox</groupId>
  <artifactId>springfox-boot-starter</artifactId>
  <version>3.0.0</version>
</dependency>

```

## Swagger UI will be at:

``` 
    http://localhost:9394/swagger-ui/
    API docs at:
    http://localhost:9394/v2/api-docs
```

# 3️⃣ For secured APIs (Keycloak + JWT)

- Since your app uses Keycloak security, you’ll need to attach a valid JWT token to access the APIs via Swagger UI.
- Swagger UI usually shows an Authorize 🔑 button
- Enter your Bearer token there:
- Bearer <JWT_TOKEN>


- That way, Swagger requests are authenticated just like your frontend.
- ✅ In your Netwatch app, assuming you’re on springdoc-openapi (with WebFlux + Flux APIs), you should be able to open:

- 👉 http://localhost:9394/swagger-ui/index.html

## HealthCheck.jsx → Shows statuses from

- 👉 http://localhost:9394//api/v1/health
- 👉 http://localhost:9394//actuator/health
- 👉 http://localhost:9394//actuator/info

## SwaggerDocs.jsx → Card with button to open Swagger UI.
- 👉 http://localhost:9394/swagger-ui/index.html
- All styled with Tailwind + UnoCSS only.