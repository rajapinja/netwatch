package com.laraid.netwatch.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PacketDTO {

    private String timestamp;

    // Ethernet
    private String srcMAC;
    private String dstMAC;

    // ARP
    private String arpOp;
    private String arpSrcIp;
    private String arpDstIp;

    // IP
    private String srcIp;
    private String dstIp;
    private String protocol;
    private Integer ttl;
    private String ipFlags;

    // TCP
    private Integer srcPort;
    private Integer dstPort;
    private Long seq;
    private String tcpFlags;

    // UDP
    private Integer udpLen;

    // ICMP
    private Integer icmpType;
    private Integer icmpCode;

    // DNS
    private String dnsQueryName;
    private String dnsQueryType;
    private String dnsAnswer;

    // App Layer
    private String payload;
    private String httpInfo;
    private String tlsInfo;

    private Integer length;
    private String packetType;

    // add to your existing Packet entity
    private String agentId;
    private String hostName;
    private String interfaceName;

}
