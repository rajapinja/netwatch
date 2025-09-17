# NetWatch – Real-Time Network Monitoring & Control System

## 1️⃣ Project Overview

**Idea:** A platform to monitor, analyze, and control devices in a network.  
Start simple with packet capture and visualization, grow into a distributed, secure system with AI-assisted anomaly detection.

### Stages:

| Stage | Goal | Features | Tech Stack |
|-------|------|---------|-----------|
| Beginner | Local packet capture & visualization | Capture packets, parse IP/TCP/UDP headers, store in local DB, display basic CLI/HTML | Python or Java, SQLite/PostgreSQL, Minimal HTML/CLI |
| Intermediate | Distributed monitoring with alerts | Multiple agents, central collector (REST/gRPC), Kafka streaming, React + Tailwind dashboard, OAuth2/Keycloak | Python/Java agents, Spring Boot, PostgreSQL, React + Tailwind, Kafka, Keycloak |
| Advanced | AI-driven network security | ML anomaly detection, block suspicious IPs, Docker/Kubernetes deployment, historical analytics, multi-tenant support | Spring Boot microservices, Python (ML), Kafka, PostgreSQL + TimescaleDB, Grafana/React, Keycloak, Docker + Kubernetes |

---

## 2️⃣ Beginner Python Packet Capture Example

```python
from scapy.all import sniff, IP, TCP, UDP, Raw, DNS, DNSQR, DNSRR, ARP, ICMP, Ether
from datetime import datetime
import psycopg2
import requests
import json

# PostgreSQL connection
conn = psycopg2.connect(
    dbname="netwatch",
    user="postgres",
    password="admin",
    host="localhost",
    port="5435"
)
cursor = conn.cursor()

# Table creation
cursor.execute("""
CREATE TABLE IF NOT EXISTS packets (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP,
    src_ip VARCHAR(50),
    dst_ip VARCHAR(50),
    protocol VARCHAR(20),
    length INT,
    srcMAC VARCHAR(50),
    dstMAC VARCHAR(50),
    arp_op VARCHAR(20),
    arp_src_ip VARCHAR(50),
    arp_dst_ip VARCHAR(50),
    ttl INT,
    ip_flags VARCHAR(20),
    srcPort INT,
    dstPort INT,
    seq BIGINT,
    tcp_flags VARCHAR(20),
    udp_len INT,
    icmp_type INT,
    icmp_code INT,
    dns_query_name VARCHAR(255),
    dns_query_type VARCHAR(10),
    dns_answer TEXT,
    payload TEXT,
    http_info VARCHAR(255),
    tls_info VARCHAR(255)
);
""")
conn.commit()

API_URL = "http://localhost:9394/api/v1/packets"

def process_packet(packet):
    packet_data = {"timestamp": datetime.now().isoformat()}

    # Ethernet
    if Ether in packet:
        packet_data["srcMAC"] = packet[Ether].src
        packet_data["dstMAC"] = packet[Ether].dst

    # ARP
    if ARP in packet:
        packet_data["arp_op"] = "who-has" if packet[ARP].op == 1 else "is-at"
        packet_data["arp_src_ip"] = packet[ARP].psrc
        packet_data["arp_dst_ip"] = packet[ARP].pdst

    # IP
    if IP in packet:
        packet_data["srcIp"] = packet[IP].src
        packet_data["dstIp"] = packet[IP].dst
        packet_data["protocol"] = packet[IP].proto
        packet_data["ttl"] = packet[IP].ttl
        packet_data["ip_flags"] = str(packet[IP].flags)

    # TCP
    if TCP in packet:
        packet_data["srcPort"] = packet[TCP].sport
        packet_data["dstPort"] = packet[TCP].dport
        packet_data["seq"] = packet[TCP].seq
        packet_data["tcp_flags"] = str(packet[TCP].flags)

    # UDP
    if UDP in packet:
        packet_data["srcPort"] = packet[UDP].sport
        packet_data["dstPort"] = packet[UDP].dport
        packet_data["udp_len"] = packet[UDP].len

    # ICMP
    if ICMP in packet:
        packet_data["icmp_type"] = packet[ICMP].type
        packet_data["icmp_code"] = packet[ICMP].code

    # DNS
    if DNS in packet:
        if packet[DNS].qd:
            packet_data["dns_query_name"] = packet[DNSQR].qname.decode() if packet.haslayer(DNSQR) else None
            packet_data["dns_query_type"] = packet[DNSQR].qtype if packet.haslayer(DNSQR) else None
        if packet[DNS].an:
            packet_data["dns_answer"] = str(packet[DNSRR].rdata) if packet.haslayer(DNSRR) else None

    # Raw Payload
    if Raw in packet:
        try:
            raw_data = packet[Raw].load
            packet_data["payload"] = raw_data.decode("utf-8", errors="ignore")[:200]
            if raw_data.startswith((b"GET", b"POST", b"HTTP")):
                packet_data["http_info"] = raw_data.split(b"\r\n")[0].decode(errors="ignore")
            elif b"\x16\x03" in raw_data:
                packet_data["tls_info"] = "<TLS Handshake Detected>"
        except:
            packet_data["payload"] = "<binary data>"

    # Post to API
    try:
        requests.post(API_URL, json=packet_data, timeout=1)
    except Exception as e:
        print(f"❌ Failed to send packet to API: {e}")

    print(json.dumps(packet_data, indent=4))

print("🚀 Starting packet capture & posting to API...")
sniff(prn=process_packet, store=False)
```
## 3️⃣ Spring Boot Backend Structure

### Entity

```java 
@Entity
@Table(name = "packets")

public class Packet {
    @Id
    @GeneratedValue
    private Long id;

    private String srcIp;
    private String dstIp;
    private String protocol;
    private Integer length;
    private String srcMAC;
    private String dstMAC;
    private String arp_op;
    private String arp_src_ip;
    private String arp_dst_ip;
    private Integer ttl;
    private String ip_flags;
    private Integer srcPort;
    private Integer dstPort;
    private Long seq;
    private String tcp_flags;
    private Integer udp_len;
    private Integer icmp_type;
    private Integer icmp_code;
    private String dns_query_name;
    private String dns_query_type;
    private String dns_answer;
    private String payload;
    private String http_info;
    private String tls_info;
}
```
### Repository
``` java
@Repository
public interface PacketRepository extends JpaRepository<Packet, Long> {}

```

### Controller
``` java
@RestController
@RequestMapping("/api/v1/packets")
public class PacketController {
    @Autowired
    private PacketRepository repo;

    @GetMapping
    public List<Packet> getAllPackets() {
        return repo.findAll();
    }

    @PostMapping
    public Packet addPacket(@RequestBody Packet packet) {
        return repo.save(packet);
    }
}

```
## 4️⃣ React / Vite / Tailwind UI
### PacketTable Component
``` react
import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";

export default function PacketTable({ searchQuery = "" }) {
  const [packets, setPackets] = useState([]);

  const fetchPackets = async () => {
    try {
      const res = await fetch("http://localhost:9394/api/v1/packets");
      const data = await res.json();
      setPackets(data);
    } catch (err) {
      console.error("Error fetching packets:", err);
    }
  };

  useEffect(() => {
    fetchPackets();
    const interval = setInterval(fetchPackets, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filter packets based on searchQuery
  const filteredPackets = packets.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      (p.timestamp && p.timestamp.toLowerCase().includes(query)) ||
      (p.srcIp && p.srcIp.toLowerCase().includes(query)) ||
      (p.dstIp && p.dstIp.toLowerCase().includes(query)) ||
      (p.protocol && p.protocol.toLowerCase().includes(query)) ||
      (p.length && String(p.length).includes(query)) ||
      (p.srcMAC && p.srcMAC.toLowerCase().includes(query)) ||
      (p.dstMAC && p.dstMAC.toLowerCase().includes(query)) ||
      (p.arp_op && p.arp_op.toLowerCase().includes(query)) ||
      (p.arp_src_ip && p.arp_src_ip.toLowerCase().includes(query)) ||
      (p.arp_dst_ip && p.arp_dst_ip.toLowerCase().includes(query)) ||
      (p.srcPort && String(p.srcPort).includes(query)) ||
      (p.dstPort && String(p.dstPort).includes(query)) ||
      (p.tcp_flags && p.tcp_flags.toLowerCase().includes(query)) ||
      (p.udp_len && String(p.udp_len).includes(query)) ||
      (p.icmp_type && String(p.icmp_type).includes(query)) ||
      (p.icmp_code && String(p.icmp_code).includes(query)) ||
      (p.dns_query_name && p.dns_query_name.toLowerCase().includes(query)) ||
      (p.dns_query_type && String(p.dns_query_type).includes(query)) ||
      (p.dns_answer && p.dns_answer.toLowerCase().includes(query)) ||
      (p.payload && p.payload.toLowerCase().includes(query)) ||
      (p.http_info && p.http_info.toLowerCase().includes(query)) ||
      (p.tls_info && p.tls_info.toLowerCase().includes(query))
    );
  });

  const columns = [
    { name: "Timestamp", selector: row => row.timestamp, sortable: true },
    { name: "Src IP", selector: row => row.srcIp, sortable: true },
    { name: "Dst IP", selector: row => row.dstIp, sortable: true },
    { name: "Protocol", selector: row => row.protocol, sortable: true },
    { name: "Length", selector: row => row.length, sortable: true },
    { name: "Src MAC", selector: row => row.srcMAC, sortable: true },
    { name: "Dst MAC", selector: row => row.dstMAC, sortable: true },
    { name: "ARP Op", selector: row => row.arp_op, sortable: true },
    { name: "ARP Src IP", selector: row => row.arp_src_ip, sortable: true },
    { name: "ARP Dst IP", selector: row => row.arp_dst_ip, sortable: true },
    { name: "TTL", selector: row => row.ttl, sortable: true },
    { name: "IP Flags", selector: row => row.ip_flags, sortable: true },
    { name: "Src Port", selector: row => row.srcPort, sortable: true },
    { name: "Dst Port", selector: row => row.dstPort, sortable: true },
    { name: "Seq", selector: row => row.seq, sortable: true },
    { name: "TCP Flags", selector: row => row.tcp_flags, sortable: true },
    { name: "UDP Len", selector: row => row.udp_len, sortable: true },
    { name: "ICMP Type", selector: row => row.icmp_type, sortable: true },
    { name: "ICMP Code", selector: row => row.icmp_code, sortable: true },
    { name: "DNS Query Name", selector: row => row.dns_query_name, sortable: true },
    { name: "DNS Query Type", selector: row => row.dns_query_type, sortable: true },
    { name: "DNS Answer", selector: row => row.dns_answer, sortable: true },
    { name: "Payload", selector: row => row.payload, sortable: false, wrap: true },
    { name: "HTTP Info", selector: row => row.http_info, sortable: true },
    { name: "TLS Info", selector: row => row.tls_info, sortable: true },
  ];

  return (
    <div>
      <DataTable
        columns={columns}
        data={filteredPackets}
        pagination
        highlightOnHover
        responsive
        striped
        customStyles={{
          headCells: {
            style: {
              fontWeight: "bold",
              background: "linear-gradient(to right, #d5e7f6ff, #e0dbdeff, #d8c4f2ff)",
              color: "black",
            },
          },
        }}
      />
    </div>
  );
}

```

# Why Your Laptop Generates Network Data Even When Idle

Even if you are not actively using your laptop, the network interface still generates and receives traffic. Here’s a breakdown of what happens:

## Common Packet Types

| Packet Type                 | Layer           | Source / Destination         | Purpose                                    |
|------------------------------|----------------|----------------------------|--------------------------------------------|
| ARP Request / Reply          | Ethernet / ARP | Laptop ↔ LAN devices       | Maps IP ↔ MAC addresses                     |
| ICMP Echo Request/Reply      | IP / ICMP      | Laptop ↔ router/gateway    | Connectivity check                          |
| DNS Query / Response         | UDP / DNS      | Laptop ↔ DNS server        | Resolve domain names                        |
| TCP SYN / SYN-ACK / ACK      | TCP            | Laptop ↔ remote server     | Establish or maintain TCP connections      |
| HTTP GET / POST              | TCP / HTTP     | Laptop ↔ web server        | Background requests (updates, telemetry)   |
| TLS Handshake                | TCP / TLS      | Laptop ↔ secure server     | Secure connections for apps                 |
| UDP Broadcast / Multicast    | UDP            | Laptop ↔ LAN broadcast    | Service discovery (printers, devices)      |
| Local service heartbeats     | TCP / UDP      | Laptop ↔ local/cloud       | Persistent connections (Slack, Teams, OneDrive) |
| DHCP / Network Config        | UDP            | Laptop ↔ DHCP server       | IP lease/renewal                            |
| Wi-Fi Probe Requests         | 802.11         | Laptop ↔ broadcast         | Detect nearby networks                      |

## Key Takeaways

- Your network interface is **never truly idle**. The OS, background apps, and services constantly communicate over the network.
- Scapy captures everything at **Layer 2/3/4**, which is why you see a lot of packets, even when not browsing.
- Many “empty” columns in your database occur because most packets may not include certain layers (TCP/UDP/DNS/ARP/ICMP). For example, an ARP packet has no TCP/UDP ports or payload.

# Common Idle Packets Generated by Your Laptop

Even when idle, your laptop constantly generates network traffic. Here's a clear reference table mapping the most common packets, their layers, typical sources/destinations, and their purpose.

| #  | Packet Type                    | Layer                 | Typical Source / Destination                                   | Purpose / Explanation                                                                 |
|----|--------------------------------|---------------------|---------------------------------------------------------------|--------------------------------------------------------------------------------------|
| 1  | ARP Request / Reply            | Ethernet / ARP       | srcMAC: your laptop, dstMAC: broadcast / router              | Maps IP ↔ MAC addresses in your LAN. Happens every few seconds to check local devices. |
| 2  | ICMP Echo Request / Reply (Ping)| IP / ICMP           | srcIP: your laptop, dstIP: router / gateway                  | Connectivity checks. OS and apps ping gateway or devices to detect connectivity.     |
| 3  | DNS Query / Response           | UDP / DNS            | srcIP: your laptop, dstIP: DNS server (ISP / Cloudflare / Google) | Resolves domain names to IPs. Happens when apps or OS check for updates, websites, telemetry. |
| 4  | TCP SYN / SYN-ACK / ACK        | TCP                  | srcIP: your laptop, dstIP: remote server                     | Initiates or maintains TCP connections. Background apps, cloud sync, email, messenger apps all use TCP handshakes. |
| 5  | HTTP GET / POST                | TCP / HTTP / Raw     | srcIP: your laptop, dstIP: web server                        | Background requests like Windows Update, software telemetry, or app updates. Seen in payload if decoded. |
| 6  | TLS Handshake                  | TCP / TLS / Raw      | srcIP: your laptop, dstIP: secure server                     | Secure connection setup. Apps like Slack, Teams, or browsers establish TLS connections. Identified by bytes like `0x16 0x03`. |
| 7  | UDP Broadcast / Multicast      | UDP                  | srcIP: your laptop, dstIP: 255.255.255.255 or multicast      | Service discovery: printers, smart devices, SSDP, local network checks.             |
| 8  | Local Service Heartbeats       | TCP / UDP            | srcIP: your laptop, dstIP: local host or cloud               | Apps maintain persistent connections: e.g., Slack, OneDrive, Teams, cloud backup apps. |
| 9  | DHCP / Network Config          | UDP                  | srcIP: your laptop, dstIP: DHCP server (router)              | Requests IP lease or renewal. Happens periodically.                                   |
| 10 | Wi-Fi Probe Requests           | 802.11 / Layer 2     | srcMAC: your laptop, dstMAC: broadcast                        | Wireless NIC probes for nearby networks (SSID discovery). Captured if on Wi-Fi interface in monitor mode. |

## Key Takeaways

- **Idle laptops are chatty**: Traffic comes from OS, apps, and background services.
- **Not every packet is external**: Many are local LAN or broadcast packets (ARP, SSDP).
- **Payloads may appear cryptic**: TLS and binary protocols look like gibberish (`0x17 0x03 ...`) in scapy.
- **Frequency**: ARP and ICMP are frequent (every few seconds); TCP/UDP depends on app activity.
- **Security Note**: Capturing packets reveals what your laptop communicates, including sensitive endpoints. Keep this local and secure.

## Npcap: Packet Capture & Sniffing Library for Windows
- Npcap is a packet capture and network sniffing library for Windows, developed as a modern replacement for WinPcap. It allows programs (like Wireshark or your Scapy Python scripts) to capture and send raw network packets directly from Windows network interfaces.

### 1️⃣ Purpose

- Capture network packets at layer 2 (Ethernet) or layer 3 (IP) directly from the network interface.
- Enable network monitoring, packet sniffing, and traffic analysis on Windows.
- Required by tools like Scapy, Wireshark, Nmap, and other network analyzers.

### 2️⃣ Features

- Works on Windows 7/8/10/11 and Server editions.
- Supports raw packet capture, loopback traffic capture, and monitor mode for Wi-Fi.
- Compatible with modern Windows networking (NDIS 6.x).
- Can be installed with admin rights and optionally started as a service.

### 3️⃣ Why You Need It

Without Npcap (or WinPcap), Scapy on Windows cannot capture packets at Layer 2, so you'll see errors like:

```text
RuntimeError: Sniffing and sending packets is not available at layer 2: winpcap is not installed.

```
### 4️⃣ Notes
- Npcap can be installed in WinPcap compatible mode for legacy software.
- Requires administrator privileges for certain operations, like capturing packets from all interfaces.
- If the service isn’t running, Scapy can fall back to Layer 3 only (IP packets), but you won’t see MAC addresses, ARP, or raw Ethernet frames.