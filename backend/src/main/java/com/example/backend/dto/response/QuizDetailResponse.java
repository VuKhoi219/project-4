package com.example.backend.dto.response;

import lombok.Data;

@Data
public class QuizDetailResponse {
    private String title;
    private String description;
    private String summary;
    private long totalQuestions;

    public QuizDetailResponse() {}

    public QuizDetailResponse(String title, long totalQuestions, String summary, String description) {
        this.title = title;
        this.totalQuestions = totalQuestions;
        this.summary = summary;
        this.description = description;
    }
}
