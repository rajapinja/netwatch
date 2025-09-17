from scapy.all import sniff, Ether, IP, TCP, UDP, Raw, DNS, DNSQR, DNSRR, ARP, ICMP
from datetime import datetime
import requests
import json
import base64
import psycopg2


# Database connection (PostgreSQL)
conn = psycopg2.connect(
    dbname="netwatch",
    user="postgres",
    password="admin",
    host="localhost",
    port="5435"
)
cursor = conn.cursor()

# Create table if not exists
cursor.execute("""
CREATE TABLE IF NOT EXISTS packets (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP,
    -- Ethernet
    src_mac VARCHAR(50),
    dst_mac VARCHAR(50),

    -- ARP
    arp_op VARCHAR(10),
    arp_src_ip VARCHAR(50),
    arp_dst_ip VARCHAR(50),

    -- IP
    src_ip VARCHAR(50),
    dst_ip VARCHAR(50),
    protocol VARCHAR(20),
    ttl INT,
    ip_flags VARCHAR(20),

    -- TCP
    src_port INT,
    dst_port INT,
    seq BIGINT,
    tcp_flags VARCHAR(20),

    -- UDP
    udp_len INT,

    -- ICMP
    icmp_type INT,
    icmp_code INT,

    -- DNS
    dns_query_name TEXT,
    dns_query_type INT,
    dns_answer TEXT,

    -- Payload
    payload TEXT,
    http_info TEXT,
    tls_info TEXT
);
""")
conn.commit()

API_URL = "http://localhost:9394/api/v1/packets"

def sanitize_string(s: str, max_len=200):
    """Remove null bytes and truncate."""
    if not s:
        return None
    return s.replace("\x00", "")[:max_len]

def process_packet(packet):
    packet_data = {"timestamp": datetime.now().isoformat()}


    # Determine packet type
    if IP in packet:
        packet_data["packetType"] = "IP"
    elif ARP in packet:
        packet_data["packetType"] = "ARP"
    elif ICMP in packet:
        packet_data["packetType"] = "ICMP"
    elif TCP in packet:
        packet_data["packetType"] = "TCP"
    elif UDP in packet:
        packet_data["packetType"] = "UDP"
    else:
        packet_data["packetType"] = "Other"

    # Ethernet Layer
    if Ether in packet:
        packet_data["srcMAC"] = packet[Ether].src
        packet_data["dstMAC"] = packet[Ether].dst

    # ARP Layer
    if ARP in packet:
        packet_data["arp_op"] = "who-has" if packet[ARP].op == 1 else "is-at"
        packet_data["arp_src_ip"] = packet[ARP].psrc
        packet_data["arp_dst_ip"] = packet[ARP].pdst

    # IP Layer
    if IP in packet:
        packet_data["srcIp"] = packet[IP].src
        packet_data["dstIp"] = packet[IP].dst
        packet_data["protocol"] = packet[IP].proto
        packet_data["ttl"] = packet[IP].ttl
        packet_data["ip_flags"] = str(packet[IP].flags)

    # TCP Layer
    if TCP in packet:
        packet_data["srcPort"] = packet[TCP].sport
        packet_data["dstPort"] = packet[TCP].dport
        packet_data["seq"] = packet[TCP].seq
        packet_data["tcp_flags"] = str(packet[TCP].flags)

    # UDP Layer
    if UDP in packet:
        packet_data["srcPort"] = packet[UDP].sport
        packet_data["dstPort"] = packet[UDP].dport
        packet_data["udp_len"] = packet[UDP].len

    # ICMP Layer
    if ICMP in packet:
        packet_data["icmp_type"] = packet[ICMP].type
        packet_data["icmp_code"] = packet[ICMP].code

    # DNS Layer
    if DNS in packet:
        if packet[DNS].qd:
            packet_data["dns_query_name"] = sanitize_string(
                packet[DNSQR].qname.decode() if packet.haslayer(DNSQR) else None
            )
            packet_data["dns_query_type"] = packet[DNSQR].qtype if packet.haslayer(DNSQR) else None
        if packet[DNS].an:
            packet_data["dns_answer"] = sanitize_string(
                str(packet[DNSRR].rdata) if packet.haslayer(DNSRR) else None
            )

    # Raw payload (HTTP, TLS, others)
    if Raw in packet:
        raw_bytes = packet[Raw].load
        # Decode safely for UI
        raw_str = raw_bytes.decode("utf-8", errors="ignore").replace("\x00", "")
        packet_data["payload"] = raw_str[:200]

        # Base64 full payload for safe storage if needed
        packet_data["payload_b64"] = base64.b64encode(raw_bytes).decode("ascii")

        # Detect HTTP
        if raw_str.startswith(("GET", "POST", "HTTP")):
            packet_data["http_info"] = raw_str.split("\r\n")[0]

        # Detect TLS handshake
        if b"\x16\x03" in raw_bytes:
            packet_data["tls_info"] = "<TLS Handshake Detected>"

    # Send to Spring Boot API
    try:
        requests.post(API_URL, json=packet_data, timeout=1)
    except Exception as e:
        print(f"❌ Failed to send packet to API: {e}")

    # Optional: debug print
    print(json.dumps(packet_data, indent=4))

print("🚀 Starting detailed packet capture & posting to API...")
sniff(prn=process_packet, store=False)
