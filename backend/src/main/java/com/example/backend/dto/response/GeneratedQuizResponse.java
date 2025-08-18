package com.example.backend.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class GeneratedQuizResponse {
    private String title;
    private List<GeneratedQuestionDTO> questions;
}

@Data
class GeneratedQuestionDTO {
    private String content;
    private List<GeneratedAnswerDTO> answers;
}

@Data
class GeneratedAnswerDTO {
    private String content;
    private boolean isCorrect;
}
