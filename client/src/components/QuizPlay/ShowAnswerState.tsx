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

// Animation cho hiệu ứng nhẹ nhàng
const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const pulseGlow = keyframes`
  0% { box-shadow: 0 4px 20px rgba(79, 172, 254, 0.2); }
  50% { box-shadow: 0 8px 30px rgba(79, 172, 254, 0.4); }
  100% { box-shadow: 0 4px 20px rgba(79, 172, 254, 0.2); }
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
      background: 'linear-gradient(135deg, #fdfeff 0%, #e0f2fe 30%, #f0f9ff 70%, #ffffff 100%)',
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
        background: 'radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 60%), radial-gradient(circle at 70% 80%, rgba(147, 197, 253, 0.06) 0%, transparent 60%)',
        pointerEvents: 'none'
      }
    }}>
      <Container maxWidth="lg" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Fade in={true} timeout={1200}>
          <Typography 
            variant="h2" 
            fontWeight="700" 
            mb={6}
            sx={{ 
              color: '#0f172a',
              fontFamily: '"Inter", sans-serif',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: `${floatAnimation} 3s ease-in-out infinite`,
              textShadow: 'none'
            }}
          >
            Kết quả câu trả lời
          </Typography>
        </Fade>
        
        <GlassCard sx={{ 
          mb: 4, 
          width: '100%',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(59, 130, 246, 0.08), 0 4px 16px rgba(0, 0, 0, 0.03)',
          animation: `${pulseGlow} 4s ease-in-out infinite`,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 15px 50px rgba(59, 130, 246, 0.12), 0 6px 20px rgba(0, 0, 0, 0.05)'
          }
        }}>
          <CardContent sx={{ p: 5 }}>
            <Typography 
              variant="h5" 
              mb={4}
              sx={{ 
                color: '#334155',
                fontFamily: '"Inter", sans-serif',
                fontWeight: '600',
                lineHeight: 1.4
              }}
            >
              {currentQ.text}
            </Typography>
            
            <Box 
              sx={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                p: 4, 
                borderRadius: '16px',
                mb: 3,
                position: 'relative',
                overflow: 'hidden',
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-200px',
                  width: '200px',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: `${shimmer} 2s infinite`
                }
              }}
            >
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} mb={2}>
                <Box 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: 'rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography sx={{ fontSize: '18px' }}>✓</Typography>
                </Box>
                <Typography 
                  variant="h6" 
                  fontWeight="600"
                  sx={{ color: '#fff', fontFamily: '"Inter", sans-serif' }}
                >
                  Đáp án đúng
                </Typography>
              </Stack>
              <Typography 
                variant="h5" 
                fontWeight="700"
                sx={{ 
                  color: '#fff', 
                  fontFamily: '"Inter", sans-serif',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {answerResult?.correctAnswerText || 
                 (currentQ.type === QuestionType.MULTIPLE_SELECT ? currentQ.correctAnswers?.join(", ") : currentQ.correctAnswer)}
              </Typography>
            </Box>

            {hasAnswered && answerResult && !answerResult.correct && (
              <>
                <Divider sx={{ my: 4, bgcolor: 'rgba(148, 163, 184, 0.3)', height: '1px' }} />
                <Box 
                  sx={{ 
                    background: 'linear-gradient(135deg, #f87171 0%, #f67272 100%)',
                    p: 4, 
                    borderRadius: '16px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} mb={2}>
                    <Box 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%', 
                        background: 'rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography sx={{ fontSize: '18px' }}>✗</Typography>
                    </Box>
                    <Typography 
                      variant="h6" 
                      fontWeight="600"
                      sx={{ color: '#fff', fontFamily: '"Inter", sans-serif' }}
                    >
                      Câu trả lời của bạn
                    </Typography>
                  </Stack>
                  <Typography 
                    variant="h5" 
                    fontWeight="700"
                    sx={{ 
                      color: '#fff', 
                      fontFamily: '"Inter", sans-serif',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                  {answerResult?.userAnswers?.length
                    ? answerResult.userAnswers.map(a => a.answerText).join(", ")
                    : "Không có câu trả lời"
                  }
                  </Typography>
                </Box>
              </>
            )}

            {currentQ.type === QuestionType.SHORT_ANSWER && (currentQ.acceptedAnswers ?? []).length > 0 && (
              <Box 
                sx={{ 
                  mt: 4,
                  p: 3,
                  background: 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)',
                  borderRadius: '12px'
                }}
              >
                <Typography 
                  variant="body1"
                  sx={{ 
                    color: '#fff',
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: '500'
                  }}
                >
                  Các đáp án được chấp nhận: {(currentQ.acceptedAnswers ?? []).join(", ")}
                </Typography>
              </Box>
            )}
          </CardContent>
        </GlassCard>

        {hasAnswered && (
          <Fade in={true} timeout={1600}>
            <AnswerResultCard 
              isCorrect={isCorrect}
              sx={{ 
                background: isCorrect 
                  ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' 
                  : 'linear-gradient(135deg, #f87171 0%, #e75b5b 100%)',
                borderRadius: '20px',
                border: 'none',
                boxShadow: isCorrect
                  ? '0 8px 32px rgba(16, 185, 129, 0.3), 0 2px 8px rgba(0, 0, 0, 0.05)'
                  : '0 8px 32px rgba(248, 113, 113, 0.3), 0 2px 8px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: isCorrect
                    ? '0 12px 40px rgba(16, 185, 129, 0.4), 0 4px 12px rgba(0, 0, 0, 0.08)'
                    : '0 12px 40px rgba(248, 113, 113, 0.4), 0 4px 12px rgba(0, 0, 0, 0.08)'
                }
              }}
            >
              <CardContent sx={{ py: 4 }}>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={3}>
                  <Typography 
                    variant="h4" 
                    fontWeight="700"
                    sx={{ 
                      color: '#fff',
                      fontFamily: '"Inter", sans-serif',
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {isCorrect ? '🎉 Chính xác!' : '😞 Sai rồi!'}
                  </Typography>
                  {isCorrect && (
                    <Chip 
                      label={`+${earnedPoints} điểm`} 
                      sx={{ 
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: '#059669',
                        fontWeight: '700', 
                        fontSize: '1.1rem',
                        height: '40px',
                        borderRadius: '20px',
                        fontFamily: '"Inter", sans-serif',
                        boxShadow: '0 4px 12px rgba(255, 255, 255, 0.3)'
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
                background: 'linear-gradient(135deg, #60a5fa 0%, #93c5fd 100%)',
                color: '#fff',
                borderRadius: '16px',
                border: 'none',
                boxShadow: '0 8px 32px rgba(96, 165, 250, 0.3), 0 2px 8px rgba(0, 0, 0, 0.05)',
                fontFamily: '"Inter", sans-serif',
                fontWeight: '500',
                fontSize: '1.1rem',
                '& .MuiAlert-icon': {
                  color: '#fff'
                }
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