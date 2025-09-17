from scapy.all import sniff, IP, TCP, UDP, Raw
from datetime import datetime
import json, requests
import psycopg2
import os
import time
import socket
from collections import Counter
from kafka import KafkaProducer

# =======================
# Configuration
# =======================
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:9394/api/v1/packets/batch")
AGENT_ID = os.getenv("AGENT_ID", "agent-1")
HOST = socket.gethostname()
IFACE = os.getenv("IFACE", None)  # e.g., "Ethernet" or "Wi-Fi"

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "192.168.29.215:39092")

# Kafka topics
TOPIC_PACKETS = "netwatch.raw-packets"
TOPIC_TOP_TALKERS = "netwatch.top-talkers"
TOPIC_TOP_PORTS = "netwatch.top-ports"
TOPIC_PROTOCOL_STATS = "netwatch.protocol-stats"

# =======================
# State
# =======================
batch = []
talker_counter = Counter()
port_counter = Counter()
protocol_counter = Counter()

# =======================
# Kafka Producer Init
# =======================
producer = KafkaProducer(
    bootstrap_servers=[KAFKA_BROKER],
    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    retries=3
)

# while True:
#     data = {
#         "agent": socket.gethostname(),
#         "ip": socket.gethostbyname(socket.gethostname()),
#         "status": "online"
#     }
#     producer.send("agent-heartbeat", value=data)
#     print("Sent heartbeat:", data)
#     time.sleep(10)

# ========================
# Helpers
# =======================
def sanitize_string(s: str, max_len=200):
    """Remove null bytes and truncate."""
    if not s:
        return None
    return s.replace("\x00", "")[:max_len]

def publish_kafka(topic, data):
    try:
        producer.send(topic, value=data)
    except Exception as e:
        print(f"[Kafka Error] {topic}: {e}")

# =======================
# Packet Processing
# =======================
def process_packet(packet):
    data = {
        "agentId": AGENT_ID,
        "hostName": HOST,
        "interfaceName": IFACE,
        "timestamp": datetime.now().isoformat(),
        "length": len(packet)
    }

    if IP in packet:
        data["srcIp"] = packet[IP].src
        data["dstIp"] = packet[IP].dst
        data["protocol"] = str(packet[IP].proto)
        talker_counter[packet[IP].src] += 1
        protocol_counter[str(packet[IP].proto)] += 1

    if TCP in packet:
        data["srcPort"] = int(packet[TCP].sport)
        data["dstPort"] = int(packet[TCP].dport)
        data["tcpFlags"] = str(packet[TCP].flags)
        port_counter[packet[TCP].sport] += 1
        port_counter[packet[TCP].dport] += 1

    if UDP in packet:
        data["srcPort"] = int(packet[UDP].sport)
        data["dstPort"] = int(packet[UDP].dport)
        data["udpLen"]  = int(packet[UDP].len)
        port_counter[packet[UDP].sport] += 1
        port_counter[packet[UDP].dport] += 1

    if Raw in packet:
        try:
            raw = packet[Raw].load.decode("utf-8", errors="ignore")
        except:
            raw = ""
        data["payload"] = sanitize_string(raw)

    batch.append(data)

    # Kafka: Stream raw packet immediately
    publish_kafka(TOPIC_PACKETS, data)

    if len(batch) >= 200:
        send_batch()
        publish_analytics()

# =======================
# Send Batch to Backend
# =======================
def send_batch():
    global batch
    print(f"Sending batch with {len(batch)} packets...")
    try:
        payload = {
            "agentId": AGENT_ID,
            "hostName": HOST,
            "interfaceName": IFACE,
            "packets": batch
        }
        requests.post(BACKEND_URL, json=payload, timeout=2)
    except Exception as e:
        print("send_batch error:", e)
    batch = []

# =======================
# Publish Aggregates to Kafka
# =======================
def publish_analytics():
    # Top Talkers
    top_talkers = talker_counter.most_common(10)
    publish_kafka(TOPIC_TOP_TALKERS, {"agentId": AGENT_ID, "topTalkers": top_talkers})

    # Top Ports
    top_ports = port_counter.most_common(10)
    publish_kafka(TOPIC_TOP_PORTS, {"agentId": AGENT_ID, "topPorts": top_ports})

    # Protocol Stats
    proto_stats = protocol_counter.most_common()
    publish_kafka(TOPIC_PROTOCOL_STATS, {"agentId": AGENT_ID, "protocolStats": proto_stats})

    print("[Kafka] Analytics published")

# =======================
# Main
# =======================
print("Agent starting...")
print(f"Listening on interface: {IFACE}")
print(f"Sending to API: {BACKEND_URL}")
print(f"Kafka broker: {KAFKA_BROKER}")

sniff(prn=process_packet, store=False, iface=IFACE)
