import { useEffect, useState } from "react";
import { EventSourcePolyfill } from "event-source-polyfill";

export default function usePacketsLive(token) {
  
  const [packets, setPackets] = useState([]);

  useEffect(() => {
    if (!token) return; // don't connect without a token

    let es;

    const connect = async () => {
      const url = "http://localhost:9394/api/v1/packets/stream";
      
      console.log("Connecting to SSE:", url);

      es = new EventSourcePolyfill(url, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ attach token
        },
        heartbeatTimeout: 300000, // 5min keepalive
      });

      es.onopen = () => console.log("✅ SSE connection opened");

      es.onmessage = (e) => {
        try {
          const pkt = JSON.parse(e.data);
          setPackets((prev) => [pkt, ...prev].slice(0, 500));
        } catch (err) {
          console.error("❌ Parse error:", err, e.data);
        }
      };

      es.onerror = (err) => {
        console.error("⚠️ SSE error:", err);
        if (es) es.close();
        setTimeout(connect, 5000); // retry after 5s
      };
    };

    connect();

    return () => {
      if (es) {
        console.log("🔌 Closing SSE connection");
        es.close();
      }
    };
  }, []); // ✅ reconnect when token changes

  return packets;
}
