// HealthTable.jsx
import React, { useEffect, useState } from "react";

export default function HealthTable({ token }) {
  const [services, setServices] = useState({});

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch("http://localhost:9394/api/v1/health/health", {
        headers: {
            "Authorization": `Bearer ${token}`
        },
        });
        const data = await res.json();
        setServices(data);
      } catch (err) {
        console.error("Error fetching health:", err);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      {/* <h2 className="text-2xl font-bold mb-4 text-center text-orange-600">
        🚦 Service Health Dashboard
      </h2> */}

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-xl shadow-md">
          <thead className="bg-gray-300 text-gray-600 dark:text-gray-400">
            <tr>
              <th className="px-4 py-2 text-left">Service</th>
              <th className="px-4 py-2 text-left">CPU</th>
              <th className="px-4 py-2 text-left">Memory</th>
              <th className="px-4 py-2 text-left">Extra Info</th>
            </tr>
          </thead>
          <tbody>
            {services &&
              Object.entries(services).map(([serviceName, details]) => (
                <tr
                  key={serviceName}
                  className="border-t border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2 font-semibold text-gray-700">
                    {serviceName}
                  </td>

                  <td
                    className={`px-4 py-2 font-medium ${
                      details.cpu && details.cpu !== "0.00%"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {details.cpu || "-"}
                  </td>

                  <td className="px-4 py-2 text-blue-600">
                    {details.memory || "-"}
                  </td>

                  <td className="px-4 py-2 text-gray-600 text-sm">
                    {details.cpuCores
                      ? `CPU Cores: ${details.cpuCores}, FreeMem: ${details.freeMemoryMB}MB, TotalMem: ${details.totalMemoryMB}MB, MaxMem: ${details.maxMemoryMB}MB`
                      : "-"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
