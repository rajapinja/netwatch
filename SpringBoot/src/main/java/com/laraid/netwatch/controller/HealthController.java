package com.laraid.netwatch.controller;

import com.laraid.netwatch.status.DockerStatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    private final DockerStatsService dockerStatsService;

    public HealthController(DockerStatsService dockerStatsService) {
        this.dockerStatsService = dockerStatsService;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> statuses = new HashMap<>();

        // Existing service checks (System, DB, Kafka, Keycloak...)
        statuses.put("System", Map.of(
                "cpuCores", Runtime.getRuntime().availableProcessors(),
                "freeMemoryMB", Runtime.getRuntime().freeMemory() / 1024 / 1024,
                "totalMemoryMB", Runtime.getRuntime().totalMemory() / 1024 / 1024,
                "maxMemoryMB", Runtime.getRuntime().maxMemory() / 1024 / 1024
        ));

        // Merge Docker container stats
        Map<String, Map<String, String>> dockerStats = dockerStatsService.getDockerStats();
        statuses.putAll(dockerStats);

        return statuses;
    }

    //@PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("timestamp", System.currentTimeMillis());
        response.put("service", "Netwatch Backend");
        response.put("version", "1.0.0");
        return ResponseEntity.ok(response);
    }
}
