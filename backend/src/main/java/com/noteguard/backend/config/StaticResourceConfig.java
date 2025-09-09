package com.noteguard.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Handle frontend assets (CSS, JS, images)
        registry.addResourceHandler("/assets/**")
                .addResourceLocations("file:static/assets/", "classpath:/static/assets/")
                .setCachePeriod(31536000); // 1 year cache
                
        // Handle frontend static files (favicon, etc.)
        registry.addResourceHandler("/static/**")
                .addResourceLocations("file:static/", "classpath:/static/")
                .setCachePeriod(31536000);
                
        // Handle root level static files (CSS, JS, etc.)
        registry.addResourceHandler("/*.css", "/*.js", "/*.ico", "/*.png", "/*.jpg", "/*.svg", "/*.json")
                .addResourceLocations("file:static/", "classpath:/static/")
                .setCachePeriod(31536000);
                
        // Handle index.html (no cache for the main page)
        registry.addResourceHandler("/index.html")
                .addResourceLocations("file:static/", "classpath:/static/")
                .setCachePeriod(0);
    }
}
