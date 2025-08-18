package com.example.backend.service;

import com.example.backend.dto.request.FinalResultRequest;
import com.example.backend.dto.response.FinalResultResponse;
import com.example.backend.entity.FinalResult;
import com.example.backend.entity.Quiz;
import com.example.backend.entity.User;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.FinalResultRepository;
import com.example.backend.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinalResultService {

    private final FinalResultRepository finalResultRepository;
    private final QuizRepository quizRepository;

    @Transactional
    public FinalResultResponse saveFinalResult(FinalResultRequest request, User currentUser) {
        // Validate that a player name is provided
        if (!StringUtils.hasText(request.getNamePlayer())) {
            throw new IllegalArgumentException("Player name must be provided.");
        }

        Quiz quiz = quizRepository.findById(request.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + request.getQuizId()));

        FinalResult finalResult = new FinalResult();
        finalResult.setQuiz(quiz);
        finalResult.setPoints(request.getPoints());
        finalResult.setNamePlayer(request.getNamePlayer()); // Always use the name from the request

        // Set the user if they are logged in
        if (currentUser != null) {
            finalResult.setUser(currentUser);
        }

        FinalResult savedResult = finalResultRepository.save(finalResult);
        return mapToResponse(savedResult);
    }

//    @Transactional(readOnly = true)
//    public List<FinalResultResponse> getFinalResultsByUser(User currentUser) {
//        List<FinalResult> finalResults = finalResultRepository.findAllByUserId(currentUser.getId());
//        return finalResults.stream()
//                .map(this::mapToResponse)
//                .collect(Collectors.toList());
//    }

    private FinalResultResponse mapToResponse(FinalResult finalResult) {
        FinalResultResponse response = new FinalResultResponse();
        response.setId(finalResult.getId());
        if (finalResult.getUser() != null) {
            response.setUserId(finalResult.getUser().getId());
        }
        response.setPoints(finalResult.getPoints());
        response.setNamePlayer(finalResult.getNamePlayer());
        response.setQuizId(finalResult.getQuiz().getId());
        return response;
    }
}