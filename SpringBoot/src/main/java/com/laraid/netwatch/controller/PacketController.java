package com.laraid.netwatch.controller;

import com.laraid.netwatch.dto.PacketBatchDTO;
import com.laraid.netwatch.dto.PacketDTO;
import com.laraid.netwatch.entity.Packet;
import com.laraid.netwatch.service.PacketService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

import java.util.List;

@RestController
@RequestMapping("/api/v1/packets")
@RequiredArgsConstructor
public class PacketController {

    private static final Logger log = LoggerFactory.getLogger(PacketController.class);

    private final PacketService packetService;

//    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<List<Packet>> getAllPackets() {
        //log.info("PacketController - getAllPackets-0");
        //List<Packet> packetList = packetService.getAllPackets();
        List<Packet> packets = packetService.getLatestPackets(30000);
        //log.info("PacketController - getAllPackets-1");
        return ResponseEntity.ok(packets);
    }

    //@PreAuthorize("hasAnyRole('ROLE_USER')")
    @PostMapping
    public ResponseEntity<Packet> savePacket(@RequestBody PacketDTO packet) {
        log.info("PacketController - savePacket");
        return ResponseEntity.ok(packetService.convertAndSave(packet));
    }

    //@PreAuthorize("hasAnyRole('USER','ADMIN')")
    @PostMapping("/batch")
    public ResponseEntity<Void> ingestBatch(@RequestBody PacketBatchDTO batch) {
        log.info("PacketController - ingestBatch-0");
        packetService.ingestBatch(batch);
        log.info("PacketController - ingestBatch-1");
        return ResponseEntity.accepted().build();
    }

    //@PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping("/latest/{count}")
    public List<Packet> listAll(@PathVariable Integer count) {
        log.info("PacketController - listAll");
        return packetService.findLatest(count); // limit for UI
    }

    // Live stream via SSE (Server-Sent Events)
    //@PreAuthorize("hasAnyRole('USER','ADMIN')")
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<Packet> liveStream() {
        log.info("PacketController - liveStream");
        return packetService.streamPackets(); // emits latest packets
    }
}

