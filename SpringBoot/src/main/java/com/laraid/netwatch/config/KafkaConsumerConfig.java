package com.laraid.netwatch.config;


import com.laraid.netwatch.entity.Packet;
import com.laraid.netwatch.utils.AgentHeartbeat;
import com.laraid.netwatch.utils.AgentInfo;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@EnableKafka
@Configuration
@RequiredArgsConstructor
public class KafkaConsumerConfig {

    private final com.laraid.netwatch.config.KafkaProperties kafkaProperties;


    @Bean
    public ConsumerFactory<String, Packet> packetConsumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaProperties.getBootstrapServers());
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "alert-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "*"); // Allow all packages or specify your entity package
        return new DefaultKafkaConsumerFactory<>(
                props,
                new StringDeserializer(),
                new JsonDeserializer<>(Packet.class)
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Packet> packetKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Packet> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(packetConsumerFactory());
        return factory;
    }


    @Bean
    public ConsumerFactory<String, Map<String, Object>> mapConsumerFactory(KafkaProperties kafkaProperties) {
        Map<String, Object> props = kafkaProperties.buildConsumerProperties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaProperties.getBootstrapServers());
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "analytic-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "*"); // Allow all packages or specify your entity package
        return new DefaultKafkaConsumerFactory<>(
                props,
                new StringDeserializer(),
                new JsonDeserializer<>(Map.class)
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Map<String, Object>> mapKafkaListenerContainerFactory(
            ConsumerFactory<String, Map<String, Object>> mapConsumerFactory) {
        ConcurrentKafkaListenerContainerFactory<String, Map<String, Object>> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(mapConsumerFactory);
        return factory;
    }

    @Bean
    public ConsumerFactory<String, AgentHeartbeat> agentHeartbeatConsumerFactory(KafkaProperties kafkaProperties) {
        Map<String, Object> props = kafkaProperties.buildConsumerProperties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaProperties.getBootstrapServers());
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "agent-registry-group");
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
        props.put(JsonDeserializer.TRUSTED_PACKAGES, "*"); // Allow all packages or specify your entity package

        return new DefaultKafkaConsumerFactory<>(
                props,
                new StringDeserializer(),
                new JsonDeserializer<>(AgentHeartbeat.class, false)
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, AgentHeartbeat> agentHeartbeatKafkaListenerContainerFactory(
            ConsumerFactory<String, AgentHeartbeat> agentHeartbeatConsumerFactory) {
        ConcurrentKafkaListenerContainerFactory<String, AgentHeartbeat> containerFactory =
                new ConcurrentKafkaListenerContainerFactory<>();
        containerFactory.setConsumerFactory(agentHeartbeatConsumerFactory);
        return containerFactory;
    }
}
