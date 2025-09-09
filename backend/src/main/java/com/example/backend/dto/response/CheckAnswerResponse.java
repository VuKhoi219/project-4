package com.example.backend.dto.response;

import com.example.backend.dto.helper.CompareAnswer;
import lombok.Data;

import java.util.List;

@Data
public class CheckAnswerResponse {
        private boolean isCorrect;
        private String correctAnswerText;       // text đáp án đúng (hiển thị)
        private List<CompareAnswer> answers;    // danh sách đáp án user gửi (cả id + text)
        private Long userAnswerId;        // Danh sách id UserAnswer đã lưu

        public CheckAnswerResponse(boolean isCorrect, String correctAnswerText, List<CompareAnswer> answers, Long userAnswerId) {
                this.isCorrect = isCorrect;
                this.correctAnswerText = correctAnswerText;
                this.answers = answers;
                this.userAnswerId = userAnswerId;
        }
}
