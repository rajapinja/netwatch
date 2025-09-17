import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function TopPortsChart({ data }) {
   // Ensure safe transformation: object → array of { port, count }

    const ports = data?.topPorts ?? [];  
  const chartData = ports.map(([port, count]) => ({
    port,
    count
  })); 
  
  const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"];

  return (
    <PieChart width={250} height={250}>
      <Pie
        data={chartData}
        dataKey="count"
        nameKey="port"
        cx="50%"
        cy="50%"
        outerRadius={80}
        label={({ port }) => port}
      >
        {chartData.map((_, i) => (
          <Cell key={i} fill={COLORS[i % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  );
}
