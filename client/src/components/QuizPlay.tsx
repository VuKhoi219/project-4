import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, set, get, update, db } from "../config/firebase";
import { Question } from "../types";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  Paper,
  Container,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Badge
} from '@mui/material';
import  styled  from '@emotion/styled';
import { keyframes } from '@emotion/react';

// Animations
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
  40%, 43% { transform: translateY(-10px); }
  70% { transform: translateY(-5px); }
  90% { transform: translateY(-2px); }
`;

const scaleIn = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

// Styled Components
const GradientBox = styled(Box)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const GetReadyBox = styled(Box)`
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: white;
`;

const ShowAnswerBox = styled(Box)`
  background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: white;
`;

const LeaderboardBox = styled(Box)`
  background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: white;
`;

const PlayingBox = styled(Box)`
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const AnimatedTitle = styled(Typography)`
  animation: ${pulse} 2s infinite;
  font-weight: bold;
`;

const CountdownText = styled(Typography)`
  animation: ${pulse} 1s infinite;
  font-weight: bold;
  font-size: 4rem;
`;

const BounceIcon = styled(Typography)`
  animation: ${bounce} 2s infinite;
  display: inline-block;
`;

const ScaleCard = styled(Card)`
  animation: ${scaleIn} 0.3s ease-out;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.02);
  }
`;

const GlassCard = styled(Card)`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
`;

const PlayerCard = styled(Card)<{ isCurrentPlayer?: boolean }>`
  ${props => props.isCurrentPlayer && `
    background: rgba(255, 193, 7, 0.3);
    border: 2px solid #ffc107;
    transform: scale(1.05);
  `}
  transition: all 0.3s ease;
`;

// Mock API - sẽ thay thế bằng API thật
const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    correctAnswer: "Paris",
    timeLimit: 10
  },
  {
    id: 2,
    text: "Which planet is known as the Red Planet?",
    options: ["Mars", "Jupiter", "Venus", "Mercury"],
    correctAnswer: "Mars",
    timeLimit: 10
  },
  {
    id: 3,
    text: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4",
    timeLimit: 15
  },
  {
    id: 4,
    text: "Who painted the Mona Lisa?",
    options: ["Leonardo da Vinci", "Pablo Picasso", "Vincent van Gogh", "Michelangelo"],
    correctAnswer: "Leonardo da Vinci",
    timeLimit: 11
  },
  {
    id: 5,
    text: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correctAnswer: "Pacific Ocean",
    timeLimit: 5
  }
];

// Hàm tính điểm theo thời gian (điểm giảm dần)
const calculateScore = (timeLeft: number, maxTime: number, maxPoints: number = 100): number => {
  if (timeLeft <= 0) return 0;
  // Điểm = maxPoints * (timeLeft / maxTime)
  // Đảm bảo ít nhất 10% điểm nếu trả lời đúng
  const minScore = Math.floor(maxPoints * 0.1);
  const timeScore = Math.floor(maxPoints * (timeLeft / maxTime));
  return Math.max(minScore, timeScore);
};

const QuizPlay: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  
  // Game states: get-ready, playing, show-answer, leaderboard, final-results
  const [gameState, setGameState] = useState<'get-ready' | 'playing' | 'show-answer' | 'leaderboard' | 'final-results'>('get-ready');
  const [participants, setParticipants] = useState<Record<string, any>>({});
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [quizStatus, setQuizStatus] = useState<any>({});
  const [leaderboardCountdown, setLeaderboardCountdown] = useState<number>(5);
  const [showAnswerCountdown, setShowAnswerCountdown] = useState<number>(3);

  // Sử dụng useRef để tránh stale closure
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameStateRef = useRef(gameState);
  const timeLeftRef = useRef(timeLeft);
  const currentQuestionRef = useRef(currentQuestion);

  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "TestUser";

  const isHost = useMemo(() => {
    return quizStatus.createdBy === userName || quizStatus.startedBy === userName;
  }, [quizStatus, userName]);

  // Tính toán leaderboard từ participants
  const leaderboard = useMemo(() => {
    return Object.entries(participants)
      .map(([name, data]: [string, any]) => ({
        name,
        score: data.score || 0,
        isCurrentPlayer: name === userName
      }))
      .sort((a, b) => b.score - a.score);
  }, [participants, userName]);

  // Top 5 cho bảng xếp hạng tạm thời
  const topLeaderboard = useMemo(() => leaderboard.slice(0, 5), [leaderboard]);

  // Cập nhật refs khi state thay đổi
  useEffect(() => {
    gameStateRef.current = gameState;
    timeLeftRef.current = timeLeft;
    currentQuestionRef.current = currentQuestion;
  }, [gameState, timeLeft, currentQuestion]);

  // Cleanup timer khi component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Reset answer state khi chuyển câu hỏi mới
  useEffect(() => {
    console.log('Resetting answer state for new question:', currentQuestion);
    setHasAnswered(false);
    setSelectedAnswer("");
    setShowResult(false);
    setIsCorrect(false);
    setEarnedPoints(0);
  }, [currentQuestion]); // Chỉ trigger khi currentQuestion thay đổi

  // Reset timer khi bắt đầu phase playing
  useEffect(() => {
    if (gameState === 'playing' && !hasAnswered) {
      const currentQ = questions[currentQuestion];
      setTimeLeft(currentQ?.timeLimit || 10);
    }
  }, [gameState, currentQuestion, hasAnswered, questions]);

  // Client timer cho non-host
  useEffect(() => {
    if (isHost || gameState !== 'playing') return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev > 1) return prev - 1;
        return 0;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isHost, gameState]);

  // Host timer - điều khiển toàn bộ game flow
  useEffect(() => {
    if (!isHost) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (gameState === 'get-ready') {
      // 3 giây chuẩn bị
      let countdown = 3;
      timerRef.current = setInterval(async () => {
        countdown--;
        if (countdown <= 0) {
          clearInterval(timerRef.current!);
          await startQuestion();
        }
      }, 1000);
      
    } else if (gameState === 'playing') {
      // Timer cho câu hỏi
      timerRef.current = setInterval(async () => {
        const currentTime = timeLeftRef.current;
        const newTime = Math.max(0, currentTime - 1);
        
        try {
          await set(ref(db, `quizzes/${quizId}/currentState/timeLeft`), newTime);
          
          if (newTime <= 0) {
            clearInterval(timerRef.current!);
            await showCorrectAnswer();
          }
        } catch (error) {
          console.error("Error updating timer:", error);
          setTimeLeft(newTime);
          if (newTime <= 0) {
            clearInterval(timerRef.current!);
            await showCorrectAnswer();
          }
        }
      }, 1000);
      
    } else if (gameState === 'show-answer') {
      // 3 giây hiển thị đáp án
      let countdown = 3;
      setShowAnswerCountdown(countdown);
      
      timerRef.current = setInterval(async () => {
        countdown--;
        setShowAnswerCountdown(countdown);
        
        if (countdown <= 0) {
          clearInterval(timerRef.current!);
          await showLeaderboard();
        }
      }, 1000);
      
    } else if (gameState === 'leaderboard') {
      // 5 giây hiển thị bảng xếp hạng
      let countdown = 5;
      setLeaderboardCountdown(countdown);
      
      timerRef.current = setInterval(async () => {
        countdown--;
        setLeaderboardCountdown(countdown);
        
        if (countdown <= 0) {
          clearInterval(timerRef.current!);
          await moveToNextQuestion();
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isHost, gameState, quizId]);

  // Main Firebase listeners
  useEffect(() => {
    if (!quizId || !userName) {
      navigate('/');
      return;
    }

    const statusRef = ref(db, `quizzes/${quizId}/status`);
    const unsub1 = onValue(statusRef, (snapshot) => {
      const status = snapshot.val();
      if (!status) { 
        navigate('/'); 
        return; 
      }
      setQuizStatus(status);
      setLoading(false);
      if (status.isCompleted) { 
        navigate(`/quiz/${quizId}/final-results`); 
      }
    });

    const participantsRef = ref(db, `quizzes/${quizId}/participants`);
    const unsub2 = onValue(participantsRef, (snapshot) => { 
      setParticipants(snapshot.val() || {}); 
    });

    const currentStateRef = ref(db, `quizzes/${quizId}/currentState`);
    const unsub3 = onValue(currentStateRef, (snapshot) => {
      const state = snapshot.val();
      
      if (state) {
        const isNewQuestion = state.questionIndex !== currentQuestionRef.current;
        const newGameState = state.phase || 'get-ready';
        
        console.log('Firebase state update:', { 
          isNewQuestion, 
          newGameState, 
          questionIndex: state.questionIndex, 
          timeLeft: state.timeLeft 
        });
        
        setCurrentQuestion(state.questionIndex || 0);
        setTimeLeft(state.timeLeft || 30);
        setGameState(newGameState);
        
        // CHỈ reset khi thực sự chuyển sang câu hỏi mới
        if (isNewQuestion) {
          console.log('New question detected, resetting answer states');
          setHasAnswered(false);
          setSelectedAnswer("");
          setShowResult(false);
          setIsCorrect(false);
          setEarnedPoints(0);
        }
        
        // Reset countdown cho các phase mới
        if (newGameState === 'leaderboard') {
          setLeaderboardCountdown(5);
        } else if (newGameState === 'show-answer') {
          setShowAnswerCountdown(3);
        }
      }
    });

    return () => { 
      unsub1(); 
      unsub2(); 
      unsub3(); 
    };
  }, [quizId, userName, navigate]);

  // Host functions
  const startQuestion = async () => {
    try {
      await set(ref(db, `quizzes/${quizId}/currentState`), {
        questionIndex: currentQuestionRef.current,
        timeLeft: questions[currentQuestionRef.current]?.timeLimit || 30,
        phase: 'playing',
        maxTimePerQuestion: 30
      });
    } catch (error) {
      console.error("Error starting question:", error);
    }
  };

  const showCorrectAnswer = async () => {
    try {
      await set(ref(db, `quizzes/${quizId}/currentState/phase`), 'show-answer');
    } catch (error) {
      console.error("Error showing answer:", error);
    }
  };

  const showLeaderboard = async () => {
    try {
      await set(ref(db, `quizzes/${quizId}/currentState/phase`), 'leaderboard');
    } catch (error) {
      console.error("Error showing leaderboard:", error);
    }
  };

  const moveToNextQuestion = async () => {
    try {
      const nextQuestionIndex = currentQuestionRef.current + 1;
      
      if (nextQuestionIndex < questions.length) {
        // Chuyển câu tiếp theo
        await set(ref(db, `quizzes/${quizId}/currentState`), {
          questionIndex: nextQuestionIndex,
          timeLeft: questions[nextQuestionIndex].timeLimit || 30,
          phase: 'playing'
        });
      } else {
        // Kết thúc quiz
        await update(ref(db, `quizzes/${quizId}/status`), {
          isCompleted: true,
          completedAt: Date.now()
        });
        
        // Cập nhật leaderboard cuối cùng
        await updateFinalLeaderboard();
      }
    } catch (error) {
      console.error("Error moving to next question:", error);
    }
  };

  const updateFinalLeaderboard = async () => {
    try {
      const updates: Record<string, any> = {};
      
      leaderboard.forEach((player, index) => {
        updates[`leaderboard/${player.name}`] = {
          rank: index + 1,
          bestScore: player.score,
          averageScore: player.score / questions.length,
          lastPlayed: Date.now()
        };
      });
      
      await update(ref(db, `quizzes/${quizId}`), updates);
    } catch (error) {
      console.error("Error updating final leaderboard:", error);
    }
  };

  // Player functions
  const handleAnswer = async (answer: string) => {
    console.log('handleAnswer called:', { 
      hasAnswered, 
      gameState, 
      timeLeft, 
      currentQuestion,
      answer 
    });
    
    // Kiểm tra điều kiện nghiêm ngặt
    if (hasAnswered || gameState !== 'playing' || timeLeft <= 0) {
      console.log('Cannot answer - conditions not met:', { hasAnswered, gameState, timeLeft });
      return;
    }
    
    console.log('Processing answer...');
    
    const currentQ = questions[currentQuestion];
    const correct = answer === currentQ.correctAnswer;
    const points = correct ? calculateScore(timeLeft, currentQ.timeLimit || 30) : 0;
    const newTotal = totalScore + points;
    
    // Set state ngay lập tức để prevent double clicks
    setHasAnswered(true);
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setShowResult(true);
    setEarnedPoints(points);
    setTotalScore(newTotal);
    
    console.log('Answer processed:', { answer, correct, points, newTotal });
    
    try {
      // Cập nhật Firebase
      await update(ref(db, `quizzes/${quizId}/participants/${userName}`), { 
        score: newTotal,
        lastAnswered: Date.now(),
        hasAnsweredCurrentQuestion: true,
        currentQuestionAnswered: currentQuestion
      });
      
      const attemptRef = ref(db, `quizzes/${quizId}/playHistory/${userName}/attempts/${Date.now()}`);
      await set(attemptRef, {
        questionId: currentQuestion + 1,
        answer: answer,
        isCorrect: correct,
        score: points,
        timeLeft: timeLeft,
        playedAt: Date.now()
      });
      
      console.log('Firebase updated successfully');
      
    } catch (error) { 
      console.error("Error saving answer:", error);
    }
  };

  if (loading) {
    return (
      <GradientBox>
        <Box textAlign="center">
          <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
          <Typography variant="h5" color="white">
            Đang tải quiz...
          </Typography>
        </Box>
      </GradientBox>
    );
  }
  
  // Get Ready Screen
  if (gameState === 'get-ready') {
    return (
      <GetReadyBox>
        <Container maxWidth="md">
          <Box textAlign="center">
            <AnimatedTitle variant="h1" sx={{ fontSize: { xs: '3rem', md: '5rem' }, mb: 2 }}>
              Sẵn sàng!
            </AnimatedTitle>
            <Typography variant="h4" sx={{ mb: 4 }}>
              Quiz sắp bắt đầu...
            </Typography>
            
            <GlassCard sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                  Câu hỏi đầu tiên:
                </Typography>
                <Box
                  sx={{
                    bgcolor: 'rgba(79, 70, 229, 0.5)',
                    p: 2,
                    borderRadius: 1,
                    color: 'white'
                  }}
                >
                  <Typography variant="body1">
                    {questions[0]?.text}
                  </Typography>
                </Box>
              </CardContent>
            </GlassCard>
            
            <Box sx={{ opacity: 0.75 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                💡 Trả lời nhanh để được điểm cao!
              </Typography>
              <Typography variant="body1">
                🏆 Điểm số sẽ giảm dần theo thời gian
              </Typography>
            </Box>
          </Box>
        </Container>
      </GetReadyBox>
    );
  }

  // Show Answer Screen
  if (gameState === 'show-answer') {
    const currentQ = questions[currentQuestion];
    
    return (
      <ShowAnswerBox>
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 4 }}>
              📝 Đáp án đúng
            </Typography>
            
            <GlassCard sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 4, color: 'white' }}>
                  {currentQ.text}
                </Typography>
                <Box
                  sx={{
                    bgcolor: 'rgba(34, 197, 94, 0.8)',
                    p: 3,
                    borderRadius: 2,
                    color: 'white'
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ✅ {currentQ.correctAnswer}
                  </Typography>
                </Box>
              </CardContent>
            </GlassCard>

            {/* Personal Result */}
            {showResult && (
              <Alert
                severity={isCorrect ? 'success' : 'error'}
                sx={{
                  mb: 4,
                  bgcolor: isCorrect ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)',
                  color: 'white',
                  '& .MuiAlert-icon': { color: 'white' }
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {isCorrect ? '🎉 Chính xác!' : '❌ Sai rồi!'}
                </Typography>
                <Typography variant="h6">
                  Bạn được: <strong>{earnedPoints} điểm</strong>
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Tổng điểm: {totalScore}
                </Typography>
              </Alert>
            )}

            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Hiển thị bảng xếp hạng sau:
              </Typography>
              <CountdownText>
                {showAnswerCountdown}
              </CountdownText>
            </Box>
          </Box>
        </Container>
      </ShowAnswerBox>
    );
  }

  // Leaderboard Screen
  if (gameState === 'leaderboard') {
    return (
      <LeaderboardBox>
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
              🏆 Bảng Xếp Hạng
            </Typography>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Sau câu hỏi {currentQuestion + 1}/{questions.length}
            </Typography>
            
            {/* Countdown */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {currentQuestion + 1 < questions.length ? 'Câu tiếp theo sau:' : 'Kết thúc sau:'}
              </Typography>
              <CountdownText sx={{ fontSize: '4rem' }}>
                {leaderboardCountdown}
              </CountdownText>
            </Box>

            {/* Leaderboard */}
            <GlassCard>
              <CardContent>
                <Stack spacing={2}>
                  {topLeaderboard.map((player, index) => {
                    const getRankIcon = (rank: number) => {
                      switch (rank) {
                        case 0: return '🥇';
                        case 1: return '🥈';
                        case 2: return '🥉';
                        default: return rank + 1;
                      }
                    };

                    const getRankColor = (rank: number) => {
                      switch (rank) {
                        case 0: return '#ffd700';
                        case 1: return '#c0c0c0';
                        case 2: return '#cd7f32';
                        default: return '#42a5f5';
                      }
                    };

                    return (
                      <PlayerCard
                        key={player.name}
                        isCurrentPlayer={player.isCurrentPlayer}
                        sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }}
                      >
                        <CardContent sx={{ py: 2 }}>
                          <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar
                                sx={{
                                  bgcolor: getRankColor(index),
                                  color: index <= 2 ? '#000' : '#fff',
                                  fontWeight: 'bold'
                                }}
                              >
                                {getRankIcon(index)}
                              </Avatar>
                              <Box textAlign="left">
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                                  {player.name}
                                  {player.isCurrentPlayer && ' (Bạn)'}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                                  Rank #{index + 1}
                                </Typography>
                              </Box>
                            </Box>
                            <Box textAlign="right">
                              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                                {player.score}
                              </Typography>
                              <Typography variant="body2" sx={{ opacity: 0.9, color: 'white' }}>
                                điểm
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </PlayerCard>
                    );
                  })}
                </Stack>
              </CardContent>
            </GlassCard>

            {/* Progress Bar */}
            <Box sx={{ mt: 4 }}>
              <LinearProgress
                variant="determinate"
                value={((5 - leaderboardCountdown) / 5) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white'
                  }
                }}
              />
            </Box>
          </Box>
        </Container>
      </LeaderboardBox>
    );
  }

  // Main Playing Screen
  if (!questions || !questions[currentQuestion]) {
    return (
      <GradientBox>
        <Typography variant="h5" color="white">
          Lỗi tải câu hỏi.
        </Typography>
      </GradientBox>
    );
  }

  const currentQ = questions[currentQuestion];
  const participantCount = Object.keys(participants).length;

  // Debug logging cho render
  console.log('Render state:', { 
    hasAnswered, 
    gameState, 
    timeLeft, 
    currentQuestion,
    selectedAnswer 
  });

  return (
    <PlayingBox>
      <Container maxWidth="lg">
        {/* Header */}
        <Box textAlign="center" sx={{ mb: 4 }}>
          <ScaleCard sx={{ mb: 2 }}>
            <CardContent>
              <Chip
                label={`🎮 MULTIPLAYER QUIZ - ${participantCount} người chơi`}
                color="primary"
                sx={{ mb: 2, fontWeight: 'bold' }}
              />
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'grey.800', mb: 2 }}>
                Câu hỏi {currentQuestion + 1}/{questions.length}
              </Typography>
              <Box display="flex" justifyContent="center" alignItems="center" gap={4}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  💰 Tổng điểm: {totalScore}
                </Typography>
                <Typography variant="body2" sx={{ color: 'grey.600' }}>
                  🏅 Rank: #{leaderboard.findIndex(p => p.name === userName) + 1}
                </Typography>
              </Box>
            </CardContent>
          </ScaleCard>
        </Box>

        {/* Question */}
        <ScaleCard sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: 'medium', textAlign: 'center' }}>
              {currentQ.text}
            </Typography>
          </CardContent>
        </ScaleCard>

        {/* Timer */}
        {gameState === 'playing' && !hasAnswered && (
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 2,
                color: timeLeft <= 10 ? 'error.main' : 'primary.main'
              }}
            >
              ⏱️ {timeLeft}s
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(timeLeft / (currentQ.timeLimit || 30)) * 100}
              sx={{
                height: 16,
                borderRadius: 8,
                mb: 2,
                '& .MuiLinearProgress-bar': {
                  bgcolor: timeLeft <= 10 ? 'error.main' : 'primary.main',
                  transition: 'all 1s linear'
                }
              }}
            />
            <Typography variant="body2" sx={{ color: 'grey.600' }}>
              💡 Điểm hiện tại nếu trả lời đúng: {calculateScore(timeLeft, currentQ.timeLimit || 30)} điểm
            </Typography>
          </Box>
        )}

        {/* Personal Result */}
        {showResult && (
          <Alert
            severity={isCorrect ? 'success' : 'error'}
            sx={{ mb: 4, textAlign: 'center' }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              {isCorrect ? '🎉 Chính xác!' : '❌ Sai rồi!'}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Bạn được: <span style={{ color: '#1976d2' }}>+{earnedPoints} điểm</span>
            </Typography>
          </Alert>
        )}

        {/* Answer Options */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
          {currentQ.options.map((option, index) => {
            const isDisabled = hasAnswered || gameState !== 'playing' || timeLeft <= 0;
            const isCorrectAnswer = option === currentQ.correctAnswer;
            const isSelectedAnswer = option === selectedAnswer;
            
            let buttonProps: any = {
              fullWidth: true,
              size: 'large',
              onClick: () => handleAnswer(option),
              disabled: isDisabled,
              sx: {
                p: 2,
                textAlign: 'left',
                justifyContent: 'flex-start',
                fontWeight: 'medium',
                transition: 'all 0.2s ease',
                minHeight: 60
              }
            };

            if (isDisabled) {
              if (isCorrectAnswer) {
                buttonProps.variant = 'contained';
                buttonProps.color = 'success';
                buttonProps.sx = {
                  ...buttonProps.sx,
                  transform: 'scale(1.05)',
                  boxShadow: '0 0 20px rgba(76, 175, 80, 0.5)'
                };
              } else if (isSelectedAnswer) {
                buttonProps.variant = 'contained';
                buttonProps.color = 'error';
              } else {
                buttonProps.variant = 'outlined';
                buttonProps.sx = {
                  ...buttonProps.sx,
                  bgcolor: 'grey.300',
                  color: 'grey.500',
                  borderColor: 'grey.400'
                };
              }
            } else {
              buttonProps.variant = 'outlined';
              buttonProps.sx = {
                ...buttonProps.sx,
                bgcolor: 'white',
                borderColor: 'grey.300',
                '&:hover': {
                  bgcolor: 'primary.50',
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                },
                '&:active': {
                  transform: 'scale(0.98)'
                }
              };
            }

            return (
              <Box 
                key={index} 
                sx={{ 
                  flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' }
                }}
              >
                <Button {...buttonProps}>
                  <Chip
                    label={String.fromCharCode(65 + index)}
                    size="small"
                    sx={{
                      mr: 2,
                      bgcolor: 'grey.200',
                      color: 'grey.700',
                      fontWeight: 'bold'
                    }}
                  />
                  {option}
                </Button>
              </Box>
            );
          })}
        </Box>

        {/* Status Messages */}
        {hasAnswered && gameState === 'playing' && (
          <Card sx={{ textAlign: 'center', bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                ✅ Đã trả lời!
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Đang chờ hết thời gian... ({timeLeft}s)
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Footer Info */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', mb: 1 }}>
              Room: {quizId} | Player: {userName} {isHost && '(Host)'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'grey.500' }}>
              State: {gameState} | hasAnswered: {hasAnswered.toString()}
            </Typography>
          </Paper>
        </Box>
      </Container>
    </PlayingBox>
  );
};

export default QuizPlay;