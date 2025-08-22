package com.example.backend.controller;

import com.example.backend.dto.generated.GeneratedQuizResponse;

import com.example.backend.dto.request.GenerateAIQuizRequest;
import com.example.backend.dto.helper.QuestionWithAnswersDTO;
import com.example.backend.dto.request.QuizRequest;
import com.example.backend.dto.response.*;
import com.example.backend.entity.Quiz;
import com.example.backend.entity.User;
import com.example.backend.repository.QuizRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.FinalResultService;
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
import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
@Slf4j // Lombok annotation
public class QuizController {
    private final QuizService quizService;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final FinalResultService finalResultService;

    @PostMapping("/generate-ai")
    public ResponseEntity<ApiResponse<GeneratedQuizResponse>> generateQuizContent(
            @Valid @RequestBody GenerateAIQuizRequest request,
            @AuthenticationPrincipal User user) {
        try {
            log.info("Generating quiz content for title: {} by user {} , number question {}, difficulty {}",
                    request.getContent(), user != null ? user.getId() : "anonymous", request.getNumberOfQuestions(),
                    request.getDifficulty());

            GeneratedQuizResponse generatedContent = quizService.generateQuizContent(request);

            return ResponseEntity.ok()
                    .body(ApiResponse.success(generatedContent, "Đã tạo nội dung Quiz thành công"));

        } catch (Exception e) {
            log.error("Error generating quiz content", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Không thể tạo nội dung Quiz: " + e.getMessage()));
        }
    }

    @PostMapping("/save-generated")
    public ResponseEntity<ApiResponse<QuizResponse>> saveGeneratedQuiz(
            @Valid @RequestBody GenerateAIQuizRequest generatedQuiz,
            @AuthenticationPrincipal User user) {
        try {
            log.info("Saving generated quiz: {} by user {}",
                    generatedQuiz.getTitle(), user != null ? user.getId() : "anonymous");
            Quiz savedQuiz = quizService.saveGeneratedQuiz(generatedQuiz, user);
            QuizResponse response = QuizResponse.fromEntity(savedQuiz);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(response, "Đã lưu Quiz thành công"));
        } catch (Exception e) {
            log.error("Error saving generated quiz", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Không thể lưu Quiz: " + e.getMessage()));
        }
    }

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
    public ResponseEntity<ApiResponse<List<QuestionWithAnswersDTO>>> getQuestionsWithAnswersByQuiz(
            @PathVariable @Min(1) long quizId) {
        try {
            List<QuestionWithAnswersDTO> questionList = quizService.getQuestionsWithAnswersByQuiz(quizId);

            if (questionList.isEmpty()) {
                return ResponseEntity.ok(
                        ApiResponse.success(questionList, "Không có câu hỏi nào"));
            }

            return ResponseEntity.ok(
                    ApiResponse.success(questionList, "Lấy danh sách câu hỏi thành công"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Dữ liệu đầu vào không hợp lệ", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Có lỗi xảy ra khi lấy danh sách câu hỏi", e.getMessage()));
        }
    }

    @GetMapping("/generate-ai/{id}")
    public ResponseEntity<ApiResponse<GeneratedQuizResponse>> getGeneratedQuizById(
            @PathVariable @Min(1) Long id) {
        try {
            log.info("Getting generated quiz content by id: {}", id);

            GeneratedQuizResponse response = quizService.getGeneratedQuizById(id);
            return ResponseEntity.ok()
                    .body(ApiResponse.success(response, "Lấy nội dung Quiz thành công"));

        } catch (Exception e) {
            log.error("Error getting quiz content", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Không thể lấy nội dung Quiz: " + e.getMessage()));
        }
    }

    @GetMapping()
    public ResponseEntity<ApiResponse<Page<ListQuizzesResponse>>> getQuizAll(
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page must be >= 0") int page) {
        try {
            Page<ListQuizzesResponse> quizzesPage = quizService.getAllQuizzes(page);

            if (!quizzesPage.hasContent()) {
                return ResponseEntity.ok(
                        ApiResponse.success(quizzesPage, "Không có quiz nào"));
            }
            return ResponseEntity.ok(
                    ApiResponse.success(quizzesPage, "Lấy danh sách quiz thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Dữ liệu đầu vào không hợp lệ", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Có lỗi xảy ra khi lấy danh sách quiz", e.getMessage()));
        }
    }

    @GetMapping("/quizzes-hot")
    public ResponseEntity<ApiResponse<List<ResponseQuizHot>>> getQuizzesByQuiz() {
        try {
            List<ResponseQuizHot> hotQuizzes = finalResultService.findTop10QuizzesHot();

            if (hotQuizzes.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.error("Không có quiz nào hot"));
            }
            return ResponseEntity.ok(ApiResponse.success(hotQuizzes, "Top 10 quizzes hot"));
        } catch (Exception e) {
            return ResponseEntity
                    .internalServerError()
                    .body(ApiResponse.error("Lỗi khi lấy danh sách quiz hot", e.getMessage()));
        }
    }

    @GetMapping("/save-creator")
    public ResponseEntity<ApiResponse<String>> saveCreator(
            @RequestParam Long quizId,
            @RequestParam Long userId) {
        try {
            // Lấy quiz theo id
            Quiz quiz = quizRepository.findById(quizId)
                    .orElseThrow(() -> new RuntimeException("Quiz không tồn tại"));

            // Lấy user theo id
            User creator = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            // Set creator cho quiz
            quiz.setCreator(creator);

            // Lưu lại quiz
            quizRepository.save(quiz);

            return ResponseEntity.ok(ApiResponse.success(
                    "Đã gán creator cho quiz thành công"));
        } catch (Exception e) {
            return ResponseEntity
                    .internalServerError()
                    .body(ApiResponse.error("Lỗi khi lưu creator vào quiz", e.getMessage()));
        }
    }

    @GetMapping("/detail-quiz/{id}")
    public ResponseEntity<ApiResponse<QuizDetailResponse>> getDetailQuizById(@PathVariable Long id) {
        try {
            QuizDetailResponse response = quizService.getQuizDetailById(id);
            return ResponseEntity.ok(ApiResponse.success(response, "Chi tiết quiz"));
        } catch (Exception e) {
            return ResponseEntity
                    .internalServerError()
                    .body(ApiResponse.error("Lỗi khi lấy quiz detail", e.getMessage()));
        }

    }

    @GetMapping("/my-quizzes")
    public ResponseEntity<ApiResponse<Page<ListQuizzesResponse>>> getMyQuizzes(
            @RequestParam(defaultValue = "0") @Min(value = 0, message = "Page must be >= 0") int page,
            @AuthenticationPrincipal User user) {
        if (user == null) {
            log.warn("Unauthorized access attempt to /my-quizzes");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Bạn cần đăng nhập để xem quiz của mình"));
        }

        try {
            log.info("Fetching quizzes for user ID: {}, page: {}", user.getId(), page);
            Page<ListQuizzesResponse> quizzesPage = quizService.getQuizzesByCreator(user.getId(), page);

            if (!quizzesPage.hasContent()) {
                log.info("No quizzes found for user ID: {}", user.getId());
                return ResponseEntity.ok(
                        ApiResponse.success(quizzesPage, "Bạn chưa tạo quiz nào"));
            }
            return ResponseEntity.ok(
                    ApiResponse.success(quizzesPage, "Lấy danh sách quiz của bạn thành công"));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid input for /my-quizzes: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Dữ liệu đầu vào không hợp lệ: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching quizzes for user ID: {}", user.getId(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Có lỗi xảy ra khi lấy danh sách quiz của bạn: " + e.getMessage()));
        }
    }

}