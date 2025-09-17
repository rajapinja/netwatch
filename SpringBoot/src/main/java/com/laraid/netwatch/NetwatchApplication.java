package com.laraid.netwatch;

import com.laraid.netwatch.utils.AgentRegistry;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NetwatchApplication {

	private static final Logger log
			= LoggerFactory. getLogger(NetwatchApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(NetwatchApplication.class, args);
	}

	@PostConstruct
	public void init() {
		log.info(">>>> JVM TimeZone: " + java.util.TimeZone.getDefault().getID());
	}

}
