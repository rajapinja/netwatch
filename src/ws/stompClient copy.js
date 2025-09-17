import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;
let handlers = {}; // ✅ global registry for subscriptions

/**
 * Register callbacks for different topics
 */
export function registerHandlers(newHandlers) {
   handlers = { ...handlers, ...newHandlers };
   console.log("🔧 Registered handlers:", handlers); 
}

/**
 * Connect STOMP with given token.
 * Will deactivate existing client if already active.
 * 👉 Data will flow straight from Python → Kafka → Spring Boot → WebSocket → React. 🚀
 */
export function connectStomp(token) {
  if (stompClient) {
    console.log("🔄 Deactivating old STOMP client");
    stompClient.deactivate();
    stompClient = null;
  }

  //const socket = new SockJS(`http://localhost:9394/ws?token=${token}`);

  stompClient = new Client({

    webSocketFactory: () => new SockJS("http://localhost:9394/ws"),
    connectHeaders: { Authorization: `Bearer ${token}` },
    //debug: (str) => console.log("[STOMP]", str),
    debug: (str) => console.log("[STOMP DEBUG]", str),

    reconnectDelay: 5000, // auto-reconnect
    onConnect: () => {
      console.log("✅ STOMP connected");

      // Register subscriptions dynamically
      if (handlers.onPackets) {
         console.log("📡 Subscribing to /topic/packets");
            stompClient.subscribe("/topic/packets", (msg) =>{            
              // prevent empty body parsing crash
              const text = msg.body;
              const data = text ? JSON.parse(text) : [];
              handlers.onPackets(data);
            });
        //  stompClient.subscribe("/topic/packets", (msg) => {
        //         try {
                   
        //             const data = JSON.parse(msg.body);
        //             console.log("Packets payload:", data);
        //             handlers.onPackets(data);
        //         } catch (e) {
        //             console.error("JSON parse error", e, msg.body);
        //         }
        //     });
      }
      if (handlers.onTopTalkers) {
        // stompClient.subscribe("/topic/topTalkers", (msg) =>
        //   handlers.onTopTalkers(JSON.parse(msg.body))
        // );
         console.log("📡 Subscribing to /topic/topTalkers");
            stompClient.subscribe("/topic/topTalkers", (msg) => {
                try {
                    //const data = JSON.parse(msg.body);
                     const text = msg.body;
                     const data = text ? JSON.parse(text) : [];             
                    console.log("TopTalkers payload:", data);
                    handlers.onTopTalkers(data);
                } catch (e) {
                    console.error("JSON parse error", e, msg.body);
                }
            });
      }
      if (handlers.onTopPorts) {
        // stompClient.subscribe("/topic/topPorts", (msg) =>
        //   handlers.onTopPorts(JSON.parse(msg.body))
        // );
         console.log("📡 Subscribing to /topic/topPorts");
         stompClient.subscribe("/topic/topPorts", (msg) => {
            try {
                const text = msg.body;
                const data = text ? JSON.parse(text) : [];
                console.log("TopPorts payload:", data);
                handlers.onTopPorts(data);
            } catch (e) {
                console.error("JSON parse error", e, msg.body);
            }
        });
      }
      if (handlers.onProtocolStats) {
        // stompClient.subscribe("/topic/protocolStats", (msg) =>
        //   handlers.onProtocolStats(JSON.parse(msg.body))
        // );
         console.log("📡 Subscribing to /topic/protocolStats");
        stompClient.subscribe("/topic/protocolStats", (msg) => {
            try {
                //const data = JSON.parse(msg.body);
                const text = msg.body;
                const data = text ? JSON.parse(text) : [];     
                console.log("ProtocolStats payload:", data);
                handlers.onProtocolStats(data);
            } catch (e) {
                console.error("JSON parse error", e, msg.body);
            }
        });
      }
      if (handlers.onAgents) {
         console.log("📡 Subscribing to /topic/agents");
        stompClient.subscribe("/topic/agents", (msg) => {
          //const data = JSON.parse(msg.body);
           const text = msg.body;
           const data = text ? JSON.parse(text) : [];
           console.log("Agents payload:", data);
          handlers.onAgents(Array.isArray(data) ? data : Object.values(data));
        });
      }
    },
    onStompError: (frame) => {
      console.error("❌ STOMP error:", frame.headers["message"]);
    },
    onWebSocketError: (event) => {
      console.error("❌ WebSocket error:", event);
    },
  });

  stompClient.activate();
  return stompClient;
}

/**
 * Disconnect STOMP client
 */
export function disconnectStomp() {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    console.log("🔌 STOMP disconnected");
  }
}

/**
 * Update STOMP client with new token without full teardown
 */
export function updateStompToken(newToken, client) {
  if (client && client.active) {
    console.log("🔄 Updating STOMP auth header with new token");
    client.connectHeaders = { Authorization: `Bearer ${newToken}` };

    // STOMP client requires reconnect to apply new headers
    client.deactivate().then(() => {
      client.activate();
    });
  }
}
