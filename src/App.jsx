import { useState } from "react";
import Dashboard from "./components/DashboardAnalytics";
import TopTalkersChart from "./components/TopTalkersChart";
import { AnimatePresence, motion } from "framer-motion";
import PacketTable from "./components/PacketTable";
import Footer from "./components/Footer";
import Topbar from "./components/Topbar";
import SwaggerDocs from "./components/SwaggerDocs";
import HealthDashboard from "./components/HealthDashboard";
import { SiSwagger } from "react-icons/si";   // Swagger icon
import { FaNetworkWired, FaChartBar, FaTable } from "react-icons/fa"; // Network icon


export default function App({ keycloak, token }) {

  const [searchQuery, setSearchQuery] = useState("");
  //const packets = usePacketsLive(token); // ✅ pass token into hook

  // Track collapsed state for each section
  const [showDashboard, setShowDashboard] = useState(true);
  const [showCharts, setShowCharts] = useState(false);
  const [showTable, setShowTable] = useState(true);  
  const [showSwagger, setShowSwagger] = useState(false);
    const [healthDashboard, setHealthDashboard] = useState(false);
  //const [healthCheck, setHealthCheck] = useState(false);
  //const [serviceHealth, setServiceHealth] = useState(false);



  const SectionHeader = ({ title, toggle, isOpen }) => (
    <div
      className="flex items-center justify-between cursor-pointer bg-gray-300 dark:bg-gray-700 px-3 py-2 rounded-lg"
      onClick={toggle}
    >
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        {title}
      </h3>
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {isOpen ? "▲ Collapse" : "▼ Expand"}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-100 via-gray-200 to-purple-200 text-sm text-white dark:from-gray-400 dark:via-gray-500 dark:to-black">
      {/* Header */}
      <header className="w-full p-1">
        <Topbar title="📡 Live Packet Monitor" onSearch={setSearchQuery} />
      </header>

      {/* Main content */}
      <main className="flex-grow p-4 space-y-6">

         {/* Health Dashboard */}
        <SectionHeader
          title="🚦Service Health Dashboard "
          toggle={() => setHealthDashboard((prev) => !prev)}
          isOpen={healthDashboard}
        />
        {healthDashboard && <HealthDashboard token={token} />}

        {/* Health Check */}
        {/* <SectionHeader
          title="Health Check"
          toggle={() => setHealthCheck((prev) => !prev)}
          isOpen={healthCheck}
        />
        {healthCheck && <HealthCheck token={token} />} */}

        {/* Services Health */}
        {/* <SectionHeader
          title="🚦Service Health Dashboard"
          toggle={() => setServiceHealth((prev) => !prev)}
          isOpen={serviceHealth}
        />
        {serviceHealth && <HealthTable token={token} />} */}

         {/* Swagger Docs */}
        <SectionHeader
          title={
            <div className="flex items-center gap-2">
              <SiSwagger className="text-green-500" size={20} />
              <span>Swagger Docs</span>
            </div>
          }
          toggle={() => setShowSwagger((prev) => !prev)}
          isOpen={showSwagger}
        />
        {showSwagger && <SwaggerDocs token={token} />}

       {/* Dashboard summary */}
        <SectionHeader
          title={
            <div className="flex items-center gap-2">
              <FaNetworkWired className="text-green-500" size={20} />
              <span>Network Packet Analytics Dashboard</span>
            </div>
          }
          toggle={() => setShowDashboard((prev) => !prev)}
          isOpen={showDashboard}
        />
        {showDashboard && <Dashboard token={token} />}
      
        {/* Charts */}
        <SectionHeader
          title={
            <div className="flex items-center gap-2">
              <FaChartBar className="text-green-500" size={20} />
              <span>Charts</span>
            </div>
          }
          toggle={() => setShowCharts((prev) => !prev)}
          isOpen={showCharts}
        />
        <AnimatePresence initial={false}>
          {showCharts && (
            <motion.div
              key="charts"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <TopTalkersChart token={token} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Packet Table */}
        <SectionHeader
          title={
            <div className="flex items-center gap-2">
              <FaTable className="text-green-500" size={20} />
              <span>Packet Table</span>
            </div>
          }
          toggle={() => setShowTable((prev) => !prev)}
          isOpen={showTable}
        />
        <AnimatePresence initial={false}>
          {showTable && (
            <motion.div
              key="table"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <PacketTable searchQuery={searchQuery} token={token} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
