package com.laraid.netwatch.controller;

import com.laraid.netwatch.dto.AgentInfoDto;
import com.laraid.netwatch.utils.AgentHeartbeat;
import com.laraid.netwatch.utils.AgentRegistry;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/agents")
public class AgentController {

    private final AgentRegistry agentRegistry;

    public AgentController(AgentRegistry agentRegistry) {
        this.agentRegistry = agentRegistry;
    }

    //@PreAuthorize("hasAnyRole('USER','ADMIN','AGENT')")
    @GetMapping
    public List<AgentHeartbeat> getAgents() {
        return agentRegistry.getActiveAgents().stream()
                .map(agent -> new AgentHeartbeat(
                        agent.getAgentId(),
                        agent.getHostName(),
                        agent.getIp(),
                        agent.getStatus(),
                        agent.getTimestamp()
                ))
                .toList();
    }


}



