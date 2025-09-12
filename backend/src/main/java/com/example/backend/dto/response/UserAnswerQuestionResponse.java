package com.example.backend.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class UserAnswerQuestionResponse {
    private Long questionId;
    private String questionText;
    private int score;
    private List<UserAnswerResponse> answers;
}