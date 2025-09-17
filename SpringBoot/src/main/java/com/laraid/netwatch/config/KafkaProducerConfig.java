package com.laraid.netwatch.config;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.support.serializer.JsonSerializer; // ✅ Correct import
import com.laraid.netwatch.entity.Packet;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import java.util.HashMap;
import java.util.Map;

@Configuration
@RequiredArgsConstructor
public class KafkaProducerConfig {

    private final KafkaProperties kafkaProperties;

    @Bean
    public ProducerFactory<String, Packet> packetProducerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaProperties.getBootstrapServers()); // Replace with your Kafka broker
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        configProps.put(ProducerConfig.ACKS_CONFIG, "all"); // Ensure message durability
        configProps.put(ProducerConfig.RETRIES_CONFIG, 3);  // Retry if broker is unavailable
        configProps.put(ProducerConfig.LINGER_MS_CONFIG, 5); // Batch send optimization
        configProps.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384); // 16KB batch size
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public KafkaTemplate<String, Packet> packetKafkaTemplate() {
        return new KafkaTemplate<>(packetProducerFactory());
    }

    @Bean
    public ProducerFactory<String, String> StringProducerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaProperties.getBootstrapServers()); // Replace with your Kafka broker
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.ACKS_CONFIG, "all"); // Ensure message durability
        configProps.put(ProducerConfig.RETRIES_CONFIG, 3);  // Retry if broker is unavailable
        configProps.put(ProducerConfig.LINGER_MS_CONFIG, 5); // Batch send optimization
        configProps.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384); // 16KB batch size
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public KafkaTemplate<String, String> stringKafkaTemplate() {
        return new KafkaTemplate<>(StringProducerFactory());
    }

    @Bean
    public ProducerFactory<String, Map<String, Object>> alertProducerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaProperties.getBootstrapServers());
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
                org.springframework.kafka.support.serializer.JsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public KafkaTemplate<String, Map<String, Object>> alertKafkaTemplate() {
        return new KafkaTemplate<>(alertProducerFactory());
    }
}
