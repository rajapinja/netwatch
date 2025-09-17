package com.laraid.netwatch.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PacketBatchDTO {
    private String agentId;         // optional top-level
    private String hostName;        // optional top-level
    private String interfaceName;   // optional top-level
    private List<PacketDTO> packets;
}
