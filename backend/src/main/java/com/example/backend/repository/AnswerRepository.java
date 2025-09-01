package com.example.backend.repository;

import com.example.backend.dto.helper.compareAnswer;
import com.example.backend.entity.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
    @Query("SELECT new com.example.backend.dto.helper.compareAnswer(a.answerText) FROM Answer a where a.question.id = :questionId AND a.isCorrect = true ")
    List<compareAnswer> ListAnswerTextByQuestionId(long questionId);
}


