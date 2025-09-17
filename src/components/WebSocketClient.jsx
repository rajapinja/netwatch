// // WebSocketClient.jsx
// import { useEffect, useState } from "react";
// import { Client } from "@stomp/stompjs";


// export default function WebSocketClient() {
//   const [stompClient, setStompClient] = useState(null);
//   const [topTalkers, setTopTalkers] = useState([]);
//   const [topPorts, setTopPorts] = useState([]);
//   const [protocolStats, setProtocolStats] = useState([]);
//   const [agents, setAgents] = useState([]);

//   useEffect(() => {
      
//       const token = localStorage.getItem("access_token");
//       console.log("WebSocketClient - Connecting to STOMP with token:", token);
  
//       stompClient = new Client({
//         brokerURL:  "ws://localhost:9394/ws?token=" + localStorage.getItem("token"), // backend STOMP endpoint
//         // connectHeaders: {
//         //   Authorization: `Bearer ${token}`, // ✅ send token
//         // },
//         onConnect: () => {
//           console.log("Connected");
//           stompClient.subscribe("/topic/packets", (message) => {
//             console.log("Received:", JSON.parse(message.body));
//           });
//           stompClient.subscribe("/topic/topTalkers", (message) => {
//             setTopTalkers(JSON.parse(message.body));
//           }); 
//           stompClient.subscribe("/topic/topPorts", (message) => {
//             setTopPorts(JSON.parse(message.body));
//           });
//           stompClient.subscribe("/topic/protocolStats", (message) => {
//             setProtocolStats(JSON.parse(message.body));
//           });
//           stompClient.subscribe("/topic/agents", (message) => {
//             const data = JSON.parse(message.body);
//             setAgents(Array.isArray(data) ? data : Object.values(data));
//           });
//         },
//         onStompError: (frame) => {
//           console.error("Broker error:", frame.headers["message"]);
//         },
//       });
  
//       stompClient.activate();
  
//       return () => {
//           if (stompClient) stompClient.deactivate();
//         };
//       }, []);  
  

//   return (
//     <div style={{ padding: "1rem" }}>
//       <h2>📊 Real-time Analytics</h2>

//       <section>
//         <h3>Top Talkers</h3>
//         <pre>{JSON.stringify(topTalkers, null, 2)}</pre>
//       </section>

//       <section>
//         <h3>Top Ports</h3>
//         <pre>{JSON.stringify(topPorts, null, 2)}</pre>
//       </section>

//       <section>
//         <h3>Protocol Stats</h3>
//         <pre>{JSON.stringify(protocolStats, null, 2)}</pre>
//       </section>
//     </div>
//   );
// }
