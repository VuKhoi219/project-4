package com.example.backend.entity;


import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(
        name = "user_answer",
        indexes = {
                @Index(name = "idx_answers_question", columnList = "question_id"),
                @Index(name = "idx_answers_user", columnList = "user_id"),
                @Index(name = "idx_room", columnList = "room"),
                @Index(name = "idx_room_user", columnList = "room,user_id"),
                @Index(name = "idx_room_question", columnList = "room,question_id")
        }
)
public class UserAnswer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room", nullable = false, length = 100)
    private String room;

    @Column(name = "user_id", nullable = true)
    private Long userId;

    // Quan hệ N-1 với Question
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "score", nullable = true)
    private Integer score;

    // Quan hệ 1-n với chi tiết
    @OneToMany(mappedBy = "userAnswer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserAnswerDetail> details;
}