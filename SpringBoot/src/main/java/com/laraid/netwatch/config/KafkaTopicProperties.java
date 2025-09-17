package com.laraid.netwatch.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "spring.kafka.topic")
@Data
public class KafkaTopicProperties {

    private String livePacketEvents;
    private String liveNetWatchAlerts;
    private String liveTopPorts;
    private String liveProtocolStats;
    private String liveTopTalkers;
    private String liveAgentHeartbeat;
    private String liveRawPackets;

}
