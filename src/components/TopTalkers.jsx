import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function TopTalkers({ data }) {
  // if payload = { agentId, topTalkers }, extract the array
  const talkers = data?.topTalkers ?? [];

  const chartData = talkers.map(([srcIp, count]) => ({
  srcIp,
  count
}));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData}>
        {/* <XAxis dataKey="srcIp" /> */}
       <XAxis
          dataKey="srcIp"
          type="category"
          tick={{
            fill: window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "#f05454ff"
              : "#603ce2ff",
            fontSize: 12,
          }}
        />
        <YAxis type="number" />
        <Tooltip />
        <Bar dataKey="count" fill="#25398bff" />
      </BarChart>
    </ResponsiveContainer>
  );
}
