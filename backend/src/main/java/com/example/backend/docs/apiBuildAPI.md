# Quiz AI - API Documentation

## 1. Authentication & User Management APIs

### 1.1 User Authentication
- **POST** `/api/auth/register` - Đăng ký tài khoản
- **POST** `/api/auth/login` - Đăng nhập
- **POST** `/api/auth/logout` - Đăng xuất
- **POST** `/api/auth/refresh` - Refresh token

### 1.2 User Profile
- **GET** `/api/users/profile` - Lấy thông tin profile
- **PUT** `/api/users/profile` - Cập nhật profile (full_name, avatar_url)
- **POST** `/api/users/upload-avatar` - Upload avatar
- **DELETE** `/api/users/account` - Xóa tài khoản (set is_active = FALSE)

## 2. File Management APIs

### 2.1 File Upload & Processing
- **POST** `/api/files/upload` - Upload file với metadata
    - Body: `original_filename`, `file_type`, `mime_type`, `file_size`
    - Response: `file_id`, `stored_filename`, `file_path`
- **GET** `/api/files` - Lấy danh sách files (filter: is_public, is_processed)
- **GET** `/api/files/{id}` - Lấy thông tin chi tiết file
- **DELETE** `/api/files/{id}` - Xóa file
- **POST** `/api/files/{id}/process` - Xử lý file bằng AI (tạo processed_content)
- **GET** `/api/files/{id}/content` - Lấy processed_content
- **PUT** `/api/files/{id}/sharing` - Cập nhật is_public, allow_reuse

### 2.2 AI Content Processing
- **POST** `/api/ai/summarize` - Tóm tắt nội dung
- **POST** `/api/ai/generate-questions` - Sinh câu hỏi từ nội dung
- **POST** `/api/ai/analyze-content` - Phân tích nội dung
- **POST** `/api/ai/generate-embeddings` - Tạo embeddings cho content
- **GET** `/api/ai/processing-logs` - Lấy logs từ bảng ai_processing_logs

## 3. Categories Management APIs

### 3.1 Categories
- **GET** `/api/categories` - Lấy danh sách categories
- **POST** `/api/categories` - Tạo category mới (name, description)
- **PUT** `/api/categories/{id}` - Cập nhật category
- **DELETE** `/api/categories/{id}` - Xóa category

## 4. Knowledge Base APIs

### 4.1 Knowledge Base CRUD
- **GET** `/api/knowledge-base` - Lấy danh sách knowledge base
    - Filter: `is_public`, `category_id`, `difficulty_level`, `source_type`
- **POST** `/api/knowledge-base` - Tạo knowledge base mới
    - Body: `title`, `content`, `source_type`, `category_id`, `tags`, `difficulty_level`
- **GET** `/api/knowledge-base/{id}` - Lấy chi tiết knowledge base
- **PUT** `/api/knowledge-base/{id}` - Cập nhật knowledge base
- **DELETE** `/api/knowledge-base/{id}` - Xóa knowledge base (set is_active = FALSE)
- **PUT** `/api/knowledge-base/{id}/sharing` - Cập nhật is_public, allow_copy, allow_edit

### 4.2 Knowledge Base Usage
- **POST** `/api/knowledge-base/{id}/use` - Tăng usage_count khi sử dụng
- **PUT** `/api/knowledge-base/{id}/quality-score` - Cập nhật quality_score

## 5. Quiz Management APIs

### 5.1 Quiz CRUD
- **POST** `/api/quizzes` - Tạo quiz mới
    - Body: `title`, `description`, `category_id`, `source_type`, `source_content`, `knowledge_base_ids`
- **GET** `/api/quizzes` - Lấy danh sách quizzes
    - Filter: `is_public`, `category_id`, `creator_id`, `source_type`
- **GET** `/api/quizzes/{id}` - Lấy thông tin chi tiết quiz
- **PUT** `/api/quizzes/{id}` - Cập nhật quiz
- **DELETE** `/api/quizzes/{id}` - Xóa quiz (set is_active = FALSE)
- **POST** `/api/quizzes/{id}/duplicate` - Sao chép quiz (nếu allow_copy = TRUE)

### 5.2 Quiz Settings
- **PUT** `/api/quizzes/{id}/settings` - Cập nhật các settings:
    - `time_limit`, `attempts_allowed`, `show_correct_answers`, `show_results_immediately`
    - `shuffle_questions`, `shuffle_answers`, `is_public`, `allow_copy`, `allow_edit`
- **POST** `/api/quizzes/{id}/generate-share-link` - Tạo share_link unique
- **PUT** `/api/quizzes/{id}/password` - Đặt/thay đổi password bảo vệ quiz
- **POST** `/api/quizzes/{id}/publish` - Xuất bản quiz (set is_public = TRUE)
- **POST** `/api/quizzes/{id}/unpublish` - Hủy xuất bản quiz (set is_public = FALSE)

### 5.3 Quiz Creation from Sources
- **POST** `/api/quizzes/from-file` - Tạo quiz từ uploaded_files
- **POST** `/api/quizzes/from-text` - Tạo quiz từ text (source_type = 'text')
- **POST** `/api/quizzes/from-knowledge` - Tạo quiz từ knowledge_base

## 6. Questions & Answers Management APIs

### 6.1 Questions
- **GET** `/api/quizzes/{quizId}/questions` - Lấy danh sách câu hỏi (order by order_index)
- **POST** `/api/quizzes/{quizId}/questions` - Thêm câu hỏi mới
    - Body: `question_text`, `question_type`, `points`, `explanation`, `order_index`
- **PUT** `/api/questions/{id}` - Cập nhật câu hỏi
- **DELETE** `/api/questions/{id}` - Xóa câu hỏi
- **PUT** `/api/questions/{id}/order` - Thay đổi order_index
- **POST** `/api/questions/{id}/generate-embedding` - Tạo question_embedding

### 6.2 Answers
- **GET** `/api/questions/{questionId}/answers` - Lấy danh sách đáp án (order by order_index)
- **POST** `/api/questions/{questionId}/answers` - Thêm đáp án mới
    - Body: `answer_text`, `is_correct`, `order_index`
- **PUT** `/api/answers/{id}` - Cập nhật đáp án
- **DELETE** `/api/answers/{id}` - Xóa đáp án
- **PUT** `/api/answers/{id}/order` - Thay đổi order_index

## 7. Quiz Taking APIs

### 7.1 Quiz Access
- **GET** `/api/quiz/share/{shareLink}` - Truy cập quiz qua share_link
- **POST** `/api/quiz/share/{shareLink}/validate` - Xác thực password quiz
- **POST** `/api/quiz/share/{shareLink}/start` - Bắt đầu làm bài

### 7.2 Quiz Attempt
- **POST** `/api/quiz-attempts` - Tạo lần làm bài mới
    - Body: `quiz_id`, `participant_name`, `participant_email` (cho user chưa đăng ký)
- **GET** `/api/quiz-attempts/{id}` - Lấy thông tin lần làm bài
- **PUT** `/api/quiz-attempts/{id}` - Cập nhật thông tin attempt
- **POST** `/api/quiz-attempts/{id}/submit` - Nộp bài (set is_completed = TRUE, tính điểm)
- **POST** `/api/quiz-attempts/{id}/pause` - Tạm dừng làm bài
- **POST** `/api/quiz-attempts/{id}/resume` - Tiếp tục làm bài

### 7.3 Quiz Responses
- **POST** `/api/quiz-responses` - Lưu câu trả lời
    - Body: `attempt_id`, `question_id`, `answer_id`, `response_text`, `time_taken`
- **PUT** `/api/quiz-responses/{id}` - Cập nhật câu trả lời
- **GET** `/api/quiz-attempts/{attemptId}/responses` - Lấy tất cả câu trả lời

## 8. Analytics & Statistics APIs

### 8.1 Quiz Statistics (sử dụng quiz_statistics view)
- **GET** `/api/quizzes/{id}/statistics` - Thống kê tổng quan quiz
- **GET** `/api/quizzes/{id}/leaderboard` - Bảng xếp hạng (sử dụng quiz_leaderboard view)
- **GET** `/api/quizzes/{id}/attempts` - Danh sách lần làm bài
- **GET** `/api/quizzes/{id}/analytics` - Phân tích chi tiết
- **GET** `/api/quizzes/{id}/export` - Xuất dữ liệu (CSV/Excel)

### 8.2 Question Analytics
- **GET** `/api/questions/{id}/statistics` - Thống kê câu hỏi
- **GET** `/api/questions/{id}/difficulty-analysis` - Phân tích độ khó
- **GET** `/api/quizzes/{id}/question-performance` - Hiệu suất từng câu hỏi

### 8.3 User Analytics
- **GET** `/api/users/my-statistics` - Thống kê cá nhân
- **GET** `/api/users/my-quizzes` - Danh sách quiz đã tạo
- **GET** `/api/users/my-attempts` - Danh sách quiz đã làm
- **GET** `/api/users/dashboard` - Dashboard tổng quan

## 9. Semantic Search APIs

### 9.1 Search (sử dụng stored procedures)
- **POST** `/api/search/quizzes` - Tìm kiếm quiz tương tự
    - Body: `query_text`, `similarity_threshold`, `limit`
    - Sử dụng `FindSimilarQuizzes` procedure
- **POST** `/api/search/knowledge` - Tìm kiếm knowledge base
    - Sử dụng `FindAvailableKnowledge` procedure
- **POST** `/api/search/files` - Tìm kiếm files
    - Sử dụng `FindAvailableFiles` procedure
- **POST** `/api/search/questions` - Tìm kiếm câu hỏi tương tự
- **GET** `/api/search/suggestions` - Gợi ý tìm kiếm

### 9.2 Content Discovery
- **GET** `/api/content/public` - Lấy nội dung public (sử dụng public_content_summary view)
- **GET** `/api/content/recommended` - Nội dung được đề xuất based on embeddings
- **POST** `/api/content/similar` - Tìm nội dung tương tự

## 10. Content Permissions APIs

### 10.1 Permissions Management
- **GET** `/api/permissions/content/{contentType}/{contentId}` - Lấy danh sách quyền
- **POST** `/api/permissions/grant` - Cấp quyền cho user
    - Body: `content_type`, `content_id`, `shared_with_user_id`, `permission_type`, `expires_at`
- **PUT** `/api/permissions/{id}` - Cập nhật quyền
- **DELETE** `/api/permissions/{id}` - Thu hồi quyền (set is_active = FALSE)
- **GET** `/api/permissions/my-shared` - Danh sách nội dung đã chia sẻ với tôi

## 11. System & Admin APIs

### 11.1 System Info
- **GET** `/api/system/health` - Kiểm tra sức khỏe hệ thống
- **GET** `/api/system/version` - Phiên bản hệ thống
- **GET** `/api/system/statistics` - Thống kê hệ thống

### 11.2 Admin
- **GET** `/api/admin/users` - Quản lý users
- **GET** `/api/admin/quizzes` - Quản lý tất cả quizzes
- **GET** `/api/admin/analytics` - Analytics toàn hệ thống
- **POST** `/api/admin/maintenance` - Chế độ bảo trì

## 12. Real-time & Monitoring APIs

### 12.1 Real-time Participants
- **GET** `/api/quizzes/{id}/active-participants` - Lấy danh sách người đang làm bài
- **POST** `/api/quizzes/{id}/join` - Tham gia làm bài (real-time)
- **POST** `/api/quizzes/{id}/leave` - Rời khỏi bài quiz
- **PUT** `/api/active-participants/{id}/status` - Cập nhật trạng thái

### 12.2 WebSocket Endpoints
- **WS** `/ws/quiz/{quizId}` - WebSocket cho real-time updates
- **WS** `/ws/quiz/{quizId}/participants` - WebSocket theo dõi participants
- **WS** `/ws/quiz/{quizId}/leaderboard` - WebSocket cập nhật bảng xếp hạng

## 13. Integration & Export APIs

### 13.1 Export
- **GET** `/api/quizzes/{id}/export/json` - Xuất quiz dạng JSON
- **GET** `/api/quizzes/{id}/export/pdf` - Xuất quiz dạng PDF
- **GET** `/api/quizzes/{id}/export/word` - Xuất quiz dạng Word
- **GET** `/api/quizzes/{id}/results/export` - Xuất kết quả

### 13.2 Import
- **POST** `/api/quizzes/import` - Import quiz từ file
- **POST** `/api/questions/import` - Import câu hỏi từ file

## 14. Notification APIs

### 14.1 Notifications
- **GET** `/api/notifications` - Lấy danh sách thông báo
- **PUT** `/api/notifications/{id}/read` - Đánh dấu đã đọc
- **POST** `/api/notifications/mark-all-read` - Đánh dấu tất cả đã đọc
- **DELETE** `/api/notifications/{id}` - Xóa thông báo

## API Response Format

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Quiz Title",
    "...": "..."
  },
  "message": "Success message",
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "total_pages": 5
    },
    "embedding_info": {
      "model": "text-embedding-ada-002",
      "updated_at": "2025-07-18T10:30:00Z"
    }
  },
  "timestamp": "2025-07-18T10:30:00Z"
}
```

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "title",
      "message": "Title is required"
    }
  },
  "timestamp": "2025-07-18T10:30:00Z"
}
```

## Database-Specific API Features

### Semantic Search Parameters
- `similarity_threshold`: Ngưỡng tương đồng (0.0 - 1.0)
- `embedding_model`: Model embedding sử dụng
- `search_type`: Loại tìm kiếm (content, title, summary)

### Content Sharing Parameters
- `is_public`: Công khai hay không
- `allow_copy`: Cho phép sao chép
- `allow_edit`: Cho phép chỉnh sửa
- `allow_reuse`: Cho phép tái sử dụng (files)

### Quiz Creation Parameters
- `source_type`: Nguồn tạo quiz (file, text, knowledge, manual)
- `knowledge_base_ids`: Danh sách ID từ knowledge base
- `original_filename`: Tên file gốc (nếu từ file)

### Analytics Parameters
- `completion_rate`: Tỷ lệ hoàn thành
- `average_score`: Điểm trung bình
- `time_analysis`: Phân tích thời gian
- `difficulty_metrics`: Các chỉ số độ khó

## Authentication

```
Authorization: Bearer <token>
```

## Rate Limiting

- **General APIs**: 100 requests/minute
- **AI Processing**: 10 requests/minute
- **File Upload**: 5 requests/minute
- **Search APIs**: 50 requests/minute
- **Embedding Generation**: 20 requests/minute

## Pagination & Filtering

### Query Parameters
- `page`: Trang hiện tại (default: 1)
- `limit`: Số item per page (default: 20, max: 100)
- `sort`: Sắp xếp (created_at:desc, title:asc, quality_score:desc)
- `search`: Tìm kiếm text

### Database-Specific Filters
- `category_id`: Filter theo category
- `source_type`: Filter theo nguồn tạo
- `difficulty_level`: Filter theo độ khó
- `is_public`: Filter nội dung public
- `creator_id`: Filter theo người tạo
- `date_from`, `date_to`: Filter theo thời gian
- `similarity_threshold`: Ngưỡng tương đồng cho search

## Vector Search Examples

### Tìm kiếm quiz tương tự
```json
POST /api/search/quizzes
{
  "query_text": "machine learning algorithms",
  "similarity_threshold": 0.7,
  "limit": 10,
  "category_id": 2
}
```

### Tìm kiếm knowledge base
```json
POST /api/search/knowledge
{
  "query_text": "neural networks",
  "similarity_threshold": 0.8,
  "difficulty_level": "intermediate",
  "limit": 15
}
```