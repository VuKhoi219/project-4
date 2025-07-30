package com.example.backend.dto.helper;

import com.example.backend.entity.QuestionType;
import lombok.Data;

import java.util.List;

@Data
public class QuestionWithAnswersDTO {
    private Long questionId;
    private String questionText;
    private QuestionType questionType;
    private int timeLimit;
    private List<AnswerDTO> answers;

    // Constructors
    public QuestionWithAnswersDTO() {}

    public QuestionWithAnswersDTO(Long questionId, String questionText,
                                  QuestionType questionType,int timeLimit ,List<AnswerDTO> answers) {
        this.questionId = questionId;
        this.questionText = questionText;
        this.questionType = questionType;
        this.timeLimit = timeLimit;
        this.answers = answers;
    }
}
