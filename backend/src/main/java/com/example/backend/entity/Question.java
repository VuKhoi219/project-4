package com.example.backend.entity;


import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
@Table(
        name = "questions",
        indexes = {
                @Index(name = "idx_questions_quiz", columnList = "quiz_id"),
                @Index(name = "idx_questions_order", columnList = "quiz_id, order_index")
        }
)
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private QuestionType questionType;

    @Column(nullable = false)
    private int points = 1000;

    @Column(nullable = false)
    private int orderIndex;

    @Column(name = "time_limit")
    private int timeLimit; // seconds, override quiz setting

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Answer> answers;
}
