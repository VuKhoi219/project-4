import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, set, get, update, db } from "../config/firebase";
import apiService from "../services/api";
import { ApiQuestion, QuestionType, ExtendedQuestion, ApiAnswer, AnswerOption, UserAnswerPayload } from "../types"; // Import AnswerOption và UserAnswerPayload
import { calculateScore } from "../utils/quizUtils";

export const useQuizLogic = () => {
  const [questions, setQuestions] = useState<ExtendedQuestion[]>([]);
  const [participants, setParticipants] = useState<Record<string, any>>({});
  const [quizStatus, setQuizStatus] = useState<any>({});
  const [currentState, setCurrentState] = useState<any>({});
  const [roomInfo, setRoomInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerOption[]>([]); // Thay đổi kiểu dữ liệu ở đây
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [shortAnswer, setShortAnswer] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [answerResult, setAnswerResult] = useState<{
    correct: boolean;
    correctAnswerText: string;
    userAnswers: { answerText: string }[]; // Cái này có thể cần được cập nhật nếu backend trả về cả ID
  } | null>(null);

  const prevQuestionIndexRef = useRef<number>(-1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lockRef = useRef(false);

  const { quizId, roomId } = useParams<{ quizId: string; roomId: string }>();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "GuestUser";

  const gameState = currentState?.phase || 'get-ready';
  const currentQuestionIndex = currentState?.questionIndex || 0;
  const timeLeft = currentState?.timeLeft || 0;
  const waitingForHost = currentState?.waitingForHost || false;

  // Kiểm tra quyền chủ phòng
  const isHost = useMemo(() => {
    return roomInfo?.createdBy === userName || quizStatus.startedBy === userName;
  }, [roomInfo, quizStatus, userName]);

  const hostControlEnabled = useMemo(() => {
    return roomInfo?.hostControlEnabled || false;
  }, [roomInfo]);

  const leaderboard = useMemo(() => {
    if (!participants) return [];
    return Object.entries(participants)
      .map(([name, data]) => ({
        name: data.displayName || name,
        avatar: data.avatar || "",
        score: data.score || 0,
        isCurrentPlayer: name === userName,
      }))
      .sort((a, b) => b.score - a.score);
  }, [participants, userName]);

  // Load questions for the current page - FIXED VERSION
  const loadQuestions = async (page: number) => {
    try {
      const response = await apiService.fetchQuestions(quizId!, page);
      console.log('API Response:', response);
      
      if (response.success) {
        const questionsFromPage = response.data; // Array of questions
        console.log('Questions from page:', questionsFromPage);
        console.log('Questions length:', questionsFromPage.length);
        
        const mappedQuestions: ExtendedQuestion[] = questionsFromPage.map((q: ApiQuestion) => ({
          id: q.questionId,
          text: q.questionText,
          options: q.answers?.map(a => ({ id: a.id, answerText: a.answerText })) || [],
          correctAnswer: q.correctAnswers?.[0]?.answerText || q.answers?.find(a => a.isCorrect)?.answerText || "",
          correctAnswers: q.correctAnswers?.map(a => ({ id: a.id, answerText: a.answerText })) || [],
          acceptedAnswers: q.acceptedAnswers || [],
          timeLimit: q.timeLimit || 15,
          type: q.questionType as QuestionType,
        }));
        
        setQuestions(prev => [...prev, ...mappedQuestions]);
        
        // ✅ FIX: Sử dụng length của data thay vì totalElements
        const currentTotalQuestions = page === 0 
          ? questionsFromPage.length  // Trang đầu tiên, set total = length
          : totalQuestions; // Trang sau, giữ nguyên total đã có
        
        // ✅ Chỉ update totalQuestions khi tải trang đầu tiên
        if (page === 0) {
          console.log('Setting totalQuestions to:', questionsFromPage.length);
          setTotalQuestions(questionsFromPage.length);
        }
        
        // ✅ Update pageSize (có thể cần cho logic phân trang sau này)
        setPageSize(questionsFromPage.length);
        
        console.log('Updated state:', {
          questionsLength: questionsFromPage.length,
          totalQuestions: currentTotalQuestions,
          pageSize: questionsFromPage.length
        });
        
        setError(null);
        return true;
      } else {
        throw new Error(response.error || 'Không thể lấy danh sách câu hỏi');
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError('Không thể tải câu hỏi. Vui lòng thử lại.');
      return false;
    }
  };
  // Handle answer submission
  const handleAnswer = async (answer: AnswerOption | AnswerOption[] | string, pointsOverride?: number) => { // Cập nhật kiểu đầu vào
    if (lockRef.current || hasAnswered || gameState !== 'playing' || !quizId || !roomId) return;
    lockRef.current = true;

    const currentQ = questions[currentQuestionIndex];
    let isCorrect = false;
    let points = 0;

    try {
      let answersToSend: UserAnswerPayload[];

      if (typeof answer === 'string') { // Xử lý Short Answer
        answersToSend = [{ answerId: 0, answerText: answer }]; // ID 0 hoặc ID placeholder cho short answer
      } else if (Array.isArray(answer)) { // Xử lý Multiple Select
        answersToSend = answer.map(a => ({ answerId: a.id, answerText: a.answerText }));
      } else { // Xử lý Multiple Choice / True False
        answersToSend = [{ answerId: answer.id, answerText: answer.answerText }];
      }

      const response = await apiService.checkAnswer(currentQ.id, answersToSend);

      if (response.success) {
        isCorrect = response.data.correct;
        // ⚡ ưu tiên dùng pointsOverride (frozenScore) nếu có
        points = isCorrect 
          ? (pointsOverride ?? calculateScore(timeLeft, currentQ.timeLimit || 30)) 
          : 0;

        setAnswerResult({
          correct: response.data.correct,
          correctAnswerText: response.data.correctAnswerText,
          userAnswers: response.data.answers?.map((a: any) => ({
            answerText: a.answerText
          })) ?? []
        });
      } else {
        throw new Error(response.error || 'Lỗi khi kiểm tra câu trả lời');
      }

      const newTotal = totalScore + points;
      setHasAnswered(true);
      // Cập nhật selectedAnswer để lưu trữ AnswerOption[]
      if (typeof answer === 'string') {
        setSelectedAnswer([{ id: 0, answerText: answer }]);
      } else if (Array.isArray(answer)) {
        setSelectedAnswer(answer);
      } else {
        setSelectedAnswer([answer]);
      }
      
      setIsCorrect(isCorrect);
      setEarnedPoints(points);

      const participantRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/participants/${userName}`);
      await update(participantRef, { score: newTotal, lastAnswered: Date.now() });

      const leaderboardRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/leaderboard/${userName}`);
      await update(leaderboardRef, { bestScore: newTotal });

      const attemptRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/playHistory/${userName}/attempts/${currentQ.id}`);
      await set(attemptRef, { 
        questionId: currentQ.id, 
        answer: JSON.stringify(answersToSend), // Lưu đáp án đã gửi
        isCorrect, 
        score: points, 
        timeLeft, 
        playedAt: Date.now(),
        answerResult: response.data
      });
    } catch (error) {
      console.error("Error checking answer:", error);
      setError('Lỗi khi kiểm tra câu trả lời. Vui lòng thử lại.');
    }
    lockRef.current = false;
  };


  // Handle multiple select
  const handleMultipleSelect = (option: AnswerOption) => { // Cập nhật kiểu đầu vào
    setSelectedAnswer(prev =>
      prev.some(a => a.id === option.id) // Kiểm tra bằng ID
        ? prev.filter(a => a.id !== option.id) 
        : [...prev, option]
    );
  };

  // Handle short answer
  const handleShortAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShortAnswer(e.target.value);
  };

  const submitShortAnswer = () => {
    if (shortAnswer.trim()) {
      handleAnswer(shortAnswer); // Vẫn truyền string, logic sẽ xử lý
    }
  };

  // Handle host next question
  const handleHostNextQuestion = async () => {
    if (!isHost || !quizId || !roomId) return;

    const nextQuestionIndex = currentQuestionIndex + 1;
    const currentStatePath = `quizzes/${quizId}/rooms/${roomId}/currentState`;

    if (nextQuestionIndex < totalQuestions) {
      await update(ref(db, currentStatePath), { 
        questionIndex: nextQuestionIndex, 
        phase: 'get-ready',
        waitingForHost: false
      });
    } else {
      await update(ref(db, `quizzes/${quizId}/rooms/${roomId}/status`), { 
        isCompleted: true, 
        completedAt: Date.now() 
      });
    }
  };

  // Firebase listeners setup
  useEffect(() => {
    if (!quizId || !roomId || !userName) {
      navigate('/');
      return;
    }

    // Listen to room info
    const roomInfoRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/info`);
    const unsubRoomInfo = onValue(roomInfoRef, (snapshot) => {
      const info = snapshot.val();
      if (info) {
        setRoomInfo(info);
      }
    });

    const statusRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/status`);
    const unsubStatus = onValue(statusRef, (snapshot) => {
      const status = snapshot.val();
      if (!status) {
        navigate(`/quiz/${quizId}/join`);
        return;
      }
      setQuizStatus(status);
      if (status.isCompleted) navigate(`/quiz/${quizId}/room/${roomId}/final-results`);
    });

    const participantsRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/participants`);
    const unsubParticipants = onValue(participantsRef, (snapshot) => {
      setParticipants(snapshot.val() || {});
      const myData = snapshot.val()?.[userName];
      if (myData) setTotalScore(myData.score || 0);
    });

    const currentStateRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/currentState`);
    const unsubCurrentState = onValue(currentStateRef, (snapshot) => {
      const state = snapshot.val();
      if (state) {
        if (state.questionIndex !== prevQuestionIndexRef.current) {
          console.log('Question changed from', prevQuestionIndexRef.current, 'to', state.questionIndex);
          
          // Reset state cho câu hỏi mới
          setHasAnswered(false);
          setSelectedAnswer([]);
          setIsCorrect(false);
          setEarnedPoints(0);
          setShortAnswer("");
          setAnswerResult(null);
          prevQuestionIndexRef.current = state.questionIndex;
          
          // ✅ Kiểm tra và tải câu hỏi nếu cần
          const requiredPage = Math.floor(state.questionIndex / pageSize);
          const currentPageFromQuestions = Math.floor((questions.length - 1) / pageSize);
          
          console.log('Page check:', {
            questionIndex: state.questionIndex,
            requiredPage,
            currentPageFromQuestions,
            questionsLength: questions.length,
            pageSize,
            totalQuestions
          });
          
          // Chỉ tải trang mới khi thực sự cần
          if (requiredPage > currentPageFromQuestions && state.questionIndex < totalQuestions) {
            console.log('Loading new page:', requiredPage);
            setCurrentPage(requiredPage);
          }
        }
        setCurrentState(state);
      }
      setLoading(false);
    });

    // Tải trang đầu tiên
    loadQuestions(0);
    
    return () => {
      unsubRoomInfo();
      unsubStatus();
      unsubParticipants();
      unsubCurrentState();
    };
  }, [quizId, roomId, userName, navigate]); // ✅ Bỏ pageSize và totalQuestions khỏi dependency

  // Timer logic for host
  useEffect(() => {
    if (!isHost || !quizId || !roomId) return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    const currentStatePath = `quizzes/${quizId}/rooms/${roomId}/currentState`;
    const updatePhase = (phase: string, additionalData?: any) => 
      update(ref(db, currentStatePath), { phase, ...additionalData });

    console.log('Timer effect triggered:', {
      gameState,
      currentQuestionIndex,
      totalQuestions,
      questionsLength: questions.length,
      hostControlEnabled,
      waitingForHost
    });

    if (gameState === 'get-ready') {
      timerRef.current = setTimeout(
        () => update(ref(db, currentStatePath), { 
          phase: 'playing', 
          timeLeft: questions[currentQuestionIndex]?.timeLimit || 30 
        }),
        3000
      );
    } else if (gameState === 'playing') {
      timerRef.current = setInterval(async () => {
        const timeSnapshot = await get(ref(db, `${currentStatePath}/timeLeft`));
        const newTime = (timeSnapshot.val() || 0) - 1;
        if (newTime >= 0) set(ref(db, `${currentStatePath}/timeLeft`), newTime);
        else {
          clearInterval(timerRef.current!);
          updatePhase('show-answer');
        }
      }, 1000);
    } else if (gameState === 'show-answer') {
      timerRef.current = setTimeout(() => updatePhase('leaderboard'), 5000);
    } else if (gameState === 'leaderboard' && !hostControlEnabled) {
      timerRef.current = setTimeout(() => {
        const nextQuestionIndex = currentQuestionIndex + 1;
        
        console.log('Auto next question check:', {
          currentIndex: currentQuestionIndex,
          nextIndex: nextQuestionIndex,
          totalQuestions,
          questionsLength: questions.length
        });
        
        // ✅ Kiểm tra cả totalQuestions và questions array
        if (nextQuestionIndex < totalQuestions && questions[nextQuestionIndex]) {
          console.log('Moving to next question automatically');
          update(ref(db, currentStatePath), { 
            questionIndex: nextQuestionIndex, 
            phase: 'get-ready',
            waitingForHost: false
          });
        } else if (nextQuestionIndex < totalQuestions && !questions[nextQuestionIndex]) {
          console.log('Next question not loaded yet, waiting...');
          // Không làm gì, để listener tải câu hỏi mới
        } else {
          console.log('Quiz completed - no more questions');
          update(ref(db, `quizzes/${quizId}/rooms/${roomId}/status`), { 
            isCompleted: true, 
            completedAt: Date.now() 
          });
        }
      }, 8000);
    } else if (gameState === 'leaderboard' && hostControlEnabled && !waitingForHost) {
      timerRef.current = setTimeout(() => {
        update(ref(db, currentStatePath), { waitingForHost: true });
      }, 3000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHost, gameState, quizId, roomId, currentQuestionIndex, totalQuestions, questions, hostControlEnabled, waitingForHost]);

  // Other useEffects
  useEffect(() => {
    if (!quizId || !roomId || !userName || !questions[currentQuestionIndex]) return;

    const currentQ = questions[currentQuestionIndex];
    const attemptRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/playHistory/${userName}/attempts/${currentQ.id}`);

    get(attemptRef).then(snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setHasAnswered(true);
        const parsedAnswer = typeof data.answer === "string" ? JSON.parse(data.answer) : data.answer;
        setSelectedAnswer(Array.isArray(parsedAnswer) ? parsedAnswer : [{ id: 0, answerText: parsedAnswer as string }]);
        setIsCorrect(data.isCorrect);
        setEarnedPoints(data.score);
        setAnswerResult(data.answerResult || null);
      } else {
        setHasAnswered(false);
        setSelectedAnswer([]);
        setIsCorrect(false);
        setEarnedPoints(0);
        setAnswerResult(null);
      }
    });
  }, [quizId, roomId, userName, currentQuestionIndex, questions]);

  useEffect(() => {
    if (currentPage > 0) {
      console.log('Loading questions for page:', currentPage);
      loadQuestions(currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 0 && !hasAnswered && questions[currentQuestionIndex]) {
      const currentQ = questions[currentQuestionIndex];
      console.log('Auto-submit triggered for question type:', currentQ.type);
      
      if (currentQ.type === QuestionType.SHORT_ANSWER && shortAnswer.trim()) {
        console.log('Auto-submitting short answer due to timeout:', shortAnswer);
        handleAnswer(shortAnswer);
      } else if (currentQ.type === QuestionType.MULTIPLE_SELECT && selectedAnswer.length > 0) {
        console.log('Auto-submitting multiple select due to timeout:', selectedAnswer);
        handleAnswer(selectedAnswer);
      } else {
        console.log('Auto-submitting empty answer due to timeout');
        // Gửi đáp án trống với format phù hợp
        handleAnswer({ id: 0, answerText: "" });
      }
    }
  }, [timeLeft, gameState, hasAnswered, shortAnswer, selectedAnswer, currentQuestionIndex, questions]);

  useEffect(() => {
    lockRef.current = false;
  }, [currentQuestionIndex]);

  return {
    // State
    questions,
    participants,
    quizStatus,
    currentState,
    roomInfo,
    loading,
    totalScore,
    hasAnswered,
    selectedAnswer, // Vẫn là AnswerOption[]
    isCorrect,
    earnedPoints,
    shortAnswer,
    error,
    answerResult,
    
    // Computed values
    gameState,
    currentQuestionIndex,
    timeLeft,
    waitingForHost,
    isHost,
    hostControlEnabled,
    leaderboard,
    totalQuestions,
    
    // Actions
    handleAnswer,
    handleMultipleSelect,
    handleShortAnswerChange,
    submitShortAnswer,
    handleHostNextQuestion,
  };
};