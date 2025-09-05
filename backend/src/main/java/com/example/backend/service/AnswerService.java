package com.example.backend.service;

import com.example.backend.dto.helper.CompareAnswer;
import com.example.backend.dto.response.CheckAnswerResponse;
import com.example.backend.repository.AnswerRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AnswerService {
    private final AnswerRepository answerRepository;

    public AnswerService(AnswerRepository answerRepository) {
        this.answerRepository = answerRepository;
    }

    public CheckAnswerResponse compareAnswers(List<CompareAnswer> submittedAnswers, Long questionId) {
        // Lấy đáp án đúng từ DB
        List<CompareAnswer> correctAnswers = answerRepository.findCorrectAnswersByQuestionId(questionId);
        System.out.println(submittedAnswers);
        System.out.println(correctAnswers);
        if (submittedAnswers == null || submittedAnswers.isEmpty()) {
            String correctText = correctAnswers.stream()
                    .map(CompareAnswer::getAnswerText)
                    .collect(Collectors.joining(", "));

            return new CheckAnswerResponse(false, correctText, new ArrayList<>());
        }

        // So sánh theo ID
        Set<Long> submittedSet = submittedAnswers.stream()
                .map(CompareAnswer::getAnswerId)
                .collect(Collectors.toSet());

        Set<Long> correctSet = correctAnswers.stream()
                .map(CompareAnswer::getAnswerId)
                .collect(Collectors.toSet());

        boolean isCorrect = submittedSet.equals(correctSet);

        // Text đáp án đúng
        String correctText = correctAnswers.stream()
                .map(CompareAnswer::getAnswerText)
                .collect(Collectors.joining(", "));

        // Trả về cả text của đáp án mà user đã chọn (FE cần hiển thị)
        return new CheckAnswerResponse(isCorrect, correctText, submittedAnswers);
    }
}
