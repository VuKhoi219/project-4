package com.example.backend.dto.response;

import lombok.Data;

@Data
public class UserAnswerResponse {
    private Long answerId;
    private String answerText;
    private Integer isCorrect;
    private Integer userChoice;
}