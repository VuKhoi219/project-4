package com.example.backend.dto.helper;

import lombok.Data;

@Data
public class compareAnswer {
    private String answerText;
    // Constructor cho JPQL
    public compareAnswer(String answerText) {
        this.answerText = answerText;
    }
}
