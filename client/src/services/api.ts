import axios from 'axios';
import { ApiResponse, ApiResponseDetail, QuizDetailData,UserAnswerPayload } from '../types';
import { verify } from 'crypto';
import { Token } from '@mui/icons-material';

const baseApi = process.env.REACT_APP_API_BACKEND || "http://localhost:8080"

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
    console.log("API fetchQuestions response:", res.data);

    return res.data;
  },
  fetchMyQuizzes: async (page: number): Promise<ApiResponse> => {
    const res = await privateApi.get(`/quizzes/my-quizzes?page=${page}`);
    return res.data;
  },
  checkAnswer: async (questionId: number, answers: UserAnswerPayload[]): Promise<any> => {
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
  },
  verifyOtp: async (otp: string): Promise<any> => {
    try {
      const email = localStorage.getItem('registerEmail');
      const res = await publicApi.post(
        '/auth/verify-otp',
        null, // body rỗng
        { params: { email, otp } } // 👈 truyền query param đúng cách
      );
      return res.data;
    } catch (error) {
      return null;
    }
  },

  resresendOtp :async (): Promise<any> => {
    try {
      const email = localStorage.getItem('registerEmail'); // key trùng với lúc bạn set
      const res = await publicApi.post(`/auth/resend-otp?email=${email}`,);
      return res.data;  
    }
    catch (error) {
      return null;
    }
  }
};

export default apiService;
