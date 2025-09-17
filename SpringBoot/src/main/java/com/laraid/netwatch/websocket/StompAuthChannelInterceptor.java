package com.laraid.netwatch.websocket;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class StompAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtDecoder jwtDecoder;

    public StompAuthChannelInterceptor(JwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = null;

            // ✅ 1. Try Authorization header
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }

            // ✅ 2. Fallback: try "token" header (e.g. from SockJS query param mapped to header)
            if (token == null) {
                token = accessor.getFirstNativeHeader("token");
            }

            if (token != null) {
                try {
                    Jwt jwt = jwtDecoder.decode(token);
                    Authentication auth = new JwtAuthenticationToken(jwt);
                    accessor.setUser(auth);
                } catch (Exception e) {
                    throw new IllegalArgumentException("Invalid token: " + e.getMessage());
                }
            } else {
                throw new IllegalArgumentException("Missing Authorization/Token header");
            }
        }

        return message;
    }
}
