package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "knowledge_base",
        indexes = {
                @Index(name = "idx_knowledge_base_source", columnList = "source_type,source_id"),
                @Index(name = "idx_knowledge_base_category", columnList = "category_id"),
                @Index(name = "idx_knowledge_base_difficulty", columnList = "difficulty_level"),
                @Index(name = "idx_knowledge_base_created_by", columnList = "created_by"),
                @Index(name = "idx_knowledge_base_is_public", columnList = "is_public")
        }
)
public class KnowledgeBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title cannot be empty")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    @Column(nullable = false, length = 255)
    private String title;

    @NotBlank(message = "Content cannot be empty")
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 20)
    private SourceType sourceType;

    @Column(name = "source_id")
    private Long sourceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    // JSON field cho tags
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private List<String> tags;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = true;

    @Column(name = "allow_copy", nullable = false)
    private Boolean allowCopy = true;

    // Chỉ giữ content embedding
    @Column(name = "content_embedding", columnDefinition = "LONGTEXT")
    private String contentEmbedding;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_level", length = 20)
    private DifficultyLevel difficultyLevel = DifficultyLevel.INTERMEDIATE;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Enums
    public enum SourceType {
        QUIZ("quiz"),
        UPLOAD("upload"),
        MANUAL("manual"),
        EXTERNAL("external");

        private final String value;

        SourceType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }

    public enum DifficultyLevel {
        BEGINNER("beginner"),
        INTERMEDIATE("intermediate"),
        ADVANCED("advanced");

        private final String value;

        DifficultyLevel(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }

    // Constructor để tạo knowledge base mới
    public KnowledgeBase(String title, String content, SourceType sourceType,
                         User createdBy, Category category) {
        this.title = title;
        this.content = content;
        this.sourceType = sourceType;
        this.createdBy = createdBy;
        this.category = category;
        this.isPublic = true;
        this.allowCopy = true;
        this.difficultyLevel = DifficultyLevel.INTERMEDIATE;
        this.isActive = true;
    }

    // Utility methods
    public void updateEmbedding(String contentEmbedding) {
        this.contentEmbedding = contentEmbedding;
    }

    public boolean isReadyForEmbedding() {
        return content != null && !content.trim().isEmpty();
    }

    public boolean hasEmbedding() {
        return contentEmbedding != null;
    }

    // Method để check quyền truy cập
    public boolean isAccessibleBy(User user) {
        return isPublic || createdBy.equals(user);
    }

    public boolean isEditableBy(User user) {
        return createdBy.equals(user);
    }

    public boolean isCopyableBy(User user) {
        return allowCopy && isAccessibleBy(user);
    }
}