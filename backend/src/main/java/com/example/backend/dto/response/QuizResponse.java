package com.example.backend.dto.response;

import com.example.backend.entity.Quiz;
import com.example.backend.entity.SourceType;
import lombok.Data;

@Data
public class QuizResponse {
    private long id;
    private String title;
    private String description;
    private String summary;
    private SourceType sourceType;
    // Creator info
    private long creatorId;
    private String creatorName;

    // Category info
    private long categoryId;
    private String categoryName;

    // File info
    private long fileId;
    private String fileName;

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
        response.setTotalQuestions(0);
        response.setQuestionsGenerated(false);
        response.setGenerationStatus("PENDING");
        return response;
    }
}