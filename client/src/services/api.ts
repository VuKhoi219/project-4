import axios from 'axios';
import { ApiResponse, ApiResponseDetail, QuizDetailData } from '../types';

const baseApi = process.env.REACT_APP_API_BACKEND || "http://api.quizai.edu.vn"

// 🔹 Public instance (không cần token)
const publicApi = axios.create({
  baseURL: `${baseApi}/api`,
  
});

// 🔐 Private instance (có token)
const privateApi = axios.create({
  baseURL: `${baseApi}/api`,
});

// Gắn token tự động vào header
privateApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 📦 Các API export ra
const apiService = {
  // ======= PUBLIC APIs =======

  // Lấy câu hỏi của quiz (KHÔNG cần token)
  fetchQuestions: async (quizId: string, page: number): Promise<ApiResponse> => {
    const res = await publicApi.get(`/quizzes/${quizId}/questions`);
    return res.data;
  },
  fetchMyQuizzes: async (page: number): Promise<ApiResponse> => {
    const res = await privateApi.get(`/quizzes/my-quizzes?page=${page}`);
    return res.data;
  },

  checkAnswer: async (questionId: number, answers: { answerText: string }[]): Promise<any> => {
    const res = await publicApi.post(`/answer/compare/${questionId}`, answers,  { withCredentials: true });
    return res.data;
  },
  fetchQuizzes: async (page: number): Promise<ApiResponse> => {
    const res = await publicApi.get(`/quizzes?page${page}`);
    return res.data
  },
  getQuizzesByQuiz: async (): Promise<ApiResponse> => {
    const res = await publicApi.get(`/quizzes/quizzes-hot`);
    return res.data;
  },
  
  getQuizAvatar: async (quizId: number): Promise<any> => {
    try {
      const res = await publicApi.get(`/quizzes/${quizId}/avatar`);
      return res.data;
    } catch (error) {
      return null; // Trả về null nếu không tìm thấy avatar
    }
  },

  createFinalResults: async (quizId: number, points: number, namePlayer: string, token?: string): Promise<any> => {
    const headers: any = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await privateApi.post(
      `/final-result`,
      { quizId, points, namePlayer },
      { headers }
    );

    return res.data;
  },
  findDetailQuiz: async (quizId: number): Promise<ApiResponseDetail<QuizDetailData>> => {
    const res = await publicApi.get(`/quizzes/detail-quiz/${quizId}`);
    return res.data;
  }
};

export default apiService;
