import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CardContent, 
  Divider, 
  Stack, 
  Chip, 
  Alert, 
  Fade,
  keyframes 
} from '@mui/material';
import { 
  ShowAnswerBox, 
  GlassCard, 
  AnswerResultCard 
} from '../../styles/QuizPlay.styles';
import { ExtendedQuestion, QuestionType } from '../../types';

// Animation cho hiệu ứng phát sáng
const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(236, 72, 153, 0.5), 0 0 20px rgba(236, 72, 153, 0.3); }
  50% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.8), 0 0 30px rgba(236, 72, 153, 0.5); }
  100% { box-shadow: 0 0 5px rgba(236, 72, 153, 0.5), 0 0 20px rgba(236, 72, 153, 0.3); }
`;

interface ShowAnswerStateProps {
  currentQ: ExtendedQuestion;
  answerResult: {
    correct: boolean;
    correctAnswerText: string;
    userAnswers: { answerText: string }[];
  } | null;
  hasAnswered: boolean;
  isCorrect: boolean;
  earnedPoints: number;
}

export const ShowAnswerState: React.FC<ShowAnswerStateProps> = ({
  currentQ,
  answerResult,
  hasAnswered,
  isCorrect,
  earnedPoints
}) => {
  return (
    <ShowAnswerBox sx={{ 
      background: 'linear-gradient(135deg, #1e3a8a 0%, #a855f7 50%, #ec4899 100%)',
      minHeight: '100vh',
      py: 6,
      overflow: 'hidden',
      position: 'relative',
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
        pointerEvents: 'none'
      }
    }}>
      <Container maxWidth="lg" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Fade in={true} timeout={1200}>
          <Typography 
            variant="h2" 
            fontWeight="bold" 
            mb={8}
            sx={{ 
              color: '#fff',
              fontFamily: '"Orbitron", sans-serif',
              letterSpacing: '2px',
              textShadow: '0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(236, 72, 153, 0.8)',
              animation: `${glow} 2s ease-in-out infinite`
            }}
          >
            Kết quả câu trả lời
          </Typography>
        </Fade>
        
        <GlassCard sx={{ 
          mb: 6, 
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(12px)',
          border: '2px solid transparent',
          borderImage: 'linear-gradient(45deg, #3b82f6, #ec4899) 1',
          borderRadius: 4,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3), 0 0 15px rgba(59,130,246,0.5)',
          animation: `${glow} 3s ease-in-out infinite`
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography 
              variant="h5" 
              mb={4}
              sx={{ 
                color: '#e0f2fe',
                fontFamily: '"Poppins", sans-serif',
                textShadow: '0 0 5px rgba(0,0,0,0.5)'
              }}
            >
              {currentQ.text}
            </Typography>
            
            <Box 
              sx={{ 
                background: 'linear-gradient(45deg, #22c55e, #86efac)',
                p: 3, 
                borderRadius: 3,
                mb: 3,
                boxShadow: '0 0 15px rgba(34,197,94,0.6)',
                transition: 'transform 0.4s ease',
                '&:hover': { transform: 'scale(1.02)' }
              }}
            >
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                mb={1}
                sx={{ color: '#fff', fontFamily: '"Roboto", sans-serif' }}
              >
                ✅ Đáp án đúng
              </Typography>
              <Typography 
                variant="h5" 
                fontWeight="bold"
                sx={{ color: '#fff', fontFamily: '"Poppins", sans-serif' }}
              >
                {answerResult?.correctAnswerText || 
                 (currentQ.type === QuestionType.MULTIPLE_SELECT ? currentQ.correctAnswers?.join(", ") : currentQ.correctAnswer)}
              </Typography>
            </Box>

            {hasAnswered && answerResult && !answerResult.correct && (
              <>
                <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
                <Box 
                  sx={{ 
                    background: 'linear-gradient(45deg, #ef4444, #f87171)',
                    p: 3, 
                    borderRadius: 3,
                    boxShadow: '0 0 15px rgba(239,68,68,0.6)',
                    transition: 'transform 0.4s ease',
                    '&:hover': { transform: 'scale(1.02)' }
                  }}
                >
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    mb={1}
                    sx={{ color: '#fff', fontFamily: '"Roboto", sans-serif' }}
                  >
                    ❌ Câu trả lời của bạn
                  </Typography>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{ color: '#fff', fontFamily: '"Poppins", sans-serif' }}
                  >
                    {answerResult.userAnswers.length > 0 
                      ? answerResult.userAnswers.map(answer => answer.answerText).join(", ")
                      : "Không có câu trả lời"
                    }
                  </Typography>
                </Box>
              </>
            )}

            {currentQ.type === QuestionType.SHORT_ANSWER && (currentQ.acceptedAnswers ?? []).length > 0 && (
              <Typography 
                variant="body1" 
                mt={3} 
                sx={{ 
                  color: '#bfdbfe',
                  fontFamily: '"Roboto", sans-serif',
                  textShadow: '0 0 5px rgba(0,0,0,0.3)'
                }}
              >
                Các đáp án được chấp nhận: {(currentQ.acceptedAnswers ?? []).join(", ")}
              </Typography>
            )}
          </CardContent>
        </GlassCard>

        {hasAnswered && (
          <Fade in={true} timeout={1600}>
            <AnswerResultCard 
              isCorrect={isCorrect}
              sx={{ 
                background: isCorrect 
                  ? 'linear-gradient(45deg, #22c55e, #86efac)' 
                  : 'linear-gradient(45deg, #ef4444, #f87171)',
                borderRadius: 4,
                border: '2px solid transparent',
                borderImage: isCorrect 
                  ? 'linear-gradient(45deg, #22c55e, #86efac) 1' 
                  : 'linear-gradient(45deg, #ef4444, #f87171) 1',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3), 0 0 15px rgba(236,72,153,0.5)',
                transition: 'all 0.4s ease',
                '&:hover': { 
                  transform: 'translateY(-6px)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.4), 0 0 20px rgba(236,72,153,0.6)'
                }
              }}
            >
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={3}>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold"
                    sx={{ 
                      color: '#fff',
                      fontFamily: '"Poppins", sans-serif',
                      textShadow: '0 0 5px rgba(0,0,0,0.5)'
                    }}
                  >
                    {isCorrect ? '🎉 Chính xác!' : '😟 Sai rồi!'}
                  </Typography>
                  {isCorrect && (
                    <Chip 
                      label={`+${earnedPoints} điểm`} 
                      sx={{ 
                        background: '#fff',
                        color: '#166534',
                        fontWeight: 'bold', 
                        fontSize: '1.2rem',
                        boxShadow: '0 0 10px rgba(34,197,94,0.6)',
                        fontFamily: '"Roboto", sans-serif'
                      }}
                    />
                  )}
                </Stack>
              </CardContent>
            </AnswerResultCard>
          </Fade>
        )}

        {!hasAnswered && (
          <Fade in={true} timeout={1600}>
            <Alert 
              severity="info" 
              sx={{ 
                color: '#fff', 
                bgcolor: 'rgba(59,130,246,0.3)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
                border: '2px solid transparent',
                borderImage: 'linear-gradient(45deg, #3b82f6, #60a5fa) 1',
                boxShadow: '0 0 15px rgba(59,130,246,0.5)',
                fontFamily: '"Roboto", sans-serif'
              }}
            >
              Bạn chưa trả lời câu hỏi này
            </Alert>
          </Fade>
        )}
      </Container>
    </ShowAnswerBox>
  );
};