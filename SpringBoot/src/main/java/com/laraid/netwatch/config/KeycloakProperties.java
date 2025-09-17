package com.laraid.netwatch.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "keycloak.admin")
@Data
public class KeycloakProperties {

    private String clientId;
    private String clientSecret;
    private String username;
    private String password;
    private String realm;
    private String serverUrl;

}

