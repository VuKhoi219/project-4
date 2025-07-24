package com.example.backend.dto.response;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FileUploadResponse {
    private Long id;
    private String originalFilename;
    private String storedFilename;
    private Long fileSize;
    private String fileType;
    private String mimeType;
    private LocalDateTime uploadDate;
    private Boolean isProcessed;
    private Boolean isPublic;
    private Boolean allowReuse;
    private String processingStatus;
    private String message;

    public static FileUploadResponse fromEntity(com.example.backend.entity.UploadedFile file, String processingStatus) {
        return new FileUploadResponse(
                file.getId(),
                file.getOriginalFilename(),
                file.getStoredFilename(),
                file.getFileSize(),
                file.getFileType(),
                file.getMimeType(),
                file.getUploadDate(),
                file.getIsProcessed(),
                file.getIsPublic(),
                file.getAllowReuse(),
                processingStatus,
                "File uploaded successfully and processing started"
        );
    }
}
