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
  description?: string;
  summary?: string;
  questions: GeneratedQuestion[];
}

const GenQuiz: React.FC = () => {
  const navigate = useNavigate();
  
  // --- State Management ---
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  // State mới để theo dõi câu hỏi đang được chỉnh sửa trong giao diện editor
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  // --- State mới ---
  const [content, setContent] = useState('');
  // Cũng cần cập nhật state initialization để tránh lỗi:
  const [numberOfQuestions, setNumberOfQuestions] = useState('8'); // Thay đổi từ 5 thành ''
  const [difficulty, setDifficulty] = useState('Dễ'); // Thay đổi từ 'EASY' thành ''
  const baseApi = process.env.REACT_APP_API_BACKEND || "http://localhost:8080"

  // --- Utility Functions ---
  const isUserLoggedIn = () => {
    return !!localStorage.getItem('token');
  };

  const getCurrentUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      // Decode JWT token để lấy userId (giả sử token có format chuẩn)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.id || payload.sub;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

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
    if (!content.trim()) {
      setError('Vui lòng nhập nội dung cho quiz');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    try {
      const response = await axios.post(`${baseApi}/api/quizzes/generate-ai`, 
        { 
          content: content.trim(), 
          numberOfQuestions: numberOfQuestions ? parseInt(numberOfQuestions) : 8, 
          difficulty 
        },
        { headers }
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
    
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    try {
      const quizToSave = {
        title: generatedQuiz.title,
        description: generatedQuiz.description || '',
        summary: generatedQuiz.summary || '',
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
        `${baseApi}/api/quizzes/save-generated`, 
        quizToSave,
        { headers }
      );
      if (response.data.success) {
        setSavedQuizId(response.data.data.id);
        // Lưu quiz ID vào localStorage
        localStorage.setItem('lastSavedQuizId', response.data.data.id);
        setShowSuccessModal(true);
      } else {
        setError(response.data.error || 'Có lỗi xảy ra khi lưu quiz');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra khi kết nối với server');
    } finally {
      setLoading(false);
    }
  };

  const handleShareQuiz = async () => {
    if (!isUserLoggedIn()) {
      setShareError('Bạn cần đăng nhập để có thể vào chơi!');
      return;
    }

    if (!savedQuizId) return;

    setShareLoading(true);
    setShareError(null);
    setShareSuccess(false);

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        setShareError('Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.');
        return;
      }

      // Gọi API để lưu creator vào quiz
      const response = await axios.get(
        `${baseApi}/api/quizzes/save-creator?quizId=${savedQuizId}&userId=${userId}`,
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          } 
        }
      );

      if (response.data.success) {
        // Tạo link vào phòng 
        const shareLink = `/quiz/${savedQuizId}/join`;
        localStorage.removeItem('pendingShareQuizId'); // Xóa quiz ID pending nếu có
        localStorage.removeItem('returnToQuizAfterLogin'); // Xóa flag return to quiz
        localStorage.removeItem('lastSavedQuizId'); // Xóa quiz ID đã lưu
        navigate(shareLink);
      } else {
        setShareError(response.data.error || 'Có lỗi xảy ra khi tạo link');
      }
    } catch (err: any) {
      setShareError(err.response?.data?.error || 'Có lỗi xảy ra khi kết nối với server');
    } finally {
      setShareLoading(false);
    }
  };


  const handleExitWithoutRedirect = () => {
    setShowSuccessModal(false);
    setShareError(null);
    setShareSuccess(false);
    // Reset states để có thể tạo quiz mới
    setGeneratedQuiz(null);
    setTitle('');
    setSavedQuizId(null);
    setActiveQuestionIndex(0);
  };

  const handleLoginRedirect = () => {
    // Lưu thông tin quiz hiện tại để sau khi login có thể quay lại
    if (savedQuizId) {
      localStorage.setItem('pendingShareQuizId', savedQuizId);
      localStorage.setItem('returnToQuizAfterLogin', 'true');
    }
    navigate('/login');
  };

  // Kiểm tra xem có quiz pending để share không khi component mount
  React.useEffect(() => {
    const pendingQuizId = localStorage.getItem('pendingShareQuizId');
    const shouldReturnToQuiz = localStorage.getItem('returnToQuizAfterLogin');
    
    if (pendingQuizId && shouldReturnToQuiz === 'true' && isUserLoggedIn()) {
      // Người dùng vừa đăng nhập và có quiz pending
      setSavedQuizId(pendingQuizId);
      setShowSuccessModal(true);
      
      // Clear các flag
      localStorage.removeItem('pendingShareQuizId');
      localStorage.removeItem('returnToQuizAfterLogin');
      
      // Load lại quiz data nếu cần
      loadQuizForShare(pendingQuizId);
    }
  }, []);

  const loadQuizForShare = async (quizId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${baseApi}/api/quizzes/${quizId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      if (response.data.success) {
        setGeneratedQuiz(response.data.data);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
    }
  };

  // Render Success Modal
  const renderSuccessModal = () => {
    if (!showSuccessModal) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <div className={styles.successIcon}>✅</div>
            <h2>Quiz đã được lưu thành công!</h2>
            <p>Quiz của bạn đã được tạo và lưu vào hệ thống.</p>
          </div>

          <div className={styles.modalContent}>
            {shareSuccess && (
              <div className={styles.shareSuccess}>
                🎉 Vào chơi
              </div>
            )}
            
            {shareError && (
              <div className={styles.shareError}>
                {shareError}
                {shareError.includes('đăng nhập') && (
                  <button 
                    className={styles.loginButton}
                    onClick={handleLoginRedirect}
                  >
                    Đăng nhập ngay
                  </button>
                )}
              </div>
            )}
          </div>

          <div className={styles.modalActions}>
            <button 
              className={styles.exitButton}
              onClick={handleExitWithoutRedirect}
            >
              Thoát
            </button>

            <button 
              className={styles.shareButton}
              onClick={handleShareQuiz}
              disabled={shareLoading}
            >
              {shareLoading ? 'Đang tạo link...' : '🔤 Vào chơi'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderInitialView = () => (
    <div className={`${styles.container} ${styles.matrixBackground}`}>
      <div className={styles.initialContent}>
        {/* AI Title */}
        <h1 className={styles.aiTitle}>A.I.</h1>
        <p className={styles.aiSubtitle}>Nhập chủ đề tạo bài kiểm tra</p>
        
        {/* Main content input */}
        <div className={styles.contentInput}>
          <input
            type="text"
            placeholder="Nhập chủ đề của bạn ở đây..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* 3 dropdowns ngang hàng như QuizGecko */}
        <div className={styles.dropdownRow}>
          <div className={styles.dropdown}>
            <select
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(e.target.value)}
              disabled={loading}
            >
              <option value="">8 câu</option>
              <option value="5">5 câu</option>
              <option value="8">8 câu</option>
              <option value="10">10 câu</option>
              <option value="15">15 câu</option>
            </select>
          </div>

          <div className={styles.dropdown}>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              disabled={loading}
            >
              <option value="Dễ">Dễ</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Khó">Khó</option>
            </select>
          </div>
        </div>

        {/* Generate button */}
        <button 
          className={styles.generateButton}
          onClick={handleGenerateQuiz}
          disabled={loading || !content.trim()}
        >
          {loading ? '🔄 Generating...' : '⚡ Generate AI quiz'}
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
        {/* ✨ Thêm phần này để show title, description, summary */}
        <div className={styles.quizInfo}>
          <h2>{generatedQuiz.title}</h2>
          {generatedQuiz.description && <p>{generatedQuiz.description}</p>}
          {generatedQuiz.summary && <p><i>{generatedQuiz.summary}</i></p>}
        </div>

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

  return (
    <>
      {generatedQuiz ? renderEditorView() : renderInitialView()}
      {renderSuccessModal()}
    </>
  );
};

export default GenQuiz;