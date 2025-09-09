package com.noteguard.backend.config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import javax.sql.DataSource;
import java.sql.Connection;

@Component
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${DATABASE_URL:not-set}")
    private String databaseUrl;

    private final DataSource dataSource;

    public DatabaseConfig(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void checkDatabaseConnection() {
        logger.info("Database URL: {}", databaseUrl.replaceAll("password=[^&]*", "password=****"));
        
        try (Connection connection = dataSource.getConnection()) {
            logger.info("Database connection successful!");
            logger.info("Database product name: {}", connection.getMetaData().getDatabaseProductName());
            logger.info("Database product version: {}", connection.getMetaData().getDatabaseProductVersion());
            logger.info("Database URL from connection: {}", connection.getMetaData().getURL());
        } catch (Exception e) {
            logger.error("Failed to connect to database: ", e);
        }
    }
}
