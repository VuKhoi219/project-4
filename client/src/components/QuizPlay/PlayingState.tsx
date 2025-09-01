import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  CardContent,
  Chip,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Stack,
  Fade,
  Zoom,
} from '@mui/material';
import {
  PlayingBox,
  GlassCard,
  CountdownText,
  OptionButton,
} from '../../styles/QuizPlay.styles';
import { ExtendedQuestion, QuestionType } from '../../types';
import { CountdownCircleTimer } from "react-countdown-circle-timer";

interface PlayingStateProps {
  currentQ: ExtendedQuestion;
  currentQuestionIndex: number;
  totalQuestions: number;
  animatedTimeLeft: number;
  timeLeft: number;
  animatedScore: number;
  hasAnswered: boolean;
  selectedAnswer: string[];
  shortAnswer: string;
  onAnswer: (answer: string | string[], pointsOverride?: number) => void;
  onMultipleSelect: (option: string) => void;
  onShortAnswerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmitShortAnswer: () => void;
}

export const PlayingState: React.FC<PlayingStateProps> = ({
  currentQ,
  currentQuestionIndex,
  totalQuestions,
  animatedTimeLeft,
  timeLeft,
  animatedScore,
  hasAnswered,
  selectedAnswer,
  shortAnswer,
  onAnswer,
  onMultipleSelect,
  onShortAnswerChange,
  onSubmitShortAnswer,
}) => {
  // State để lưu điểm tại thời điểm trả lời
  const [frozenScore, setFrozenScore] = useState<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  
  // Reset frozen score và start time khi chuyển câu hỏi mới
  useEffect(() => {
    setFrozenScore(null);
    startTimeRef.current = performance.now();
  }, [currentQuestionIndex]);
  
  // Hàm tính điểm chung để đảm bảo tính nhất quán
  const calculateScore = () => {
    if (!startTimeRef.current) return 0;
    const elapsed = performance.now() - startTimeRef.current;
    const totalMs = (currentQ.timeLimit || 30) * 1000;
    const remainingMs = Math.max(0, totalMs - elapsed);
    return Math.max(0, Math.floor((remainingMs / totalMs) * 1000));
  };
  
  // Wrap các hàm xử lý để capture điểm tại thời điểm trả lời với millisecond
  const handleAnswerWithScore = (answer: string | string[]) => {
    if (!hasAnswered) {
      const currentScore = calculateScore();
      setFrozenScore(currentScore);

      // Truyền thêm điểm này vào onAnswer
      onAnswer(answer, currentScore);
    } else {
      onAnswer(answer);
    }
  };
  
  const handleSubmitShortAnswerWithScore = () => {
    if (!hasAnswered && shortAnswer.trim()) {
      const currentScore = calculateScore();
      setFrozenScore(currentScore);
    }
    onSubmitShortAnswer();
  };

  // Hàm lấy màu sắc cho option button
  const getOptionButtonStyle = (option: string, index: number, isCorrect: boolean, isSelected: boolean) => {
    const baseStyle = {
      minHeight: '70px',
      borderRadius: '16px',
      fontSize: '1.1rem',
      fontWeight: 600,
      textAlign: 'left' as const,
      justifyContent: 'flex-start',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '2px solid transparent',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
      backdropFilter: 'blur(20px)',
      position: 'relative' as const,
      overflow: 'hidden' as const,
      '&::before': {
        content: '""',
        position: 'absolute' as const,
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        transition: 'left 0.5s ease'
      },
      '&:hover::before': {
        left: '100%'
      }
    };

    if (hasAnswered) {
      if (isCorrect) {
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          border: '2px solid #10b981',
          boxShadow: '0 12px 35px rgba(16, 185, 129, 0.4)',
          transform: 'translateY(-2px)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 15px 40px rgba(16, 185, 129, 0.5)'
          }
        };
      } else if (isSelected) {
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #6fc6ef 0%, #72dbed 100%)',
          color: 'white',
          border: '2px solid #4497ef',
          boxShadow: '0 12px 35px rgba(68, 239, 77, 0.4)',
          transform: 'translateY(-2px)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 15px 40px rgba(239, 68, 68, 0.5)'
          }
        };
      } else {
        return {
          ...baseStyle,
          background: 'rgba(148, 163, 184, 0.3)',
          color: 'rgba(255, 255, 255, 0.6)',
          border: '2px solid rgba(148, 163, 184, 0.3)',
          cursor: 'not-allowed'
        };
      }
    }

    return {
      ...baseStyle,
      background: 'linear-gradient(135deg, rgba(143, 245, 138, 0.95) 0%, rgba(47, 251, 88, 0.85) 100%)',
      color: '#1f2937',
      border: '2px solid rgba(99, 102, 241, 0.2)',
      '&:hover': {
        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
        color: 'white',
        border: '2px solid #6366f1',
        transform: 'translateY(-4px)',
        boxShadow: '0 15px 40px rgba(99, 102, 241, 0.4)'
      },
      '&:active': {
        transform: 'translateY(-2px) scale(0.98)'
      }
    };
  };

  return (
    <PlayingBox>
      <Container maxWidth="lg">
        <Fade in={true} timeout={600}>
          <GlassCard sx={{ 
            mb: 4, 
            p: 0,
            background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '24px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #f093fb, #ffd700)',
              backgroundSize: '200% 100%',
              animation: 'gradientMove 3s ease-in-out infinite'
            }
          }}>
            <Box display="flex" alignItems="center" p={3}>
              {/* Nội dung câu hỏi */}
              <CardContent sx={{ flex: 1, textAlign: "center", p: 0 }}>
                <Zoom in={true} timeout={400}>
                  <Chip
                    label={`Câu ${currentQuestionIndex + 1}/${totalQuestions}`}
                    sx={{ 
                      mb: 3, 
                      fontWeight: "700",
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                      px: 3,
                      py: 1
                    }}
                  />
                </Zoom>
                
                <Fade in={true} timeout={800}>
                  <Typography 
                    variant="h4" 
                    my={3} 
                    fontWeight={600}
                    sx={{
                      color: 'rgba(52, 50, 50, 0.95)',
                      lineHeight: 1.4,
                      textShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                  >
                    {currentQ.text}
                  </Typography>
                </Fade>
              </CardContent>

              {/* Timer */}
              <Box
                sx={{
                  ml: 4,
                  p: 2,
                  borderRadius: "50%",
                  backdropFilter: "blur(20px)",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)",
                  boxShadow: "0 15px 35px rgba(0,0,0,0.15)",
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              >
                <CountdownCircleTimer
                  isPlaying={true}
                  duration={currentQ.timeLimit || 30}
                  initialRemainingTime={timeLeft}
                  colors={[
                    "#10b981", // Xanh lá
                    "#f59e0b", // Vàng
                    "#ef4444"  // Đỏ
                  ]}
                  colorsTime={[currentQ.timeLimit || 30, 10, 0]}
                  size={100}
                  strokeWidth={8}
                  trailColor="rgba(255,255,255,0.2)"
                >
                  {({ remainingTime, elapsedTime }) => {
                    const currentScore = hasAnswered && frozenScore !== null ? frozenScore : calculateScore();

                    return (
                      <Box textAlign="center">
                        <Typography 
                          variant="h6" 
                          fontWeight="bold" 
                          sx={{
                            color: hasAnswered ? "rgba(105, 209, 247, 0.7)" : "rgba(105, 209, 247, 0.7)",
                            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }}
                        >
                          {Math.ceil(remainingTime)}s
                        </Typography>
                        <Typography 
                          variant="caption" 
                          fontWeight={hasAnswered ? "bold" : "600"}
                          sx={{
                            color: hasAnswered ? "#10b981" : "rgba(116, 233, 239, 0.8)",
                            fontSize: '0.8rem'
                          }}
                        >
                          {Math.round(currentScore)} điểm
                        </Typography>
                      </Box>
                    );
                  }}
                </CountdownCircleTimer>
              </Box>
            </Box>
          </GlassCard>
        </Fade>

        {/* Multiple Choice */}
        {currentQ.type === QuestionType.MULTIPLE_CHOICE && (
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
            {currentQ.options.map((option, index) => {
              const isCorrect = option === currentQ.correctAnswer;
              const isSelected = selectedAnswer.includes(option);
              const isDisabled = hasAnswered && !isCorrect && !isSelected;
              
              return (
                <Fade in={true} timeout={600 + index * 100} key={index}>
                  <OptionButton
                    disabled={isDisabled}
                    onClick={() => handleAnswerWithScore(option)}
                    sx={getOptionButtonStyle(option, index, isCorrect, isSelected)}
                  >
                    <Chip 
                      label={String.fromCharCode(65 + index)} 
                      sx={{ 
                        mr: 2, 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                        border: 'none'
                      }} 
                    />
                    <Typography variant="body1" fontWeight="inherit">
                      {option}
                    </Typography>
                  </OptionButton>
                </Fade>
              );
            })}
          </Box>
        )}
        
        {/* Multiple Select */}
        {currentQ.type === QuestionType.MULTIPLE_SELECT && (
          <Box>
            <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
              {currentQ.options.map((option, index) => {
                const isDisabled = hasAnswered;
                const isCorrect = currentQ.correctAnswers?.includes(option);
                const isSelected = selectedAnswer.includes(option);
                let bgColor = 'linear-gradient(135deg, rgba(250, 175, 175, 0.95) 0%, rgba(255,255,255,0.85) 100%)';
                let textColor = '#1f2937';
                
                if (isDisabled) {
                  if (isCorrect) {
                    bgColor = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                    textColor = 'white';
                  } else if (isSelected) {
                    bgColor = 'linear-gradient(135deg, #71e3ff 0%, #14a9e8 100%)';
                    textColor = 'white';
                  }
                }
                
                return (
                  <Fade in={true} timeout={600 + index * 100} key={index}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isSelected}
                          onChange={() => onMultipleSelect(option)}
                          disabled={isDisabled}
                          sx={{
                            color: isCorrect ? '#10b981' : isSelected && isDisabled ? '#44ef69' : '#6366f1',
                            '&.Mui-checked': {
                              color: isCorrect ? '#10b981' : isSelected && isDisabled ? '#4fef44' : '#6366f1',
                            }
                          }}
                        />
                      }
                      label={
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Chip 
                            label={String.fromCharCode(65 + index)} 
                            sx={{ 
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              fontWeight: 'bold',
                              border: 'none'
                            }} 
                          />
                          <Typography variant="body1" fontWeight="600" color={textColor}>
                            {option}
                          </Typography>
                        </Stack>
                      }
                      sx={{
                        background: bgColor,
                        p: 2,
                        borderRadius: '16px',
                        border: '2px solid',
                        borderColor: isCorrect ? '#10b981' : isSelected && isDisabled ? '#44bcef' : 'rgba(99, 102, 241, 0.2)',
                        boxShadow: isCorrect ? '0 8px 25px rgba(16, 185, 129, 0.3)' : 
                                   isSelected && isDisabled ? '0 8px 25px rgba(68, 148, 239, 0.3)' :
                                   '0 8px 25px rgba(0, 0, 0, 0.08)',
                        transition: 'all 0.3s ease',
                        '&:hover': !isDisabled ? {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 30px rgba(99, 102, 241, 0.3)'
                        } : {}
                      }}
                    />
                  </Fade>
                );
              })}
            </Box>
            
            <Fade in={true} timeout={1000}>
              <Button
                variant="contained"
                onClick={() => handleAnswerWithScore(selectedAnswer)}
                disabled={hasAnswered || selectedAnswer.length === 0}
                sx={{ 
                  mt: 4, 
                  borderRadius: '16px', 
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 12px 35px rgba(16, 185, 129, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    boxShadow: '0 15px 40px rgba(16, 185, 129, 0.5)',
                    transform: 'translateY(-2px)'
                  },
                  '&:disabled': {
                    background: 'rgba(148, 163, 184, 0.5)',
                    color: 'rgba(255, 255, 255, 0.5)'
                  }
                }}
              >
                Gửi câu trả lời
              </Button>
            </Fade>
          </Box>
        )}
        
        {/* True/False */}
        {currentQ.type === QuestionType.TRUE_FALSE && (
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={3}>
            {['Đúng', 'Sai'].map((option, index) => {
              const isCorrect = option === currentQ.correctAnswer;
              const isSelected = selectedAnswer.includes(option);
              const isDisabled = hasAnswered && !isCorrect && !isSelected;
              
              return (
                <Fade in={true} timeout={600 + index * 200} key={index}>
                  <OptionButton
                    disabled={isDisabled}
                    onClick={() => handleAnswerWithScore(option)}
                    sx={getOptionButtonStyle(option, index, isCorrect, isSelected)}
                  >
                    <Chip 
                      label={option === 'Đúng' ? '✓' : '✗'} 
                      sx={{ 
                        mr: 2, 
                        background: option === 'Đúng' ? 
                          'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                          'linear-gradient(135deg, #abb2f6 0%, #263bdc 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        width: 40,
                        height: 40
                      }} 
                    />
                    <Typography variant="h6" fontWeight="inherit">
                      {option}
                    </Typography>
                  </OptionButton>
                </Fade>
              );
            })}
          </Box>
        )}
        
        {/* Short Answer */}
        {currentQ.type === QuestionType.SHORT_ANSWER && (
          <Box>
            <Fade in={true} timeout={600}>
              <TextField
                fullWidth
                value={shortAnswer}
                onChange={onShortAnswerChange}
                placeholder="Nhập câu trả lời của bạn..."
                disabled={hasAnswered}
                sx={{
                  mb: 3,
                  '& .MuiInputBase-root': { 
                    borderRadius: '16px',
                    background: 'rgba(138, 244, 108, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(99, 102, 241, 0.2)',
                    fontSize: '1.1rem',
                    '&:hover': {
                      border: '2px solid rgba(99, 102, 241, 0.4)',
                    },
                    '&.Mui-focused': {
                      border: '2px solid #6366f1',
                      boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.1)'
                    }
                  },
                  '& .MuiInputBase-input': { 
                    p: 3,
                    fontWeight: 600
                  },
                  '& fieldset': {
                    border: 'none'
                  }
                }}
                variant="outlined"
              />
            </Fade>
            
            <Fade in={true} timeout={800}>
              <Button
                variant="contained"
                onClick={handleSubmitShortAnswerWithScore}
                disabled={hasAnswered || !shortAnswer.trim()}
                sx={{ 
                  borderRadius: '16px', 
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 12px 35px rgba(16, 185, 129, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    boxShadow: '0 15px 40px rgba(16, 185, 129, 0.5)',
                    transform: 'translateY(-2px)'
                  },
                  '&:disabled': {
                    background: 'rgba(148, 163, 184, 0.5)',
                    color: 'rgba(255, 255, 255, 0.5)'
                  }
                }}
              >
                Gửi câu trả lời
              </Button>
            </Fade>
          </Box>
        )}
      </Container>

      <style>{`
        @keyframes gradientMove {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </PlayingBox>
  );
};