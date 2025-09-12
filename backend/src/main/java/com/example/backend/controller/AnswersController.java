package com.example.backend.controller;


import com.example.backend.dto.helper.CompareAnswer;
import com.example.backend.dto.request.CompareAnswersRequest;
import com.example.backend.dto.request.PointsRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.CheckAnswerResponse;
import com.example.backend.dto.response.HistoryUserAnswerResponse;
import com.example.backend.dto.response.QuestionResponse;
import com.example.backend.entity.Question;
import com.example.backend.entity.User;
import com.example.backend.entity.UserAnswer;
import com.example.backend.entity.UserAnswerDetail;
import com.example.backend.repository.QuestionRepository;
import com.example.backend.service.AnswerService;
import com.example.backend.service.UserAnswerService;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/answer")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@Slf4j  // Lombok annotation
public class AnswersController {
    private final AnswerService answerService;
    private final UserAnswerService userAnswerService;
    private final QuestionRepository questionRepository;
    @PostMapping("/compare/{questionId}")
    public ResponseEntity<ApiResponse<CheckAnswerResponse>> compareAnswers(
            @PathVariable("questionId") Long questionId,
            @RequestBody CompareAnswersRequest req, @AuthenticationPrincipal User user) {

        try {
            if (questionId == null || questionId <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Question ID không hợp lệ"));
            }
            if (req.getAnswers() == null || req.getAnswers().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Danh sách câu trả lời không được rỗng"));
            }
            // nếu chưa login => user = null
            Long userId = (user != null) ? user.getId() : null;
            Question q = questionRepository.findById(questionId).orElse(null);
            UserAnswer ua = new UserAnswer();
            ua.setRoom(req.getRoomId());
            ua.setUserId(userId);
            ua.setQuestion(q);
            ua.setScore(0);

            UserAnswer saved = userAnswerService.save(ua);
            List<UserAnswerDetail> details = req.getAnswers().stream()
                    .map(ans -> {
                        UserAnswerDetail d = new UserAnswerDetail();
                        d.setAnswerId(ans.getAnswerId());
                        d.setUserAnswer(saved);
                        return d;
                    })
                    .toList();

            userAnswerService.saveDetails(details);
            Long savedId = saved.getId();



            CheckAnswerResponse result =
                    answerService.compareAnswers(req.getAnswers(), questionId /*, req.getRoomId() nếu cần*/);
            result.setUserAnswerId(savedId);

            String message = result.isCorrect()
                    ? "Câu trả lời chính xác!"
                    : "Câu trả lời không chính xác";

            return ResponseEntity.ok(ApiResponse.success(result, message));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Có lỗi xảy ra khi so sánh câu trả lời", e.getMessage()));
        }
    }
    @PostMapping("/save-point/{userAnswerId}")
    public ResponseEntity<ApiResponse<Boolean>> savePoint(
            @PathVariable("userAnswerId") Long userAnswerId,
            @RequestBody PointsRequest req) {
        try {
            if (req == null || req.getPoints() == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Points không hợp lệ"));
            }

            Optional<UserAnswer> opt = userAnswerService.findById(userAnswerId);
            if (opt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("UserAnswer không tồn tại"));
            }

            UserAnswer ua = opt.get();
            ua.setScore(req.getPoints()); // cập nhật điểm
            userAnswerService.save(ua);

            return ResponseEntity.ok(ApiResponse.success(true, "Lưu điểm thành công"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Có lỗi xảy ra khi lưu điểm", e.getMessage()));
        }
    }
    @GetMapping("/history-user-answer/{roomId}")
    public ResponseEntity<ApiResponse<HistoryUserAnswerResponse>> getHistoryUserAnswer(
            @PathVariable("roomId") String roomId,
            @AuthenticationPrincipal User user) {
        if (user == null || roomId == null || roomId.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Không hợp lệ"));
        }

        try {
            // Gọi service để lấy dữ liệu lịch sử
            HistoryUserAnswerResponse response = userAnswerService.getHistory(roomId, user.getId());
            if (response == null) {
                return ResponseEntity.notFound()
                        .build();
            }
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Có lỗi xảy ra khi lấy dữ liệu lịch sử", e.getMessage()));
        }
    }
    @PostMapping("/save-userId/{roomId}")
    public ResponseEntity<ApiResponse<Boolean>> saveUserId(
            @PathVariable("roomId") String room,
            @AuthenticationPrincipal User user) {
        try {
            // Validate roomId
            if (room == null || room.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Room ID không được để trống"));
            }

            // Xử lý logic lưu userId
            boolean result = userAnswerService.saveUserIdForRoom(room, user.getId());

            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Có lỗi xảy ra khi lưu userId", e.getMessage()));
        }
    }
}
