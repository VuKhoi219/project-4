package com.example.backend.service;

import com.example.backend.entity.UploadedFile;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.hwpf.HWPFDocument;
import org.apache.poi.hwpf.extractor.WordExtractor;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

@Service
@Slf4j
public class FileProcessingService {

    /**
     * Extract content từ file dựa trên MIME type
     */
    public String extractContent(UploadedFile file) {
        try {
            log.info("Extracting content from file: {} ({})", file.getOriginalFilename(), file.getMimeType());

            String content = switch (file.getMimeType()) {
                case "text/plain" -> extractTextContent(file.getFilePath());
                case "application/pdf" -> extractPdfContent(file.getFilePath());
                case "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ->
                        extractDocxContent(file.getFilePath());
                case "application/msword" -> extractDocContent(file.getFilePath());
                case "text/csv" -> extractCsvContent(file.getFilePath());
                case "application/vnd.ms-excel",
                     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ->
                        extractExcelContent(file.getFilePath());
                default -> {
                    log.warn("Unsupported file type: {}", file.getMimeType());
                    yield "Unsupported file type for content extraction: " + file.getMimeType();
                }
            };

            // Clean và validate content
            content = cleanExtractedContent(content);

            log.info("Successfully extracted {} characters from file: {}",
                    content.length(), file.getOriginalFilename());

            return content;

        } catch (Exception e) {
            log.error("Error extracting content from file: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("Failed to extract content from file: " + e.getMessage());
        }
    }

    /**
     * Extract content từ text file
     */
    private String extractTextContent(String filePath) throws IOException {
        return Files.readString(Paths.get(filePath));
    }

    /**
     * Extract content từ PDF file
     */
    private String extractPdfContent(String filePath) throws IOException {
        try (PDDocument document = PDDocument.load(new FileInputStream(filePath))) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    /**
     * Extract content từ DOCX file
     */
    private String extractDocxContent(String filePath) throws IOException {
        try (FileInputStream fis = new FileInputStream(filePath);
             XWPFDocument document = new XWPFDocument(fis);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {

            return extractor.getText();
        }
    }

    /**
     * Extract content từ DOC file (old format)
     */
    private String extractDocContent(String filePath) throws IOException {
        try (FileInputStream fis = new FileInputStream(filePath);
             HWPFDocument document = new HWPFDocument(fis);
             WordExtractor extractor = new WordExtractor(document)) {

            return extractor.getText();
        }
    }

    /**
     * Extract content từ CSV file
     */
    private String extractCsvContent(String filePath) throws IOException {
        // Đọc CSV và convert thành text readable
        StringBuilder content = new StringBuilder();
        Files.lines(Paths.get(filePath))
                .forEach(line -> {
                    // Convert CSV row to readable text
                    String[] columns = line.split(",");
                    for (int i = 0; i < columns.length; i++) {
                        content.append(columns[i].trim().replaceAll("\"", ""));
                        if (i < columns.length - 1) {
                            content.append(" | ");
                        }
                    }
                    content.append("\n");
                });

        return content.toString();
    }

    /**
     * Extract content từ Excel file
     */
    private String extractExcelContent(String filePath) throws IOException {
        // Simplified Excel extraction - có thể dùng Apache POI để extract chi tiết hơn
        try {
            // Sử dụng Apache POI để đọc Excel
            // Tạm thời return placeholder, cần implement chi tiết
            return "Excel content extraction - implement with Apache POI";
        } catch (Exception e) {
            log.warn("Could not extract Excel content, treating as binary file", e);
            return "Binary Excel file - content extraction not available";
        }
    }

    /**
     * Clean extracted content
     */
    private String cleanExtractedContent(String content) {
        if (content == null) {
            return "";
        }

        // Remove excessive whitespace
        content = content.replaceAll("\\s+", " ");

        // Remove control characters
        content = content.replaceAll("[\\p{Cntrl}&&[^\r\n\t]]", "");

        // Trim
        content = content.trim();

        // Limit content length if too long (để tránh embedding quá lớn)
        int maxLength = 50000; // Adjust based on your embedding model's limits
        if (content.length() > maxLength) {
            log.warn("Content too long ({}), truncating to {} characters", content.length(), maxLength);
            content = content.substring(0, maxLength) + "... [truncated]";
        }

        return content;
    }

    /**
     * Check if file có thể extract content được không
     */
    public boolean canExtractContent(String mimeType) {
        return switch (mimeType) {
            case "text/plain",
                 "application/pdf",
                 "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                 "application/msword",
                 "text/csv",
                 "application/vnd.ms-excel",
                 "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" -> true;
            default -> false;
        };
    }

    /**
     * Get file processing status
     */
    public String getProcessingStatus(UploadedFile file) {
        if (!canExtractContent(file.getMimeType())) {
            return "UNSUPPORTED_TYPE";
        }

        if (!file.getIsProcessed()) {
            return "PENDING";
        }

        if (file.getProcessedContent() == null || file.getProcessedContent().trim().isEmpty()) {
            return "FAILED";
        }

        return "COMPLETED";
    }
}
