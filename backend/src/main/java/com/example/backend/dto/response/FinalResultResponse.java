package com.example.backend.dto.response;

import lombok.Data;

@Data
public class FinalResultResponse {
    private Long id;
    private int points;
    private String namePlayer;
    private Long quizId;
    private Long userId;
}
