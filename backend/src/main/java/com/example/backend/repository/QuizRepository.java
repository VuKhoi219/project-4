package com.example.backend.repository;

import com.example.backend.dto.response.ListQuizzesResponse;
import com.example.backend.dto.response.QuizDetailResponse;
import com.example.backend.entity.Category;
import com.example.backend.entity.Quiz;
import com.example.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface
QuizRepository extends JpaRepository<Quiz, Integer> {
    Optional<Quiz> findById(long id); // Sửa từ long thành int để khớp với Quiz.id
    @Query("SELECT DISTINCT q FROM Quiz q LEFT JOIN FETCH q.questions WHERE q.id = :quizId")
    Optional<Quiz> findQuizWithQuestions(@Param("quizId") Long quizId);

    @Query("SELECT new com.example.backend.dto.response.ListQuizzesResponse(q.id, q.title, q.description,q.avatar) FROM Quiz q WHERE q.creator is not null order by q.id desc ")
    Page<ListQuizzesResponse> findQuizzesAll(Pageable pageable);

    @Query("SELECT new com.example.backend.dto.response.QuizDetailResponse(q.title, COUNT(que), q.summary, q.description) " +
            "FROM Quiz q LEFT JOIN q.questions que " +
            "WHERE q.id = :id and q.creator is not null " +
            "GROUP BY q.id, q.title, q.description, q.summary")
    QuizDetailResponse findQuizDetailById(@Param("id") Long id);
    
    @Query("SELECT new com.example.backend.dto.response.ListQuizzesResponse(q.id, q.title, q.description,q.avatar) " +
            "FROM Quiz q WHERE q.creator.id = :creatorId")
    Page<ListQuizzesResponse> findQuizzesByCreatorId(@Param("creatorId") Long creatorId, Pageable pageable);
}