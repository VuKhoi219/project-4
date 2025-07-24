package com.example.backend.controller;


import com.example.backend.dto.request.QuizRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.QuizResponse;
import com.example.backend.entity.Quiz;
import com.example.backend.entity.User;
import com.example.backend.service.QuizService;
import com.sun.security.auth.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.Parameter;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
@Slf4j  // Lombok annotation
public class QuizController {
    private final QuizService quizService;
//
//    /**
//     * Tạo quiz mới
//     */
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
//
//    /**
//     * Lấy quiz theo ID
//     */
//    @GetMapping("/{id}")
//    public ResponseEntity<ApiResponse<QuizResponse>> getQuizById(
//            @PathVariable Integer id) {
//
//        QuizResponse quiz = quizService.getQuizById(id);
//        return ResponseEntity.ok(ApiResponse.success(quiz, "Quiz retrieved successfully"));
//    }
//
//    /**
//     * Lấy quiz theo share link
//     */
    @GetMapping("/share/{shareLink}")
    public ResponseEntity<ApiResponse<QuizResponse>> getQuizByShareLink(
            @PathVariable String shareLink) {

        QuizResponse quiz = quizService.getQuizByShareLink(shareLink);
        return ResponseEntity.ok(ApiResponse.success(quiz, "Quiz retrieved successfully"));
    }
//
//    /**
//     * Cập nhật quiz
//     */
////    @PutMapping("/{id}")
////    public ResponseEntity<ApiResponse<QuizResponse>> updateQuiz(
////            @PathVariable Integer id,
////            @Valid @RequestBody QuizRequest updateDTO,
////            Authentication authentication) {
////
////        Integer userId = getUserIdFromAuthentication(authentication);
////        QuizResponse quiz = quizService.updateQuiz(id, updateDTO, userId);
////
////        return ResponseEntity.ok(ApiResponse.success(quiz, "Quiz updated successfully"));
////    }
//
//    /**
//     * Xóa quiz
//     */
//    @DeleteMapping("/{id}")
//    public ResponseEntity<ApiResponse<Void>> deleteQuiz(
//            @PathVariable Integer id,
//            Authentication authentication) {
//
//        Integer userId = getUserIdFromAuthentication(authentication);
//        quizService.deleteQuiz(id, userId);
//
//        return ResponseEntity.ok(ApiResponse.success(null, "Quiz deleted successfully"));
//    }
//
//    /**
//     * Lấy danh sách quiz public
//     */
//    @GetMapping("/public")
//    public ResponseEntity<ApiResponse<Page<QuizResponse>>> getPublicQuizzes(
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size,
//            @RequestParam(defaultValue = "id") String sortBy,
//            @RequestParam(defaultValue = "desc") String sortDir) {
//
//        Page<QuizResponse> quizzes = quizService.getPublicQuizzes(page, size, sortBy, sortDir);
//        return ResponseEntity.ok(ApiResponse.success(quizzes, "Public quizzes retrieved successfully"));
//    }
//
//    /**
//     * Lấy quiz theo category
//     */
//    @GetMapping("/category/{categoryId}")
//    public ResponseEntity<ApiResponse<Page<QuizResponse>>> getQuizzesByCategory(
//            @PathVariable Integer categoryId,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size) {
//
//        Page<QuizResponse> quizzes = quizService.getQuizzesByCategory(categoryId, page, size);
//        return ResponseEntity.ok(ApiResponse.success(quizzes, "Category quizzes retrieved successfully"));
//    }
//
//    /**
//     * Tìm kiếm quiz
//     */
//    @GetMapping("/search")
//    public ResponseEntity<ApiResponse<Page<QuizResponse>>> searchQuizzes(
//            @RequestParam String title,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size) {
//
//        Page<QuizResponse> quizzes = quizService.searchQuizzes(title, page, size);
//        return ResponseEntity.ok(ApiResponse.success(quizzes, "Search results retrieved successfully"));
//    }
//
//    /**
//     * Lấy quiz của user hiện tại
//     */
//    @GetMapping("/my-quizzes")
//    public ResponseEntity<ApiResponse<Page<QuizResponse>>> getUserQuizzes(
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size,
//            Authentication authentication) {
//
//        Integer userId = getUserIdFromAuthentication(authentication);
//        Page<QuizResponse> quizzes = quizService.getUserQuizzes(userId, page, size);
//
//        return ResponseEntity.ok(ApiResponse.success(quizzes, "User quizzes retrieved successfully"));
//    }
//
//    /**
//     * Tìm kiếm quiz của user
//     */
//    @GetMapping("/my-quizzes/search")
//    public ResponseEntity<ApiResponse<Page<QuizResponse>>> searchUserQuizzes(
//            @RequestParam String title,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size,
//            Authentication authentication) {
//
//        Integer userId = getUserIdFromAuthentication(authentication);
//        Page<QuizResponse> quizzes = quizService.searchUserQuizzes(userId, title, page, size);
//
//        return ResponseEntity.ok(ApiResponse.success(quizzes, "User quiz search results retrieved successfully"));
//    }
//
//    /**
//     * Lấy quiz gần đây
//     */
//    @GetMapping("/recent")
//    public ResponseEntity<ApiResponse<List<QuizResponse>>> getRecentQuizzes(
//            @RequestParam(defaultValue = "10") int limit) {
//
//        List<QuizResponse> quizzes = quizService.getRecentQuizzes(limit);
//        return ResponseEntity.ok(ApiResponse.success(quizzes, "Recent quizzes retrieved successfully"));
//    }
//
//    /**
//     * Thống kê số lượng quiz
//     */
//    @GetMapping("/stats/public-count")
//    public ResponseEntity<ApiResponse<Long>> countPublicQuizzes() {
//        long count = quizService.countPublicQuizzes();
//        return ResponseEntity.ok(ApiResponse.success(count, "Public quiz count retrieved successfully"));
//    }
//
//    /**
//     * Đếm quiz của user
//     */
//    @GetMapping("/stats/my-count")
//    public ResponseEntity<ApiResponse<Long>> countUserQuizzes(Authentication authentication) {
//        Integer userId = getUserIdFromAuthentication(authentication);
//        long count = quizService.countUserQuizzes(userId);
//        return ResponseEntity.ok(ApiResponse.success(count, "User quiz count retrieved successfully"));
//    }

}