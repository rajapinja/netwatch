package com.laraid.netwatch.utils;


import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AgentHeartbeat {
    private String agentId;
    private String hostName;
    private String ip;
    private String status;
    private String timestamp;

    public AgentHeartbeat(String agentId, String hostName, String ip, String status, String timestamp) {
        this.agentId = agentId;
        this.hostName = hostName;
        this.ip = ip;
        this.status = status;
        this.timestamp = timestamp;
    }

    // Getters and setters
    public String getAgentId() { return agentId; }
    public void setAgentId(String agentId) { this.agentId = agentId; }

    public String getHostName() { return hostName; }
    public void setHostName(String hostName) { this.hostName = hostName; }

    public String getIp() { return ip; }
    public void setIp(String ip) { this.ip = ip; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }


}
