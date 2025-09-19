📡 Netwatch – Live Network Monitoring App

Netwatch is a real-time network monitoring and visualization platform.
It captures live traffic at packet level, streams it through a Kafka backbone, and delivers insights to users via Spring Boot APIs, WebSockets, and SSE.
With its agent-based architecture, Netwatch scales to monitor multiple machines and aggregate results centrally.

👉 Pipeline: Python (packet capture) → Kafka → Spring Boot (reactive services) → WebSocket/SSE → React dashboard 🚀

🏗️ Tech Stack
🔹 Frontend

⚛️ React + ⚡ Vite – modern, fast UI
🎨 TailwindCSS / UnoCSS – styling flexibility
🎭 Lucide-React – icons
📊 Recharts – charts and live graphs
🔌 EventSource Polyfill – SSE support
🔑 Keycloak – JWT authentication & SSO

🔹 Backend
☕ Spring Boot – core backend
🔄 Spring WebFlux (Reactor) – reactive pipelines (Flux, Sinks)
📨 Kafka – event streaming backbone
🗄️ PostgreSQL – relational storage
🛠️ Swagger / OpenAPI – API documentation
🐍 Python – packet decoding utilities
📊 Kafka UI – topic monitoring
🐘 PgAdmin – DB management

⚡ Why Netwatch?
Detect and visualize live traffic across distributed nodes

Real-time dashboards for admins and engineers

Scalable architecture leveraging Kafka + WebFlux for high throughput
