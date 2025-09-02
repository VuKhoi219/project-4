import React, { useState } from "react";
import axios from "axios";
// Thay đổi import để sử dụng file CSS mới, chuyên dụng
import styles from "../styles/CreateQuiz.module.css"; 

type QuizInfo = {
  title: string;
  description: string;
};

type Answer = { answerText: string; isCorrect: boolean };
type Question = {
  id?: number;
  questionText: string;
  questionType: "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "MULTIPLE_SELECT" | "TRUE_FALSE";
  points?: number;
  timeLimit?: number;
  answers: Answer[];
};

const defaultQuestion: Question = {
  questionText: "",
  questionType: "MULTIPLE_CHOICE",
  points: 1,
  timeLimit: 30,
  answers: [
    { answerText: "", isCorrect: false },
    { answerText: "", isCorrect: false },
    { answerText: "", isCorrect: false },
    { answerText: "", isCorrect: false },
  ],
};

const CreateQuiz: React.FC = () => {
  const [quizInfo, setQuizInfo] = useState<QuizInfo>({
    title: "",
    description: ""
  });
  const [questions, setQuestions] = useState<Question[]>([defaultQuestion]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // --- TOÀN BỘ LOGIC BÊN DƯỚI ĐƯỢC GIỮ NGUYÊN ---
  const baseApi = process.env.REACT_APP_API_BACKEND || "http://api.quizai.edu.vn"

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Bạn cần đăng nhập để tạo quiz!");
      return;
    }
    if (!quizInfo.title || !quizInfo.description ) {
      setError("Vui lòng nhập đầy đủ thông tin quiz!");
      return;
    }
    if (questions.length === 0) {
      setError("Vui lòng thêm ít nhất 1 câu hỏi!");
      return;
    }
    setLoading(true);
    try {
      const body = {
        ...quizInfo,
        sourceType: "TEXT",
        showCorrectAnswers: true,
        shuffleAnswers: false,
      };
      const headers: any = { Authorization: `Bearer ${token}` };
      const quizRes = await axios.post(`${baseApi}/api/quizzes`, body, {
        headers,
      });
      const quizId = quizRes.data.data.id;
      for (const q of questions) {
        await axios.post(`${baseApi}/api/questions/quizzes/${quizId}`, q, {
          headers,
        });
      }
      alert("🎉 Tạo quiz thành công! Hãy mời bạn bè cùng chơi nhé!");
      setQuizInfo({ title: "", description: "" });
      setQuestions([defaultQuestion]);
      setActiveQuestionIndex(0);
      setError(null);
    } catch (err: any) {
      if (err.response) {
        console.error("Lỗi chi tiết:", err.response.data);
        setError("Lỗi: " + (err.response.data?.message || JSON.stringify(err.response.data)));
      } else {
        setError("Lỗi: " + err.message);
      }
    }
    setLoading(false);
  };

  const addQuestion = () => {
    setQuestions([...questions, { ...defaultQuestion }]);
    setActiveQuestionIndex(questions.length);
  };
  const removeQuestion = (idx: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== idx);
      setQuestions(newQuestions);
      setActiveQuestionIndex(Math.min(idx, newQuestions.length - 1));
    }
  };

  const handleQuestionTypeChange = (qIdx: number, value: "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "MULTIPLE_SELECT" | "TRUE_FALSE") => {
    const newQuestions = [...questions];
    newQuestions[qIdx].questionType = value;
    if (value === "SHORT_ANSWER") {
      newQuestions[qIdx].answers = [{ answerText: "", isCorrect: true }];
    } else if (value === "TRUE_FALSE") {
      newQuestions[qIdx].answers = [
        { answerText: "True", isCorrect: false },
        { answerText: "False", isCorrect: false },
      ];
    } else if (value === "MULTIPLE_CHOICE" || value === "MULTIPLE_SELECT") {
      newQuestions[qIdx].answers = [
        { answerText: "", isCorrect: false },
        { answerText: "", isCorrect: false },
        { answerText: "", isCorrect: false },
        { answerText: "", isCorrect: false },
      ];
    }
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (qIdx: number, aIdx: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[qIdx].answers[aIdx].answerText = value;
    setQuestions(newQuestions);
  };

  const handleCorrectChange = (qIdx: number, aIdx: number) => {
    const newQuestions = [...questions];
    const questionType = newQuestions[qIdx].questionType;
    if (questionType === "MULTIPLE_SELECT") {
      newQuestions[qIdx].answers[aIdx].isCorrect = !newQuestions[qIdx].answers[aIdx].isCorrect;
    } else {
      newQuestions[qIdx].answers = newQuestions[qIdx].answers.map((ans, idx) => ({
        ...ans,
        isCorrect: idx === aIdx,
      }));
    }
    setQuestions(newQuestions);
  };

  const activeQuestion = questions[activeQuestionIndex];

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Create New Quiz</h1>
        <button className={styles.buttonPrimary} onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Quiz"}
        </button>
      </header>

      <div className={styles.editorWrapper}>
        {/* SIDEBAR - Thông tin Quiz */}
        <aside className={styles.sidebar}>
          <div className={styles.formGroup}>
            <label htmlFor="quizTitle">Quiz Title</label>
            <input
              id="quizTitle"
              className={styles.input}
              placeholder="e.g. Vietnamese History"
              value={quizInfo.title}
              onChange={(e) => setQuizInfo({ ...quizInfo, title: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="quizDesc">Description</label>
            <textarea
              id="quizDesc"
              className={styles.textarea}
              placeholder="A brief description of your quiz"
              value={quizInfo.description}
              onChange={(e) => setQuizInfo({ ...quizInfo, description: e.target.value })}
            />
          </div>

        </aside>

        {/* MAIN PANEL - Trình chỉnh sửa câu hỏi */}
        <main className={styles.mainPanel}>
          <div className={styles.questionEditor}>
            
            <div className={styles.questionForm}>
              <div className={styles.formGroup}>
                <label>Question Type</label>
                <select
                  className={styles.select}
                  value={activeQuestion.questionType}
                  onChange={(e) => handleQuestionTypeChange(activeQuestionIndex, e.target.value as any)}
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="MULTIPLE_SELECT">Multiple Select</option>
                  <option value="TRUE_FALSE">True/False</option>
                  
                </select>
              </div>
              <div className={styles.formGroup}>
                 <label>Question</label>
                 <textarea
                  className={styles.textarea}
                  value={activeQuestion.questionText}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[activeQuestionIndex].questionText = e.target.value;
                    setQuestions(newQuestions);
                  }}
                  placeholder="Type your question here..."
                />
              </div>
              <div className={styles.formGroup}>
                <label>Answers</label>
                <div className={styles.answersList}>
                  {activeQuestion.answers.map((ans, ansIndex) => (
                    <div key={ansIndex} className={styles.answerRow}>
                      <button
                        className={`${styles.correctnessToggle} ${ans.isCorrect ? styles.correct : styles.incorrect}`}
                        onClick={() => handleCorrectChange(activeQuestionIndex, ansIndex)}
                      >
                        {ans.isCorrect ? '✓' : '✗'}
                      </button>
                      <input
                        type="text"
                        className={styles.input}
                        value={ans.answerText}
                        onChange={(e) => handleAnswerChange(activeQuestionIndex, ansIndex, e.target.value)}
                        placeholder={
                            activeQuestion.questionType === "TRUE_FALSE" 
                            ? (ansIndex === 0 ? "True" : "False")
                            : `Answer ${ansIndex + 1}`
                        }
                        readOnly={activeQuestion.questionType === 'TRUE_FALSE'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className={styles.footer}>
        <div className={styles.questionTabs}>
          {questions.map((_, index) => (
            <div key={index} className={styles.tabContainer}>
              <button
                className={`${styles.tab} ${index === activeQuestionIndex ? styles.active : ""}`}
                onClick={() => setActiveQuestionIndex(index)}
              >
                {index + 1}
              </button>
              {questions.length > 1 && (
                <button
                  className={styles.deleteTabButton}
                  onClick={() => removeQuestion(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button className={styles.addButton} onClick={addQuestion}>+</button>
        </div>
      </footer>

      {error && <div className={styles.errorBanner}>{error}</div>}
    </div>
  );
};

export default CreateQuiz;