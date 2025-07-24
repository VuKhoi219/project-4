package com.example.backend.dto.generated;

import lombok.Data;
import java.util.List;

@Data
public class GeneratedQuestion {
    private String questionText;
    private String questionType;
    private List<GeneratedAnswer> answers;
    private String explanation;
    private int points;
}
