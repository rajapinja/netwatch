package com.laraid.netwatch.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "packets")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Packet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
    @Column(columnDefinition = "TEXT",length = 1000)
    private String payload;
    private String httpInfo;
    private String tlsInfo;

    private Integer length;

    @Column(name = "packet_type")
    private String packetType;
    // getters & setters

    // add to your existing Packet entity
    private String agentId;
    private String hostName;
    private String interfaceName;
    private LocalDateTime receivedAt;

}

