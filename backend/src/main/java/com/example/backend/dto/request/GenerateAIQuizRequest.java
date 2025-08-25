package com.example.backend.dto.request;

import lombok.Data;
import javax.validation.constraints.NotBlank;

import java.util.List;
import com.example.backend.dto.generated.GeneratedQuestionDTO;

@Data
public class GenerateAIQuizRequest {
    private String title;
    @NotBlank(message = "Content không được để trống")
    private String content;
    private String description;
    private String summary;
    private int numberOfQuestions;
    private String difficulty;
    private String questionType;
    private int timeLimit;
    private List<GeneratedQuestionDTO> questions;
}
