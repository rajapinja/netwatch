// HealthDashboard.jsx
import { useEffect, useState } from "react";

function StatusBadge({ status }) {
  const colorMap = {
    UP: "bg-green-500",
    DOWN: "bg-red-500",
    UNKNOWN: "bg-yellow-500",
    LOADING: "bg-gray-400 animate-pulse",
  };

  return (
    <span
      className={`inline-block ${colorMap[status] || "bg-gray-500"} text-white text-xs font-medium px-2 py-1 rounded-md`}
    >
      {status}
    </span>
  );
}

export default function HealthDashboard() {
  const [statuses, setStatuses] = useState({
    api: { status: "LOADING", raw: {} },
    actuatorHealth: { status: "LOADING", raw: {} },
    actuatorInfo: { status: "LOADING", raw: {} },
  });
  const [metrics, setMetrics] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchStatus = async () => {
    const endpoints = [
      { key: "api", url: "http://localhost:9394/api/v1/health" },
      { key: "actuatorHealth", url: "http://localhost:9394/actuator/health" },
      { key: "actuatorInfo", url: "http://localhost:9394/actuator/info" },
      { key: "metrics", url: "http://localhost:9394/api/v1/health/health" },
    ];

    const newStatuses = {};
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep.url, {
          headers: { Accept: "application/json" },
          mode: "cors",
        });

        if (!res.ok) {
          newStatuses[ep.key] = {
            status: "DOWN",
            raw: `Error: ${res.status}`,
          };
          continue;
        }

        const json = await res.json();
        if (ep.key === "actuatorHealth") {
          newStatuses[ep.key] = {
            status: json.status || "UNKNOWN",
            raw: json,
          };
        } else if (ep.key === "actuatorInfo") {
          newStatuses[ep.key] = {
            status: Object.keys(json).length > 0 ? "UP" : "UNKNOWN",
            raw: json,
          };
        } else {
          newStatuses[ep.key] = {
            status: json.status || "UP",
            raw: json,
          };
          // Save API container metrics separately
          setMetrics(json);
        }
      } catch (err) {
        newStatuses[ep.key] = { status: "DOWN", raw: err.message };
      }
    }

    setStatuses((prev) => ({ ...prev, ...newStatuses }));
    setLastUpdated(new Date());
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header + Refresh */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          System Health Dashboard
        </h1>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchStatus}
            className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* API */}
        <div className="bg-white shadow-lg rounded-2xl p-4 border border-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">API</h2>
            <StatusBadge status={statuses.api.status} />
          </div>
          <div className="space-y-2 text-sm">
            {typeof statuses.api.raw === "object" ? (
              <>
                <p>
                  <strong>Service:</strong> {statuses.api.raw.service}
                </p>
                <p>
                  <strong>Version:</strong> {statuses.api.raw.version}
                </p>
                {statuses.api.raw.timestamp && (
                  <p>
                    <strong>Timestamp:</strong>{" "}
                    {new Date(statuses.api.raw.timestamp).toLocaleString()}
                  </p>
                )}
              </>
            ) : (
              <p className="text-red-600">{statuses.api.raw}</p>
            )}
          </div>
        </div>

        {/* Actuator Health */}
        <div className="bg-white shadow-lg rounded-2xl p-4 border border-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Actuator Health</h2>
            <StatusBadge status={statuses.actuatorHealth.status} />
          </div>
          <div className="space-y-2 text-sm">
            {statuses.actuatorHealth.raw?.components ? (
              Object.entries(statuses.actuatorHealth.raw.components).map(
                ([key, comp]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="capitalize">{key}</span>
                    <StatusBadge status={comp.status} />
                  </div>
                )
              )
            ) : (
              <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded-md border border-gray-200 dark:bg-gray-800">
                {JSON.stringify(statuses.actuatorHealth.raw, null, 2)}
              </pre>
            )}
          </div>
        </div>

        {/* Actuator Info */}
        <div className="bg-white shadow-lg rounded-2xl p-4 border border-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
          <h2 className="font-semibold mb-3">Actuator Info</h2>
          <div className="space-y-2 text-sm">
            {statuses.actuatorInfo.raw?.build ? (
              <>
                <p>
                  <strong>Artifact:</strong>{" "}
                  {statuses.actuatorInfo.raw.build.artifact}
                </p>
                <p>
                  <strong>Name:</strong> {statuses.actuatorInfo.raw.build.name}
                </p>
                <p>
                  <strong>Version:</strong>{" "}
                  {statuses.actuatorInfo.raw.build.version}
                </p>
                <p>
                  <strong>Group:</strong>{" "}
                  {statuses.actuatorInfo.raw.build.group}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {new Date(
                    statuses.actuatorInfo.raw.build.time
                  ).toLocaleString()}
                </p>
              </>
            ) : (
              <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded-md border border-gray-200 dark:bg-gray-800">
                {JSON.stringify(statuses.actuatorInfo.raw, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* Container Metrics Table */}
      <div className="bg-white shadow-lg rounded-2xl p-4 border border-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
        <h2 className="text-lg font-semibold mb-4">Container Metrics</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800 text-left">
                <th className="p-2 border">Container</th>
                <th className="p-2 border">Memory</th>
                <th className="p-2 border">CPU</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(metrics).map(([name, data]) => {
                if (typeof data === "object" && data.memory && data.cpu) {
                  return (
                    <tr key={name} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                      <td className="p-2 border font-medium">{name}</td>
                      <td className="p-2 border">{data.memory}</td>
                      <td className="p-2 border">{data.cpu}</td>
                    </tr>
                  );
                }
                return null;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
