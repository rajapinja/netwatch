package com.laraid.netwatch.config;

import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaAdmin;

import java.util.HashMap;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
public class KafkaConfig {

    private final KafkaTopicProperties props;
    private final KafkaProperties kafkaProperties;

    @Bean
    public KafkaAdmin kafkaAdmin() {
        Map<String, Object> configs = new HashMap<>();
        configs.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaProperties.getBootstrapServers());
        return new KafkaAdmin(configs);
    }

    @Bean
    public NewTopic packetEventTopic() {
        return TopicBuilder.name(props.getLivePacketEvents())
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic netWatchAlertTopic() {
        return TopicBuilder.name(props.getLiveNetWatchAlerts())
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic topPortsTopic() {
        return TopicBuilder.name(props.getLiveTopPorts())
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic topTalkersTopic() {
        return TopicBuilder.name(props.getLiveTopTalkers())
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic protocolStatsTopic() {
        return TopicBuilder.name(props.getLiveProtocolStats())
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic agentHeartBeatTopic(){
        return TopicBuilder.name(props.getLiveAgentHeartbeat())
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic rawPacketsTopic(){
        return TopicBuilder.name(props.getLiveRawPackets())
                .partitions(3)
                .replicas(1)
                .build();
    }


}

