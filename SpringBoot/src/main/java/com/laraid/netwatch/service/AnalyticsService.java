package com.laraid.netwatch.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

//KafkaListener → receives message → pushes via WebSocket

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsService.class);

    private final SimpMessagingTemplate messagingTemplate; // For WebSocket push to UI

    @KafkaListener(
            topics = "netwatch.top-talkers",
            groupId = "analytics-group",
            containerFactory = "mapKafkaListenerContainerFactory" // String -> Map
    )
    public void onTopTalkers(Map<String, Object> data) {
        log.info("🔥 Received from Kafka to onTopTalkers: {} ", data);
        messagingTemplate.convertAndSend("/topic/topTalkers", data);
    }

    @KafkaListener(
            topics = "netwatch.top-ports",
            groupId = "analytics-group",
            containerFactory = "mapKafkaListenerContainerFactory"
    )
    public void onTopPorts(Map<String, Object> data) {
        log.info("🔥 Received from Kafka to onTopPorts: {} ", data);
        messagingTemplate.convertAndSend("/topic/topPorts", data);
    }

    @KafkaListener(
            topics = "netwatch.protocol-stats",
            groupId = "analytics-group",
            containerFactory = "mapKafkaListenerContainerFactory"
    )
    public void onProtocolStats(Map<String, Object> data) {
        log.info("🔥 Received from Kafka to onProtocolStats: {} ", data);
        messagingTemplate.convertAndSend("/topic/protocolStats", data);
    }

    @KafkaListener(
            topics = "netwatch.raw-packets",
            groupId = "analytics-group",
            containerFactory = "mapKafkaListenerContainerFactory"
    )
    public void onRawPackets(Map<String, Object> data) {
        log.info("🔥 Received from Kafka to onRawPackets: {} ", data);
        messagingTemplate.convertAndSend("/topic/rawPackets", data);
    }
}

