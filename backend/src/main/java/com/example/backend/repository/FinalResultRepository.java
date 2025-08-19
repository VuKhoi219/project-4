package com.example.backend.repository;

import com.example.backend.dto.response.ResponseQuizHot;
import com.example.backend.entity.FinalResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FinalResultRepository extends JpaRepository<FinalResult, Long> {
    @Query("SELECT new com.example.backend.dto.response.ResponseQuizHot(q.id, q.title, q.description, COUNT(fr.id)) " +
            "FROM FinalResult fr " +
            "JOIN fr.quiz q " +
            "GROUP BY q.id, q.title, q.description " +
            "ORDER BY COUNT(fr.id) DESC")
    List<ResponseQuizHot> findTop10QuizHot();
}