package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Data
@Table(
        name = "quizzes",
        indexes = {
                @Index(name = "idx_quizzes_creator", columnList = "creator_id"),
                @Index(name = "idx_quizzes_category", columnList = "category_id"),
                @Index(name = "idx_quizzes_share_link", columnList = "share_link"),
        }
)
public class Quiz {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SourceType source_type = SourceType.TEXT;

    @ManyToOne
    @JoinColumn(name = "file_id")
    private UploadedFile  file;

    @Column
    private boolean show_correct_answers = true;

    @Column
    private boolean shuffle_answers = true;

    @Column(name = "share_link", length = 100, unique = true) // Mapping tới database column share_link
    private String shareLink; // Java field name là shareLink

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Question> questions;
}