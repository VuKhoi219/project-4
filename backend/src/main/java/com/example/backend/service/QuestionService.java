
package com.example.backend.service;

import com.example.backend.dto.request.QuestionRequest;
import com.example.backend.dto.response.QuestionResponse;
import com.example.backend.entity.Question;
import com.example.backend.entity.Quiz;
import com.example.backend.repository.QuestionRepository;
import com.example.backend.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;

@Service
public class QuestionService {
    public Page<QuestionResponse> getQuestionsByQuizIdPaged(Long quizId, int page, int size) {
        return questionRepository.getQuestionsWithAnswersByQuiz(quizId, org.springframework.data.domain.PageRequest.of(page, size))
                .map(QuestionResponse::fromEntity);
    }

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private QuizRepository quizRepository;

    public List<QuestionResponse> getQuestionsByQuizId(Long quizId) {
        // Lấy tất cả câu hỏi của quiz, không phân trang
        return questionRepository.getQuestionsWithAnswersByQuiz(quizId, PageRequest.of(0, 100)).getContent()
                .stream().map(QuestionResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public QuestionResponse addQuestion(Long quizId, QuestionRequest request) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow();
        Question question = new Question();
        question.setQuiz(quiz);
        question.setQuestionText(request.getQuestionText());
        question.setQuestionType(com.example.backend.entity.QuestionType.valueOf(request.getQuestionType()));
        question.setPoints(request.getPoints());
        question.setTimeLimit(request.getTimeLimit());
        // orderIndex: cuối cùng
        int maxOrder = quiz.getQuestions() != null && !quiz.getQuestions().isEmpty() ?
                quiz.getQuestions().stream().mapToInt(Question::getOrderIndex).max().orElse(0) : 0;
        question.setOrderIndex(maxOrder + 1);
        questionRepository.save(question);
        return QuestionResponse.fromEntity(question);
    }

    @Transactional
    public QuestionResponse updateQuestion(Long id, QuestionRequest request) {
        Question question = questionRepository.findById(id).orElseThrow();
        question.setQuestionText(request.getQuestionText());
        question.setQuestionType(com.example.backend.entity.QuestionType.valueOf(request.getQuestionType()));
        question.setPoints(request.getPoints());
        question.setTimeLimit(request.getTimeLimit());
        questionRepository.save(question);
        return QuestionResponse.fromEntity(question);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }

    @Transactional
    public void reorderQuestions(List<Long> questionIds) {
        for (int i = 0; i < questionIds.size(); i++) {
            Question q = questionRepository.findById(questionIds.get(i)).orElseThrow();
            q.setOrderIndex(i + 1);
            questionRepository.save(q);
        }
    }
}
