// src/services/authService.jsx
import keycloak from "../keycloak/keycloak";

let isRefreshing = false;
let refreshPromise = null;

/**
 * Initialize Keycloak on app start
 */
export const initAuth = async () => {
  const authenticated = await keycloak.init({
    onLoad: "login-required",
    checkLoginIframe: false,
  });

  if (!authenticated) {
    keycloak.login();
    return null;
  }

  // Save tokens to localStorage
  localStorage.setItem("access_token", keycloak.token);
  localStorage.setItem("refresh_token", keycloak.refreshToken);

  return keycloak;
};

/**
 * Get a valid access token.
 * Refreshes automatically if needed.
 */
export const getToken = async () => {
  try {
    // Use Keycloak’s built-in refresh
    const refreshed = await keycloak.updateToken(60);
    if (refreshed) {
      console.log("authService - Token refreshed ✅");
      localStorage.setItem("access_token", keycloak.token);
      localStorage.setItem("refresh_token", keycloak.refreshToken);
    }
    return keycloak.token;
  } catch (err) {
    console.error("authService - Refresh failed ❌", err);
    keycloak.logout();
    return null;
  }
};

/**
 * Fetch wrapper that injects token automatically.
 */
export const fetchWithAuth = async (url, options = {}) => {
  const token = await getToken();
  if (!token) throw new Error("No valid token, user must log in again.");

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    console.error("authService - 401, logging out ❌");
    keycloak.logout();
  }

  return res;
};

/**
 * Expose Keycloak instance if needed
 */
export const authClient = keycloak;
