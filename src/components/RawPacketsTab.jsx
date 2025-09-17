import { useMemo, useState} from "react";
import {Copy, Download, Filter, CalendarClock, Network, Shield, Server, Box, Hash} from "lucide-react";
import { motion } from "framer-motion";
import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Legend} from "recharts";

/**
 * RawPacketsTab
 * - Dashboard tab for inspecting raw packet payloads
 * - Pretty prints JSON
 * - Hex/ASCII dump of payload
 * - Charts for ports, protocol and payload length
 */
export default function RawPacketsTab({data}) {

    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState("overview");

     // if payload = { agentId, topTalkers }, extract the array
   const rawPackets = Array.isArray(data) ? data : [data]; // ensure array

const packets = rawPackets.map(
  ({
    agentId, 
    hostName,
    interfaceName,
    timestamp,
    length,
    srcIp,
    dstIp,
    protocol,
    srcPort,
    dstPort,
    tcpFlags,
    payload
  }) => ({
    agentId,
    hostName,
    interfaceName,
    timestamp,
    length,
    srcIp,
    dstIp,
    protocol,
    srcPort,
    dstPort,
    tcpFlags,
    payload
  })
);

  console.log("RawPacketsTab mounted, packets:", packets);

    const filtered = useMemo(() => {
        if (!query) return packets;
        const q = query.toLowerCase();
        return packets.filter((p) =>
            [
                p.agentId,
                p.hostName,
                p.interfaceName,
                p.timestamp,
                String(p.length),
                p.srcIp,
                p.dstIp,
                String(p.srcPort),
                String(p.dstPort),
                p.tcpFlags,
                p.protocol,
                p.payload,
            ]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(q))
        );
    }, [packets, query]);

    const active = filtered[0];

    // Helpers
    const protocolName = (code) => {
        if (code === 6 || code === "6") return "TCP (6)";
        if (code === 17 || code === "17") return "UDP (17)";
        if (code === 1 || code === "1") return "ICMP (1)";
        return String(code || "?");
    };

    const toHexDump = (str = "", bytesPerRow = 16) => {
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            bytes.push(str.charCodeAt(i) & 0xff);
        }
        const rows = [];
        for (let i = 0; i < bytes.length; i += bytesPerRow) {
            const slice = bytes.slice(i, i + bytesPerRow);
            const offset = i.toString(16).padStart(8, "0");
            const hex = slice.map((b) => b.toString(16).padStart(2, "0")).join(" ");
            const ascii = slice
                .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : "."))
                .join("");
            rows.push({ offset, hex, ascii });
        }
        return rows;
    };

    const hexRows = useMemo(() => toHexDump(active?.payload || ""), [active]);

    // Charts data
    const portBars = useMemo(
        () =>
            filtered.map((p, idx) => ({
                name: idx + 1,
                srcPort: Number(p.srcPort) || 0,
                dstPort: Number(p.dstPort) || 0,
            })),
        [filtered]
    );

    const payloadSizes = useMemo(
        () => filtered.map((p, idx) => ({ name: idx + 1, bytes: Number(p.length) || 0 })),
        [filtered]
    );

    const protoPie = useMemo(() => {
        const counts = new Map();
        filtered.forEach((p) => {
            const key = protocolName(p.protocol);
            counts.set(key, (counts.get(key) || 0) + 1);
        });
        return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
    }, [filtered]);

    const copy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch (e) {
            console.warn("Copy failed", e);
        }
    };

    return (
        <div className="w-full p-4 md:p-6 lg:p-8 space-y-4">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-800 dark:text-gray-200"></h1>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <input
                                className="border rounded-lg pl-9 pr-3 py-2 min-w-[240px] text-sm text-gray-800 dark:text-gray-200 focus:ring focus:ring-blue-300"
                                placeholder="Search agent, host, IP, port, flags…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <Filter className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" />
                        </div>
                        <button
                            className="px-3 py-2 rounded-lg bg-slate-400 hover:bg-slate-500 text-sm flex items-center gap-1"
                            onClick={() => copy(JSON.stringify(filtered, null, 2))}
                        >
                            <Copy className="h-4 w-4 text-gray-600 dark:text-gray-400" /> Copy JSON
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            {active ? (
                <div>
                    <div className="flex border-b gap-2 dark:text-gray-200">
                        {["overview", "raw", "payload", "charts"].map((t) => (
                            <button
                                key={t}
                                onClick={() => setActiveTab(t)}
                                className={`px-4 py-2 text-sm ${activeTab === t
                                        ? "border-b-2 border-blue-500 text-blue-600 dark:text-gray-200"
                                        : "text-slate-600 hover:text-slate-900 dark:text-gray-200"
                                    }`}
                            >
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Overview */}
                    {activeTab === "overview" && (
                        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3  text-gray-800 dark:bg-gray-500 dark:text-gray-500">
                            <InfoCard icon={Server} label="Agent" value={active.agentId} />
                            <InfoCard icon={Network} label="Host" value={active.hostName} />
                            <InfoCard icon={CalendarClock} label="Timestamp" value={fmtTime(active.timestamp)} />
                            <InfoCard icon={Shield} label="Protocol" value={protocolName(active.protocol)} />
                            <InfoCard icon={Hash} label="TCP Flags" value={active.tcpFlags || "-"} />
                            <InfoCard icon={Box} label="Length (bytes)" value={String(active.length)} />
                        </div>
                    )}

                    {/* Raw JSON */}
                    {activeTab === "raw" && (
                        <div className="mt-4 border rounded-2xl overflow-hidden">
                            <div className="flex justify-between items-center px-3 py-2 border-b">
                                <span className="text-sm opacity-70">Pretty JSON</span>
                                <div className="flex gap-2">
                                    <button
                                        className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 flex items-center gap-1"
                                        onClick={() => copy(JSON.stringify(active, null, 2))}
                                    >
                                        <Copy className="h-4 w-4" /> Copy
                                    </button>
                                    <button
                                        className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 flex items-center gap-1"
                                        onClick={() => downloadJson(active)}
                                    >
                                        <Download className="h-4 w-4" /> Download
                                    </button>
                                </div>
                            </div>
                            <pre className="p-4 overflow-auto text-xs leading-relaxed bg-black text-white font-mono">
                                {JSON.stringify(active, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Payload Hex */}
                    {activeTab === "payload" && (
                        <div className="mt-4 border rounded-2xl">
                            <div className="flex justify-between items-center px-3 py-2 border-b">
                                <span className="text-sm opacity-70">Hex / ASCII view</span>
                                <button
                                    className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 flex items-center gap-1"
                                    onClick={() => copy(active.payload || "")}
                                >
                                    <Copy className="h-4 w-4" /> Copy Raw
                                </button>
                            </div>
                            <div className="p-3 overflow-auto">
                                <table className="w-full text-xs font-mono">
                                    <thead className="sticky top-0 bg-white">
                                        <tr className="text-left">
                                            <th className="py-1 pr-3">Offset</th>
                                            <th className="py-1 pr-3">Hex</th>
                                            <th className="py-1">ASCII</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {hexRows.map((r) => (
                                            <tr key={r.offset}>
                                                <td className="pr-3 text-slate-500">{r.offset}</td>
                                                <td className="pr-3 break-all">{r.hex}</td>
                                                <td className="whitespace-pre">{r.ascii}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Charts */}
                    {activeTab === "charts" && (
                        <div className="mt-4 grid gap-4 md:grid-cols-2 dark:text-gray-600">
                            <ChartCard title="Source vs Destination Ports">
                                <BarChart data={portBars}>
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="srcPort" name="Src Port" />
                                    <Bar dataKey="dstPort" name="Dst Port" />
                                </BarChart>
                            </ChartCard>

                            <ChartCard title="Payload Length (bytes)">
                                <BarChart data={payloadSizes}>
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="bytes" name="Bytes" />
                                </BarChart>
                            </ChartCard>

                            <ChartCard title="Protocol Distribution" full>
                                <PieChart>
                                    <Pie data={protoPie} dataKey="value" nameKey="name" outerRadius={110} label />
                                    <Tooltip />
                                </PieChart>
                            </ChartCard>
                        </div>
                    )}
                </div>
            ) : (
                <EmptyState />
            )}
        </div>
    );
}

function InfoCard({ icon: Icon, label, value }) {
    return (
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100">
                    <Icon className="h-4 w-4" />
                </div>
                <div>
                    <div className="text-xs uppercase tracking-wide opacity-60">{label}</div>
                    <div className="text-sm font-medium break-all">{value || <span className="opacity-60">-</span>}</div>
                </div>
            </div>
        </div>
    );
}

function ChartCard({ title, children, full }) {
    return (
        <div className={`rounded-2xl border bg-white p-4 shadow-sm ${full ? "md:col-span-2" : ""}`}>
            <h3 className="text-sm font-medium mb-2">{title}</h3>
            <div className="h-64 md:h-72">
                <ResponsiveContainer width="100%" height="100%">
                    {children}
                </ResponsiveContainer>
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="h-56 grid place-items-center text-center border rounded-2xl">
            <div>
                <div className="text-lg font-medium text-gray-800 dark:text-gray-200">No packets to display</div>
                <div className="text-sm opacity-70 text-gray-600 dark:text-gray-400 mt-2">
                    Provide an array in the <code>packets</code> prop.
                </div>
            </div>
        </div>
    );
}

function fmtTime(ts) {
    if (!ts) return "-";
    try {
        const d = new Date(ts);
        if (isNaN(d)) return String(ts);
        return d.toLocaleString();
    } catch {
        return String(ts);
    }
}

function downloadJson(obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `packet-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}


// How to use:
//import RawPacketsTab from "./RawPacketsTab";

// export default function NetworkPage() {
//   return <RawPacketsTab />;
//   // or <RawPacketsTab packets={[ /* array of packet objects */ ]} />
// }