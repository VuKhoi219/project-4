package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ChatResponse
{
    // Chỉ lấy phần content chính
    @Data
    public static class Choice {
        public Message message;
    }
    @Data
    public static class Message {
        public String role;
        public String content;
    }

    private List<Choice> choices;
}
