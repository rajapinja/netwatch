package com.laraid.netwatch.service;

import com.laraid.netwatch.config.KafkaTopicProperties;
import com.laraid.netwatch.dto.PacketBatchDTO;
import com.laraid.netwatch.dto.PacketDTO;
import com.laraid.netwatch.entity.Packet;
import com.laraid.netwatch.repo.PacketRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PacketService {

    private static final Logger log = LoggerFactory.getLogger(PacketService.class);

    private final PacketRepository packetRepository;
    private final KafkaTopicProperties kafkaTopicProperties;
    private final KafkaTemplate<String, Packet> kafkaTemplate;
    private final Sinks.Many<Packet> sink = Sinks.many().multicast().onBackpressureBuffer();

    public List<Packet> getLatestPackets(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "timestamp"));
        return packetRepository.findAll(pageable).getContent();
    }

    public Packet convertAndSave(PacketDTO dto) {
        Packet packet = packetRepository.save(map(dto));
        publishPacket(packet);
        return packet;
    }

    public void ingestBatch(PacketBatchDTO batch) {
        List<Packet> toSave = batch.getPackets().stream()
                .map(d -> {
                    if (StringUtils.isBlank(d.getAgentId())) d.setAgentId(batch.getAgentId());
                    if (StringUtils.isBlank(d.getHostName())) d.setHostName(batch.getHostName());
                    if (StringUtils.isBlank(d.getInterfaceName())) d.setInterfaceName(batch.getInterfaceName());
                    return map(d);
                })
                .collect(Collectors.toList());

        List<Packet> saved = packetRepository.saveAll(toSave);
        saved.forEach(this::publishPacket);
    }

    public List<Packet> findLatest(int limit) {
        return packetRepository.findTopN(limit);
    }

    public Flux<Packet> streamPackets() {
        return sink.asFlux();
    }

    /** 🔹 Common publish logic: Kafka + SSE */
    private void publishPacket(Packet packet) {
        kafkaTemplate.send(kafkaTopicProperties.getLivePacketEvents(), packet.getSrcIp(), packet);

        Sinks.EmitResult result = sink.tryEmitNext(packet);
        if (result.isFailure()) {
            log.warn("Failed to emit packet to SSE stream: {}", result);
        }
    }

    /** 🔹 DTO → Entity mapper */
    private Packet map(PacketDTO d) {
        Packet p = new Packet();
        p.setAgentId(clean(d.getAgentId()));
        p.setHostName(clean(d.getHostName()));
        p.setInterfaceName(clean(d.getInterfaceName()));
        p.setReceivedAt(LocalDateTime.now());
        p.setTimestamp(d.getTimestamp());
        p.setSrcMAC(clean(d.getSrcMAC()));
        p.setDstMAC(clean(d.getDstMAC()));
        p.setArpOp(clean(d.getArpOp()));
        p.setArpSrcIp(clean(d.getArpSrcIp()));
        p.setArpDstIp(clean(d.getArpDstIp()));
        p.setSrcIp(clean(d.getSrcIp()));
        p.setDstIp(clean(d.getDstIp()));
        p.setProtocol(clean(d.getProtocol()));
        p.setTtl(d.getTtl());
        p.setIpFlags(clean(d.getIpFlags()));
        p.setSrcPort(d.getSrcPort());
        p.setDstPort(d.getDstPort());
        p.setSeq(d.getSeq());
        p.setTcpFlags(clean(d.getTcpFlags()));
        p.setUdpLen(d.getUdpLen());
        p.setIcmpType(d.getIcmpType());
        p.setIcmpCode(d.getIcmpCode());
        p.setDnsQueryName(clean(d.getDnsQueryName()));
        p.setDnsQueryType(clean(d.getDnsQueryType()));
        p.setDnsAnswer(clean(d.getDnsAnswer()));
        p.setPayload(clean(d.getPayload()));   // ✅ same cleaner for payload
        p.setHttpInfo(clean(d.getHttpInfo()));
        p.setTlsInfo(clean(d.getTlsInfo()));
        p.setLength(d.getLength());
        p.setPacketType(clean(d.getPacketType()));
        return p;
    }

    /** 🔹 One reusable cleaner for all string fields */
    private String clean(String s) {
        if (s == null) return null;
        return s.replace("\u0000", ""); // strip null bytes
    }
}
