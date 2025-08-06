// src/types/index.ts

// Định nghĩa kiểu cho một đáp án
export interface Answer {
  id: number;
  answerText: string;
}

// Định nghĩa kiểu cho một câu hỏi
export interface Question {
  questionId: number;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECT' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  timeLimit: number;
  answers?: Answer[]; // Có thể null cho SHORT_ANSWER
  correctAnswer?: string; // Đáp án đúng, có thể là chuỗi đơn hoặc danh sách cách nhau bằng dấu phẩy cho MULTIPLE_SELECT
  options?: string[]; // Dùng cho MULTIPLE_CHOICE hoặc MULTIPLE_SELECT nếu cần
}

// Định nghĩa kiểu cho trạng thái trò chơi
export interface GameState {
  phase: 'get-ready' | 'playing' | 'show-answer' | 'leaderboard';
  questionIndex: number;
  timeLeft: number;
}

// Định nghĩa kiểu cho dữ liệu người chơi
export interface PlayerData {
  displayName: string;
  score: number;
  lastAnswered?: number; // Timestamp
}