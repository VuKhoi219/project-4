package com.example.backend.controller;


import com.example.backend.dto.request.QuestionRequest;
import com.example.backend.dto.response.QuestionResponse;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.service.QuestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
@Slf4j
public class QuestionController {

    private final QuestionService questionService;

    // GET /api/quizzes/{quizId}/questions
    @GetMapping("/quizzes/{quizId}")
    public ResponseEntity<ApiResponse<Page<QuestionResponse>>> getQuestions(
            @PathVariable Long quizId,
            @RequestParam(defaultValue = "0") int page) {
//        try {
//            List<QuestionResponse> questionPage = questionService.getQuestionsByQuizIdPaged(quizId);
//            if (!questionPage.hasContent()) {
//                return ResponseEntity.ok(
//                        ApiResponse.success(questionPage, "Không có câu hỏi nào trong trang này")
//                );
//            }
//            return ResponseEntity.ok(
//                    ApiResponse.success(questionPage, "Lấy danh sách câu hỏi thành công")
//            );
//        } catch (IllegalArgumentException e) {
//            return ResponseEntity.badRequest()
//                    .body(ApiResponse.error("Dữ liệu đầu vào không hợp lệ", e.getMessage()));
//        } catch (Exception e) {
//            return ResponseEntity.internalServerError()
//                    .body(ApiResponse.error("Có lỗi xảy ra khi lấy danh sách câu hỏi", e.getMessage()));
//        }
        return null ;
    }


    // POST /api/quizzes/{quizId}/questions
    @PostMapping("/quizzes/{quizId}")
    public ResponseEntity<ApiResponse<QuestionResponse>> addQuestion(
            @PathVariable Long quizId,
            @RequestBody QuestionRequest request) {
        try {
            QuestionResponse response = questionService.addQuestion(quizId, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(response, "Thêm câu hỏi thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Dữ liệu đầu vào không hợp lệ", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Có lỗi xảy ra khi thêm câu hỏi", e.getMessage()));
        }
    }


    // PUT /api/questions/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QuestionResponse>> updateQuestion(
            @PathVariable Long id,
            @RequestBody QuestionRequest request) {
        try {
            QuestionResponse response = questionService.updateQuestion(id, request);
            return ResponseEntity.ok(ApiResponse.success(response, "Cập nhật câu hỏi thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Dữ liệu đầu vào không hợp lệ", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Có lỗi xảy ra khi cập nhật câu hỏi", e.getMessage()));
        }
    }


    // DELETE /api/questions/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Long id) {
        try {
            questionService.deleteQuestion(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Xóa câu hỏi thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Dữ liệu đầu vào không hợp lệ", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Có lỗi xảy ra khi xóa câu hỏi", e.getMessage()));
        }
    }

    // PUT /api/questions/reorder
    @PutMapping("/reorder")
    public ResponseEntity<ApiResponse<Void>> reorderQuestions(@RequestBody List<Long> questionIds) {
        try {
            questionService.reorderQuestions(questionIds);
            return ResponseEntity.ok(ApiResponse.success(null, "Sắp xếp lại câu hỏi thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Dữ liệu đầu vào không hợp lệ", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Có lỗi xảy ra khi sắp xếp lại câu hỏi", e.getMessage()));
        }
    }
}
