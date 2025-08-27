import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { Box, Typography, Button, Card } from '@mui/material';

// Animations
export const pulse = keyframes`0%, 100% { opacity: 1; } 50% { opacity: 0.7; }`;
export const bounce = keyframes`0%, 20%, 53%, 80%, 100% { transform: translateY(0); } 40%, 43% { transform: translateY(-8px); } 70% { transform: translateY(-4px); }`;

// Styled Components
export const BaseBox = styled(Box)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: white;
  transition: background 0.5s ease;
`;

export const GetReadyBox = styled(BaseBox)`
  background: linear-gradient(135deg, #55b5f5 0%, #7c3aed 100%);
`;

export const ShowAnswerBox = styled(BaseBox)`
  background: linear-gradient(135deg, #f97316 0%, #dc2626 100%);
`;

export const LeaderboardBox = styled(BaseBox)`
  background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
`;

export const PlayingBox = styled(BaseBox)`
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
  color: #1f2937;
`;

export const WaitingForHostBox = styled(BaseBox)`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
`;

export const AnimatedTitle = styled(Typography)`
  animation: ${pulse} 2s infinite;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

export const CountdownText = styled(Typography)`
  animation: ${pulse} 1s infinite;
  font-weight: 700;
  font-size: 4rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

export const GlassCard = styled(Card)`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

export const PlayerCard = styled(Card)<{ isCurrentPlayer?: boolean }>`
  background: ${props => (props.isCurrentPlayer ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 255, 255, 0.1)')};
  border: ${props => (props.isCurrentPlayer ? '2px solid #ffc107' : '1px solid rgba(255, 255, 255, 0.2)')};
  transform: ${props => (props.isCurrentPlayer ? 'scale(1.03)' : 'scale(1)')};
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.05);
  }
`;

export const OptionButton = styled(Button)`
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

export const AnswerResultCard = styled(Card)<{ isCorrect?: boolean }>`
  background: ${props => (props.isCorrect ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)')};
  border: 2px solid ${props => (props.isCorrect ? '#22c55e' : '#ef4444')};
  border-radius: 12px;
  margin-bottom: 16px;
`;

export const HostControlButton = styled(Button)`
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