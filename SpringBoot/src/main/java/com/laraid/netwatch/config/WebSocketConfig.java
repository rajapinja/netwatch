package com.laraid.netwatch.config;

import com.laraid.netwatch.websocket.AuthChannelInterceptor;
import com.laraid.netwatch.websocket.AuthHandshakeInterceptor;
import com.laraid.netwatch.websocket.StompAuthChannelInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final StompAuthChannelInterceptor stompAuthInterceptor;
    private final AuthChannelInterceptor authChannelInterceptor;


    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // ✅ Register both interceptors
        registration.interceptors(authChannelInterceptor, stompAuthInterceptor);
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .addInterceptors(new AuthHandshakeInterceptor())
                .setAllowedOriginPatterns("http://localhost:5173"); // ✅ instead of setAllowedOrigins    }
        // .withSockJS(); // uncomment if SockJS is required
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
    }


}
