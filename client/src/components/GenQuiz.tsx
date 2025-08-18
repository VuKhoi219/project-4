import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/GenQuiz.module.css';

// --- Types (Không thay đổi) ---
interface GeneratedQuestion {
  questionText: string;
  questionType: string;
  explanation?: string;
  points: number;
  timeLimit?: number;
  answers: {
    answerText: string;
    isCorrect: boolean;
    orderIndex: number;
  }[];
}

interface GeneratedQuiz {
  title: string;
  questions: GeneratedQuestion[];
}

const GenQuiz: React.FC = () => {
  const navigate = useNavigate();
  
  // --- State Management (Gần như không thay đổi) ---
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  // State mới để theo dõi câu hỏi đang được chỉnh sửa trong giao diện editor
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // --- Logic Handlers (Không thay đổi logic cốt lõi) ---
  const handleEditQuestion = (questionIndex: number, newText: string) => {
    if (!generatedQuiz) return;
    const updatedQuiz = { ...generatedQuiz };
    updatedQuiz.questions[questionIndex].questionText = newText;
    setGeneratedQuiz(updatedQuiz);
  };

  const handleEditAnswer = (questionIndex: number, answerIndex: number, newText: string) => {
    if (!generatedQuiz) return;
    const updatedQuiz = { ...generatedQuiz };
    updatedQuiz.questions[questionIndex].answers[answerIndex].answerText = newText;
    setGeneratedQuiz(updatedQuiz);
  };

  const handleEditExplanation = (questionIndex: number, newText: string) => {
    if (!generatedQuiz) return;
    const updatedQuiz = { ...generatedQuiz };
    updatedQuiz.questions[questionIndex].explanation = newText;
    setGeneratedQuiz(updatedQuiz);
  };

  const handleChangeCorrectAnswer = (questionIndex: number, answerIndex: number) => {
    if (!generatedQuiz) return;
    const updatedQuiz = { ...generatedQuiz };
    const question = updatedQuiz.questions[questionIndex];

    if (question.questionType === 'MULTIPLE_SELECT') {
      question.answers[answerIndex].isCorrect = !question.answers[answerIndex].isCorrect;
    } else {
      question.answers = question.answers.map((ans, idx) => ({
        ...ans,
        isCorrect: idx === answerIndex
      }));
    }
    setGeneratedQuiz(updatedQuiz);
  };
  
  const handleGenerateQuiz = async () => {
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề cho bài quiz');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Bạn cần đăng nhập để tạo quiz!');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:8080/api/quizzes/generate-ai', 
        { title: title.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setGeneratedQuiz(response.data.data);
        setActiveQuestionIndex(0); // Bắt đầu ở câu hỏi đầu tiên
        setError(null);
      } else {
        setError(response.data.error || 'Có lỗi xảy ra khi tạo quiz');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra khi kết nối với server');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (!generatedQuiz) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Bạn cần đăng nhập để lưu quiz!');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const quizToSave = {
        title: generatedQuiz.title,
        questions: generatedQuiz.questions.map((q, index) => ({
          ...q,
          timeLimit: q.timeLimit || 30,
          points: q.points || 1,
          answers: q.answers.map((a, ansIndex) => ({
            ...a,
            orderIndex: ansIndex
          }))
        }))
      };
      const response = await axios.post(
        'http://localhost:8080/api/quizzes/save-generated', 
        quizToSave,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          navigate(`/quizzes/${response.data.data.id}`);
        }, 2000);
      } else {
        setError(response.data.error || 'Có lỗi xảy ra khi lưu quiz');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra khi kết nối với server');
    } finally {
      setLoading(false);
    }
  };

  // --- Render Functions cho Giao diện mới ---

  // Render giao diện ban đầu (Hình 1)
  const renderInitialView = () => (
    <div className={`${styles.container} ${styles.matrixBackground}`}>
      <div className={styles.initialContent}>
        <h1 className={styles.aiTitle}>A.I.</h1>
        <p className={styles.aiSubtitle}>Type a subject to generate a quiz</p>
        
        <div className={styles.inputWrapper}>
          <input
            type="text"
            placeholder="Type here..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGenerateQuiz()}
            disabled={loading}
          />
        </div>

        {/* Các options này chỉ để giống giao diện, không có logic */}
        <div className={styles.optionsBar}>
          <span>Auto language ⌄</span>
          <span>8 questions ⌄</span>
          <span>With Images ⌄</span>
        </div>

        <button 
          className={styles.generateButton}
          onClick={handleGenerateQuiz}
          disabled={loading || !title.trim()}
        >
          {loading ? 'Generating...' : '⚡ Generate AI quiz'}
        </button>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );

  // Render giao diện chỉnh sửa (Hình 2)
  const renderEditorView = () => {
    if (!generatedQuiz) return null;
    const activeQuestion = generatedQuiz.questions[activeQuestionIndex];

    return (
      <div className={styles.editorContainer}>
        <header className={styles.editorHeader}>
          <div>
            <button className={`${styles.headerButton} ${styles.doneButton}`} onClick={handleSaveQuiz} disabled={loading}>
              {loading ? 'Saving...' : 'Done'}
            </button>
            <button className={styles.headerButton}>👁️ Preview</button>
          </div>
          <span className={styles.lastEdit}>Last edit was saved seconds ago</span>
        </header>

        <main className={styles.editorMain}>
          <div className={styles.mediaPane}>
            <div className={styles.mediaBox}>
              <button>Add media</button>
              <span>⚡ Generate with AI</span>
            </div>
          </div>

          <div className={styles.questionPane}>
            <div className={styles.formSection}>
              <label>Question</label>
              <textarea
                value={activeQuestion.questionText}
                onChange={(e) => handleEditQuestion(activeQuestionIndex, e.target.value)}
                placeholder="Required"
              />
            </div>

            <div className={styles.formSection}>
              <label>Select the correct answer(s)</label>
              <div className={styles.answersList}>
                {activeQuestion.answers.map((ans, ansIndex) => (
                  <div key={ansIndex} className={styles.answerInputWrapper}>
                    <button 
                      className={`${styles.correctnessToggle} ${ans.isCorrect ? styles.correct : styles.incorrect}`}
                      onClick={() => handleChangeCorrectAnswer(activeQuestionIndex, ansIndex)}
                    >
                      {ans.isCorrect ? '✓' : '✗'}
                    </button>
                    <input
                      type="text"
                      value={ans.answerText}
                      onChange={(e) => handleEditAnswer(activeQuestionIndex, ansIndex, e.target.value)}
                      placeholder={ansIndex === 0 ? "Required" : "Optional"}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.formSection}>
              <label>Fun fact</label>
              <textarea
                value={activeQuestion.explanation || ''}
                onChange={(e) => handleEditExplanation(activeQuestionIndex, e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        </main>

        <footer className={styles.editorFooter}>
            <div className={styles.questionTabs}>
              {generatedQuiz.questions.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.questionTab} ${index === activeQuestionIndex ? styles.active : ''}`}
                  onClick={() => setActiveQuestionIndex(index)}
                >
                  {index + 1}
                </button>
              ))}
              <button className={styles.addQuestionButton}>+</button>
            </div>
        </footer>
      </div>
    );
  };

  if (showSuccess) {
    return (
        <div className={styles.container}>
            <div className={`${styles.success}`}>
                <div className={styles.successIcon}>✓</div>
                <h2>Đã lưu Quiz thành công!</h2>
                <p>Đang chuyển đến trang chi tiết...</p>
            </div>
        </div>
    );
  }

  return generatedQuiz ? renderEditorView() : renderInitialView();
};

export default GenQuiz;

