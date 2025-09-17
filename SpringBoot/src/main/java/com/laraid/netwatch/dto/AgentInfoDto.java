package com.laraid.netwatch.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AgentInfoDto {
    private String agentId;
    private String hostName;
    private String ip;
    private String status;
    private String timestamp;

    // Constructor
    public AgentInfoDto(String agentId, String hostName, String ip, String status, String timestamp) {
        this.agentId = agentId;
        this.hostName = hostName;
        this.ip = ip;
        this.status = status;
        this.timestamp = timestamp;
    }

    // Getters
    public String getAgentId() { return agentId; }
    public String getHostName() { return hostName; }
    public String getIp() { return ip; }
    public String getStatus() { return status; }
    public String getTimestamp(){return timestamp;}
}
