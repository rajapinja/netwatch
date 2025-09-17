// index.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./ThemeContext.jsx";
import App from "./App.jsx";
import "virtual:uno.css";
import "./main.css";
import keycloak from "./keycloak/keycloak";
import { connectStomp, updateStompToken, disconnectStomp } from "./ws/stompClient";

const root = createRoot(document.getElementById("root"));
let stompClient = null;

keycloak
  .init({
    onLoad: "login-required",
    checkLoginIframe: false,
  })
  .then(authenticated => {
    if (!authenticated) {
      keycloak.login();
      return;
    }

    console.log("✅ Main - Keycloak initialized, authenticated:", authenticated);

    // Store initial tokens
    localStorage.setItem("access_token", keycloak.token);
    localStorage.setItem("refresh_token", keycloak.refreshToken);

    // First STOMP connect
    stompClient = connectStomp(keycloak.token);

    // Token refresh loop
    setInterval(() => {
      keycloak
        .updateToken(60) // refresh if expiring in next 60s
        .then(refreshed => {
          if (refreshed) {
            console.log("🔄 Main - Token refreshed ✅");
            localStorage.setItem("access_token", keycloak.token);
            localStorage.setItem("refresh_token", keycloak.refreshToken);

            // Instead of full disconnect → just update token in STOMP headers
            updateStompToken(keycloak.token, stompClient);
          }
        })
        .catch(() => {
          console.error("❌ Main - Token refresh failed, logging out");
          disconnectStomp();
          keycloak.logout();
        });
    }, 60000); // ⏱️ check every 1 min (not 10!)

    // Render React app
    root.render(
      <StrictMode>
        <ThemeProvider>
          <App keycloak={keycloak} token={keycloak.token} />
        </ThemeProvider>
      </StrictMode>
    );
  })
  .catch(err => {
    console.error("❌ Main - Keycloak init failed:", err);
    keycloak.login();
  });
