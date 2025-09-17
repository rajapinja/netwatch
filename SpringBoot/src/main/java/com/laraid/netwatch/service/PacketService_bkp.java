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
public class PacketService_bkp {

    private static final Logger log = LoggerFactory.getLogger(PacketService_bkp.class);

    private final PacketRepository packetRepository;
    private final KafkaTopicProperties kafkaTopicProperties;
    private final KafkaTemplate<String, Packet> kafkaTemplate; // JSON serializer
    private final Sinks.Many<Packet> sink = Sinks.many().multicast().onBackpressureBuffer();

//    public List<Packet> getAllPackets() {
//        return packetRepository.findAll();
//    }

    public List<Packet> getLatestPackets(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "timestamp"));
        return packetRepository.findAll(pageable).getContent();
    }

    public String sanitize(String input) {
        if (input == null) return null;
        return input.replace("\0", "");  // Remove null bytes
    }

    public Packet convertAndSave(PacketDTO dto) {

        Packet packet = new Packet();
        // 1️⃣ Map DTO → Entity
        packet = packetRepository.save(map(dto));
        // 2️⃣ Publish to Kafka (so other services / consumers can see it)
        kafkaTemplate.send(
                kafkaTopicProperties.getLivePacketEvents(),  // topic name
                packet.getSrcIp(),                           // key
                packet                                       // payload
        );
        // 3️⃣ Push into Reactor Sink → SSE/WebSocket subscribers
        //sink.tryEmitNext(packet);
        Sinks.EmitResult result = sink.tryEmitNext(packet);
        if (result.isFailure()) {
            log.warn("Failed to emit packet to SSE stream: {}", result);
        }
        // 4️⃣ Return for REST/other processing
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
        saved.forEach(s -> {
            kafkaTemplate.send(kafkaTopicProperties.getLivePacketEvents(), s.getSrcIp(), s);
            sink.tryEmitNext(s);
        });
    }

    public List<Packet> findLatest(int limit) {
        return packetRepository.findTopN(limit);
    }

    public Flux<Packet> streamPackets() {
        return sink.asFlux();
    }

    private Packet map(PacketDTO d) {
        Packet p = new Packet();
        // agent meta
        p.setAgentId(safe(d.getAgentId()));
        p.setHostName(safe(d.getHostName()));
        p.setInterfaceName(safe(d.getInterfaceName()));
        p.setReceivedAt(LocalDateTime.now());

        // your fields
        p.setTimestamp(d.getTimestamp());
        p.setSrcMAC(safe(d.getSrcMAC()));
        p.setDstMAC(safe(d.getDstMAC()));
        p.setArpOp(safe(d.getArpOp()));
        p.setArpSrcIp(safe(d.getArpSrcIp()));
        p.setArpDstIp(safe(d.getArpDstIp()));
        p.setSrcIp(safe(d.getSrcIp()));
        p.setDstIp(safe(d.getDstIp()));
        p.setProtocol(safe(d.getProtocol()));
        p.setTtl(d.getTtl());
        p.setIpFlags(safe(d.getIpFlags()));
        p.setSrcPort(d.getSrcPort());
        p.setDstPort(d.getDstPort());
        p.setSeq(d.getSeq());
        p.setTcpFlags(safe(d.getTcpFlags()));
        p.setUdpLen(d.getUdpLen());
        p.setIcmpType(d.getIcmpType());
        p.setIcmpCode(d.getIcmpCode());
        p.setDnsQueryName(safe(d.getDnsQueryName()));
        p.setDnsQueryType(safe(d.getDnsQueryType()));
        p.setDnsAnswer(safe(d.getDnsAnswer()));
        p.setPayload(safePayload(d.getPayload()));
        p.setHttpInfo(safe(d.getHttpInfo()));
        p.setTlsInfo(safe(d.getTlsInfo()));
        p.setLength(d.getLength());
        p.setPacketType(safe(d.getPacketType()));
        return p;
    }

    private String safe(String s) {
        if (s == null) return null;
        // strip null bytes that broke inserts in Stage 1
        return s.replace("\u0000", "");
    }
    private String safePayload(String s) {
        if (s == null) return null;
        return s.replace("\u0000", "");
    }
}

