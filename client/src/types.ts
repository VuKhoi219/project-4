// export interface Question {
//   id: number;
//   text: string;
//   options: string[];
//   correctAnswer: string;
//   timeLimit: number;
  
// }

// export interface Participant {
//   joinedAt: number;
//   score: number;
//   bestScore: number;
//   displayName: string; // <--- THÊM DÒNG NÀY
//   isActive: boolean;
// }

// export interface LeaderboardEntry {
//   rank: number;
//   bestScore: number;
//   averageScore: number;
//   lastPlayed: number;
//     displayName: string; // <--- THÊM DÒNG NÀY

// }

// export interface Attempt {
//   playedAt: number;
//   score: number;
//   questionId: number;
// }

// export interface QuizStatus {
//   isStarted: boolean;
//   startedAt: number | null;
//   startedBy: string | null;
//   isCompleted: boolean;
//   completedAt: number | null;
// }

// export interface QuizData {
//   info: {
//     title: string;
//     questions: Question[];
//   };
//   status: QuizStatus;
//   participants: Record<string, Participant>;
//   leaderboard: Record<string, LeaderboardEntry>;
//   playHistory: Record<string, { attempts: Record<string, Attempt> }>;
// }
// // Trong file ../types/index.ts (hoặc file types tương ứng)
// export interface Participant {
//   joinedAt: number;
//   score: number;
//   bestScore: number;
//   isActive: boolean;
//   lastAnswered?: number; // Thêm thuộc tính này (optional)
// }
// Question Types Enum
export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  MULTIPLE_SELECT = 'MULTIPLE_SELECT',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER'
}

export interface Question {
  id: number;
  text: string;
  options: AnswerOption[]; // Thay đổi từ string[] sang AnswerOption[]
  correctAnswer: string;
  timeLimit: number;
}

// Định nghĩa một kiểu mới cho mỗi lựa chọn đáp án, bao gồm cả ID và TEXT
export interface AnswerOption {
  id: number;
  answerText: string;
}

export interface ExtendedQuestion extends Question {
  type: QuestionType;
  // Cập nhật các thuộc tính này để dùng AnswerOption[] nếu chúng cũng trả về ID
  correctAnswers?: AnswerOption[]; // Có thể giữ string[] nếu bạn chỉ cần text để so sánh
  acceptedAnswers?: string[]; // Thường là text cho Short Answer
}

export interface Participant {
  joinedAt: number;
  score: number;
  bestScore: number;
  displayName: string;
  isActive: boolean;
  lastAnswered?: number;
  avatar?: string;      // ✅ thêm vào
  background?: string;  // ✅ thêm vào
}

export interface LeaderboardEntry {
  rank: number;
  bestScore: number;
  averageScore: number;
  lastPlayed: number;
  displayName: string;
}

export interface Attempt {
  playedAt: number;
  score: number;
  questionId: number;
}

export interface QuizStatus {
  isStarted: boolean;
  startedAt: number | null;
  startedBy: string | null;
  isCompleted: boolean;
  completedAt: number | null;
}

export interface QuizData {
  info: {
    title: string;
    questions: Question[];
  };
  status: QuizStatus;
  participants: Record<string, Participant>;
  leaderboard: Record<string, LeaderboardEntry>;
  playHistory: Record<string, { attempts: Record<string, Attempt> }>;
}

export interface ApiAnswer {
  id: number;
  answerText: string;
  isCorrect?: boolean;
}

export interface ApiQuestion {
  questionId: number;
  questionText: string;
  questionType: keyof typeof QuestionType;
  timeLimit: number;
  answers: ApiAnswer[];
  correctAnswers?: ApiAnswer[];
  acceptedAnswers?: string[];
}
export interface UserAnswerPayload {
  answerId: number;
  answerText: string;
}
export interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    length: number;
    // Cập nhật phần map này để ánh xạ đúng sang AnswerOption[]
    map(arg0: (q: ApiQuestion) => { 
      id: number; 
      text: string; 
      options: AnswerOption[]; // Thay đổi ở đây
      correctAnswer: string; 
      correctAnswers: AnswerOption[]; // Thay đổi ở đây
      acceptedAnswers: string[]; 
      timeLimit: number; 
      type: QuestionType; 
    }): ExtendedQuestion[];
    data: ApiQuestion[];
    pageable: any;
    last: boolean;
    totalPages: number;
    totalElements: number;
    first: boolean;
    numberOfElements: number;
    size: number;
    number: number;
    sort: any;
    empty: boolean;
  };
  error: any;
}
export interface ApiResponseDetail<T = any> {
  success: boolean;
  message: string;
  data: T;
  error: any;
}

// Cho API detail quiz
export interface QuizDetailData {
  title: string;
  description: string;
  summary: string;
  totalQuestions: number;
}