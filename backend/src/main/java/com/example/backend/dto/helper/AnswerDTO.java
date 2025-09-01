package com.example.backend.dto.helper;

import lombok.Data;

@Data
public class AnswerDTO {
    private long id;
    private String answerText;

    public AnswerDTO() {}
    public AnswerDTO(long id, String answerText) {
        this.id = id;
        this.answerText = answerText;
    }
}
