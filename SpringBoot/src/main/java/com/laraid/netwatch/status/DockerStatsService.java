package com.laraid.netwatch.status;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

@Service
public class DockerStatsService {

    public Map<String, Map<String, String>> getDockerStats() {
        Map<String, Map<String, String>> stats = new HashMap<>();

        try {
            ProcessBuilder pb = new ProcessBuilder(
                    "docker", "stats", "--no-stream", "--format", "{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}"
            );
            Process process = pb.start();

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    String[] parts = line.split("\\|");
                    if (parts.length == 3) {
                        String name = parts[0];
                        String cpu = parts[1];
                        String memUsage = parts[2]; // e.g., "512MiB / 1GiB"

                        Map<String, String> serviceStats = new HashMap<>();
                        serviceStats.put("cpu", cpu);
                        serviceStats.put("memory", memUsage);

                        stats.put(name, serviceStats);
                    }
                }
            }

            process.waitFor();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return stats;
    }
}

