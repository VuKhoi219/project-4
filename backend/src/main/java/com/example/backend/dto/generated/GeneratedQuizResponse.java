package com.example.backend.dto.generated;

import lombok.Data;
import java.util.List;

@Data
public class GeneratedQuizResponse {
    private String title;
    private List<GeneratedQuestionDTO> questions;
}
