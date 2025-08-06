package com.example.backend.service;

import com.example.backend.dto.helper.compareAnswer;
import com.example.backend.dto.response.CheckAnswerResponse;
import com.example.backend.repository.AnswerRepository;
import org.springframework.stereotype.Service;

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

    public CheckAnswerResponse compareAnswers(List<compareAnswer> answers, Long questionId) {
        // Không có đáp án gửi lên
        if (answers == null || answers.isEmpty()) {
            List<compareAnswer> correctAnswers = answerRepository.ListAnswerTextByQuestionId(questionId);
            String correctText = correctAnswers.stream()
                    .map(compareAnswer::getAnswerText)
                    .collect(Collectors.joining(", "));
            return new CheckAnswerResponse(false, correctText, answers);
        }

        List<compareAnswer> correctAnswers = answerRepository.ListAnswerTextByQuestionId(questionId);

        if (correctAnswers == null || correctAnswers.isEmpty()) {
            return new CheckAnswerResponse(false, "", answers);
        }

        // So sánh danh sách đáp án (chuyển về Set cho dễ so sánh)
        Set<String> submittedSet = answers.stream()
                .map(ans -> ans.getAnswerText().trim().toLowerCase())
                .collect(Collectors.toSet());

        Set<String> correctSet = correctAnswers.stream()
                .map(ans -> ans.getAnswerText().trim().toLowerCase())
                .collect(Collectors.toSet());

        boolean isCorrect = submittedSet.equals(correctSet);

        String correctText = correctAnswers.stream()
                .map(compareAnswer::getAnswerText)
                .collect(Collectors.joining(", "));

        return new CheckAnswerResponse(isCorrect, correctText, answers);
    }

}
