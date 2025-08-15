package com.example.backend.dto.request;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Positive;

import java.util.List;
import com.example.backend.dto.generated.GeneratedQuestionDTO;

@Data
public class GenerateAIQuizRequest {
    @NotBlank(message = "Title không được để trống")
    private String title;
    
    private String questionType; // Removed @NotBlank since it's not required for saving

    private int timeLimit;

    private List<GeneratedQuestionDTO> questions;
}
