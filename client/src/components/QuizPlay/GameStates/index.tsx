import React from 'react';
import { Container, Typography, Fade } from '@mui/material';
import { 
  GetReadyBox, 
  AnimatedTitle, 
  WaitingForHostBox, 
  GlassCard,
  HostControlButton 
} from '../../../styles/QuizPlay.styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface GetReadyStateProps {
  currentQuestionIndex: number;
}

export const GetReadyState: React.FC<GetReadyStateProps> = ({ currentQuestionIndex }) => {
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
};

interface WaitingForHostStateProps {
  isHost: boolean;
  roomInfo: any;
  currentQuestionIndex: number;
  totalQuestions: number;
  onNextQuestion: () => void;
}

export const WaitingForHostState: React.FC<WaitingForHostStateProps> = ({
  isHost,
  roomInfo,
  currentQuestionIndex,
  totalQuestions,
  onNextQuestion
}) => {
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
                onClick={onNextQuestion}
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
};