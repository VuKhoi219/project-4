import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ thêm useNavigate

import apiService from "../services/api";
import styles from "../styles/UserAnswerDetail.module.css";

interface Answer {
  answerId: number;
  answerText: string;
  isCorrect: number;
  userChoice: number;
}

interface Question {
  questionId: number;
  questionText: string;
  score: number;
  answers: Answer[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: {
    room: string;
    title: string;
    questions: Question[];
  };
  error: string | null;
}

const UserAnswerDetail: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [data, setData] = useState<ApiResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ hook điều hướng

  useEffect(() => {
    if (!roomId) return;
    const fetchData = async () => {
      try {
        const res = await apiService.getUserAnswer(roomId);
        setData(res.data); // vì getUserAnswer đã return res.data
      } catch (err) {
        console.error("Lỗi khi lấy kết quả:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [roomId]);

  if (loading) return <div className={styles.loading}>⏳ Đang tải kết quả...</div>;
  if (!data) return <div className={styles.error}>❌ Không có dữ liệu</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>📘 {data.title}</h2>
      <p className={styles.room}>Phòng: {data.room}</p>
      {/* ✅ Nút Back */}
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        ⬅ Quay lại
      </button>
      <div className={styles.questionList}>
        {data.questions.map((q, index) => (
          <div key={q.questionId} className={styles.questionCard}>
            <h3 className={styles.questionText}>
              Câu {index + 1}: {q.questionText}
            </h3>
            <p className={styles.score}>Điểm: {q.score}</p>

            <ul className={styles.answerList}>
              {q.answers.map((ans) => {
                const isUserChoice = ans.userChoice === 1;
                const isCorrect = ans.isCorrect === 1;

                return (
                  <li
                    key={ans.answerId}
                    className={`${styles.answerItem} ${
                      isCorrect
                        ? styles.correct
                        : isUserChoice
                        ? styles.wrong
                        : ""
                    }`}
                  >
                    <span>{ans.answerText}</span>
                    {isCorrect && <span className={styles.badge}>✔ Đúng</span>}
                    {isUserChoice && !isCorrect && (
                      <span className={styles.badgeWrong}>✘ Sai</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserAnswerDetail;
