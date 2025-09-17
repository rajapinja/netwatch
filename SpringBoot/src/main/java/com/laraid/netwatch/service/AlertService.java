package com.laraid.netwatch.service;

import com.laraid.netwatch.config.KafkaTopicProperties;
import com.laraid.netwatch.entity.Packet;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

// AlertService.java
@Service
@RequiredArgsConstructor
public class AlertService {

    private final KafkaTemplate<String, Map<String, Object>> kafkaTemplate;
    private final KafkaTopicProperties kafkaTopicProperties;

    // Sliding window tracking
    private final Map<String, Set<Integer>> uniquePortsPerIp = new ConcurrentHashMap<>();
    private final Map<String, Deque<Long>> timestampsPerIp = new ConcurrentHashMap<>();

    @KafkaListener(
            topics = "packet-events",
            groupId = "alert-group",
            containerFactory = "packetKafkaListenerContainerFactory"
    )
    public void onPacket(Packet p) {
        if (p.getSrcIp() == null) return;

        long now = System.currentTimeMillis();

        // ----------------------------
        // 1) Port Scan Detection
        // ----------------------------
        if (p.getDstPort() != null) {
            uniquePortsPerIp
                    .computeIfAbsent(p.getSrcIp(), k -> ConcurrentHashMap.newKeySet())
                    .add(p.getDstPort());

            if (uniquePortsPerIp.get(p.getSrcIp()).size() >= 30) {
                Map<String, Object> alertData = new HashMap<>();
                alertData.put("type", "PORT_SCAN");
                alertData.put("message", "Port scan suspected");
                alertData.put("srcIp", p.getSrcIp());
                alertData.put("detectedAt", now);
                alertData.put("uniquePortsCount", uniquePortsPerIp.get(p.getSrcIp()).size());

                kafkaTemplate.send(kafkaTopicProperties.getLiveNetWatchAlerts(), p.getSrcIp(), alertData);
                uniquePortsPerIp.get(p.getSrcIp()).clear();
            }
        }

        // ----------------------------
        // 2) Traffic Spike Detection
        // ----------------------------
        Deque<Long> q = timestampsPerIp.computeIfAbsent(p.getSrcIp(), k -> new ArrayDeque<>());
        q.addLast(now);

        // Keep only timestamps within last 10 sec
        while (!q.isEmpty() && now - q.peekFirst() > 10_000) {
            q.pollFirst();
        }

        if (q.size() > 500) {
            Map<String, Object> alertData = new HashMap<>();
            alertData.put("type", "TRAFFIC_SPIKE");
            alertData.put("message", "Traffic spike detected");
            alertData.put("srcIp", p.getSrcIp());
            alertData.put("detectedAt", now);
            alertData.put("packetCountLast10s", q.size());

            kafkaTemplate.send(kafkaTopicProperties.getLiveNetWatchAlerts(), p.getSrcIp(), alertData);
            q.clear();
        }
    }
}


