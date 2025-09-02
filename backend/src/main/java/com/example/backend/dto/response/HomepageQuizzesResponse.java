// File: src/main/java/com/example/backend/dto/response/HomepageQuizzesResponse.java
package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HomepageQuizzesResponse {
    private List<ListQuizzesResponse> myQuizzes; // Quizzes của người dùng hiện tại, chỉ có nếu đăng nhập
    private List<ResponseQuizHot> hotQuizzes;    // Top 10 quiz hot
    private Page<ListQuizzesResponse> allQuizzes;  // Tất cả các quiz có phân trang
    private boolean isAuthenticated; // Cờ để frontend biết người dùng đã đăng nhập hay chưa
}