package com.example.backend.dto.request;


import com.example.backend.dto.helper.CompareAnswer;
import lombok.Data;

import java.util.List;

@Data
public class CompareAnswersRequest {
    private String roomId;
    private List<CompareAnswer> answers;
}