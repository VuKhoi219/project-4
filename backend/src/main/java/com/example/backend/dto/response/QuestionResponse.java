package com.example.backend.dto.response;

import com.example.backend.entity.Answer;
import com.example.backend.entity.Question;
import com.example.backend.entity.QuestionType;
import lombok.Data;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Data
public class QuestionResponse {
    private long id;
    private String questionText;
    private QuestionType questionType;
    private int points;
    private String explanation;
    private int orderIndex;
    private boolean isRequired;
    private Integer timeLimit;
    private List<AnswerResponse> answers;

    public static QuestionResponse fromEntity(Question question) {
        QuestionResponse response = new QuestionResponse();

        response.setId(question.getId());
        response.setQuestionText(question.getQuestionText());
        response.setQuestionType(QuestionType.valueOf(question.getQuestionType().name()));
        response.setPoints(question.getPoints());
        response.setOrderIndex(question.getOrderIndex());
        response.setTimeLimit(question.getTimeLimit());

        // Convert answers
        List<AnswerResponse> answerResponses = new ArrayList<>();
        if (question.getAnswers() != null && !question.getAnswers().isEmpty()) {
            answerResponses = question.getAnswers().stream()
                    .sorted(Comparator.comparing(Answer::getOrderIndex))
                    .map(AnswerResponse::fromEntity)
                    .collect(Collectors.toList());
        }
        response.setAnswers(answerResponses);

        return response;
    }
}