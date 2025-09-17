package com.laraid.netwatch.status;

import com.laraid.netwatch.config.KafkaProperties;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class ServiceStatusService {

    private static final Logger log = LoggerFactory.getLogger(ServiceStatusService.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final DataSource dataSource; // for Postgres
    private final RestTemplate restTemplate = new RestTemplate();
    private final KafkaProperties kafkaProperties;

    @Scheduled(fixedRate = 10000) // every 10 sec
    public void checkServices() {
        Map<String, Object> statuses = new LinkedHashMap<>();

        // Spring Boot self
        statuses.put("Spring Boot", Map.of(
                "status", "UP",
                "cpu", Runtime.getRuntime().availableProcessors(),
                "memory", Runtime.getRuntime().freeMemory() / 1024 / 1024 + " MB"
        ));

        // Postgres
        try (Connection conn = dataSource.getConnection()) {
            statuses.put("Postgres", Map.of("status", "UP"));
        } catch (Exception e) {
            statuses.put("Postgres", Map.of("status", "DOWN"));
        }

        // Keycloak
        try {
            String healthUrl = "http://localhost:8383/health/ready"; // 👈 no /realms/ prefix
            restTemplate.getForObject(healthUrl, String.class);
            statuses.put("Keycloak", Map.of("status", "UP"));
        } catch (Exception e) {
            statuses.put("Keycloak", Map.of(
                    "status", "DOWN",
                    "error", e.getMessage()
            ));
        }

        // Example for Keycloak metrics
        try {
            String metrics = restTemplate.getForObject("http://localhost:8383/metrics", String.class);
            // parse Prometheus metrics if needed
            statuses.put("Keycloak-Metrics", Map.of("status", "UP", "metrics", metrics.substring(0, 200) + "..."));
        } catch (Exception e) {
            statuses.put("Keycloak-Metrics", Map.of("status", "DOWN"));
        }

        try (AdminClient admin = AdminClient.create(
                Map.of(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, "192.168.29.215:39092"))) {

            admin.listTopics().names().get(5, TimeUnit.SECONDS); // add timeout for safety
            statuses.put("Kafka", Map.of("status", "UP"));
        } catch (Exception e) {
            statuses.put("Kafka", Map.of("status", "DOWN", "error", e.getMessage()));
        }

        // System + JVM Info
        statuses.put("System", Map.of(
                "cpuCores", Runtime.getRuntime().availableProcessors(),
                "maxMemoryMB", Runtime.getRuntime().maxMemory() / 1024 / 1024 + " MB",
                "freeMemoryMB", Runtime.getRuntime().freeMemory() / 1024 / 1024 + " MB",
                "totalMemoryMB", Runtime.getRuntime().totalMemory() / 1024 / 1024 + " MB",
                "status", "JVM Runtime Info"
        ));

        log.info(" Pushing service status update : {}",statuses);
        // Push via WebSocket
        messagingTemplate.convertAndSend("/topic/serviceStatus", statuses);
    }
}

