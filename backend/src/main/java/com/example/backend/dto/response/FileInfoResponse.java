package com.example.backend.dto.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileInfoResponse {
    private Long id;
    private String originalFilename;
    private Long fileSize;
    private String fileType;
    private String mimeType;
    private LocalDateTime uploadDate;
    private Boolean isProcessed;
    private Boolean isPublic;
    private Boolean allowReuse;
    private Boolean hasEmbedding;
    private LocalDateTime embeddingUpdatedAt;

    public static FileInfoResponse fromEntity(com.example.backend.entity.UploadedFile file) {
        return new FileInfoResponse(
                file.getId(),
                file.getOriginalFilename(),
                file.getFileSize(),
                file.getFileType(),
                file.getMimeType(),
                file.getUploadDate(),
                file.getIsProcessed(),
                file.getIsPublic(),
                file.getAllowReuse(),
                file.getContentEmbedding() != null && !file.getContentEmbedding().trim().isEmpty(),
                file.getEmbeddingUpdatedAt()
        );
    }
}