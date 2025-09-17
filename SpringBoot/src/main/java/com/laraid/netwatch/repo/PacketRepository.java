package com.laraid.netwatch.repo;

import com.laraid.netwatch.entity.Packet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PacketRepository extends JpaRepository<Packet, Long> {

    // PacketRepository.java
    @Query(value = "SELECT * FROM packets ORDER BY id DESC LIMIT :limit", nativeQuery = true)
    List<Packet> findTopN(@Param("limit") int limit);

}
