

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, set, get, update, db } from "../config/firebase";
import { Question } from "../types";
import { Box, Typography, Button, Card, CardContent, LinearProgress, Chip, Avatar, Paper, Container, CircularProgress, Alert, Stack } from '@mui/material';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// Animations and Styled Components
const pulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0.5; }`;
const bounce = keyframes`0%, 20%, 53%, 80%, 100% { transform: translateY(0); } 40%, 43% { transform: translateY(-10px); } 70% { transform: translateY(-5px); } 90% { transform: translateY(-2px); }`;
const scaleIn = keyframes`0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; }`;
const BaseBox = styled(Box)`min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; color: white;`;
const GetReadyBox = styled(BaseBox)`background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);`;
const ShowAnswerBox = styled(BaseBox)`background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);`;
const LeaderboardBox = styled(BaseBox)`background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);`;
const PlayingBox = styled(BaseBox)`background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); color: #1f2937;`;
const AnimatedTitle = styled(Typography)`animation: ${pulse} 2s infinite; font-weight: bold;`;
const CountdownText = styled(Typography)`animation: ${pulse} 1s infinite; font-weight: bold; font-size: 4rem;`;
const GlassCard = styled(Card)`background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.3);`;
const PlayerCard = styled(Card)<{ isCurrentPlayer?: boolean }>`${props => props.isCurrentPlayer && `background: rgba(255, 193, 7, 0.3); border: 2px solid #ffc107; transform: scale(1.05);`} transition: all 0.3s ease;`;

// Mock Questions and Score Calculation
const MOCK_QUESTIONS: Question[] = [
    { id: 1, text: "Thủ đô của Pháp là gì?", options: ["Paris", "London", "Berlin", "Madrid"], correctAnswer: "Paris", timeLimit: 10 },
    { id: 2, text: "Hành tinh nào được mệnh danh là 'Hành tinh Đỏ'?", options: ["Sao Hỏa", "Sao Mộc", "Sao Kim", "Sao Thủy"], correctAnswer: "Sao Hỏa", timeLimit: 10 },
    { id: 3, text: "2 + 2 bằng mấy?", options: ["3", "4", "5", "6"], correctAnswer: "4", timeLimit: 15 },
    { id: 4, text: "Ai là người vẽ bức họa Mona Lisa?", options: ["Leonardo da Vinci", "Pablo Picasso", "Vincent van Gogh", "Michelangelo"], correctAnswer: "Leonardo da Vinci", timeLimit: 11 },
    { id: 5, text: "Đại dương lớn nhất trên Trái Đất là gì?", options: ["Đại Tây Dương", "Ấn Độ Dương", "Bắc Băng Dương", "Thái Bình Dương"], correctAnswer: "Thái Bình Dương", timeLimit: 5 }
];
const calculateScore = (timeLeft: number, maxTime: number, maxPoints: number = 100): number => {
    if (timeLeft <= 0) return 0;
    const minScore = Math.floor(maxPoints * 0.1);
    const timeScore = Math.floor(maxPoints * (timeLeft / maxTime));
    return Math.max(minScore, timeScore);
};

const QuizPlay: React.FC = () => {
  const [questions] = useState<Question[]>(MOCK_QUESTIONS);
  const [participants, setParticipants] = useState<Record<string, any>>({});
  const [quizStatus, setQuizStatus] = useState<any>({});
  const [currentState, setCurrentState] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);

  const { quizId, roomId } = useParams<{ quizId: string; roomId: string }>();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "GuestUser";

  const gameState = currentState?.phase || 'get-ready';
  const currentQuestionIndex = currentState?.questionIndex || 0;
  const timeLeft = currentState?.timeLeft || 0;
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isHost = useMemo(() => quizStatus.startedBy === userName, [quizStatus, userName]);
  const leaderboard = useMemo(() => Object.entries(participants).map(([name, data]) => ({ name: data.displayName || name, score: data.score || 0, isCurrentPlayer: name === userName })).sort((a, b) => b.score - a.score), [participants, userName]);

  useEffect(() => {
    if (!quizId || !roomId || !userName) { navigate('/'); return; }
    const statusRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/status`);
    const unsubStatus = onValue(statusRef, (snapshot) => {
      const status = snapshot.val();
      if (!status) { navigate(`/quiz/${quizId}/join`); return; }
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
        if (state.questionIndex !== (currentState?.questionIndex || -1)) {
          setHasAnswered(false); setSelectedAnswer(""); setIsCorrect(false); setEarnedPoints(0);
        }
        setCurrentState(state);
      }
      setLoading(false);
    });
    return () => { unsubStatus(); unsubParticipants(); unsubCurrentState(); };
  }, [quizId, roomId, userName, navigate]);

  useEffect(() => {
    if (!isHost || !quizId || !roomId) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const currentStatePath = `quizzes/${quizId}/rooms/${roomId}/currentState`;
    const updatePhase = (phase: string) => update(ref(db, currentStatePath), { phase });
    
    if (gameState === 'get-ready') {
      timerRef.current = setTimeout(() => update(ref(db, currentStatePath), { phase: 'playing', timeLeft: questions[currentQuestionIndex]?.timeLimit || 30 }), 3000);
    } else if (gameState === 'playing') {
      timerRef.current = setInterval(async () => {
        const timeSnapshot = await get(ref(db, `${currentStatePath}/timeLeft`));
        const newTime = (timeSnapshot.val() || 0) - 1;
        if (newTime >= 0) set(ref(db, `${currentStatePath}/timeLeft`), newTime);
        else { clearInterval(timerRef.current!); updatePhase('show-answer'); }
      }, 1000);
    } else if (gameState === 'show-answer') {
      timerRef.current = setTimeout(() => updatePhase('leaderboard'), 5000);
    } else if (gameState === 'leaderboard') {
      timerRef.current = setTimeout(() => {
        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < questions.length) {
          update(ref(db, currentStatePath), { questionIndex: nextQuestionIndex, phase: 'get-ready' });
        } else {
          update(ref(db, `quizzes/${quizId}/rooms/${roomId}/status`), { isCompleted: true, completedAt: Date.now() });
        }
      }, 8000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isHost, gameState, quizId, roomId, currentQuestionIndex, questions]);

  const handleAnswer = async (answer: string) => {
    if (hasAnswered || gameState !== 'playing' || !quizId || !roomId) return;
    const currentQ = questions[currentQuestionIndex];
    const correct = answer === currentQ.correctAnswer;
    const points = correct ? calculateScore(timeLeft, currentQ.timeLimit || 30) : 0;
    const newTotal = totalScore + points;
    setHasAnswered(true); setSelectedAnswer(answer); setIsCorrect(correct); setEarnedPoints(points);
    try {
      const participantRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/participants/${userName}`);
      await update(participantRef, { score: newTotal, lastAnswered: Date.now() });
      const leaderboardRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/leaderboard/${userName}`);
      await update(leaderboardRef, { bestScore: newTotal }); // Update bestScore immediately
      const attemptRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/playHistory/${userName}/attempts/${currentQ.id}`);
      await set(attemptRef, { questionId: currentQ.id, answer, isCorrect: correct, score: points, timeLeft, playedAt: Date.now() });
    } catch (error) { console.error("Error saving answer:", error); }
  };
  
  if (loading) return <BaseBox style={{background:'#1f2937'}}><CircularProgress color="inherit" /></BaseBox>;

  const currentQ = questions[currentQuestionIndex];
  if (!currentQ) return <PlayingBox><Typography>Chờ câu hỏi tiếp theo...</Typography></PlayingBox>;

  switch (gameState) {
    case 'get-ready':
      return <GetReadyBox><Container maxWidth="md" sx={{textAlign:'center'}}><AnimatedTitle variant="h1" sx={{fontSize: '5rem'}}>Sẵn sàng!</AnimatedTitle><Typography variant="h4">Câu hỏi tiếp theo sắp bắt đầu...</Typography></Container></GetReadyBox>;
    case 'show-answer':
      return <ShowAnswerBox><Container maxWidth="md" sx={{textAlign:'center'}}><Typography variant="h3" fontWeight="bold" mb={4}>Đáp án đúng là</Typography><GlassCard sx={{mb:4, width:'100%'}}><CardContent><Typography variant="h5" mb={2}>{currentQ.text}</Typography><Box bgcolor="rgba(34,197,94,.8)" p={2} borderRadius={1}><Typography variant="h4" fontWeight="bold">✅ {currentQ.correctAnswer}</Typography></Box></CardContent></GlassCard>{hasAnswered && <Alert sx={{color:'white', bgcolor: isCorrect ? 'success.main' : 'error.main'}}>{isCorrect ? `Chính xác! +${earnedPoints} điểm` : 'Sai rồi!'}</Alert>}</Container></ShowAnswerBox>;
    case 'leaderboard':
      return <LeaderboardBox><Container maxWidth="lg" sx={{textAlign:'center'}}><Typography variant="h3" fontWeight="bold" mb={4}>🏆 Bảng Xếp Hạng 🏆</Typography>{leaderboard.slice(0, 5).map((p, i) => <PlayerCard key={p.name} isCurrentPlayer={p.isCurrentPlayer} sx={{mb:1, bgcolor:'rgba(255,255,255,.1)', p:1}}><CardContent sx={{p:1}}><Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}><Avatar sx={{bgcolor:'#fff', color:'#000', fontWeight:'bold'}}>{i+1}</Avatar><Typography variant="h6" flexGrow={1} textAlign="left">{p.name}</Typography><Typography variant="h5" fontWeight="bold">{p.score}</Typography></Stack></CardContent></PlayerCard>)}</Container></LeaderboardBox>;
    case 'playing':
    default:
      return (
        <PlayingBox>
          <Container maxWidth="lg">
            <Card sx={{ mb: 2, textAlign: 'center' }}><CardContent><Chip label={`Câu ${currentQuestionIndex + 1}/${questions.length}`} color="primary"/><Typography variant="h4" my={2} fontWeight={500}>{currentQ.text}</Typography><Stack direction="row" justifyContent="space-around"><Typography>Điểm: {totalScore}</Typography><Typography>Hạng: #{leaderboard.findIndex(p => p.name === userName) + 1}</Typography></Stack></CardContent></Card>
            <Box mb={2} textAlign="center"><Typography variant="h3" fontWeight="bold" color={timeLeft <= 5 ? 'error.main' : 'primary.main'}>{timeLeft}</Typography><LinearProgress variant="determinate" value={(timeLeft / (currentQ.timeLimit || 30)) * 100} sx={{ height: 10, borderRadius: 5 }} /></Box>
            {hasAnswered && <Alert severity={isCorrect ? "success" : "error"} sx={{ mb: 2, justifyContent:'center' }}>{isCorrect ? `Chính xác! +${earnedPoints} điểm` : "Sai rồi! Đang chờ những người khác..."}</Alert>}
            <Box display="grid" gridTemplateColumns={{xs: '1fr', sm: '1fr 1fr'}} gap={2}>
              {currentQ.options.map((option, index) => {
                const isDisabled = hasAnswered;
                let variant: "contained" | "outlined" = "outlined";
                let color: "success" | "error" | "primary" = "primary";
                if (isDisabled) {
                  if (option === currentQ.correctAnswer) { variant = "contained"; color = "success"; }
                  else if (option === selectedAnswer) { variant = "contained"; color = "error"; }
                }
                return <Button key={index} variant={variant} color={color} disabled={isDisabled && option !== selectedAnswer && option !== currentQ.correctAnswer} onClick={() => handleAnswer(option)} sx={{ p: 2, fontSize: '1.1rem', justifyContent: 'flex-start', textTransform:'none' }}><Chip label={String.fromCharCode(65 + index)} sx={{mr:2}}/>{option}</Button>;
              })}
            </Box>
          </Container>
        </PlayingBox>
      );
  }
};

export default QuizPlay;