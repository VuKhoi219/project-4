import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CircularProgress, Alert, Button, Typography } from '@mui/material';
import { BaseBox } from "../styles/QuizPlay.styles";
import { PlayingBox } from "../styles/QuizPlay.styles";
import { GetReadyState, WaitingForHostState } from "./QuizPlay/GameStates";
import { ShowAnswerState } from "./QuizPlay/ShowAnswerState";
import { LeaderboardState } from "./QuizPlay/LeaderboardState";
import { PlayingState } from "./QuizPlay/PlayingState";
import { useQuizLogic } from "../hooks/useQuizLogic";
import { useQuizAnimations } from "../hooks/useQuizAnimations";

const QuizPlay: React.FC = () => {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string; roomId: string }>();
  
  const {
    // State
    questions,
    loading,
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
    hasAnswered,
    selectedAnswer,
    isCorrect,
    earnedPoints,
    shortAnswer,
    roomInfo,
    
    // Actions
    handleAnswer,
    handleMultipleSelect,
    handleShortAnswerChange,
    submitShortAnswer,
    handleHostNextQuestion,
  } = useQuizLogic();

  const { animatedTimeLeft, animatedScore, displayLeaderboard } = useQuizAnimations(
    gameState, 
    timeLeft, 
    questions, 
    currentQuestionIndex, 
    leaderboard
  );

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
      <WaitingForHostState
        isHost={isHost}
        roomInfo={roomInfo}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        onNextQuestion={handleHostNextQuestion}
      />
    );
  }

  switch (gameState) {
    case 'get-ready':
      return <GetReadyState currentQuestionIndex={currentQuestionIndex} />;

    case 'show-answer':
      return (
        <ShowAnswerState
          currentQ={currentQ}
          answerResult={answerResult}
          hasAnswered={hasAnswered}
          isCorrect={isCorrect}
          earnedPoints={earnedPoints}
        />
      );

    case 'leaderboard':
      return (
        <LeaderboardState
          displayLeaderboard={displayLeaderboard.length > 0 ? displayLeaderboard : leaderboard}
          hostControlEnabled={hostControlEnabled}
          waitingForHost={waitingForHost}
          isHost={isHost}
          roomInfo={roomInfo}
        />
      );

    case 'playing':
    default:
      return (
        <PlayingState
          currentQ={currentQ}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          animatedTimeLeft={animatedTimeLeft}
          timeLeft={timeLeft}
          animatedScore={animatedScore}
          hasAnswered={hasAnswered}
          selectedAnswer={selectedAnswer}
          shortAnswer={shortAnswer}
          onAnswer={handleAnswer}
          onMultipleSelect={handleMultipleSelect}
          onShortAnswerChange={handleShortAnswerChange}
          onSubmitShortAnswer={submitShortAnswer}
        />
      );
  }
};

export default QuizPlay;