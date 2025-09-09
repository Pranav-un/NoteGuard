package com.noteguard.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
@EnableScheduling
public class NoteGuardBackendApplication {

    private static final Logger logger = LoggerFactory.getLogger(NoteGuardBackendApplication.class);

    public static void main(String[] args) {
        logger.info("🚀 Starting NoteGuard Backend Application...");
        SpringApplication.run(NoteGuardBackendApplication.class, args);
        logger.info("📋 NoteGuard Backend Application main method completed");
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        logger.info("✅ NoteGuard Backend Application is ready and running!");
        logger.info("📡 Server is listening for requests");
    }
}
