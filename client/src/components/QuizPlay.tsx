import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, set, get, update, db } from "../config/firebase";
import apiService from "../services/api";
import { ApiQuestion, QuestionType, ExtendedQuestion } from "../types";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  Container,
  CircularProgress,
  Alert,
  Stack,
  TextField,
  FormControlLabel,
  Checkbox,
  Fade,
  Divider,
} from '@mui/material';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Animations and Styled Components
const pulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0.7; }`;
const bounce = keyframes`0%, 20%, 53%, 80%, 100% { transform: translateY(0); } 40%, 43% { transform: translateY(-8px); } 70% { transform: translateY(-4px); }`;

// Styled Components
const BaseBox = styled(Box)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: white;
  transition: background 0.5s ease;
`;

const GetReadyBox = styled(BaseBox)`
  background: linear-gradient(135deg, #55b5f5 0%, #7c3aed 100%);
`;

const ShowAnswerBox = styled(BaseBox)`
  background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
`;

const LeaderboardBox = styled(BaseBox)`
  background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
`;

const PlayingBox = styled(BaseBox)`
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
  color: #1f2937;
`;

const WaitingForHostBox = styled(BaseBox)`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
`;

const AnimatedTitle = styled(Typography)`
  animation: ${pulse} 2s infinite;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const CountdownText = styled(Typography)`
  animation: ${pulse} 1s infinite;
  font-weight: 700;
  font-size: 4rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const GlassCard = styled(Card)`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const PlayerCard = styled(Card)<{ isCurrentPlayer?: boolean }>`
  background: ${props => (props.isCurrentPlayer ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 255, 255, 0.1)')};
  border: ${props => (props.isCurrentPlayer ? '2px solid #ffc107' : '1px solid rgba(255, 255, 255, 0.2)')};
  transform: ${props => (props.isCurrentPlayer ? 'scale(1.03)' : 'scale(1)')};
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.05);
  }
`;

const OptionButton = styled(Button)`
  border-radius: 8px;
  padding: 12px;
  text-transform: none;
  font-size: 1.1rem;
  justify-content: flex-start;
  transition: all 0.2s ease;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const AnswerResultCard = styled(Card)<{ isCorrect?: boolean }>`
  background: ${props => (props.isCorrect ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)')};
  border: 2px solid ${props => (props.isCorrect ? '#22c55e' : '#ef4444')};
  border-radius: 12px;
  margin-bottom: 16px;
`;

const HostControlButton = styled(Button)`
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  padding: 12px 24px;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
  animation: ${pulse} 2s infinite;
  &:hover {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    transform: scale(1.05);
  }
`;

// Score Calculation
const calculateScore = (timeLeft: number, maxTime: number, maxPoints: number = 1000): number => {
  if (timeLeft <= 0) return 0;
  const minScore = Math.floor(maxPoints * 0.1);
  const timeScore = Math.floor(maxPoints * (timeLeft / maxTime));
  return Math.max(minScore, timeScore);
};

const QuizPlay: React.FC = () => {
  const [questions, setQuestions] = useState<ExtendedQuestion[]>([]);
  const [participants, setParticipants] = useState<Record<string, any>>({});
  const [quizStatus, setQuizStatus] = useState<any>({});
  const [currentState, setCurrentState] = useState<any>({});
  const [roomInfo, setRoomInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string[]>([]);
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
    userAnswers: { answerText: string }[];
  } | null>(null);

  const prevQuestionIndexRef = useRef<number>(-1);

  const { quizId, roomId } = useParams<{ quizId: string; roomId: string }>();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "GuestUser";

  const gameState = currentState?.phase || 'get-ready';
  const currentQuestionIndex = currentState?.questionIndex || 0;
  const timeLeft = currentState?.timeLeft || 0;
  const waitingForHost = currentState?.waitingForHost || false;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Kiểm tra quyền chủ phòng
  const isHost = useMemo(() => {
    return roomInfo?.createdBy === userName || quizStatus.startedBy === userName;
  }, [roomInfo, quizStatus, userName]);

  const hostControlEnabled = useMemo(() => {
    return roomInfo?.hostControlEnabled || false;
  }, [roomInfo]);

  const [animatedTimeLeft, setAnimatedTimeLeft] = useState(timeLeft);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [displayLeaderboard, setDisplayLeaderboard] = useState<any[]>([]);

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

  // Load questions for the current page
  const loadQuestions = async (page: number) => {
    try {
      const response = await apiService.fetchQuestions(quizId!, page);
      if (response.success) {
        const questionsFromPage = response.data;
        const mappedQuestions: ExtendedQuestion[] = questionsFromPage.map((q: ApiQuestion) => ({
          id: q.questionId,
          text: q.questionText,
          options: q.answers?.map(a => a.answerText) || [],
          correctAnswer: q.correctAnswers?.[0]?.answerText || q.answers?.find(a => a.isCorrect)?.answerText || "",
          correctAnswers: q.correctAnswers?.map(a => a.answerText) || [],
          acceptedAnswers: q.acceptedAnswers || [],
          timeLimit: q.timeLimit || 15,
          type: q.questionType as QuestionType,
        }));
        setQuestions(prev => [...prev, ...mappedQuestions]);
        setPageSize(response.data.length || 10);
        setTotalQuestions(response.data.length || 0);
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

  useEffect(() => {
    if (!quizId || !roomId || !userName) {
      navigate('/');
      return;
    }

    // Lắng nghe thông tin phòng
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
          setHasAnswered(false);
          setSelectedAnswer([]);
          setIsCorrect(false);
          setEarnedPoints(0);
          setShortAnswer("");
          setAnswerResult(null);
          prevQuestionIndexRef.current = state.questionIndex;
          
          const requiredPage = Math.floor(state.questionIndex / pageSize);
          if (requiredPage >= currentPage && state.questionIndex < totalQuestions) {
            setCurrentPage(requiredPage);
          }
        }
        setCurrentState(state);
      }
      setLoading(false);
    });

    loadQuestions(0);
    return () => {
      unsubRoomInfo();
      unsubStatus();
      unsubParticipants();
      unsubCurrentState();
    };
  }, [quizId, roomId, userName, navigate]);

  // Xử lý timer logic với host control
  useEffect(() => {
    if (!isHost || !quizId || !roomId) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const currentStatePath = `quizzes/${quizId}/rooms/${roomId}/currentState`;
    const updatePhase = (phase: string, additionalData?: any) => 
      update(ref(db, currentStatePath), { phase, ...additionalData });

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
      // Chỉ tự động chuyển khi không bật host control
      timerRef.current = setTimeout(() => {
        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < totalQuestions) {
          update(ref(db, currentStatePath), { 
            questionIndex: nextQuestionIndex, 
            phase: 'get-ready',
            waitingForHost: false
          });
        } else {
          update(ref(db, `quizzes/${quizId}/rooms/${roomId}/status`), { 
            isCompleted: true, 
            completedAt: Date.now() 
          });
        }
      }, 8000);
    } else if (gameState === 'leaderboard' && hostControlEnabled && !waitingForHost) {
      // Khi bật host control, chuyển sang trạng thái chờ host sau 3 giây
      timerRef.current = setTimeout(() => {
        update(ref(db, currentStatePath), { waitingForHost: true });
      }, 3000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHost, gameState, quizId, roomId, currentQuestionIndex, totalQuestions, questions, hostControlEnabled, waitingForHost]);

  // Xử lý khi chủ phòng bấm next
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

  // Các useEffect khác giữ nguyên...
  useEffect(() => {
    if (!quizId || !roomId || !userName || !questions[currentQuestionIndex]) return;

    const currentQ = questions[currentQuestionIndex];
    const attemptRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/playHistory/${userName}/attempts/${currentQ.id}`);

    get(attemptRef).then(snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setHasAnswered(true);
        const parsedAnswer = typeof data.answer === "string" ? JSON.parse(data.answer) : data.answer;
        setSelectedAnswer(Array.isArray(parsedAnswer) ? parsedAnswer : [parsedAnswer]);
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
      loadQuestions(currentPage);
    }
  }, [currentPage]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft === 0 && !hasAnswered && questions[currentQuestionIndex]) {
      const currentQ = questions[currentQuestionIndex];
      if (currentQ.type === QuestionType.SHORT_ANSWER && shortAnswer.trim()) {
        console.log('Auto-submitting short answer due to timeout:', shortAnswer);
        handleAnswer(shortAnswer);
      } else if (currentQ.type === QuestionType.MULTIPLE_SELECT && selectedAnswer.length > 0) {
        console.log('Auto-submitting multiple select due to timeout:', selectedAnswer);
        handleAnswer(selectedAnswer);
      }
      else if (currentQ.type === QuestionType.MULTIPLE_CHOICE || currentQ.type === QuestionType.TRUE_FALSE) {
        console.log('Auto-submitting empty answer due to timeout');
        handleAnswer("");
      }
    }
  }, [timeLeft, gameState, hasAnswered, shortAnswer, selectedAnswer, currentQuestionIndex, questions]);

  const lockRef = useRef(false);

  const handleAnswer = async (answer: string | string[]) => {
    if (lockRef.current || hasAnswered || gameState !== 'playing' || !quizId || !roomId) return;
    lockRef.current = true;

    const currentQ = questions[currentQuestionIndex];
    let isCorrect = false;
    let points = 0;

    try {
      const answers = Array.isArray(answer)
        ? answer.map(a => ({ answerText: a }))
        : [{ answerText: answer }];

      const response = await apiService.checkAnswer(currentQ.id, answers);

      if (response.success) {
        isCorrect = response.data.correct;
        points = isCorrect ? calculateScore(timeLeft, currentQ.timeLimit || 30) : 0;

        setAnswerResult({
          correct: response.data.correct,
          correctAnswerText: response.data.correctAnswerText,
          userAnswers: response.data.answers
        });
      } else {
        throw new Error(response.error || 'Lỗi khi kiểm tra câu trả lời');
      }

      const newTotal = totalScore + points;
      setHasAnswered(true);
      setSelectedAnswer(Array.isArray(answer) ? answer : [answer]);
      setIsCorrect(isCorrect);
      setEarnedPoints(points);

      const participantRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/participants/${userName}`);
      await update(participantRef, { score: newTotal, lastAnswered: Date.now() });

      const leaderboardRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/leaderboard/${userName}`);
      await update(leaderboardRef, { bestScore: newTotal });

      const attemptRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/playHistory/${userName}/attempts/${currentQ.id}`);
      await set(attemptRef, { 
        questionId: currentQ.id, 
        answer: JSON.stringify(answer), 
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

  const handleMultipleSelect = (option: string) => {
    setSelectedAnswer(prev =>
      prev.includes(option) ? prev.filter(a => a !== option) : [...prev, option]
    );
  };

  const handleShortAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShortAnswer(e.target.value);
  };

  const submitShortAnswer = () => {
    if (shortAnswer.trim()) {
      handleAnswer(shortAnswer);
    }
  };

  useEffect(() => {
    lockRef.current = false;
  }, [currentQuestionIndex]);

  // Smooth animation for time left & score in playing state
  useEffect(() => {
    if (gameState === 'playing' && questions[currentQuestionIndex]) {
      const questionTime = (questions[currentQuestionIndex]?.timeLimit || 30) * 1000;
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const remainingMs = Math.max(0, questionTime - elapsed);
        setAnimatedTimeLeft(remainingMs / 1000);
        const score = (remainingMs / questionTime) * 1000;
        setAnimatedScore(Math.max(0, score));
        if (remainingMs > 0 && gameState === 'playing') {
          requestAnimationFrame(tick);
        }
      };
      requestAnimationFrame(tick);
    }
  }, [gameState, currentQuestionIndex, questions]);

  // Animate leaderboard scores
  useEffect(() => {
    if (gameState === 'leaderboard' && leaderboard.length > 0) {
      let frame = 0;
      const duration = 1500;
      const totalFrames = duration / 16;
      const interval = setInterval(() => {
        frame++;
        setDisplayLeaderboard(
          leaderboard.map((p) => ({
            ...p,
            score: Math.round((p.score * frame) / totalFrames),
          }))
        );
        if (frame >= totalFrames) {
          clearInterval(interval);
          setDisplayLeaderboard(leaderboard);
        }
      }, 16);
      return () => clearInterval(interval);
    }
  }, [gameState, leaderboard]);

  if (loading || !questions.length) {
    return (
      <BaseBox sx={{ background: '#1f2937' }}>
        <CircularProgress color="inherit" />
        <Typography mt={2}>Đang tải...</Typography>
      </BaseBox>
    );
  }

  if (error) {
    return (
      <BaseBox sx={{ background: '#1f2937' }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={() => navigate(`/quiz/${quizId}/join`)} sx={{ mt: 2 }}>
          Quay lại
        </Button>
      </BaseBox>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  if (!currentQ) {
    return (
      <PlayingBox>
        <Typography variant="h5">Chờ câu hỏi tiếp theo...</Typography>
      </PlayingBox>
    );
  }

  // Hiển thị màn hình chờ host khi bật host control
  if (gameState === 'leaderboard' && hostControlEnabled && waitingForHost) {
    return (
      <WaitingForHostBox>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Fade in={true} timeout={1000}>
            <div>
              <AnimatedTitle variant="h2" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, mb: 3 }}>
                ⏳ Chờ chủ phòng
              </AnimatedTitle>
              <Typography variant="h5" mb={4}>
                {isHost ? 'Bạn là chủ phòng, hãy bấm để tiếp tục!' : 'Đang chờ chủ phòng chuyển câu hỏi tiếp theo...'}
              </Typography>
              
              {isHost && (
                <HostControlButton
                  onClick={handleHostNextQuestion}
                  startIcon={<ArrowForwardIcon />}
                  size="large"
                >
                  {currentQuestionIndex + 1 < totalQuestions ? 'Câu tiếp theo' : 'Kết thúc quiz'}
                </HostControlButton>
              )}
              
              {!isHost && (
                <GlassCard sx={{ p: 3, display: 'inline-block' }}>
                  <Typography variant="h6">
                    Chủ phòng: <strong>{roomInfo?.createdBy || 'Unknown'}</strong>
                  </Typography>
                  <Typography variant="body1" color="rgba(255,255,255,0.8)">
                    Đang chuẩn bị câu hỏi tiếp theo...
                  </Typography>
                </GlassCard>
              )}
            </div>
          </Fade>
        </Container>
      </WaitingForHostBox>
    );
  }

  switch (gameState) {
    case 'get-ready':
      return (
        <GetReadyBox>
          <Container maxWidth="md" sx={{ textAlign: 'center' }}>
            <Fade in={true} timeout={1000}>
              <AnimatedTitle variant="h1" sx={{ fontSize: { xs: '3rem', md: '5rem' } }}>
                Sẵn sàng!
              </AnimatedTitle>
            </Fade>
            <Typography variant="h4" mt={2}>
              Câu hỏi {currentQuestionIndex + 1} sắp bắt đầu...
            </Typography>
          </Container>
        </GetReadyBox>
      );

    case 'show-answer':
      return (
        <ShowAnswerBox>
          <Container maxWidth="md" sx={{ textAlign: 'center' }}>
            <Fade in={true} timeout={500}>
              <Typography variant="h3" fontWeight="bold" mb={4}>
                Kết quả câu trả lời
              </Typography>
            </Fade>
            
            <GlassCard sx={{ mb: 4, width: '100%' }}>
              <CardContent>
                <Typography variant="h5" mb={3}>
                  {currentQ.text}
                </Typography>
                
                <Box bgcolor="rgba(34, 197, 94, 0.8)" p={2} borderRadius={8} mb={2}>
                  <Typography variant="h6" fontWeight="bold" mb={1}>
                    ✅ Đáp án đúng
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {answerResult?.correctAnswerText || 
                     (currentQ.type === QuestionType.MULTIPLE_SELECT ? currentQ.correctAnswers?.join(", ") : currentQ.correctAnswer)}
                  </Typography>
                </Box>

                {hasAnswered && answerResult && !answerResult.correct && (
                  <>
                    <Divider sx={{ my: 2, bgcolor: 'rgba(255, 255, 255, 0.3)' }} />
                    <Box bgcolor="rgba(239, 68, 68, 0.8)" p={2} borderRadius={8}>
                      <Typography variant="h6" fontWeight="bold" mb={1}>
                        ❌ Câu trả lời của bạn
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {answerResult.userAnswers.length > 0 
                          ? answerResult.userAnswers.map(answer => answer.answerText).join(", ")
                          : "Không có câu trả lời"
                        }
                      </Typography>
                    </Box>
                  </>
                )}

                {currentQ.type === QuestionType.SHORT_ANSWER && (currentQ.acceptedAnswers ?? []).length > 0 && (
                  <Typography variant="body1" mt={2} sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Các đáp án được chấp nhận: {(currentQ.acceptedAnswers ?? []).join(", ")}
                  </Typography>
                )}
              </CardContent>
            </GlassCard>

            {hasAnswered && (
              <Fade in={true} timeout={1000}>
                <AnswerResultCard isCorrect={isCorrect}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
                      <Typography variant="h5" fontWeight="bold">
                        {isCorrect ? '🎉 Chính xác!' : '😔 Sai rồi!'}
                      </Typography>
                      {isCorrect && (
                        <Chip 
                          label={`+${earnedPoints} điểm`} 
                          color="success" 
                          sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                        />
                      )}
                    </Stack>
                  </CardContent>
                </AnswerResultCard>
              </Fade>
            )}

            {!hasAnswered && (
              <Fade in={true} timeout={1000}>
                <Alert severity="info" sx={{ color: 'white', bgcolor: 'info.main' }}>
                  Bạn chưa trả lời câu hỏi này
                </Alert>
              </Fade>
            )}
          </Container>
        </ShowAnswerBox>
      );

    case 'leaderboard':
      return (
        <LeaderboardBox>
          <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
            <Typography variant="h3" fontWeight="bold" mb={4}>
              🏆 Bảng Xếp Hạng 🏆
            </Typography>

            <Stack spacing={1} maxWidth={600} mx="auto">
              {(displayLeaderboard.length > 0 ? displayLeaderboard : leaderboard).slice(0, 5).map((p, i) => {
                const medals = ['🥇', '🥈', '🥉'];
                const medal = i < 3 ? medals[i] : `${i + 1}`;

                return (
                  <Fade in={true} timeout={500 + i * 200} key={p.name}>
                    <PlayerCard isCurrentPlayer={p.isCurrentPlayer}>
                      <CardContent sx={{ p: 1.5 }}>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            src={p.avatar || undefined}
                            sx={{
                              width: 56,
                              height: 56,
                              bgcolor: p.avatar ? 'transparent' : '#fff',
                              color: p.avatar ? 'inherit' : '#000',
                              fontWeight: 'bold',
                              border: '2px solid white'
                            }}
                          >
                            {!p.avatar && p.name.charAt(0).toUpperCase()}
                          </Avatar>

                          <Box flexGrow={1} textAlign="left">
                            <Typography variant="h6" fontWeight="bold">
                              {medal} {p.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {p.score} điểm
                            </Typography>
                          </Box>

                          <Typography variant="h5" fontWeight="bold" color="secondary">
                            {p.score}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </PlayerCard>
                  </Fade>
                );
              })}
            </Stack>

            {/* Hiển thị thông báo cho host control */}
            {hostControlEnabled && !waitingForHost && (
              <Fade in={true} timeout={2000}>
                <Box mt={4}>
                  <Typography variant="h6" color="rgba(255,255,255,0.9)">
                    {isHost ? 
                      "Bạn sẽ có thể chuyển câu tiếp theo trong giây lát..." : 
                      `Chờ chủ phòng ${roomInfo?.createdBy} chuyển câu tiếp theo...`
                    }
                  </Typography>
                </Box>
              </Fade>
            )}
          </Container>
        </LeaderboardBox>
      );

    case 'playing':
    default:
      return (
        <PlayingBox>
          <Container maxWidth="lg">
            <GlassCard sx={{ mb: 3, textAlign: 'center' }}>
              <CardContent>
                <Chip
                  label={`Câu ${currentQuestionIndex + 1}/${totalQuestions}`}
                  color="primary"
                  sx={{ mb: 2, fontWeight: 'bold' }}
                />
                <Typography variant="h4" my={2} fontWeight={500}>
                  {currentQ.text}
                </Typography>
              </CardContent>
            </GlassCard>
            
            <Box mb={3} textAlign="center">
              <CountdownText
                variant="h3"
                color={timeLeft <= 5 ? 'error.main' : 'primary.main'}
              >
                {animatedTimeLeft.toFixed(2)}s
              </CountdownText>
              <LinearProgress
                variant="determinate"
                value={(animatedTimeLeft / (currentQ.timeLimit || 30)) * 100}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: timeLeft <= 5 ? '#ef4444' : '#3b82f6',
                  },
                }}
              />
              <Typography mt={1} variant="h6" color="secondary">
                Điểm hiện tại: {Math.round(animatedScore)}
              </Typography>
            </Box>

            {currentQ.type === QuestionType.MULTIPLE_CHOICE && (
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                {currentQ.options.map((option, index) => {
                  const isDisabled = hasAnswered;
                  let variant: 'contained' | 'outlined' = 'outlined';
                  let color: 'success' | 'error' | 'primary' = 'primary';
                  if (isDisabled) {
                    if (option === currentQ.correctAnswer) {
                      variant = 'contained';
                      color = 'success';
                    } else if (selectedAnswer.includes(option)) {
                      variant = 'contained';
                      color = 'error';
                    }
                  }
                  return (
                    <OptionButton
                      key={index}
                      variant={variant}
                      color={color}
                      disabled={isDisabled && option !== currentQ.correctAnswer && !selectedAnswer.includes(option)}
                      onClick={() => handleAnswer(option)}
                      sx={{ bgcolor: variant === 'contained' ? undefined : 'rgba(255, 255, 255, 0.9)' }}
                    >
                      <Chip label={String.fromCharCode(65 + index)} sx={{ mr: 2, bgcolor: '#e0e7ff' }} />
                      {option}
                    </OptionButton>
                  );
                })}
              </Box>
            )}
            
            {currentQ.type === QuestionType.MULTIPLE_SELECT && (
              <Box>
                <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                  {currentQ.options.map((option, index) => {
                    const isDisabled = hasAnswered;
                    let color: 'success' | 'error' | 'default' = 'default';
                    if (isDisabled) {
                      if (currentQ.correctAnswers?.includes(option)) {
                        color = 'success';
                      } else if (selectedAnswer.includes(option)) {
                        color = 'error';
                      }
                    }
                    return (
                      <FormControlLabel
                        key={index}
                        control={
                          <Checkbox
                            checked={selectedAnswer.includes(option)}
                            onChange={() => handleMultipleSelect(option)}
                            disabled={isDisabled}
                            sx={{
                              color: color === 'success' ? 'success.main' : color === 'error' ? 'error.main' : undefined,
                            }}
                          />
                        }
                        label={
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Chip label={String.fromCharCode(65 + index)} sx={{ bgcolor: '#e0e7ff' }} />
                            <Typography>{option}</Typography>
                          </Stack>
                        }
                        sx={{
                          bgcolor: isDisabled && color !== 'default' ? `${color}.light` : 'rgba(255, 255, 255, 0.9)',
                          p: 1,
                          borderRadius: 2,
                        }}
                      />
                    );
                  })}
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleAnswer(selectedAnswer)}
                  disabled={hasAnswered || selectedAnswer.length === 0}
                  sx={{ mt: 2, borderRadius: 8, px: 4 }}
                >
                  Gửi câu trả lời
                </Button>
              </Box>
            )}
            
            {currentQ.type === QuestionType.TRUE_FALSE && (
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2}>
                {['Đúng', 'Sai'].map((option, index) => {
                  const isDisabled = hasAnswered;
                  let variant: 'contained' | 'outlined' = 'outlined';
                  let color: 'success' | 'error' | 'primary' = 'primary';
                  if (isDisabled) {
                    if (option === currentQ.correctAnswer) {
                      variant = 'contained';
                      color = 'success';
                    } else if (selectedAnswer.includes(option)) {
                      variant = 'contained';
                      color = 'error';
                    }
                  }
                  return (
                    <OptionButton
                      key={index}
                      variant={variant}
                      color={color}
                      disabled={isDisabled && option !== currentQ.correctAnswer && !selectedAnswer.includes(option)}
                      onClick={() => handleAnswer(option)}
                      sx={{ bgcolor: variant === 'contained' ? undefined : 'rgba(255, 255, 255, 0.9)' }}
                    >
                      <Chip label={String.fromCharCode(65 + index)} sx={{ mr: 2, bgcolor: '#e0e7ff' }} />
                      {option}
                    </OptionButton>
                  );
                })}
              </Box>
            )}
            
            {currentQ.type === QuestionType.SHORT_ANSWER && (
              <Box>
                <TextField
                  fullWidth
                  value={shortAnswer}
                  onChange={handleShortAnswerChange}
                  placeholder="Nhập câu trả lời của bạn"
                  disabled={hasAnswered}
                  sx={{
                    mb: 2,
                    '& .MuiInputBase-root': { borderRadius: 8 },
                    '& .MuiInputBase-input': { bgcolor: 'white', borderRadius: 8 },
                  }}
                  variant="outlined"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={submitShortAnswer}
                  disabled={hasAnswered || !shortAnswer.trim()}
                  sx={{ borderRadius: 8, px: 4 }}
                >
                  Gửi câu trả lời
                </Button>
              </Box>
            )}
          </Container>
        </PlayingBox>
      );
  }
};

export default QuizPlay;