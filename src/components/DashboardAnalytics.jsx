import React, { useState, useEffect, useRef } from "react";
import { connectStomp, disconnectStomp, registerHandlers } from "../ws/stompClient";
import ProtocolStatsChart from "./ProtocolStatsChart";
import TopTalkers from "./TopTalkers";  
import TopPortsChart from "./TopPortsChart";      
import RawPacketsTab from "./RawPacketsTab"; 
import SectionHeader from "./SectionHeader";


//👉 Data will flow straight from Python → Kafka → Spring Boot → WebSocket → React. 🚀

export default function DashboardAnalytics({ token }) {
  const [topTalkers, setTopTalkers] = useState([]);
  const [topPorts, setTopPorts] = useState([]);
  const [protocolStats, setProtocolStats] = useState([]);
  const [agents, setAgents] = useState([]);
  const [rawPackets, setRawPackets] = useState([]);
  const [services, setServices] = useState({});

  const stompClientRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    registerHandlers({
      onPackets: (data) => console.log("Received packets:", data),     
      onTopTalkers: setTopTalkers,
      onTopPorts: setTopPorts,
      onProtocolStats: setProtocolStats,
      onAgents: setAgents,
      onRawPackets: setRawPackets,
      onServiceStatus:setServices,
    });

    stompClientRef.current = connectStomp(token);

    return () => {
      disconnectStomp();
    };
  }, [token]); 

  return (
    <div className="space-y-4 p-4">
      <AnalyticsCard title={`Connected Agents`} data={agents}>
        {agents && agents.length > 0 ? (
          <ul className="text-sm">
            {agents.map((a) => (
              <li key={a.agentId} className="flex justify-between border-b py-1">
                <span>
                  {a.hostName} ({a.ip})
                </span>
                <span
                  className={
                    a.status === "online" ? "font-bold text-green-500" : "text-red-500"
                  }
                >
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">No agents connected.</p>
        )}
      </AnalyticsCard>


      <div className="flex flex-col gap-4">
        <AnalyticsCard title="Service Status">
                <ServiceStatusCard services={services} />
        </AnalyticsCard>
      </div>

      <div className="flex flex-col gap-4">
        <AnalyticsCard title="Raw Packets">
          <RawPacketsTab data={rawPackets} />
        </AnalyticsCard>
      </div>

      <div className="flex flex-row gap-4">
        <div className="flex-1">
          <AnalyticsCard title="Top Talkers">
            <TopTalkers data={topTalkers} />
          </AnalyticsCard>
        </div>        
        <div className="flex-1">
          <AnalyticsCard title="Top Ports">
            <TopPortsChart data={topPorts} />
          </AnalyticsCard>
        </div>
        <div className="flex-1">
          <AnalyticsCard title="Protocol Stats">
            <ProtocolStatsChart data={protocolStats} />
          </AnalyticsCard>
        </div>
      </div>

    </div>
  );
}

function AnalyticsCard({ title, data, children }) {
  const safeData = Array.isArray(data) ? data : [];

  // 👉 Default expanded if data exists
  const [isOpen, setIsOpen] = useState(safeData.length > 0);

  // 👉 Auto-open/close when data changes
   useEffect(() => {
    setIsOpen(safeData.length > 0); 
  }, [safeData.length]); // ✅ auto-toggle if data updates

  return (
    <div className="p-4 border rounded-lg shadow bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200">
      <SectionHeader 
        title={`${title}${safeData.length > 0 ? ` (${safeData.length})` : ""}`}
        isOpen={isOpen}
        toggle={() => setIsOpen(!isOpen)}
      />

       {/* Render content only if expanded */}
      {isOpen && (
        <div className="mt-2">
          {children ? (
            children
          ) : safeData.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">No data available.</p>
          ) : (
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(safeData, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
{/* Services Status */}
function ServiceStatusCard({ services }) {
  return (
    <div className="p-4 border rounded-lg shadow bg-gray-100 dark:bg-gray-800">
      <h2 className="font-bold mb-2">Service Status</h2>
      <table className="min-w-full text-sm">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Service</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Notes</th>
          </tr>
        </thead>
        <tbody>
          {services &&
            Object.entries(services).map(([serviceName, details]) => (
              <tr key={serviceName}>
                <td className="px-4 py-2">{serviceName}</td>
                <td
                  className={`px-4 py-2 ${
                    details.status === "UP" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {details.status}
                </td>
                <td className="px-4 py-2">
                  {details.cpuCores || details.memory ? (
                    <>
                      {details.cpu && <span>CPU: {details.cpu}, </span>}
                      {details.memory && <span>Mem: {details.memory}, </span>}
                      {details.cpuCores && <span>Cores: {details.cpuCores}, </span>}
                      {details.freeMemoryMB && <span>Free Mem: {details.freeMemoryMB}, </span>}
                      {details.maxMemoryMB && <span>Max Mem: {details.maxMemoryMB}, </span>}
                      {details.totalMemoryMB && <span>Total Mem: {details.totalMemoryMB}</span>}
                    </>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}





