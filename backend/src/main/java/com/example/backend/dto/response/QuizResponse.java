package com.example.backend.dto.response;

import com.example.backend.entity.Question;
import com.example.backend.entity.Quiz;
import com.example.backend.entity.SourceType;
import lombok.Data;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class QuizResponse {
    private long id;
    private String title;
    private String description;
    private String summary;
    private SourceType sourceType;
    private boolean showCorrectAnswers;
    private boolean shuffleAnswers;
    private String shareLink;

    // Creator info
    private long creatorId;
    private String creatorName;

    // Category info
    private long categoryId;
    private String categoryName;

    // File info
    private long fileId;
    private String fileName;

    // Questions and answers - THÊM MỚI
    private List<QuestionResponse> questions;
    private int totalQuestions;
    private boolean questionsGenerated;
    private String generationStatus; // "SUCCESS", "FAILED", "PARTIAL"

    public static QuizResponse fromEntity(Quiz quiz) {
        QuizResponse response = new QuizResponse();

        response.setId(quiz.getId());
        response.setTitle(quiz.getTitle());
        response.setDescription(quiz.getDescription());
        response.setSummary(quiz.getSummary());
        response.setSourceType(quiz.getSource_type());
        response.setShowCorrectAnswers(quiz.isShow_correct_answers());
        response.setShuffleAnswers(quiz.isShuffle_answers());
        response.setShareLink(quiz.getShareLink());

        // Creator info
        if (quiz.getCreator() != null) {
            response.setCreatorId(quiz.getCreator().getId());
            response.setCreatorName(quiz.getCreator().getFullName());
        }

        // Category info
        if (quiz.getCategory() != null) {
            response.setCategoryId(quiz.getCategory().getId());
            response.setCategoryName(quiz.getCategory().getName());
        }

        // File info
        if (quiz.getFile() != null) {
            response.setFileId(quiz.getFile().getId());
            response.setFileName(quiz.getFile().getOriginalFilename());
        }

        // Questions info - THÊM MỚI
        List<QuestionResponse> questionResponses = new ArrayList<>();
        if (quiz.getQuestions() != null && !quiz.getQuestions().isEmpty()) {
            questionResponses = quiz.getQuestions().stream()
                    .sorted(Comparator.comparing(Question::getOrderIndex))
                    .map(QuestionResponse::fromEntity)
                    .collect(Collectors.toList());
            response.setQuestionsGenerated(true);
            response.setGenerationStatus("SUCCESS");
        } else {
            response.setQuestionsGenerated(false);
            response.setGenerationStatus("NO_QUESTIONS");
        }

        response.setQuestions(questionResponses);
        response.setTotalQuestions(questionResponses.size());

        return response;
    }

    // Overloaded method với generation status - THÊM MỚI
    public static QuizResponse fromEntity(Quiz quiz, String generationStatus, boolean questionsGenerated) {
        QuizResponse response = fromEntity(quiz);
        response.setGenerationStatus(generationStatus);
        response.setQuestionsGenerated(questionsGenerated);
        return response;
    }

    // Method để tạo response cho quiz không có questions - THÊM MỚI
    public static QuizResponse fromEntityWithoutQuestions(Quiz quiz) {
        QuizResponse response = fromEntity(quiz);
        response.setQuestions(new ArrayList<>());
        response.setTotalQuestions(0);
        response.setQuestionsGenerated(false);
        response.setGenerationStatus("PENDING");
        return response;
    }
}