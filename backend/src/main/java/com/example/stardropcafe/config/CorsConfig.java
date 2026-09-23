package com.example.stardropcafe.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * Browsers block cross-origin calls unless the API opts in, which the Expo web
 * build always is: it is served from port 8081, and from another device it is a
 * different host entirely. Native builds do not enforce CORS and are unaffected.
 *
 * <p>The default is permissive for local development. Narrow
 * {@code stardropcafe.cors.allowed-origin-patterns} before deploying publicly.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final List<String> allowedOriginPatterns;

    public CorsConfig(
            @Value("${stardropcafe.cors.allowed-origin-patterns}") List<String> allowedOriginPatterns) {
        this.allowedOriginPatterns = allowedOriginPatterns;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns(allowedOriginPatterns.toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
