import { PieChart, Pie, Tooltip } from "recharts";

export default function ProtocolStatsChart({ data }) {
  // backend sends { agentId, protocolStats }, so unwrap safely
  const stats = data?.protocolStats ?? [];  
  const chartData = stats.map(([proto, count]) => ({
    proto,
    count
  })); 

   const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"];

  return (
    <PieChart width={250} height={250}>
      <Pie
        data={chartData}
        dataKey="count"
        nameKey="proto"
        cx="50%"
        cy="50%"
        innerRadius={50}
        outerRadius={80}
        label
      />
      <Tooltip />
    </PieChart>
  );
}
