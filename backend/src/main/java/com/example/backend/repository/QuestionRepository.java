package com.example.backend.repository;

import com.example.backend.dto.helper.QuestionWithAnswersDTO;
import com.example.backend.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    @Query("SELECT DISTINCT q FROM Question q LEFT JOIN FETCH q.answers WHERE q.id IN :questionIds")
    List<Question> findQuestionsWithAnswers(@Param("questionIds") long questionIds);

    @Query("SELECT DISTINCT q FROM Question q LEFT JOIN FETCH q.answers WHERE q.quiz.id = :quizId")
    Page<Question> getQuestionsWithAnswersByQuiz(@Param("quizId") long quizId, Pageable pageable);
}
