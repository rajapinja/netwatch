import { useState, useEffect, useMemo, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import usePacketsLive from "../hooks/usePacketsLive";
import { p } from "framer-motion/client";

export default function TopTalkersChart({ token }) {
  const [bufferedPackets, setBufferedPackets] = useState([]);
  const [throttledPackets, setThrottledPackets] = useState([]);
  const bufferRef = useRef([]); 

  const packets = usePacketsLive(token); // ✅ pass token into hook
  console.log("TopTalkersChart - packets from usePacketsLive :", packets)

  useEffect(() => {
    console.log("📥 New packets received:", packets);
  }, [packets]);

  useEffect(() => {
    console.log("📊 Throttled packets count:", throttledPackets.length);
  }, [throttledPackets]);

  // 📦 Append new packets
  useEffect(() => {
    if (!packets || packets.length === 0) return;
    setBufferedPackets((prev) => {
      const updated = [...prev, ...packets].slice(-5000);
      bufferRef.current = updated; // keep ref in sync
      return updated;
    });
  }, [packets]);

  // ⏱️ Throttle updates (once per second) - interval only created once
  useEffect(() => {
    const interval = setInterval(() => {
      setThrottledPackets(bufferRef.current);
    }, 1000);
    return () => clearInterval(interval);
  }, []); // 👈 empty deps → interval not reset

  // 📊 Compute top talkers
  const data = useMemo(() => {
    if (!throttledPackets || throttledPackets.length === 0) return [];
    const counts = {};
    throttledPackets.forEach((p) => {
      if (!p?.srcIp) return;
      counts[p.srcIp] = (counts[p.srcIp] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([srcIp, count]) => ({ srcIp, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [throttledPackets]);

  const colors = [
    "#1e3a8a", "#7f1d1d", "#064e3b", "#695907ff",
    "#4507a2ff", "#091492ff", "#6b0696ff", "#7c0580ff",
    "#072875ff", "#14532d"
  ];

  if (data.length === 0) {
    return <div className="text-center text-gray-400">No data yet...</div>;
  }

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis
            dataKey="srcIp"
            tick={{
              fill: window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "#f05454ff"
                : "#603ce2ff",
            }}
          />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count">
            {data.map((entry, index) => (
              <Cell key={entry.srcIp} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
