package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "final_result",
        indexes = {
                @Index(name = "idx_finalresult_user", columnList = "user_id"),
                @Index(name = "idx_finalresult_quiz", columnList = "quiz_id")
        }
)
public class FinalResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "name_player", nullable = false)
    private String namePlayer;

    @Column(name = "points", nullable = false)
    private int points;
}