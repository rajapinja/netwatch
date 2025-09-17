package com.laraid.netwatch.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AgentRegistry {

    private static final Logger log
            = LoggerFactory. getLogger(AgentRegistry.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final Map<String, AgentInfo> activeAgents = new ConcurrentHashMap<>();

    public AgentRegistry(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @KafkaListener(
            topics = "netwatch.agent-heartbeat",
            groupId = "agent-registry-group",
            containerFactory = "agentHeartbeatKafkaListenerContainerFactory"
    )
    public void listenHeartbeat(AgentHeartbeat heartbeat) {
        AgentInfo agent = new AgentInfo(
                heartbeat.getAgentId(),
                heartbeat.getHostName(),
                heartbeat.getIp(),
                heartbeat.getStatus(),
                heartbeat.getTimestamp()
        );

        activeAgents.put(agent.getAgentId(), agent);

        // Broadcast the updated agents list
        log.info("🔥 Received from Kafka to agents: {} ", agent);
        messagingTemplate.convertAndSend("/topic/agents", activeAgents.values());
    }

    public Collection<AgentInfo> getActiveAgents() {
        return activeAgents.values();
    }
}

