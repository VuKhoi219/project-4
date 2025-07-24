package com.example.backend.service;

import com.example.backend.entity.UploadedFile;
import com.example.backend.entity.User;
import com.example.backend.repository.UploadedFileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FileUploadService {

    private final UploadedFileRepository fileRepository;
    private final FileProcessingService fileProcessingService;
    private final EmbeddingService embeddingService;

    @Value("${file.upload.directory:uploads}")
    private String uploadDirectory;

    @Value("${file.upload.max-size:10485760}") // 10MB default
    private long maxFileSize;

    private final List<String> allowedFileTypes = List.of(
            "application/pdf",
            "text/plain",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword",
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    /**
     * Upload file và xử lý tự động
     */
    public UploadedFile uploadFile(MultipartFile file, User user, boolean isPublic, boolean allowReuse) {
        try {
            // Validate file
            validateFile(file);

            // Tạo thư mục upload nếu chưa có
            createUploadDirectoryIfNotExists();

            // Generate unique filename
            String storedFilename = generateUniqueFilename(file.getOriginalFilename());
            String filePath = saveFileToStorage(file, storedFilename);

            // Tạo entity UploadedFile
            UploadedFile uploadedFile = new UploadedFile(
                    user,
                    file.getOriginalFilename(),
                    storedFilename,
                    filePath,
                    file.getSize(),
                    getFileExtension(file.getOriginalFilename()),
                    file.getContentType()
            );

            uploadedFile.setIsPublic(isPublic);
            uploadedFile.setAllowReuse(allowReuse);

            // Save to database
            uploadedFile = fileRepository.save(uploadedFile);

            // Process file asynchronously
            processFileAsync(uploadedFile);

            log.info("File uploaded successfully: {} by user {}", file.getOriginalFilename(), user.getId());
            return uploadedFile;

        } catch (Exception e) {
            log.error("Error uploading file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Validate file trước khi upload
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size");
        }

        if (!allowedFileTypes.contains(file.getContentType())) {
            throw new IllegalArgumentException("File type not allowed: " + file.getContentType());
        }
    }

    /**
     * Tạo thư mục upload
     */
    private void createUploadDirectoryIfNotExists() {
        try {
            Path uploadPath = Paths.get(uploadDirectory);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Created upload directory: {}", uploadDirectory);
            }
        } catch (IOException e) {
            log.error("Failed to create upload directory", e);
            throw new RuntimeException("Could not create upload directory");
        }
    }

    /**
     * Generate unique filename
     */
    private String generateUniqueFilename(String originalFilename) {
        String extension = getFileExtension(originalFilename);
        String uuid = UUID.randomUUID().toString();
        return uuid + (extension.isEmpty() ? "" : "." + extension);
    }

    /**
     * Lấy file extension
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    /**
     * Lưu file vào storage
     */
    private String saveFileToStorage(MultipartFile file, String storedFilename) throws IOException {
        Path uploadPath = Paths.get(uploadDirectory);
        Path filePath = uploadPath.resolve(storedFilename);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return filePath.toString();
    }

    /**
     * Xử lý file bất đồng bộ
     */
    private void processFileAsync(UploadedFile uploadedFile) {
        // Sử dụng @Async hoặc ExecutorService để xử lý bất đồng bộ
        new Thread(() -> {
            try {
                // Extract content từ file
                String content = fileProcessingService.extractContent(uploadedFile);

                // Update processed content
                uploadedFile.setProcessedContent(content);
                uploadedFile.setIsProcessed(true);
                fileRepository.save(uploadedFile);

                // Generate embedding
                String embedding = embeddingService.generateEmbedding(content);
                uploadedFile.updateEmbedding(embedding, "default-model");
                fileRepository.save(uploadedFile);

                log.info("File processed and embedded successfully: {}", uploadedFile.getOriginalFilename());

            } catch (Exception e) {
                log.error("Error processing file: {}", uploadedFile.getOriginalFilename(), e);
                // Có thể mark file là failed processing
            }
        }).start();
    }

    /**
     * Lấy danh sách files của user
     */
    @Transactional(readOnly = true)
    public List<UploadedFile> getUserFiles(User user) {
        return fileRepository.findByUser(user);
    }

    /**
     * Lấy file theo ID (chỉ nếu user có quyền)
     */
    @Transactional(readOnly = true)
    public Optional<UploadedFile> getFileById(Long fileId, User user) {
        return fileRepository.findById(fileId)
                .filter(file -> file.getUser().equals(user) || file.getIsPublic());
    }

    /**
     * Xóa file
     */
    public void deleteFile(Long fileId, User user) {
        Optional<UploadedFile> fileOpt = fileRepository.findById(fileId);

        if (fileOpt.isEmpty()) {
            throw new IllegalArgumentException("File not found");
        }

        UploadedFile file = fileOpt.get();

        if (!file.getUser().equals(user)) {
            throw new SecurityException("You don't have permission to delete this file");
        }

        try {
            // Xóa file vật lý
            Files.deleteIfExists(Paths.get(file.getFilePath()));

            // Xóa record trong database
            fileRepository.delete(file);

            log.info("File deleted successfully: {}", file.getOriginalFilename());

        } catch (IOException e) {
            log.error("Error deleting physical file: {}", file.getFilePath(), e);
            // Vẫn xóa record trong database
            fileRepository.delete(file);
        }
    }

    /**
     * Lấy tổng dung lượng files của user
     */
    @Transactional(readOnly = true)
    public Long getUserTotalFileSize(User user) {
        return fileRepository.getTotalFileSizeByUser(user);
    }

    /**
     * Lấy số lượng files của user
     */
    @Transactional(readOnly = true)
    public long getUserFileCount(User user) {
        return fileRepository.countByUser(user);
    }
}