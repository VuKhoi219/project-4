package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HistoryUserAnswerResponse {
    private String room;          // chỉ giữ 1 lần
    private String title;         // chỉ giữ 1 lần
    private List<UserAnswerQuestionResponse> questions;
}


