package com.example.backend.controller;


import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.FileInfoResponse;
import com.example.backend.dto.response.FileUploadResponse;
import com.example.backend.entity.UploadedFile;
import com.example.backend.entity.User;
import com.example.backend.service.FileProcessingService;
import com.example.backend.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.constraints.NotNull;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {


    private final FileUploadService fileUploadService;
    private final FileProcessingService fileProcessingService;

    /**
     * POST /api/files/upload - Tải file lên và AI xử lý ngay
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadFile(
            @RequestParam("file") @NotNull MultipartFile file,
            @RequestParam(value = "isPublic", defaultValue = "false") Boolean isPublic,
            @RequestParam(value = "allowReuse", defaultValue = "true") Boolean allowReuse,
            @AuthenticationPrincipal User user) {

        try {
            log.info("File upload request: {} by user {}", file.getOriginalFilename(), user != null ? user.getId() : "anonymous");

            UploadedFile uploadedFile = fileUploadService.uploadFile(file, user, isPublic, allowReuse);
            String processingStatus = fileProcessingService.getProcessingStatus(uploadedFile);

            FileUploadResponse response = FileUploadResponse.fromEntity(uploadedFile, processingStatus);

            return ResponseEntity.ok(ApiResponse.success(response, "File uploaded successfully"));

        } catch (IllegalArgumentException e) {
            log.warn("Invalid file upload request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid request: " + e.getMessage()));

        } catch (Exception e) {
            log.error("Error uploading file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload file: " + e.getMessage()));
        }
    }

    /**
     * GET /api/files/stats - Lấy thống kê files của user
     */

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<FileStatsResponse>> getUserFileStats(
            @AuthenticationPrincipal User user) {

        try {
            long fileCount = fileUploadService.getUserFileCount(user);
            Long totalSize = fileUploadService.getUserTotalFileSize(user);

            FileStatsResponse stats = new FileStatsResponse(fileCount, totalSize);

            return ResponseEntity.ok(ApiResponse.success(stats));

        } catch (Exception e) {
            log.error("Error getting file stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get file stats"));
        }
    }

    /**
     * GET /api/files - Lấy danh sách files của user
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<FileInfoResponse>>> getUserFiles(
            @AuthenticationPrincipal User user) {

        try {
            List<UploadedFile> files = fileUploadService.getUserFiles(user);

            List<FileInfoResponse> response = files.stream()
                    .map(FileInfoResponse::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            log.error("Error getting user files", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get files"));
        }
    }

    /**
     * GET /api/files/{id} - Lấy thông tin chi tiết file (CHỈ ACCEPT SỐ)
     */
    @GetMapping("/{id:\\d+}")  // CHỈ ACCEPT ID LÀ SỐ
    public ResponseEntity<ApiResponse<FileInfoResponse>> getFileById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        try {
            Optional<UploadedFile> fileOpt = fileUploadService.getFileById(id, user);

            if (fileOpt.isEmpty()) {
                return ResponseEntity.notFound()
                        .build();
            }

            FileInfoResponse response = FileInfoResponse.fromEntity(fileOpt.get());
            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            log.error("Error getting file by id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get file"));
        }
    }

    /**
     * DELETE /api/files/{id} - Xóa file (CHỈ ACCEPT SỐ)
     */
    @DeleteMapping("/{id:\\d+}")  // CHỈ ACCEPT ID LÀ SỐ
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        try {
            fileUploadService.deleteFile(id, user);
            return ResponseEntity.ok(ApiResponse.success(null, "File deleted successfully"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound()
                    .build();

        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied"));

        } catch (Exception e) {
            log.error("Error deleting file: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete file"));
        }
    }

    // DTO cho file stats
    public static class FileStatsResponse {
        private long totalFiles;
        private Long totalSize;

        public FileStatsResponse(long totalFiles, Long totalSize) {
            this.totalFiles = totalFiles;
            this.totalSize = totalSize;
        }

        // Getters
        public long getTotalFiles() { return totalFiles; }
        public Long getTotalSize() { return totalSize; }
    }
}