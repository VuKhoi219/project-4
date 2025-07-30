package com.example.backend.service;

import com.example.backend.dto.helper.compareAnswer;
import com.example.backend.repository.AnswerRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class AnswerService {
    private final AnswerRepository answerRepository;

    public AnswerService(AnswerRepository answerRepository) {
        this.answerRepository = answerRepository;
    }

    public boolean compareAnswers(List<compareAnswer> answers, long questionId) {
        if (answers == null) {
            return false;
        }
        List<compareAnswer> answersList = answerRepository.ListAnswerTextByQuestionId(questionId);
        if (answersList == null) {
            return false;
        }

        Set<compareAnswer> answersListSet = new HashSet<>(answersList);
        Set<compareAnswer> answersSet = new HashSet<>(answers);
        return answersListSet.equals(answersSet);
    }
}
