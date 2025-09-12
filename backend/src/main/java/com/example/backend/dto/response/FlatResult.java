package com.example.backend.dto.response;



public interface FlatResult {
    String getRoom();
    int getScore();
    Long getQuestionId();
    String getQuestionText();
    String getTitle();
    Long getAnswerId();
    String getAnswerText();
    Integer getIsCorrect();   // Đổi về Integer
    Integer getUserChoice();  // Đổi về Integer

    // Thêm method helper
    default Boolean isCorrect() {
        return getIsCorrect() != null && getIsCorrect() == 1;
    }

    default Boolean hasUserChoice() {
        return getUserChoice() != null && getUserChoice() == 1;
    }
}
