package com.example.backend.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "uploaded_files",
        indexes = {
                @Index(name = "idx_uploaded_files_user", columnList = "user_id"),
                @Index(name = "idx_uploaded_files_is_public", columnList = "is_public"),
                @Index(name = "idx_uploaded_files_embedding_updated", columnList = "embedding_updated_at")
        }
)
public class UploadedFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank(message = "Original filename cannot be empty")
    @Size(max = 255, message = "Original filename cannot exceed 255 characters")
    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    @NotBlank(message = "Stored filename cannot be empty")
    @Size(max = 255, message = "Stored filename cannot exceed 255 characters")
    @Column(name = "stored_filename", nullable = false, length = 255)
    private String storedFilename;

    @NotBlank(message = "File path cannot be empty")
    @Size(max = 500, message = "File path cannot exceed 500 characters")
    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Min(value = 0, message = "File size must be positive")
    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @NotBlank(message = "File type cannot be empty")
    @Size(max = 50, message = "File type cannot exceed 50 characters")
    @Column(name = "file_type", nullable = false, length = 50)
    private String fileType;

    @NotBlank(message = "MIME type cannot be empty")
    @Size(max = 100, message = "MIME type cannot exceed 100 characters")
    @Column(name = "mime_type", nullable = false, length = 100)
    private String mimeType;

    @Column(name = "upload_date", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime uploadDate;

    @Column(name = "is_processed", nullable = false)
    private Boolean isProcessed = false;

    @Column(name = "processed_content", columnDefinition = "LONGTEXT")
    private String processedContent;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = false;

    @Column(name = "allow_reuse", nullable = false)
    private Boolean allowReuse = true;

    @Column(name = "content_embedding", columnDefinition = "LONGTEXT")
    private String contentEmbedding;


    @Column(name = "embedding_updated_at")
    private LocalDateTime embeddingUpdatedAt;

    // Constructor để tạo uploaded file mới
    public UploadedFile(User user, String originalFilename, String storedFilename,
                        String filePath, Long fileSize, String fileType, String mimeType) {
        this.user = user;
        this.originalFilename = originalFilename;
        this.storedFilename = storedFilename;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.fileType = fileType;
        this.mimeType = mimeType;
        this.isProcessed = false;
        this.isPublic = false;
        this.allowReuse = true;
    }

    // Phương thức tiện ích để check xem file đã được xử lý chưa
    public boolean isReadyForEmbedding() {
        return isProcessed && processedContent != null && !processedContent.trim().isEmpty();
    }

    // Phương thức để cập nhật embedding
    public void updateEmbedding(String embedding, String model) {
        this.contentEmbedding = embedding;
        this.embeddingUpdatedAt = LocalDateTime.now();
    }
}