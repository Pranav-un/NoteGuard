package com.noteguard.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NoteGuardBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(NoteGuardBackendApplication.class, args);
    }

}
