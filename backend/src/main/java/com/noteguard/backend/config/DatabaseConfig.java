package com.noteguard.backend.config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    /**
     * Custom DataSource configuration for Railway PostgreSQL
     * Railway provides DATABASE_URL in format: postgresql://user:pass@host:port/db
     * We need to convert it to proper JDBC format
     */
    @Bean
    @Primary
    @Profile("prod")
    public DataSource railwayDataSource() {
        logger.info("🔧 Configuring Railway PostgreSQL DataSource");
        
        if (databaseUrl == null || databaseUrl.isEmpty()) {
            logger.error("❌ DATABASE_URL environment variable is not set");
            throw new RuntimeException("DATABASE_URL environment variable is not set");
        }

        try {
            // Parse the Railway DATABASE_URL
            URI uri = URI.create(databaseUrl);
            
            String jdbcUrl = String.format("jdbc:postgresql://%s:%d%s",
                uri.getHost(), uri.getPort(), uri.getPath());
            
            String username = uri.getUserInfo().split(":")[0];
            String password = uri.getUserInfo().split(":")[1];
            
            logger.info("📍 Database Host: {}", uri.getHost());
            logger.info("🔌 Database Port: {}", uri.getPort());
            logger.info("🗄️ Database Name: {}", uri.getPath());
            
            DataSource dataSource = DataSourceBuilder.create()
                .driverClassName("org.postgresql.Driver")
                .url(jdbcUrl)
                .username(username)
                .password(password)
                .build();
                
            logger.info("✅ DataSource configured successfully");
            return dataSource;
                
        } catch (Exception e) {
            logger.error("❌ Failed to parse DATABASE_URL", e);
            throw new RuntimeException("Failed to configure database connection", e);
        }
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        logger.info("🎯 Application is ready - database should be connected!");
    }
}
