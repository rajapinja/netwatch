import token
from scapy.all import sniff, IP, TCP, UDP, Raw
from datetime import datetime
import json, requests, threading
import os, time, socket
from collections import Counter
from kafka import KafkaProducer


# =======================   
# Keycloak Configuration
# =======================

KEYCLOAK_TOKEN_URL = "http://localhost:8383/realms/netwatch-realm/protocol/openid-connect/token"
CLIENT_ID = "netwatch-api"
CLIENT_SECRET = os.getenv("NETWATCH_API_SECRET", "gA9xkHXpcEcn7P8hWLjfK9SOGDDnRLWR")

token_cache = {"access_token": None, "expires_at": 0}

def get_token():
    now = time.time()
    if token_cache["access_token"] and now < token_cache["expires_at"]:
        return token_cache["access_token"]

    data = {
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET
    }
    r = requests.post(KEYCLOAK_TOKEN_URL, data=data, timeout=5)
    r.raise_for_status()
    resp = r.json()
    token_cache["access_token"] = resp["access_token"]
    token_cache["expires_at"] = now + resp.get("expires_in", 300)
    return resp["access_token"]

# =======================
# Configuration
# =======================
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:9394/api/v1/packets/batch")
AGENT_ID = os.getenv("AGENT_ID", socket.gethostname())
HOST = socket.gethostname()
IFACE = os.getenv("IFACE", None)  # e.g., "Ethernet" or "Wi-Fi"

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "192.168.29.215:39092")

# Kafka topics
TOPIC_PACKETS = "netwatch.raw-packets"
TOPIC_TOP_TALKERS = "netwatch.top-talkers"
TOPIC_TOP_PORTS = "netwatch.top-ports"
TOPIC_PROTOCOL_STATS = "netwatch.protocol-stats"
TOPIC_HEARTBEAT = "netwatch.agent-heartbeat"

# =======================
# State
# =======================
batch = []
talker_counter = Counter()
port_counter = Counter()
protocol_counter = Counter()
lock = threading.Lock()

# =======================
# Kafka Producer Init
# =======================
producer = KafkaProducer(
    bootstrap_servers=[KAFKA_BROKER],
    value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    retries=3
)

# =======================
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
        with lock:
            talker_counter[packet[IP].src] += 1
            protocol_counter[str(packet[IP].proto)] += 1

    if TCP in packet:
        data["srcPort"] = int(packet[TCP].sport)
        data["dstPort"] = int(packet[TCP].dport)
        data["tcpFlags"] = str(packet[TCP].flags)
        with lock:
            port_counter[packet[TCP].sport] += 1
            port_counter[packet[TCP].dport] += 1

    if UDP in packet:
        data["srcPort"] = int(packet[UDP].sport)
        data["dstPort"] = int(packet[UDP].dport)
        data["udpLen"]  = int(packet[UDP].len)
        with lock:
            port_counter[packet[UDP].sport] += 1
            port_counter[packet[UDP].dport] += 1

    if Raw in packet:
        try:
            raw = packet[Raw].load.decode("utf-8", errors="ignore")
        except:
            raw = ""
        data["payload"] = sanitize_string(raw)

    with lock:
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
    with lock:
        if not batch:
            return
        payload = {
            "agentId": AGENT_ID,
            "hostName": HOST,
            "interfaceName": IFACE,
            "packets": list(batch)
        }
        batch.clear()

    print(f"Sending batch with {len(payload['packets'])} packets...")
    try:
        token = get_token()
        headers = {"Authorization": f"Bearer {token}"}
        requests.post(BACKEND_URL, json=payload, headers=headers, timeout=5)
    except Exception as e:
        print("send_batch error:", e)

# =======================
# Publish Aggregates to Kafka
# =======================
def publish_analytics():
    with lock:
        top_talkers = talker_counter.most_common(10)
        top_ports = port_counter.most_common(10)
        proto_stats = protocol_counter.most_common()

    publish_kafka(TOPIC_TOP_TALKERS, {"agentId": AGENT_ID, "topTalkers": top_talkers})
    publish_kafka(TOPIC_TOP_PORTS, {"agentId": AGENT_ID, "topPorts": top_ports})
    publish_kafka(TOPIC_PROTOCOL_STATS, {"agentId": AGENT_ID, "protocolStats": proto_stats})
    print("[Kafka] Analytics published")

# =======================
# Heartbeat Thread
# =======================
def heartbeat_loop():
    while True:
        try:
            data = {
                "agentId": AGENT_ID,
                "hostName": HOST,
                "ip": socket.gethostbyname(socket.gethostname()),
                "status": "online",
                "timestamp": datetime.now().isoformat()
            }
            publish_kafka(TOPIC_HEARTBEAT, data)
            print("[Heartbeat]", data)
        except Exception as e:
            print("heartbeat error:", e)
        time.sleep(10)

# =======================
# Main
# =======================
if __name__ == "__main__":
    print("Agent starting...")
    print(f"Listening on interface: {IFACE}")
    print(f"Sending to API: {BACKEND_URL}")
    print(f"Kafka broker: {KAFKA_BROKER}")

    threading.Thread(target=heartbeat_loop, daemon=True).start()

    try:
        sniff(prn=process_packet, store=False, iface=IFACE)
    finally:
        producer.flush()
