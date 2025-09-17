import { Client } from "@stomp/stompjs";

let client = null;
const handlers = {}; // ✅ global registry for subscriptions

/**
 * Register callbacks for different topics
 */
export function registerHandlers(newHandlers) {
  Object.assign(handlers, newHandlers);
}

/**
 * Connect STOMP with given token.
 * Will deactivate existing client if already active.
 */
export function connectStomp(token) {
  client = new Client({
    brokerURL: "ws://localhost:9394/ws", // 👈 your broker endpoint
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    onConnect: () => {
      console.log("✅ STOMP connected");

      client.subscribe("/topic/topTalkers", (msg) => {
        console.log("📩 Top Talkers payload:", msg.body);
        handlers.onTopTalkers?.(JSON.parse(msg.body));
      });
      client.subscribe("/topic/topPorts", (msg) => {
        console.log("📩 Top Ports payload:", msg.body);
        handlers.onTopPorts?.(JSON.parse(msg.body));
      });
      client.subscribe("/topic/protocolStats", (msg) => {
        console.log("📩 Protocol Stats payload:", msg.body);
        handlers.onProtocolStats?.(JSON.parse(msg.body));
      });
      client.subscribe("/topic/rawPackets", (msg) => {
        //console.log("📩 Raw Packets payload:", msg.body);
        handlers.onRawPackets?.(JSON.parse(msg.body));
      });
      client.subscribe("/topic/agents", (msg) => {
        const data = JSON.parse(msg.body);
        console.log("Agents payload:", data);
        handlers.onAgents(Array.isArray(data) ? data : Object.values(data));
      });
      client.subscribe("/topic/serviceStatus", (msg) => {
        const data = JSON.parse(msg.body);
        console.log("Service Status:", data);
        handlers.onServiceStatus?.(JSON.parse(msg.body));
        //handlers.onServiceStatus(Array.isArray(data) ? data : Object.values(data));
      });
    },
    onStompError: (frame) => {
      console.error("❌ STOMP error:", frame.headers["message"]);
    },
    onWebSocketError: (event) => {
      console.error("❌ WebSocket error:", event);
    },
  });

  client.activate();
  return client;
}

/**
 * Disconnect STOMP client
 */
export function disconnectStomp() {
  if (client) {
    client.deactivate();
    client = null;
    console.log("🔌 STOMP disconnected");
  }
}

/**
 * Update STOMP client with new token without full teardown
 */
export function updateStompToken(newToken) {
  if (client && client.active) {
    console.log("🔄 Updating STOMP auth header with new token");
    client.connectHeaders = { Authorization: `Bearer ${newToken}` };

    // STOMP client requires reconnect to apply new headers
    client.deactivate().then(() => {
      client.activate();
    });
  }
}
