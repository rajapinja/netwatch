import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";

export default function PacketTable({searchQuery = "", token }) {
  const [packets, setPackets] = useState([]);


 const fetchPackets = async () => {
  try {
    const res = await fetch("http://localhost:9394/api/v1/packets", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! ${res.status}`);
    }

    // prevent empty body parsing crash
    const text = await res.text();
    const data = text ? JSON.parse(text) : [];

    setPackets(data);   // ✅ update state here
    return data;        // ✅ return data if caller needs it
  } catch (err) {
    console.error("Error fetching packets:", err);
    return [];
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
      (p.packetType && p.packetType.toLowerCase().includes(query)) ||
      (p.srcIp && p.srcIp.toLowerCase().includes(query)) ||
      (p.dstIp && p.dstIp.toLowerCase().includes(query)) ||
      (p.srcMAC && p.srcMAC.toLowerCase().includes(query)) ||
      (p.dstMAC && p.dstMAC.toLowerCase().includes(query)) ||
      (p.protocol && p.protocol.toLowerCase().includes(query)) ||
      (p.payload && p.payload.toLowerCase().includes(query))
    );
  });

  const columns = [
    { name: "Type", selector: row => row.packetType || "-", sortable: true },
    { name: "Timestamp", selector: row => row.timestamp || "-", sortable: true },
    
    // IP / ARP
    { name: "Src IP", selector: row => row.srcIp || row.arp_src_ip || "-", sortable: true },
    { name: "Dst IP", selector: row => row.dstIp || row.arp_dst_ip || "-", sortable: true },
    { name: "Protocol", selector: row => row.protocol || "-", sortable: true },

    // Ethernet
    { name: "Src MAC", selector: row => row.srcMAC || "-", sortable: true },
    { name: "Dst MAC", selector: row => row.dstMAC || "-", sortable: true },

    // ARP
    { name: "ARP Op", selector: row => row.arp_op || "-", sortable: true },

    // IP Layer
    { name: "TTL", selector: row => row.ttl || "-", sortable: true },
    { name: "IP Flags", selector: row => row.ip_flags || "-", sortable: true },

    // TCP/UDP
    { name: "Src Port", selector: row => row.srcPort || "-", sortable: true },
    { name: "Dst Port", selector: row => row.dstPort || "-", sortable: true },
    { name: "Seq", selector: row => row.seq || "-", sortable: true },
    { name: "TCP Flags", selector: row => row.tcp_flags || "-", sortable: true },
    { name: "UDP Len", selector: row => row.udp_len || "-", sortable: true },

    // ICMP
    { name: "ICMP Type", selector: row => row.icmp_type || "-", sortable: true },
    { name: "ICMP Code", selector: row => row.icmp_code || "-", sortable: true },

    // DNS
    { name: "DNS Query Name", selector: row => row.dns_query_name || "-", sortable: true },
    { name: "DNS Query Type", selector: row => row.dns_query_type || "-", sortable: true },
    { name: "DNS Answer", selector: row => row.dns_answer || "-", sortable: true },

    // Payload / App Layer
    { name: "Payload", selector: row => row.payload || "-", sortable: false, wrap: true },
    { name: "HTTP Info", selector: row => row.http_info || "-", sortable: true },
    { name: "TLS Info", selector: row => row.tls_info || "-", sortable: true },
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
              background:
                "linear-gradient(to right, #bee0fcff, #e0dbdeff, #d8c4f2ff)",
              color: "black",
            },
          },
        }}
      />
    </div>
  );
}
