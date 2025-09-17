//package com.laraid.netwatch.config;
//
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
//import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;
//
//@Configuration
//public class WebSocketSecurityConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer {
//
//    @Override
//    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
//        messages
//                .simpDestMatchers("/app/**").authenticated() // For client -> server sends
//                .simpSubscribeDestMatchers("/topic/secure/**").hasRole("ADMIN") // Restrict subscriptions
//                .simpSubscribeDestMatchers("/topic/**").authenticated() // Require auth for any topic
//                .anyMessage().denyAll(); // fallback deny
//    }
//
//    @Override
//    protected boolean sameOriginDisabled() {
//        return true; // Disable CSRF-style same-origin checks for WebSocket
//    }
//}
