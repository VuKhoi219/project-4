package com.example.backend.controller;


import com.example.backend.dto.helper.QuestionWithAnswersDTO;
import com.example.backend.dto.request.QuizRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.ListQuizzesResponse;
import com.example.backend.dto.response.QuizResponse;
import com.example.backend.entity.Quiz;
import com.example.backend.entity.User;
import com.example.backend.service.QuizService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Min;


@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
@Slf4j  // Lombok annotation
public class QuizController {
    private final QuizService quizService;

    @PostMapping
    public ResponseEntity<ApiResponse<QuizResponse>> createQuiz(
            @Valid @RequestBody QuizRequest createDTO,
            @AuthenticationPrincipal User user) {

        try {
            log.info("Creating quiz: {} by user {}", createDTO.getTitle(), user != null ? user.getId() : "anonymous");

            Quiz createdQuiz = quizService.createQuiz(createDTO, user);
            QuizResponse response = QuizResponse.fromEntity(createdQuiz);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(response, "Quiz created successfully"));

        } catch (IllegalArgumentException e) {
            log.warn("Invalid quiz creation request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid request: " + e.getMessage()));

        } catch (RuntimeException e) {
            log.error("Error creating quiz: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to create quiz: " + e.getMessage()));

        } catch (Exception e) {
            log.error("Unexpected error creating quiz", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create quiz: " + e.getMessage()));
        }
    }
    @GetMapping("/{quizId}/questions")
    public ResponseEntity<ApiResponse<Page<QuestionWithAnswersDTO>>> getQuestionsWithAnswersByQuiz(
            @PathVariable @Min(1) long quizId,
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page must be >= 0") int page) {
        try {
            Page<QuestionWithAnswersDTO> questionPage = quizService.getQuestionsWithAnswersByQuiz(quizId, page);
            if (!questionPage.hasContent()) {
                return ResponseEntity.ok(
                        ApiResponse.success(questionPage, "Không có câu hỏi nào trong trang này")
                );
            }

            return ResponseEntity.ok(
                    ApiResponse.success(questionPage, "Lấy danh sách câu hỏi thành công")
            );

        } catch (IllegalArgumentException e) {
            // Handle validation errors (invalid quizId, etc.)
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Dữ liệu đầu vào không hợp lệ", e.getMessage()));

        } catch (Exception e) {
            // Handle general errors
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Có lỗi xảy ra khi lấy danh sách câu hỏi", e.getMessage()));
        }
    }
    @GetMapping()
    public ResponseEntity<ApiResponse<Page<ListQuizzesResponse>>> getQuizAll(
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page must be >= 0") int page) {
        try{
            Page<ListQuizzesResponse> quizzesPage = quizService.getAllQuizzes(page);

            if (!quizzesPage.hasContent()) {
                return ResponseEntity.ok(
                        ApiResponse.success(quizzesPage, "Không có quiz nào")
                );
            }

            return ResponseEntity.ok(
                    ApiResponse.success(quizzesPage, "Lấy danh sách quiz thành công")
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Dữ liệu đầu vào không hợp lệ", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Có lỗi xảy ra khi lấy danh sách quiz", e.getMessage()));
        }
    }

}