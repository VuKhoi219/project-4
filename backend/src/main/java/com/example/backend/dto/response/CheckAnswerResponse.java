package com.example.backend.dto.response;

import com.example.backend.dto.helper.compareAnswer;
import lombok.Data;

import java.util.List;

@Data
public class CheckAnswerResponse {
        private boolean isCorrect;
        private String correctAnswerText;
        private List<compareAnswer> answers;


        public CheckAnswerResponse(boolean isCorrect, String correctAnswerText, List<compareAnswer> answers) {
                this.isCorrect = isCorrect;
                this.correctAnswerText = correctAnswerText;
                this.answers = answers;
        }
}
