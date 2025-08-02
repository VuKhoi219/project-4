package com.example.backend.dto.request;

import lombok.Data;

@Data
public class QuestionRequest {
    private String questionText;
    private String questionType; // "SINGLE", "MULTIPLE", "ESSAY"
    private int points;
    private Integer timeLimit;
}