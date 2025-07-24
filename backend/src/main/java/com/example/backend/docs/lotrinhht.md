# Quiz AI - Tài Liệu API Tối Ưu (Tiếng Việt)

## 🎯 **LỘ TRÌNH PHÁT TRIỂN ƯU TIÊN**

### **GIAI ĐOẠN 1 - CƠ BẢN (Làm trước - 2 tuần đầu)**
```
✅ MVP Core - Các tính năng tối thiểu để demo được
1. Xác thực người dùng cơ bản
2. Upload file và xử lý AI đơn giản  
3. Tạo quiz từ AI
4. Chỉnh sửa câu hỏi/đáp án
5. Làm bài quiz cơ bản (không real-time)
6. Chia sẻ quiz qua link
```

### **GIAI ĐOẠN 2 - NÂNG CAO (Tuần 3-4)**
```
🚀 Tính năng nâng cao
1. Tính điểm real-time từng câu
2. Bảng xếp hạng cơ bản
3. Theo dõi ai đang làm bài
4. Tổng kết sau bài quiz
```

### **GIAI ĐOẠN 3 - HOÀN THIỆN (Tuần 5-6)**
```
⭐ Real-time & Polish
1. WebSocket cho live updates
2. Hiệu ứng điểm số và xếp hạng
3. Thống kê chi tiết
4. Tối ưu UX/UI
```

---

## 📚 **TÀI LIỆU API CHI TIẾT**

## 1. API Xác Thực & Quản Lý Người Dùng

### 1.1 Xác Thực Người Dùng ⭐ **[GIAI ĐOẠN 1]**
- **POST** `/api/auth/register` - Đăng ký tài khoản mới
- **POST** `/api/auth/login` - Đăng nhập vào hệ thống
- **POST** `/api/auth/logout` - Đăng xuất khỏi hệ thống
- **POST** `/api/auth/refresh` - Làm mới token xác thực

### 1.2 Thông Tin Cá Nhân ⭐ **[GIAI ĐOẠN 1]**
- **GET** `/api/users/profile` - Xem thông tin cá nhân
- **PUT** `/api/users/profile` - Cập nhật thông tin cá nhân
- **POST** `/api/users/upload-avatar` - Tải lên ảnh đại diện
- **DELETE** `/api/users/account` - Xóa tài khoản

## 2. API Quản Lý File & Xử Lý AI

### 2.1 Tải File & Xử Lý Nội Dung ⭐ **[GIAI ĐOẠN 1]**
- **POST** `/api/files/upload` - Tải file lên và AI xử lý ngay
    - Body: `file`, `user_requirements` (yêu cầu của người dùng)
    - Trả về: `file_id`, `summary` (tóm tắt), `suggested_quiz_settings` (gợi ý cài đặt)
- **POST** `/api/ai/process-text` - Xử lý văn bản thành tóm tắt và gợi ý quiz
    - Body: `content_text`, `user_requirements`
    - Trả về: `summary`, `suggested_questions`, `difficulty_level`
- **GET** `/api/files/{id}/summary` - Lấy tóm tắt đã được AI xử lý

## 3. API Tạo & Quản Lý Quiz

### 3.1 Quy Trình Tạo Quiz ⭐ **[GIAI ĐOẠN 1]**
- **POST** `/api/quizzes/create-from-file` - Tạo quiz từ file đã tải lên
    - Body: `file_id`, `quiz_settings`, `custom_requirements`
    - Trả về: Quiz với các câu hỏi do AI sinh ra
- **POST** `/api/quizzes/create-from-text` - Tạo quiz từ văn bản
    - Body: `content_text`, `quiz_settings`, `question_count`, `difficulty`
    - Trả về: Quiz với các câu hỏi do AI sinh ra
- **GET** `/api/quizzes/{id}` - Xem chi tiết quiz (có thể chỉnh sửa)
- **PUT** `/api/quizzes/{id}` - Cập nhật thông tin quiz (tiêu đề, mô tả, cài đặt)
- **DELETE** `/api/quizzes/{id}` - Xóa quiz

### 3.2 Cài Đặt Quiz & Chia Sẻ ⭐ **[GIAI ĐOẠN 1]**
- **PUT** `/api/quizzes/{id}/settings` - Cập nhật cài đặt quiz:
    - `time_limit_per_question` (thời gian mỗi câu), `total_time_limit` (tổng thời gian)
    - `allow_multiple_attempts` (cho phép làm nhiều lần), `show_results_immediately` (hiện kết quả ngay)
    - `show_leaderboard` (hiện bảng xếp hạng), `require_name` (bắt buộc nhập tên)
- **POST** `/api/quizzes/{id}/generate-share-link` - Tạo link chia sẻ
- **POST** `/api/quizzes/{id}/publish` - Xuất bản quiz để chia sẻ

## 4. API Quản Lý Câu Hỏi & Đáp Án

### 4.1 Quản Lý Câu Hỏi ⭐ **[GIAI ĐOẠN 1]**
- **GET** `/api/quizzes/{quizId}/questions` - Lấy danh sách câu hỏi để chỉnh sửa
- **POST** `/api/quizzes/{quizId}/questions` - Thêm câu hỏi mới
    - Body: `question_text`, `question_type` (1 đáp án/nhiều đáp án/tự luận), `points`, `time_limit`
- **PUT** `/api/questions/{id}` - Cập nhật nội dung câu hỏi
- **DELETE** `/api/questions/{id}` - Xóa câu hỏi
- **PUT** `/api/questions/reorder` - Thay đổi thứ tự câu hỏi

### 4.2 Quản Lý Đáp Án ⭐ **[GIAI ĐOẠN 1]**
- **GET** `/api/questions/{questionId}/answers` - Lấy danh sách đáp án để chỉnh sửa
- **POST** `/api/questions/{questionId}/answers` - Thêm đáp án mới
    - Body: `answer_text`, `is_correct`, `order_index`
- **PUT** `/api/answers/{id}` - Cập nhật đáp án
- **DELETE** `/api/answers/{id}` - Xóa đáp án

## 5. API Trải Nghiệm Làm Bài Quiz

### 5.1 Truy Cập & Bắt Đầu Quiz ⭐ **[GIAI ĐOẠN 1]**
- **GET** `/api/quiz/share/{shareLink}` - Truy cập quiz qua link chia sẻ
    - Trả về: Thông tin quiz, các trường bắt buộc, cài đặt
- **POST** `/api/quiz/share/{shareLink}/join` - Tham gia làm bài
    - Body: `participant_name` (nếu chưa đăng nhập), `session_id`
    - Trả về: `attempt_id`, `questions_order`, `time_settings`

### 5.2 Làm Bài Real-time 🚀 **[GIAI ĐOẠN 2]**
- **GET** `/api/quiz-attempts/{attemptId}/current-question` - Lấy câu hỏi hiện tại
- **POST** `/api/quiz-attempts/{attemptId}/answer` - Trả lời câu hỏi và lưu ngay
    - Body: `question_id`, `answer_ids[]` hoặc `answer_text`, `time_taken`
    - Trả về: `score_earned` (điểm nhận được), `is_correct`, `next_question_id`, `current_rank`
- **GET** `/api/quiz-attempts/{attemptId}/next-question` - Lấy câu hỏi tiếp theo
- **POST** `/api/quiz-attempts/{attemptId}/complete` - Hoàn thành bài quiz (câu cuối)
    - Trả về: `final_score`, `final_rank`, `completion_time`, `leaderboard_position`

### 5.3 Cập Nhật Real-time ⭐ **[GIAI ĐOẠN 3]**
- **GET** `/api/quizzes/{quizId}/live-participants` - Lấy danh sách người đang làm bài
- **GET** `/api/quizzes/{quizId}/live-leaderboard` - Bảng xếp hạng real-time
- **WebSocket** `/ws/quiz/{quizId}/live` - Cập nhật real-time cho:
    - Người tham gia vào/ra
    - Cập nhật bảng xếp hạng trực tiếp
    - Hiệu ứng điểm số
    - Thay đổi thứ hạng

## 6. API Thống Kê & Kết Quả

### 6.1 Thống Kê Quiz 🚀 **[GIAI ĐOẠN 2]**
- **GET** `/api/quizzes/{id}/leaderboard` - Bảng xếp hạng chi tiết
    - Trả về: Danh sách xếp hạng với điểm số, thời gian hoàn thành, thông tin người tham gia
- **GET** `/api/quizzes/{id}/statistics` - Thống kê tổng quan
    - Trả về: Tổng số người tham gia, điểm trung bình, tỷ lệ hoàn thành, phân tích thời gian
- **GET** `/api/quiz-attempts/{attemptId}/detailed-results` - Kết quả chi tiết cá nhân
    - Trả về: Kết quả từng câu hỏi, thời gian mỗi câu, tiến trình xếp hạng

### 6.2 Kết Quả Cá Nhân 🚀 **[GIAI ĐOẠN 2]**
- **GET** `/api/quiz-attempts/{attemptId}/summary` - Tóm tắt kết quả
- **GET** `/api/users/my-quiz-history` - Lịch sử làm bài của user đã đăng nhập
- **GET** `/api/users/my-created-quizzes` - Danh sách quiz đã tạo

## 7. API Phân Loại & Tổ Chức (Tùy Chọn)

### 7.1 Phân Loại 🔄 **[GIAI ĐOẠN 3]**
- **GET** `/api/categories` - Lấy danh sách danh mục
- **POST** `/api/categories` - Tạo danh mục mới (admin)

---

## 📋 **QUY TRÌNH PHÁT TRIỂN CHI TIẾT**

### **GIAI ĐOẠN 1 - MVP (2 tuần đầu) ⭐ QUAN TRỌNG NHẤT**

#### Tuần 1:
1. **Setup dự án & Database**
    - Thiết kế database cơ bản (users, quizzes, questions, answers, quiz_attempts)
    - API xác thực cơ bản (register, login)

2. **Upload & AI cơ bản**
    - API upload file đơn giản
    - Tích hợp AI để tạo tóm tắt (có thể dùng OpenAI API)
    - API tạo quiz từ AI-generated content

#### Tuần 2:
3. **Quản lý Quiz**
    - CRUD cho quiz, questions, answers
    - Tính năng edit quiz sau khi AI tạo
    - Tạo share link

4. **Làm bài cơ bản**
    - API làm bài quiz không real-time
    - Lưu kết quả vào database
    - Hiển thị kết quả cuối

### **GIAI ĐOẠN 2 - Nâng cao (Tuần 3-4) 🚀**

#### Tuần 3:
1. **Real-time scoring**
    - API trả lời từng câu và tính điểm ngay
    - Cập nhật ranking sau mỗi câu
    - Bảng xếp hạng cơ bản

#### Tuần 4:
2. **Live features**
    - Theo dõi ai đang làm bài
    - Cập nhật leaderboard theo thời gian thực
    - Tổng kết comprehensive

### **GIAI ĐOẠN 3 - Hoàn thiện (Tuần 5-6) ⭐**

#### Tuần 5-6:
1. **WebSocket & Hiệu ứng**
    - WebSocket cho live updates
    - Hiệu ứng điểm số, animations
    - Polish UX/UI
    - Thống kê chi tiết

---

## 📝 **ĐỊNH DẠNG RESPONSE API**

### Response Thành Công
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Tiêu Đề Quiz"
  },
  "message": "Thành công",
  "timestamp": "2025-07-19T10:30:00Z"
}
```

### Response Lỗi
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu đầu vào không hợp lệ",
    "details": {
      "field": "title",
      "message": "Tiêu đề là bắt buộc"
    }
  },
  "timestamp": "2025-07-19T10:30:00Z"
}
```

## 🔌 **WEBSOCKET EVENTS**

### Cập Nhật Quiz Trực Tiếp
```json
{
  "event": "participant_joined",
  "data": {
    "participant_name": "Nguyễn Văn A",
    "total_participants": 5
  }
}

{
  "event": "score_update",
  "data": {
    "participant_id": "123",
    "new_score": 85,
    "new_rank": 2,
    "score_change": "+10"
  }
}

{
  "event": "leaderboard_update",
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "name": "Alice",
        "score": 95,
        "completion_time": "02:45"
      }
    ]
  }
}
```

## 🔄 **QUY TRÌNH WORKFLOW CHÍNH**

### 1. Quy Trình Tạo Quiz
```
1. POST /api/files/upload (nếu upload file)
   hoặc POST /api/ai/process-text (nếu nhập text)
   
2. POST /api/quizzes/create-from-file hoặc create-from-text
   → Nhận quiz với câu hỏi AI sinh ra
   
3. PUT /api/quizzes/{id} - Chỉnh sửa quiz
4. PUT /api/questions/{id} - Chỉnh sửa từng câu hỏi  
5. PUT /api/answers/{id} - Chỉnh sửa đáp án
6. PUT /api/quizzes/{id}/settings - Cài đặt thời gian, rules
7. POST /api/quizzes/{id}/publish - Xuất bản
8. POST /api/quizzes/{id}/generate-share-link - Tạo link chia sẻ
```

### 2. Quy Trình Làm Bài
```
1. GET /api/quiz/share/{shareLink} - Xem thông tin quiz
2. POST /api/quiz/share/{shareLink}/join - Tham gia (+ tên nếu chưa login)
3. GET /api/quiz-attempts/{attemptId}/current-question - Lấy câu hỏi đầu

Lặp lại cho mỗi câu hỏi:
4. POST /api/quiz-attempts/{attemptId}/answer - Trả lời + lưu điểm ngay
   → Response có điểm hiện tại và ranking
5. GET /api/quiz-attempts/{attemptId}/next-question - Câu hỏi tiếp theo

Câu hỏi cuối cùng:
6. POST /api/quiz-attempts/{attemptId}/complete - Hoàn thành + tổng kết final
```

### 3. Cập Nhật Real-time
```
WebSocket connection: /ws/quiz/{quizId}/live
- Nhận updates về participants
- Nhận live leaderboard changes  
- Nhận score animations/effects
- Nhận ranking changes
```

## 🔐 **XÁC THỰC**
```
Authorization: Bearer <token>
```
**Lưu ý:** Token không bắt buộc cho việc làm bài quiz qua share link

## ⚡ **GIỚI HẠN TỐC ĐỘ**
- **API thông thường**: 100 requests/phút
- **Xử lý AI**: 10 requests/phút
- **Upload file**: 5 requests/phút
- **Làm bài quiz**: 200 requests/phút (cần real-time)
- **WebSocket**: Không giới hạn

---

## 💡 **GỢI Ý CÔNG NGHỆ**

### Backend:
- **Node.js + Express** hoặc **Python + FastAPI**
- **PostgreSQL** cho database
- **Redis** cho caching và session
- **Socket.io** cho WebSocket
- **OpenAI API** cho AI processing

### Frontend:
- **React** hoặc **Vue.js**
- **Socket.io-client** cho real-time
- **Chart.js** cho thống kê
- **Tailwind CSS** cho styling

### Infrastructure:
- **Docker** cho deployment
- **Nginx** cho load balancing
- **AWS S3** cho file storage
- **AWS RDS** cho database production