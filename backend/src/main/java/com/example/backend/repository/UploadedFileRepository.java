package com.example.backend.repository;

import com.example.backend.entity.UploadedFile;
import com.example.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UploadedFileRepository extends JpaRepository<UploadedFile, Long> {
    Optional<UploadedFile> findById(Long id);
    // Tìm files theo user
    List<UploadedFile> findByUser(User user);

    // Tìm files theo user với phân trang
    Page<UploadedFile> findByUser(User user, Pageable pageable);

    // Tìm files public
    Page<UploadedFile> findByIsPublicTrue(Pageable pageable);

    // Tìm files theo user và trạng thái processed
    List<UploadedFile> findByUserAndIsProcessed(User user, Boolean isProcessed);

    // Tìm file theo stored filename (để tránh trùng lặp)
    Optional<UploadedFile> findByStoredFilename(String storedFilename);

    // Tìm files chưa có embedding
    @Query("SELECT f FROM UploadedFile f WHERE f.isProcessed = true AND f.contentEmbedding IS NULL")
    List<UploadedFile> findFilesNeedingEmbedding();

    // Tìm files theo file type
    List<UploadedFile> findByFileTypeIn(List<String> fileTypes);

    // Tìm files theo khoảng thời gian upload
    List<UploadedFile> findByUploadDateBetween(LocalDateTime start, LocalDateTime end);

    // Tìm files theo user và file type
    List<UploadedFile> findByUserAndFileType(User user, String fileType);

    // Đếm số files của user
    long countByUser(User user);

    // Tính tổng dung lượng files của user
    @Query("SELECT COALESCE(SUM(f.fileSize), 0) FROM UploadedFile f WHERE f.user = :user")
    Long getTotalFileSizeByUser(@Param("user") User user);

    // Tìm files có thể reuse
    @Query("SELECT f FROM UploadedFile f WHERE f.isPublic = true AND f.allowReuse = true AND f.isProcessed = true")
    List<UploadedFile> findReusableFiles();

    // Tìm files cần cập nhật embedding (đã lâu không update)
    @Query("SELECT f FROM UploadedFile f WHERE f.embeddingUpdatedAt < :threshold AND f.isProcessed = true")
    List<UploadedFile> findFilesNeedingEmbeddingUpdate(@Param("threshold") LocalDateTime threshold);
}
