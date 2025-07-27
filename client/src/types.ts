export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  timeLimit: number;
}

export interface Participant {
  joinedAt: number;
  score: number;
  bestScore: number;
  isActive: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  bestScore: number;
  averageScore: number;
  lastPlayed: number;
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
// Trong file ../types/index.ts (hoặc file types tương ứng)
export interface Participant {
  joinedAt: number;
  score: number;
  bestScore: number;
  isActive: boolean;
  lastAnswered?: number; // Thêm thuộc tính này (optional)
}