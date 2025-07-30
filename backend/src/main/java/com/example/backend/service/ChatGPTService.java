package com.example.backend.service;

import com.example.backend.dto.request.ChatRequest;
import com.example.backend.dto.response.ChatResponse;
import com.example.backend.entity.ChatMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;

@Service
@Slf4j
public class ChatGPTService {

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate;

    public ChatGPTService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }


    public ChatResponse generateQuestions(String content, int numberOfQuestions, String difficulty) {
        try {
            log.debug("Calling AI with content length: {}, questions: {}, difficulty: {}",
                    content.length(), numberOfQuestions, difficulty);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            String prompt = buildPrompt(content, numberOfQuestions, difficulty);

            ChatRequest request = ChatRequest.builder()
                    .model("gpt-4o-mini")
                    .messages(Arrays.asList(
                            new ChatMessage("system", "Bạn là một chuyên gia tạo câu hỏi trắc nghiệm và tự luận. Trả lời theo định dạng JSON chính xác."),
                            new ChatMessage("user", prompt)
                    ))
                    .build();

            HttpEntity<ChatRequest> entity = new HttpEntity<>(request, headers);
            ResponseEntity<ChatResponse> response = restTemplate.exchange(
                    apiUrl, HttpMethod.POST, entity, ChatResponse.class);

            return response.getBody();

        } catch (Exception e) {
            log.error("Lỗi khi gọi Chat API: ", e);
            throw new RuntimeException("Không thể tạo câu hỏi từ AI: " + e.getMessage());
        }
    }
    private String buildPrompt(String content, int numberOfQuestions, String difficulty) {
        return String.format(
                """
                Dựa vào nội dung sau, hãy tạo ra %d câu hỏi với độ khó %s, có thể bao gồm các loại sau đây:
        
                === Các loại câu hỏi hợp lệ (questionType) ===
                1. MULTIPLE_CHOICE:
                   - Chọn duy nhất 1 đáp án đúng từ 4 đáp án.
                   - Trả về 4 đáp án, chỉ 1 đáp án có `"isCorrect": true`.
        
                2. MULTIPLE_SELECT:
                   - Chọn nhiều đáp án đúng từ 4 đáp án.
                   - Phải có ít nhất 2 đáp án đúng (`isCorrect: true`).
        
                3. TRUE_FALSE:
                   - Câu hỏi chỉ có 2 đáp án: "Đúng" và "Sai".
                   - Một trong 2 sẽ là `"isCorrect": true`.
        
                4. SHORT_ANSWER:
                    - Chỉ có 1 đáp án đúng.
                    - Người dùng cần tự điền câu trả lời ngắn (1–2 câu).
                    - Chỉ có 1 đáp án đúng.
                    - Người dùng cần tự điền câu trả lời ngắn (1–2 câu).
                    - Vẫn trả về trường `answers`, với 1 phần tử duy nhất.
        
                === Nội dung dùng để tạo câu hỏi ===
                %s
        
                === Yêu cầu chung cho mỗi câu hỏi ===
                - `questionText`: nội dung câu hỏi
                - `questionType`: đúng như mô tả ở trên
                - `explanation`: giải thích tại sao đúng (cho các loại trắc nghiệm) hoặc mô tả ngắn gợi ý cho câu trả lời tự luận
                - `points`: mặc định là 1
                - `orderIndex`: số thứ tự câu hỏi (1 đến %d)
                - `timeLimit`: thời gian giới hạn (tùy loại câu hỏi, gợi ý: 30–90 giây)
                - `answers`: chỉ dùng cho MULTIPLE_CHOICE, MULTIPLE_SELECT, TRUE_FALSE, SHORT_ANSWER
        
                === Cấu trúc JSON mong muốn ===
                {
                  "questions": [
                    {
                      "questionText": "Ví dụ: Trái đất quay quanh Mặt trời là đúng hay sai?",
                      "questionType": "TRUE_FALSE",
                      "explanation": "Trái đất quay quanh Mặt trời là kiến thức thiên văn cơ bản.",
                      "points": 1000,
                      "orderIndex": 1,
                      "timeLimit": 20,
                      "answers": [
                        {
                          "answerText": "Đúng",
                          "isCorrect": true,
                          "orderIndex": 1
                        },
                        {
                          "answerText": "Sai",
                          "isCorrect": false,
                          "orderIndex": 2
                        }
                      ]
                    },
                    {
                      "questionText": "Ai là tác giả của Truyện Kiều?",
                      "questionType": "SHORT_ANSWER",
                      "explanation": "Giải thích tại sao lại lựa chọn đáp án ",
                      "points": 1000,
                      "orderIndex": 2,
                      "timeLimit": 30,
                      "answers": [
                        {
                          "answerText": "Nguyễn Du",
                          "isCorrect": true,
                          "orderIndex": 1
                        }
                      ]
                    },
                  ]
                }
        
                === Lưu ý quan trọng ===
                - Trả về đúng định dạng JSON, không bọc trong Markdown (` ``` `).
                - Không thêm lời giải thích ngoài JSON.
                - Tránh trùng lặp nội dung câu hỏi hoặc đáp án.
                - Sử dụng tiếng Việt, từ ngữ rõ ràng, chuẩn xác.
                - Đảm bảo JSON hoàn chỉnh với tất cả các dấu ngoặc `{}` và `[]` được đóng đúng.
                """,
                numberOfQuestions, difficulty, content, numberOfQuestions
        );
    }
}
