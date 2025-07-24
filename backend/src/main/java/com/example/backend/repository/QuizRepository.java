package com.example.backend.repository;

import com.example.backend.entity.Category;
import com.example.backend.entity.Quiz;
import com.example.backend.entity.User;
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

    Optional<Quiz> findByShareLink(String shareLink); // Sửa từ findByShare_Link thành findByShare_link
    boolean existsByShareLink(String shareLink); // Đúng, giữ nguyên

    Optional<Quiz> findById(long id); // Sửa từ long thành int để khớp với Quiz.id
    @Query("SELECT DISTINCT q FROM Quiz q LEFT JOIN FETCH q.questions WHERE q.id = :quizId")
    Optional<Quiz> findQuizWithQuestions(@Param("quizId") Long quizId);
//    // Tìm quiz theo creator
//    @Query("SELECT q FROM Quiz q WHERE q.creator = :creator")
//    Page<Quiz> findByCreator(@Param("creator") User creator, Pageable pageable);
//
//    // Tìm quiz theo category
//    @Query("SELECT q FROM Quiz q WHERE q.category = :category")
//    Page<Quiz> findByCategory(@Param("category") Category category, Pageable pageable);
//
//    // Tìm quiz theo title (search)
//    @Query("SELECT q FROM Quiz q WHERE LOWER(q.title) LIKE LOWER(CONCAT('%', :title, '%'))")
//    Page<Quiz> findByTitleContainingIgnoreCase(@Param("title") String title, Pageable pageable);
//
//    // Tìm quiz của user theo title
//    @Query("SELECT q FROM Quiz q WHERE q.creator = :creator AND LOWER(q.title) LIKE LOWER(CONCAT('%', :title, '%'))")
//    Page<Quiz> findByCreatorAndTitleContainingIgnoreCase(@Param("creator") User creator, @Param("title") String title, Pageable pageable);
//
//    // Đếm số quiz của user
//    @Query("SELECT COUNT(q) FROM Quiz q WHERE q.creator = :creator")
//    long countByCreator(@Param("creator") User creator);
//
//    // Lấy quiz gần đây
//    @Query("SELECT q FROM Quiz q ORDER BY q.id DESC")
//    List<Quiz> findTopByOrderByIdDesc(Pageable pageable);
//
}