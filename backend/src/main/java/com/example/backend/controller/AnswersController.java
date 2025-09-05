package com.example.backend.controller;


import com.example.backend.dto.helper.CompareAnswer;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.CheckAnswerResponse;
import com.example.backend.service.AnswerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/answer")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@Slf4j  // Lombok annotation
public class AnswersController {
    private final AnswerService answerService;

    @PostMapping("/compare/{questionId}")
    public ResponseEntity<ApiResponse<CheckAnswerResponse>> compareAnswers(
            @PathVariable("questionId") Long questionId,
            @RequestBody List<CompareAnswer> answers) {

        try {
            if (questionId == null || questionId <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Question ID không hợp lệ"));
            }

            if (answers == null || answers.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Danh sách câu trả lời không được rỗng"));
            }

            CheckAnswerResponse result = answerService.compareAnswers(answers, questionId);
            String message = result.isCorrect() ? "Câu trả lời chính xác!" : "Câu trả lời không chính xác";

            return ResponseEntity.ok(ApiResponse.success(result, message));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Có lỗi xảy ra khi so sánh câu trả lời", e.getMessage()));
        }
    }
}
