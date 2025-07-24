package com.example.backend.dto.generated;

import lombok.Data;

import java.util.List;


@Data
public class GeneratedQuestionDTO {
    private String questionText;
    private String questionType;
    private String explanation;
    private Integer points;
    private List<GeneratedAnswerDTO> answers;
    private int timeLimit;
}