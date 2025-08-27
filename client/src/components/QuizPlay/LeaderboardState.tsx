import React from 'react';
import { 
  Container, 
  Typography, 
  Stack, 
  CardContent, 
  Avatar, 
  Box, 
  Fade,
  keyframes 
} from '@mui/material';
import { LeaderboardBox, PlayerCard } from '../../styles/QuizPlay.styles';

// Animation cho hiệu ứng phát sáng
const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(59, 130, 246, 0.5); }
  100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3); }
`;

interface LeaderboardPlayer {
  name: string;
  avatar: string;
  score: number;
  isCurrentPlayer: boolean;
}

interface LeaderboardStateProps {
  displayLeaderboard: LeaderboardPlayer[];
  hostControlEnabled: boolean;
  waitingForHost: boolean;
  isHost: boolean;
  roomInfo: any;
}

export const LeaderboardState: React.FC<LeaderboardStateProps> = ({
  displayLeaderboard,
  hostControlEnabled,
  waitingForHost,
  isHost,
  roomInfo
}) => {
  return (
    <LeaderboardBox sx={{ 
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
            🏆 Bảng Xếp Hạng 🏆
          </Typography>
        </Fade>

        <Stack spacing={3} maxWidth={900} mx="auto">
          {displayLeaderboard.slice(0, 5).map((p, i) => {
            const medals = ['🥇', '🥈', '🥉'];
            const medal = i < 3 ? medals[i] : `${i + 1}`;
            return (
              <Fade in={true} timeout={800 + i * 400} key={p.name}>
                <PlayerCard 
                  isCurrentPlayer={p.isCurrentPlayer}
                  sx={{ 
                    background: p.isCurrentPlayer 
                      ? 'linear-gradient(45deg, #f472b6, #f9a8d4)' 
                      : 'rgba(255,255,255,0.1)',
                    borderRadius: 4,
                    border: '2px solid transparent',
                    borderImage: p.isCurrentPlayer 
                      ? 'linear-gradient(45deg, #f472b6, #a855f7) 1' 
                      : 'linear-gradient(45deg, #3b82f6, #60a5fa) 1',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3), 0 0 15px rgba(59,130,246,0.5)',
                    transition: 'all 0.4s ease',
                    '&:hover': { 
                      transform: 'translateY(-6px) scale(1.03)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.4), 0 0 20px rgba(236,72,153,0.6)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={4}>
                      <Avatar
                        src={p.avatar || undefined}
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: p.avatar ? 'transparent' : '#a855f7',
                          color: '#fff',
                          fontWeight: 'bold',
                          border: '4px solid #fff',
                          boxShadow: '0 0 15px rgba(236,72,153,0.7)',
                          transition: 'transform 0.4s ease',
                          '&:hover': { transform: 'rotate(5deg)' }
                        }}
                      >
                        {!p.avatar && p.name.charAt(0).toUpperCase()}
                      </Avatar>

                      <Box flexGrow={1} textAlign="left">
                        <Typography 
                          variant="h5" 
                          fontWeight="bold"
                          sx={{ 
                            color: p.isCurrentPlayer ? '#fff' : '#e0f2fe',
                            fontFamily: '"Poppins", sans-serif',
                            textShadow: '0 0 5px rgba(0,0,0,0.5)'
                          }}
                        >
                          {medal} {p.name}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: p.isCurrentPlayer ? '#fce7f3' : '#bfdbfe',
                            fontFamily: '"Roboto", sans-serif'
                          }}
                        >
                          {p.score} điểm
                        </Typography>
                      </Box>

                      <Typography 
                        variant="h4" 
                        fontWeight="bold" 
                        sx={{ 
                          color: p.isCurrentPlayer ? '#fff' : '#3b82f6',
                          textShadow: '0 0 10px rgba(59,130,246,0.7)',
                          fontFamily: '"Orbitron", sans-serif'
                        }}
                      >
                        {p.score}
                      </Typography>
                    </Stack>
                  </CardContent>
                </PlayerCard>
              </Fade>
            );
          })}
        </Stack>

        {hostControlEnabled && !waitingForHost && (
          <Fade in={true} timeout={2000}>
            <Box 
              mt={8}
              sx={{
                background: 'rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)',
                p: 3,
                borderRadius: 4,
                border: '2px solid transparent',
                borderImage: 'linear-gradient(45deg, #3b82f6, #ec4899) 1',
                boxShadow: '0 0 15px rgba(236,72,153,0.5)',
                animation: `${glow} 3s ease-in-out infinite`
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#fff',
                  fontFamily: '"Poppins", sans-serif',
                  textShadow: '0 0 5px rgba(0,0,0,0.5)'
                }}
              >
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
};