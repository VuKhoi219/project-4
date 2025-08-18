package com.example.backend.dto.request;

import lombok.Data;

@Data
public class FinalResultRequest {
    private Long quizId;
    private int points;
    private String namePlayer;
}
