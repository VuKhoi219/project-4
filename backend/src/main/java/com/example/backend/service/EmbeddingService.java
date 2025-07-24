package com.example.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmbeddingService {

    private final RestTemplate restTemplate;

    @Value("${embedding.api.base-url}")
    private String embeddingApiBaseUrl;

    /**
     * Generate embedding cho text content sử dụng API có sẵn của bạn
     */
    public String generateEmbedding(String text) {
        try {
            log.info("Generating embedding for text of length: {}", text.length());

            // Chuẩn bị request body theo format API của bạn
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("text", text); // Adjust theo field name của API bạn

            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Gọi API embedding của bạn
            ResponseEntity<String> response = restTemplate.postForEntity(
                    embeddingApiBaseUrl, // URL đầy đủ từ config
                    request,
                    String.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String embeddingResult = response.getBody();
                log.info("Successfully generated embedding");
                return embeddingResult;
            } else {
                log.error("Failed to generate embedding. Status: {}", response.getStatusCode());
                throw new RuntimeException("Failed to generate embedding");
            }

        } catch (Exception e) {
            log.error("Error generating embedding: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate embedding: " + e.getMessage());
        }
    }

}
