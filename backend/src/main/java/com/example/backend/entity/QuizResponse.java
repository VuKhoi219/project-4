package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.security.Timestamp;

@Entity
@Data
@Table(name = "quiz_responses") // nên dùng số nhiều và giống tên bảng đã mô tả
public class QuizResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FK: attempt_id
    @ManyToOne
    @JoinColumn(name = "attempt_id", nullable = false)
    private QuizAttempt quizAttempt;

    // FK: question_id – thiếu trong entity bạn gửi
    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    // FK: answer_id
    @ManyToOne
    @JoinColumn(name = "answer_id") // có thể null cho tự luận
    private Answer answer;

    // Text answer (tự luận)
    @Column(columnDefinition = "TEXT")
    private String response_text;

    @Column(nullable = false)
    private boolean is_correct = false;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal points_earned = BigDecimal.valueOf(0.0);;

    @Column
    private int time_taken = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp created_at;
}