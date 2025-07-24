package com.example.backend.dto.response;

import com.example.backend.entity.Answer;
import lombok.Data;

@Data
public class AnswerResponse {
    private long id;
    private String answerText;
    private boolean isCorrect;
    private int orderIndex;

    public static AnswerResponse fromEntity(Answer answer) {
        AnswerResponse response = new AnswerResponse();

        response.setId(answer.getId());
        response.setAnswerText(answer.getAnswerText());
        response.setCorrect(answer.isCorrect());
        response.setOrderIndex(answer.getOrderIndex());

        return response;
    }
}