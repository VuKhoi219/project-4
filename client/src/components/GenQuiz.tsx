import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../styles/GenQuiz.module.css';
import editStyles from '../styles/GenQuizEdit.module.css';

// Types
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

interface EditingState {
  questionIndex: number;
  isEditing: boolean;
}

const GenQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingState, setEditingState] = useState<EditingState>({ questionIndex: -1, isEditing: false });

  // Xử lý chỉnh sửa câu hỏi
  const handleEditQuestion = (questionIndex: number, newText: string) => {
    if (!generatedQuiz) return;
    
    const updatedQuiz = { ...generatedQuiz };
    updatedQuiz.questions[questionIndex].questionText = newText;
    setGeneratedQuiz(updatedQuiz);
  };

  // Xử lý chỉnh sửa đáp án
  const handleEditAnswer = (questionIndex: number, answerIndex: number, newText: string) => {
    if (!generatedQuiz) return;
    
    const updatedQuiz = { ...generatedQuiz };
    updatedQuiz.questions[questionIndex].answers[answerIndex].answerText = newText;
    setGeneratedQuiz(updatedQuiz);
  };

  // Xử lý thay đổi đáp án đúng cho MULTIPLE_CHOICE, SHORT_ANSWER, TRUE_FALSE
  const handleChangeCorrectAnswer = (questionIndex: number, answerIndex: number) => {
    if (!generatedQuiz) return;
    
    const updatedQuiz = { ...generatedQuiz };
    const question = updatedQuiz.questions[questionIndex];
    
    if (question.questionType === 'MULTIPLE_SELECT') {
      // Với MULTIPLE_SELECT, có thể có nhiều đáp án đúng
      updatedQuiz.questions[questionIndex].answers[answerIndex].isCorrect = 
        !updatedQuiz.questions[questionIndex].answers[answerIndex].isCorrect;
    } else {
      // Với các loại khác, chỉ có một đáp án đúng
      updatedQuiz.questions[questionIndex].answers = updatedQuiz.questions[questionIndex].answers.map((ans, idx) => ({
        ...ans,
        isCorrect: idx === answerIndex
      }));
    }
    setGeneratedQuiz(updatedQuiz);
  };

  // Hàm lấy tên loại câu hỏi
  const getQuestionTypeName = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return 'Trắc nghiệm (1 đáp án)';
      case 'MULTIPLE_SELECT':
        return 'Trắc nghiệm (nhiều đáp án)';
      case 'SHORT_ANSWER':
        return 'Câu trả lời ngắn';
      case 'TRUE_FALSE':
        return 'Đúng/Sai';
      default:
        return type;
    }
  };

  // Hàm lấy icon cho loại câu hỏi
  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return '🔘';
      case 'MULTIPLE_SELECT':
        return '☑️';
      case 'SHORT_ANSWER':
        return '✏️';
      case 'TRUE_FALSE':
        return '❓';
      default:
        return '📝';
    }
  };

  const handleGenerateQuiz = async () => {
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề cho bài quiz');
      return;
    }

    // Kiểm tra đăng nhập
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Bạn cần đăng nhập để tạo quiz!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:8080/api/quizzes/generate-ai', 
        {
          title: title.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setGeneratedQuiz(response.data.data);
        setError(null);
      } else {
        setError(response.data.error || 'Có lỗi xảy ra khi tạo quiz');
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Bạn không có quyền thực hiện hành động này hoặc phiên làm việc đã hết hạn');
      } else {
        setError(err.response?.data?.error || 'Có lỗi xảy ra khi kết nối với server');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuiz = async () => {
    if (!generatedQuiz) return;

    // Kiểm tra đăng nhập
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Bạn cần đăng nhập để lưu quiz!');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preserve all question attributes when saving
      const quizToSave = {
        title: generatedQuiz.title,
        questions: generatedQuiz.questions.map(q => ({
          ...q,
          questionType: q.questionType, // Ensure each question's type is preserved
          timeLimit: q.timeLimit || 30, // Set default time limit if not specified
          points: q.points || 1, // Ensure points are set
          answers: q.answers.map((a, index) => ({
            ...a,
            orderIndex: index // Ensure order index is set correctly
          }))
        }))
      };

      const response = await axios.post(
        'http://localhost:8080/api/quizzes/save-generated', 
        quizToSave,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
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
      if (err.response?.status === 403) {
        setError('Bạn không có quyền thực hiện hành động này hoặc phiên làm việc đã hết hạn');
      } else {
        setError(err.response?.data?.error || 'Có lỗi xảy ra khi kết nối với server');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setGeneratedQuiz(null);
    setTitle('');
    setError(null);
  };

  if (showSuccess) {
    return (
      <div className={styles.container}>
        <div className={`${styles.previewSection} ${styles.success}`}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.title}>Đã lưu Quiz thành công!</h2>
          <p>Đang chuyển đến trang chi tiết...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Tạo Quiz với AI</h1>
        <p className={styles.subtitle}>
          Nhập tiêu đề về chủ đề bạn muốn tạo quiz và để AI giúp bạn tạo các câu hỏi
        </p>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.form}>
        <input
          type="text"
          className={styles.input}
          placeholder="Ví dụ: Lịch sử Việt Nam thế kỷ 20"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
        />
        <button
          className={styles.button}
          onClick={handleGenerateQuiz}
          disabled={loading || !title.trim()}
        >
          {loading ? (
            <span className={styles.loadingDots}>Đang tạo</span>
          ) : (
            'Tạo Quiz'
          )}
        </button>
      </div>

      {generatedQuiz && (
        <div className={styles.previewSection}>
          <div className={styles.quizHeader}>
            <h2 className={styles.previewTitle}>
              Xem trước Quiz: {generatedQuiz.title}
            </h2>
            <div className={styles.quizStats}>
              <span className={styles.statItem}>
                📊 {generatedQuiz.questions.length} câu hỏi
              </span>
              <span className={styles.statItem}>
                ⭐ {generatedQuiz.questions.reduce((sum, q) => sum + q.points, 0)} điểm
              </span>
            </div>
          </div>
          
          <div>
            {generatedQuiz.questions.map((question, index) => (
              <div key={index} className={styles.questionCard}>
                {editingState.isEditing && editingState.questionIndex === index ? (
                  // Chế độ chỉnh sửa
                  <>
                    <div className={styles.questionEdit}>
                      <div className={styles.questionMeta}>
                        <span className={styles.questionType}>
                          {getQuestionTypeIcon(question.questionType)} {getQuestionTypeName(question.questionType)}
                        </span>
                        <div className={styles.questionInfo}>
                          <span className={styles.points}>⭐ {question.points} điểm</span>
                          {question.timeLimit && (
                            <span className={styles.timeLimit}>⏱️ {question.timeLimit}s</span>
                          )}
                        </div>
                      </div>
                      <textarea
                        value={question.questionText}
                        onChange={(e) => handleEditQuestion(index, e.target.value)}
                        className={styles.textareaInput}
                        placeholder="Nhập câu hỏi..."
                        rows={3}
                      />
                      {question.explanation && (
                        <div className={styles.explanation}>
                          <strong>Giải thích:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                    <div className={styles.answerList}>
                      {question.answers.map((answer, ansIndex) => (
                        <div key={ansIndex} className={styles.answerEdit}>
                          <input
                            type="text"
                            value={answer.answerText}
                            onChange={(e) => handleEditAnswer(index, ansIndex, e.target.value)}
                            className={styles.input}
                            placeholder={`Đáp án ${String.fromCharCode(65 + ansIndex)}...`}
                          />
                          <label className={styles.correctAnswerLabel}>
                            <input
                              type={question.questionType === 'MULTIPLE_SELECT' ? 'checkbox' : 'radio'}
                              checked={answer.isCorrect}
                              onChange={() => handleChangeCorrectAnswer(index, ansIndex)}
                              className={styles.radioInput}
                              name={`question-${index}`}
                            />
                            <span className={styles.radioLabel}>Đáp án đúng</span>
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className={styles.editActions}>
                      <button 
                        className={`${styles.button} ${styles.secondary}`}
                        onClick={() => setEditingState({ questionIndex: -1, isEditing: false })}
                      >
                        ✓ Xong
                      </button>
                    </div>
                  </>
                ) : (
                  // Chế độ xem
                  <>
                    <div className={styles.questionHeader}>
                      <div className={styles.questionMeta}>
                        <span className={styles.questionNumber}>Câu {index + 1}</span>
                        <span className={styles.questionType}>
                          {getQuestionTypeIcon(question.questionType)} {getQuestionTypeName(question.questionType)}
                        </span>
                        <div className={styles.questionInfo}>
                          <span className={styles.points}>⭐ {question.points} điểm</span>
                          {question.timeLimit && (
                            <span className={styles.timeLimit}>⏱️ {question.timeLimit}s</span>
                          )}
                        </div>
                      </div>
                      <button
                        className={`${styles.button} ${styles.small} ${styles.editButton}`}
                        onClick={() => setEditingState({ questionIndex: index, isEditing: true })}
                      >
                        ✏️ Sửa
                      </button>
                    </div>
                    
                    <div className={styles.questionContent}>
                      <div className={styles.questionText}>
                        {question.questionText}
                      </div>
                      
                      {question.explanation && (
                        <div className={styles.explanation}>
                          <strong>💡 Giải thích:</strong> {question.explanation}
                        </div>
                      )}
                      
                      <div className={styles.answerList}>
                        {question.answers.map((answer, ansIndex) => (
                          <div
                            key={ansIndex}
                            className={`${styles.answerItem} ${
                              answer.isCorrect ? styles.correct : ''
                            } ${styles[question.questionType.toLowerCase()]}`}
                          >
                            <span className={styles.answerPrefix}>
                              {question.questionType === 'TRUE_FALSE' 
                                ? (ansIndex === 0 ? '✓' : '✗')
                                : String.fromCharCode(65 + ansIndex)
                              }.
                            </span>
                            <span className={styles.answerText}>{answer.answerText}</span>
                            {answer.isCorrect && (
                              <span className={styles.correctMark}>
                                {question.questionType === 'MULTIPLE_SELECT' ? '☑️' : '✅'}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
            
            <div className={styles.buttonGroup}>
              <button
                className={`${styles.button} ${styles.secondary}`}
                onClick={handleReset}
                disabled={loading}
              >
                🔄 Tạo lại
              </button>
              <button
                className={`${styles.button} ${styles.primary}`}
                onClick={handleSaveQuiz}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.loadingDots}>Đang lưu</span>
                ) : (
                  '💾 Lưu Quiz'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenQuiz;