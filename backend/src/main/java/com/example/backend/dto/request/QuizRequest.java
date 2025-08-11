package com.example.backend.dto.request;

import com.example.backend.entity.Quiz;
import com.example.backend.entity.SourceType;
import lombok.Data;

@Data
public class QuizRequest {
    private long categoryId;
    private String title;
    private String description;
    private String summary;
    private SourceType sourceType = SourceType.TEXT;
    private Long fileId;
    // Các field mới cho AI generation
    private Integer numberOfQuestions = 10;
    private String difficulty = "medium"; // easy, medium, hard

    private boolean showCorrectAnswers = true;
    private boolean shuffleAnswers = true;
}