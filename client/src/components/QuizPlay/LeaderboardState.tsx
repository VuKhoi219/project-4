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

// Animation nhẹ nhàng
const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const gentleGlow = keyframes`
  0% { box-shadow: 0 8px 32px rgba(79, 172, 254, 0.15); }
  50% { box-shadow: 0 12px 40px rgba(79, 172, 254, 0.25); }
  100% { box-shadow: 0 8px 32px rgba(79, 172, 254, 0.15); }
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
    backgroundImage: `linear-gradient(135deg, rgba(124,58,237,0.7), rgba(37,99,235,0.7)), url("/img/backgrounddep4k.jpg")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
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
        background: `
          radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.06) 0%, transparent 70%),
          radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.05) 0%, transparent 70%),
          radial-gradient(circle at 50% 20%, rgba(236, 72, 153, 0.04) 0%, transparent 80%)
        `,
        pointerEvents: 'none'
      }
    }}>
      <Container maxWidth="lg" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Fade in={true} timeout={1200}>
          <Typography 
            variant="h2" 
            fontWeight="800" 
            mb={6}
            sx={{ 
              color: '#1e293b',
              fontFamily: '"Inter", sans-serif',
              letterSpacing: '-1px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 25%, #dc2626 50%, #be123c 75%, #a21caf 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: `${floatAnimation} 4s ease-in-out infinite`,
              filter: 'drop-shadow(0 4px 8px rgba(245, 158, 11, 0.15))',
              position: 'relative',
              '&:before': {
                content: '"🏆"',
                position: 'absolute',
                left: '-60px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.8em',
                animation: `${floatAnimation} 3s ease-in-out infinite reverse`
              },
              '&:after': {
                content: '"🏆"',
                position: 'absolute',
                right: '-60px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '0.8em',
                animation: `${floatAnimation} 3s ease-in-out infinite reverse`
              }
            }}
          >
            Bảng Xếp Hạng
          </Typography>
        </Fade>

        <Stack spacing={3} maxWidth={900} mx="auto">
          {displayLeaderboard.slice(0, 5).map((p, i) => {
            const medals = ['🥇', '🥈', '🥉'];
            const medal = i < 3 ? medals[i] : `#${i + 1}`;
            
            // Màu gradient dựa trên ranking
            let cardGradient = '';
            let borderColor = '';
            
            if (p.isCurrentPlayer) {
              cardGradient = 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)';
              borderColor = '2px solid rgba(236, 72, 153, 0.3)';
            } else {
              switch (i) {
                case 0: // Vàng cho hạng 1
                  cardGradient = 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)';
                  borderColor = '2px solid rgba(251, 191, 36, 0.3)';
                  break;
                case 1: // Bạc cho hạng 2
                  cardGradient = 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)';
                  borderColor = '2px solid rgba(229, 231, 235, 0.5)';
                  break;
                case 2: // Đồng cho hạng 3
                  cardGradient = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
                  borderColor = '2px solid rgba(249, 115, 22, 0.3)';
                  break;
                default: // Xanh dương cho các hạng khác
                  cardGradient = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                  borderColor = '2px solid rgba(59, 130, 246, 0.3)';
              }
            }

            return (
              <Fade in={true} timeout={800 + i * 200} key={p.name}>
                <PlayerCard 
                  isCurrentPlayer={p.isCurrentPlayer}
                  sx={{ 
                    background: `rgba(255, 255, 255, 0.95)`,
                    borderRadius: '20px',
                    border: borderColor,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '6px',
                      background: cardGradient,
                      opacity: 0.8
                    },
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, pt: 5 }}>
                    <Stack direction="row" alignItems="center" spacing={4}>
                      <Box sx={{ position: 'relative' }}>
                        <Avatar
                          src={p.avatar || undefined}
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: p.avatar ? 'transparent' : cardGradient.includes('#ec4899') ? '#ec4899' : '#3b82f6',
                            color: '#fff',
                            fontWeight: 'bold',
                            border: `4px solid ${p.isCurrentPlayer ? '#ec4899' : '#3b82f6'}`,
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
                            transition: 'transform 0.3s ease',
                            fontSize: '2rem'
                          }}
                        >
                          {!p.avatar && p.name.charAt(0).toUpperCase()}
                        </Avatar>
                        
                        {/* Medal badge */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            fontSize: i < 3 ? '18px' : '14px',
                            fontWeight: 'bold',
                            color: i < 3 ? 'inherit' : '#64748b'
                          }}
                        >
                          {medal}
                        </Box>
                      </Box>

                      <Box flexGrow={1} textAlign="left">
                        <Typography 
                          variant="h5" 
                          fontWeight="700"
                          sx={{ 
                            color: '#1e293b',
                            fontFamily: '"Inter", sans-serif',
                            mb: 1
                          }}
                        >
                          {p.name}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: '#64748b',
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: '500'
                          }}
                        >
                          {p.score} điểm
                        </Typography>
                      </Box>

                      <Box 
                        sx={{ 
                          background: cardGradient,
                          borderRadius: '16px',
                          px: 3,
                          py: 2,
                          minWidth: '80px',
                          textAlign: 'center'
                        }}
                      >
                        <Typography 
                          variant="h4" 
                          fontWeight="800" 
                          sx={{ 
                            color: '#fff',
                            fontFamily: '"Inter", sans-serif',
                            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                          }}
                        >
                          {p.score}
                        </Typography>
                      </Box>
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
              mt={6}
              sx={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(16px)',
                p: 4,
                borderRadius: '16px',
                border: '2px solid rgba(59, 130, 246, 0.2)',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)',
                animation: `${gentleGlow} 3s ease-in-out infinite`,
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#334155',
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: '600',
                  lineHeight: 1.5
                }}
              >
                {isHost ? 
                  "🎮 Bạn sẽ có thể chuyển câu tiếp theo trong giây lát..." : 
                  `⏳ Chờ chủ phòng ${roomInfo?.createdBy} chuyển câu tiếp theo...`
                }
              </Typography>
            </Box>
          </Fade>
        )}
      </Container>
    </LeaderboardBox>
  );
};