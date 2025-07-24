package com.example.backend.dto.request;

import com.example.backend.entity.ChatMessage;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder  // ← THIẾU CÁI NÀY!
public class ChatRequest {
    private String model;
    private List<ChatMessage> messages;
    private double temperature;
}
