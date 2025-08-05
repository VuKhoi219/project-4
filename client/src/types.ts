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
  options: string[];
  correctAnswer: string;
  timeLimit: number;
}

export interface ExtendedQuestion extends Question {
  type: QuestionType;
  correctAnswers?: string[];
  acceptedAnswers?: string[];
}

export interface Participant {
  joinedAt: number;
  score: number;
  bestScore: number;
  displayName: string;
  isActive: boolean;
  lastAnswered?: number;
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

export interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    length: number;
    map(arg0: (q: ApiQuestion) => { id: number; text: string; options: string[]; correctAnswer: string; correctAnswers: string[]; acceptedAnswers: string[]; timeLimit: number; type: QuestionType; }): ExtendedQuestion[];
    content: ApiQuestion[];
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