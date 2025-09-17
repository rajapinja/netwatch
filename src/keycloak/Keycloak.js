import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8383",  // 👈 add /auth
  realm: "netwatch-realm",
  clientId: "netwatch-ui",
});

export default keycloak;
