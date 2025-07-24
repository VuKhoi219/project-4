package com.example.backend.repository;

import com.example.backend.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    @Query("SELECT DISTINCT q FROM Question q LEFT JOIN FETCH q.answers WHERE q.id IN :questionIds")
    List<Question> findQuestionsWithAnswers(@Param("questionIds") long questionIds);
}
