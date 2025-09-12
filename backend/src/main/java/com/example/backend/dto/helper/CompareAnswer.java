package com.example.backend.dto.helper;

import lombok.Data;

@Data
public class CompareAnswer {
    private long answerId;
    private String answerText;
    public CompareAnswer() {
        // no-args constructor for JSON deserialization
    }

    // JPQL constructor
    public CompareAnswer(long answerId, String answerText) {
        this.answerId = answerId;
        this.answerText = answerText;
    }
}
