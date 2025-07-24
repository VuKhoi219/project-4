package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@Table(
        name = "answers",
        indexes = {
                @Index(name = "idx_answers_question", columnList = "question_id")
        }
)
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String answerText;

    @Column(nullable = false)
    private boolean isCorrect = false;

    @Column(nullable = false)
    private int orderIndex;

    @CreationTimestamp
    private LocalDateTime createdAt;
}