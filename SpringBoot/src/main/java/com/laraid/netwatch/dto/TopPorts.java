package com.laraid.netwatch.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class TopPorts {
    private String agentId;
    private List<Map<String, Object>> ports;
}

