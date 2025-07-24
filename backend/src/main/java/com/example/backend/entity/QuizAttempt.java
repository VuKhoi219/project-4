package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;


import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Table(
        name = "quiz_attempts",
        indexes = {
                @Index(name = "idx_quiz_attempts_quiz", columnList = "quiz_id"),
                @Index(name = "idx_quiz_attempts_user", columnList = "user_id")
        }
)
public class QuizAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 100)
    private String participantName;

    @Column(length = 100)
    private String participantEmail;

    @Column
    private LocalDateTime startTime;

    @Column
    private LocalDateTime endTime;

    @Column(precision = 5, scale = 2)
    private BigDecimal totalScore = BigDecimal.valueOf(0.0);

    @Column(precision = 5, scale = 2)
    private BigDecimal maxScore = BigDecimal.valueOf(0.0);

    @Column(precision = 5, scale = 2)
    private BigDecimal percentageScore = BigDecimal.valueOf(0.0);

    @Column
    private int timeTaken;

    @Column
    private boolean isCompleted = false;

    @Column(length = 45)
    private String ipAddress;

    @Column(columnDefinition = "TEXT")
    private String userAgent;

    @CreationTimestamp
    private LocalDateTime createdAt;
}