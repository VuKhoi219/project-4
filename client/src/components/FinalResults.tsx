import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, update, db } from "../config/firebase";
import { LeaderboardEntry } from "../types";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Grid,
  Paper,
  Avatar,
  Stack,
  Container,
  Fade,
  Zoom,
  Slide,
  IconButton,
  Collapse,
  Divider,
  Tooltip
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Share as ShareIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  BarChart as ChartIcon,
  Groups as GroupsIcon,
  Quiz as QuizIcon,
  Timer as TimerIcon,
  GpsFixed as TargetIcon,
  Star as StarIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

// Keyframes for animations
const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translateY(0);
  }
  40%, 43% {
    transform: translateY(-30px);
  }
  70% {
    transform: translateY(-15px);
  }
  90% {
    transform: translateY(-4px);
  }
`;

// Enhanced confetti animation - rơi vĩnh viễn
const confettiFloat = keyframes`
  0% {
    transform: translateY(-10vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(110vh) rotate(720deg);
    opacity: 0;
  }
`;

// Trophy floating animation
const trophyFloat = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
`;

// Sparkle animation
const sparkle = keyframes`
  0%, 100% {
    opacity: 0;
    transform: scale(0.5);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
`;

// Styled components
const GradientBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f3e5f5 0%, #e3f2fd 50%, #e8eaf6 100%)',
  position: 'relative',
  overflow: 'hidden',
}));

const CelebrationHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(8),
  position: 'relative',
}));

const FloatingTrophy = styled(Typography)(({ theme }) => ({
  animation: `${trophyFloat} 3s ease-in-out infinite, ${sparkle} 2s ease-in-out infinite`,
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}));

const GradientText = styled(Typography)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FFD700 30%, #FF6B6B 90%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  fontWeight: 'bold',
  animation: `${bounce} 2s infinite`,
}));

const ConfettiBox = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 9999,
}));

const ConfettiItem = styled(Box)<{ delay: number; duration: number; left: number }>(({ delay, duration, left }) => ({
  position: 'absolute',
  left: `${left}%`,
  top: '-10px',
  fontSize: '2rem',
  animation: `${confettiFloat} ${duration}s ${delay}s infinite linear`,
}));

const PodiumCard = styled(Card)<{ rank: number }>(({ theme, rank }) => {
  const colors = {
    1: { from: '#FFD700', to: '#FFA000' }, // Gold
    2: { from: '#C0C0C0', to: '#9E9E9E' }, // Silver
    3: { from: '#CD7F32', to: '#FF8F00' }, // Bronze
  };
  
  const color = colors[rank as keyof typeof colors];
  
  return {
    background: `linear-gradient(135deg, ${color.from} 0%, ${color.to} 100%)`,
    color: 'white',
    transform: 'translateY(0)',
    transition: 'all 0.3s ease-in-out',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-8px) scale(1.02)',
      boxShadow: theme.shadows[12],
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
      transition: 'left 0.5s',
    },
    '&:hover::before': {
      left: '100%',
    },
  };
});

const PlayerCard = styled(Card)<{ isCurrentUser?: boolean; isSelected?: boolean; rank?: number }>(({ theme, isCurrentUser, isSelected, rank }) => ({
  margin: theme.spacing(1, 0),
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  transform: isCurrentUser ? 'scale(1.02)' : 'scale(1)',
  background: isCurrentUser 
    ? 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)'
    : isSelected
    ? 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)'
    : rank && rank <= 3
    ? 'linear-gradient(135deg, #F5F5F5 0%, #EEEEEE 100%)'
    : '#FFFFFF',
  border: isCurrentUser ? `2px solid ${theme.palette.warning.main}` : `1px solid ${theme.palette.divider}`,
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: isCurrentUser ? 'scale(1.03)' : 'scale(1.01)',
  },
}));

const RankAvatar = styled(Avatar)<{ rank: number }>(({ theme, rank }) => {
  const getBackgroundColor = () => {
    switch (rank) {
      case 1: return 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)';
      case 2: return 'linear-gradient(135deg, #C0C0C0 0%, #9E9E9E 100%)';
      case 3: return 'linear-gradient(135deg, #CD7F32 0%, #FF8F00 100%)';
      default: return 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)';
    }
  };

  return {
    width: 56,
    height: 56,
    background: getBackgroundColor(),
    fontSize: '1.5rem',
    fontWeight: 'bold',
    animation: rank <= 3 ? `${sparkle} 2s ease-in-out infinite` : 'none',
  };
});

const SparkleEffect = styled(Box)(({ theme }) => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  '&::before, &::after': {
    content: '"✨"',
    position: 'absolute',
    fontSize: '1rem',
    animation: `${sparkle} 1.5s ease-in-out infinite`,
  },
  '&::before': {
    top: '10%',
    left: '10%',
    animationDelay: '0s',
  },
  '&::after': {
    bottom: '10%',
    right: '10%',
    animationDelay: '0.5s',
  },
}));

const FinalResults: React.FC = () => {
  const [finalLeaderboard, setFinalLeaderboard] = useState<Array<{name: string, score: number, rank: number}>>([]);
  const [participants, setParticipants] = useState<Record<string, any>>({});
  const [quizInfo, setQuizInfo] = useState<any>(null);
  const [showCelebration, setShowCelebration] = useState(true);
  const [loading, setLoading] = useState(true);
  const [playHistory, setPlayHistory] = useState<Record<string, any>>({});
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [confettiItems, setConfettiItems] = useState<Array<{id: number, emoji: string, delay: number, duration: number, left: number}>>([]);
  
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");

  // Generate confetti items
  useEffect(() => {
    const emojis = ['🎉', '🎊', '✨', '🏆', '🥇', '🌟', '🎈', '🎁', '💫', '⭐'];
    const generateConfetti = () => {
      const items = [];
      for (let i = 0; i < 100; i++) {
        items.push({
          id: i,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          delay: Math.random() * 5,
          duration: 3 + Math.random() * 4,
          left: Math.random() * 100,
        });
      }
      setConfettiItems(items);
    };

    generateConfetti();
    
    // Regenerate confetti every 10 seconds for continuous effect
    const confettiInterval = setInterval(generateConfetti, 10000);
    
    return () => clearInterval(confettiInterval);
  }, []);

  useEffect(() => {
    if (!quizId) {
      navigate('/');
      return;
    }

    // Load quiz info
    const infoRef = ref(db, `quizzes/${quizId}/info`);
    const unsubscribeInfo = onValue(infoRef, (snapshot) => {
      setQuizInfo(snapshot.val());
    });

    // Load participants
    const participantsRef = ref(db, `quizzes/${quizId}/participants`);
    const unsubscribeParticipants = onValue(participantsRef, (snapshot) => {
      setParticipants(snapshot.val() || {});
    });

    // Load play history
    const historyRef = ref(db, `quizzes/${quizId}/playHistory`);
    const unsubscribeHistory = onValue(historyRef, (snapshot) => {
      setPlayHistory(snapshot.val() || {});
    });

    // Load leaderboard data
    const leaderboardRef = ref(db, `quizzes/${quizId}/leaderboard`);
    const unsubscribeLeaderboard = onValue(leaderboardRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const leaderboardData = data as Record<string, LeaderboardEntry>;
        const sorted = Object.entries(leaderboardData)
          .map(([name, info]) => ({
            name,
            score: info.bestScore,
            rank: info.rank || 0
          }))
          .sort((a, b) => b.score - a.score)
          .map((player, index) => ({
            ...player,
            rank: player.rank || index + 1
          }));
        setFinalLeaderboard(sorted);
      }
      setLoading(false);
    });

    // Hide celebration animation after 5 seconds
    const celebrationTimer = setTimeout(() => {
      setShowCelebration(false);
    }, 5000);

    return () => {
      unsubscribeInfo();
      unsubscribeParticipants();
      unsubscribeHistory();
      unsubscribeLeaderboard();
      clearTimeout(celebrationTimer);
    };
  }, [quizId, navigate]);

  const getPlayerStats = (playerName: string) => {
    const history = playHistory[playerName]?.attempts || {};
    const attempts = Object.values(history) as any[];
    
    if (attempts.length === 0) return null;

    const correctAnswers = attempts.filter(a => a.isCorrect).length;
    const totalQuestions = attempts.length;
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    const averageTimeLeft = Math.round(
      attempts.reduce((sum: number, a: any) => sum + (a.timeLeft || 0), 0) / attempts.length
    );

    return {
      accuracy,
      correctAnswers,
      totalQuestions,
      averageTimeLeft,
      bestAnswer: attempts.reduce((best, current) => 
        (current.score || 0) > (best.score || 0) ? current : best, attempts[0])
    };
  };

  const shareResults = () => {
    const userRank = finalLeaderboard.findIndex(p => p.name === userName) + 1;
    const userScore = finalLeaderboard.find(p => p.name === userName)?.score || 0;
    
    const shareText = `🎉 Tôi vừa hoàn thành Quiz Multiplayer!
    
📊 Kết quả của tôi:
🏆 Xếp hạng: #${userRank}/${finalLeaderboard.length}
⭐ Điểm số: ${userScore}
🎮 Quiz: ${quizInfo?.title || 'Multiplayer Quiz'}

Thử thách bản thân tại: ${window.location.origin}/quiz/${quizId}`;

    if (navigator.share) {
      navigator.share({
        title: 'Quiz Multiplayer Results',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('✅ Đã copy kết quả để chia sẻ!');
      });
    }
  };

  const createNewRoom = () => {
    const newRoomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem("quizId", newRoomId);
    navigate(`/quiz/${newRoomId}/join`);
  };

  if (loading) {
    return (
      <GradientBox display="flex" alignItems="center" justifyContent="center">
        <Box textAlign="center">
          <CircularProgress size={64} thickness={4} sx={{ mb: 3, color: 'purple' }} />
          <Typography variant="h5" color="text.primary" gutterBottom>
            Đang tính toán kết quả cuối cùng...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Vui lòng đợi một chút
          </Typography>
        </Box>
      </GradientBox>
    );
  }

  return (
    <GradientBox>
      {/* Permanent Confetti Animation */}
      <ConfettiBox>
        {confettiItems.map((item) => (
          <ConfettiItem
            key={`${item.id}-${Date.now()}`}
            delay={item.delay}
            duration={item.duration}
            left={item.left}
          >
            {item.emoji}
          </ConfettiItem>
        ))}
      </ConfettiBox>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Main Celebration Header with Permanent Trophy */}
        <Fade in={showCelebration} timeout={1000}>
          <CelebrationHeader>
            <Box position="relative" display="inline-block">
              <FloatingTrophy sx={{ fontSize: { xs: '6rem', md: '8rem' }, mb: 2 }}>
                🏆
              </FloatingTrophy>
              <SparkleEffect />
            </Box>
            <GradientText variant="h1" sx={{ fontSize: { xs: '3rem', md: '5rem' }, mb: 2 }}>
              HOÀN THÀNH!
            </GradientText>
            <Typography variant="h4" color="text.primary" fontWeight="600">
              Quiz Multiplayer đã kết thúc
            </Typography>
          </CelebrationHeader>
        </Fade>

        {/* Quiz Info */}
        {quizInfo && (
          <Zoom in timeout={800}>
            <Card sx={{ maxWidth: 800, mx: 'auto', mb: 6, boxShadow: 8, position: 'relative', overflow: 'hidden' }}>
              <SparkleEffect />
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {quizInfo.title}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 3, mt: 2 }}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <GroupsIcon fontSize="large" />
                      <Typography variant="h6" fontWeight="600">
                        {finalLeaderboard.length} người chơi
                      </Typography>
                    </Stack>
                  </Box>
                  
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <QuizIcon fontSize="large" />
                      <Typography variant="h6" fontWeight="600">
                        {quizInfo.totalQuestions || 5} câu hỏi
                      </Typography>
                    </Stack>
                  </Box>
                  
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TimerIcon fontSize="large" />
                      <Typography variant="h6" fontWeight="600">
                        30s/câu
                      </Typography>
                    </Stack>
                  </Box>
                  
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TargetIcon fontSize="large" />
                      <Typography variant="h6" fontWeight="600">
                        Tối đa {quizInfo.pointsPerQuestion || 100} điểm/câu
                      </Typography>
                    </Stack>
                  </Box>
                </Box>

                <Chip
                  label={`Room ID: ${quizId}`}
                  variant="outlined"
                  sx={{ mt: 3, fontFamily: 'monospace', fontSize: '0.9rem' }}
                />
              </CardContent>
            </Card>
          </Zoom>
        )}

        {/* Enhanced Podium for Top 3 */}
        {finalLeaderboard.length >= 3 && (
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" fontWeight="bold" textAlign="center" sx={{ mb: 4 }}>
              🏅 PODIUM TOP 3
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              justifyContent: 'center', 
              alignItems: 'end', 
              gap: 2, 
              maxWidth: 1000, 
              mx: 'auto' 
            }}>
              {/* 2nd Place */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 300px' }, maxWidth: { xs: '100%', sm: '350px' } }}>
                <Slide direction="right" in timeout={1200}>
                  <Box position="relative">
                    <PodiumCard rank={2} sx={{ height: 200 }}>
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'rgba(255,255,255,0.3)' }}>
                          🥈
                        </Avatar>
                        <Typography variant="h5" fontWeight="bold">
                          {finalLeaderboard[1]?.name}
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          {finalLeaderboard[1]?.score} điểm
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ mt: 2 }}>
                          #2
                        </Typography>
                      </CardContent>
                    </PodiumCard>
                    <SparkleEffect />
                  </Box>
                </Slide>
              </Box>

              {/* 1st Place - Enhanced */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 300px' }, maxWidth: { xs: '100%', sm: '350px' } }}>
                <Slide direction="up" in timeout={1000}>
                  <Box position="relative">
                    <PodiumCard rank={1} sx={{ height: 250 }}>
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'rgba(255,255,255,0.3)' }}>
                          🥇
                        </Avatar>
                        <Typography variant="h4" fontWeight="bold">
                          {finalLeaderboard[0]?.name}
                        </Typography>
                        <Typography variant="h5" sx={{ mt: 1 }}>
                          {finalLeaderboard[0]?.score} điểm
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          🎉 CHAMPION!
                        </Typography>
                        <Typography variant="h3" fontWeight="bold" sx={{ mt: 2 }}>
                          #1
                        </Typography>
                      </CardContent>
                    </PodiumCard>
                    <SparkleEffect />
                  </Box>
                </Slide>
              </Box>

              {/* 3rd Place */}
              <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 300px' }, maxWidth: { xs: '100%', sm: '350px' } }}>
                <Slide direction="left" in timeout={1400}>
                  <Box position="relative">
                    <PodiumCard rank={3} sx={{ height: 200 }}>
                      <CardContent sx={{ textAlign: 'center', p: 3 }}>
                        <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'rgba(255,255,255,0.3)' }}>
                          🥉
                        </Avatar>
                        <Typography variant="h5" fontWeight="bold">
                          {finalLeaderboard[2]?.name}
                        </Typography>
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          {finalLeaderboard[2]?.score} điểm
                        </Typography>
                        <Typography variant="h4" fontWeight="bold" sx={{ mt: 2 }}>
                          #3
                        </Typography>
                      </CardContent>
                    </PodiumCard>
                    <SparkleEffect />
                  </Box>
                </Slide>
              </Box>
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          {/* Main Results */}
          <Box sx={{ flex: { xs: '1', lg: '2' } }}>
            <Card sx={{ boxShadow: 8 }}>
              <Box sx={{ background: 'linear-gradient(135deg, #673AB7 0%, #3F51B5 100%)', color: 'white', p: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  📊 Bảng Xếp Hạng Cuối Cùng
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Kết quả chính thức của tất cả người chơi
                </Typography>
              </Box>
              
              <CardContent sx={{ p: 3 }}>
                {finalLeaderboard.length > 0 ? (
                  <Stack spacing={2}>
                    {finalLeaderboard.map((player, index) => {
                      const stats = getPlayerStats(player.name);
                      const isCurrentUser = player.name === userName;
                      
                      return (
                        <PlayerCard
                          key={player.name}
                          isCurrentUser={isCurrentUser}
                          isSelected={selectedPlayer === player.name}
                          rank={index + 1}
                          onClick={() => setSelectedPlayer(selectedPlayer === player.name ? "" : player.name)}
                        >
                          <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Stack direction="row" spacing={2} alignItems="center">
                                <RankAvatar rank={index + 1}>
                                  {index === 0 ? '👑' : 
                                   index === 1 ? '🥈' : 
                                   index === 2 ? '🥉' : 
                                   `#${index + 1}`}
                                </RankAvatar>
                                
                                <Box>
                                  <Typography variant="h6" fontWeight="bold">
                                    {player.name}
                                    {isCurrentUser && ' (Bạn)'}
                                  </Typography>
                                  <Stack direction="row" spacing={2}>
                                    <Chip label={`🏆 ${player.score} điểm`} size="small" />
                                    {stats && (
                                      <>
                                        <Chip label={`🎯 ${stats.accuracy}% đúng`} size="small" />
                                        <Chip label={`⚡ ${stats.averageTimeLeft}s TB`} size="small" />
                                      </>
                                    )}
                                  </Stack>
                                </Box>
                              </Stack>
                              
                              <Box textAlign="right">
                                <Typography variant="h4" fontWeight="bold" color="text.primary">
                                  {player.score}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  điểm
                                </Typography>
                              </Box>
                            </Stack>
                            
                            {/* Expanded Stats */}
                            <Collapse in={selectedPlayer === player.name}>
                              {stats && (
                                <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                    <Box sx={{ flex: { xs: '1 1 45%', sm: '1 1 22%' } }}>
                                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                                        <Typography variant="h6" fontWeight="bold">
                                          {stats.correctAnswers}/{stats.totalQuestions}
                                        </Typography>
                                        <Typography variant="body2">Câu đúng</Typography>
                                      </Paper>
                                    </Box>
                                    <Box sx={{ flex: { xs: '1 1 45%', sm: '1 1 22%' } }}>
                                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                                        <Typography variant="h6" fontWeight="bold">
                                          {stats.accuracy}%
                                        </Typography>
                                        <Typography variant="body2">Độ chính xác</Typography>
                                      </Paper>
                                    </Box>
                                    <Box sx={{ flex: { xs: '1 1 45%', sm: '1 1 22%' } }}>
                                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                                        <Typography variant="h6" fontWeight="bold">
                                          {stats.averageTimeLeft}s
                                        </Typography>
                                        <Typography variant="body2">TB thời gian</Typography>
                                      </Paper>
                                    </Box>
                                    <Box sx={{ flex: { xs: '1 1 45%', sm: '1 1 22%' } }}>
                                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                                        <Typography variant="h6" fontWeight="bold">
                                          {Math.round(player.score / (quizInfo?.totalQuestions || 5))}
                                        </Typography>
                                        <Typography variant="body2">Điểm/câu</Typography>
                                      </Paper>
                                    </Box>
                                  </Box>
                                </Box>
                              )}
                            </Collapse>
                          </CardContent>
                        </PlayerCard>
                      );
                    })}
                  </Stack>
                ) : (
                  <Box textAlign="center" py={8}>
                    <Typography sx={{ fontSize: '4rem', mb: 2 }}>🤔</Typography>
                    <Typography variant="h5" color="text.secondary">
                      Không có dữ liệu
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Sidebar */}
          <Box sx={{ flex: { xs: '1', lg: '1' } }}>
            <Stack spacing={3}>
              {/* Personal Achievement */}
              {userName && finalLeaderboard.find(p => p.name === userName) && (
                <Card sx={{ background: 'linear-gradient(135deg, #FFF8E1 0%, #FFE0B2 100%)', boxShadow: 6, position: 'relative', overflow: 'hidden' }}>
                  <SparkleEffect />
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" textAlign="center" gutterBottom>
                      🎯 Thành Tích Của Bạn
                    </Typography>
                    {(() => {
                      const userRank = finalLeaderboard.findIndex(p => p.name === userName) + 1;
                      const userScore = finalLeaderboard.find(p => p.name === userName)?.score || 0;
                      const userStats = getPlayerStats(userName);
                      
                      return (
                        <Stack spacing={2}>
                          <Box textAlign="center">
                            <Typography variant="h3" fontWeight="bold" color="warning.main">
                              #{userRank}
                            </Typography>
                            <Typography color="text.secondary">
                              Xếp hạng cuối cùng
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.6)' }}>
                                <Typography variant="h5" fontWeight="bold" color="success.main">
                                  {userScore}
                                </Typography>
                                <Typography variant="caption">Tổng điểm</Typography>
                              </Paper>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.6)' }}>
                                <Typography variant="h5" fontWeight="bold" color="info.main">
                                  {userStats ? `${userStats.accuracy}%` : '0%'}
                                </Typography>
                                <Typography variant="caption">Độ chính xác</Typography>
                              </Paper>
                            </Box>
                          </Box>

                          {userRank === 1 && (
                            <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.main', color: 'warning.contrastText', position: 'relative' }}>
                              <Typography fontWeight="bold">
                                🏆 CHÚC MỪNG! BẠN LÀ NHẤT!
                              </Typography>
                              <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                                <Typography sx={{ position: 'absolute', top: '10%', left: '10%', fontSize: '1rem', animation: `${sparkle} 1s ease-in-out infinite` }}>✨</Typography>
                                <Typography sx={{ position: 'absolute', top: '20%', right: '15%', fontSize: '1rem', animation: `${sparkle} 1s ease-in-out infinite`, animationDelay: '0.3s' }}>🌟</Typography>
                                <Typography sx={{ position: 'absolute', bottom: '15%', left: '20%', fontSize: '1rem', animation: `${sparkle} 1s ease-in-out infinite`, animationDelay: '0.6s' }}>💫</Typography>
                              </Box>
                            </Paper>
                          )}
                        </Stack>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Statistics */}
              <Card sx={{ boxShadow: 6 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    📈 Thống Kê Game
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">Tổng người chơi:</Typography>
                      <Typography fontWeight="bold" color="info.main">
                        {finalLeaderboard.length}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">Điểm cao nhất:</Typography>
                      <Typography fontWeight="bold" color="success.main">
                        {finalLeaderboard.length > 0 ? finalLeaderboard[0].score : 0}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">Điểm trung bình:</Typography>
                      <Typography fontWeight="bold" color="secondary.main">
                        {finalLeaderboard.length > 0 
                          ? Math.round(finalLeaderboard.reduce((sum, p) => sum + p.score, 0) / finalLeaderboard.length)
                          : 0
                        }
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography color="text.secondary">Hoàn thành lúc:</Typography>
                      <Typography fontWeight="bold" color="warning.main" variant="body2">
                        {new Date().toLocaleTimeString('vi-VN')}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card sx={{ boxShadow: 6 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    ⚡ Hành Động
                  </Typography>
                  <Stack spacing={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      startIcon={<ShareIcon />}
                      onClick={shareResults}
                      sx={{ py: 1.5 }}
                    >
                      Chia Sẻ Kết Quả
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      startIcon={<ChartIcon />}
                      onClick={() => navigate(`/quiz/${quizId}/leaderboard`)}
                      sx={{ py: 1.5 }}
                    >
                      Xem Chi Tiết
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      startIcon={<RefreshIcon />}
                      onClick={createNewRoom}
                      sx={{ py: 1.5 }}
                    >
                      Chơi Lại
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>
        </Box>

        {/* Bottom Actions */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Card sx={{ maxWidth: 800, mx: 'auto', boxShadow: 8, position: 'relative', overflow: 'hidden' }}>
            <SparkleEffect />
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                🎮 Chơi Tiếp?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Cảm ơn bạn đã tham gia! Hãy thử thách bản thân với một quiz mới hoặc mời bạn bè cùng chơi.
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 200px' }, maxWidth: { xs: '100%', sm: '250px' } }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={createNewRoom}
                    sx={{
                      py: 3,
                      background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
                        transform: 'scale(1.02)',
                      },
                      transition: 'all 0.3s ease-in-out',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Stack alignItems="center" spacing={1}>
                      <Typography sx={{ fontSize: '2rem' }}>🆕</Typography>
                      <Typography fontWeight="bold">Tạo Phòng Mới</Typography>
                    </Stack>
                  </Button>
                </Box>
                
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 200px' }, maxWidth: { xs: '100%', sm: '250px' } }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate('/')}
                    sx={{
                      py: 3,
                      background: 'linear-gradient(135deg, #2196F3 0%, #42A5F5 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #42A5F5 0%, #2196F3 100%)',
                        transform: 'scale(1.02)',
                      },
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    <Stack alignItems="center" spacing={1}>
                      <Typography sx={{ fontSize: '2rem' }}>🏠</Typography>
                      <Typography fontWeight="bold">Trang Chủ</Typography>
                    </Stack>
                  </Button>
                </Box>
                
                <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 200px' }, maxWidth: { xs: '100%', sm: '250px' } }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={shareResults}
                    sx={{
                      py: 3,
                      background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #BA68C8 0%, #9C27B0 100%)',
                        transform: 'scale(1.02)',
                      },
                      transition: 'all 0.3s ease-in-out',
                    }}
                  >
                    <Stack alignItems="center" spacing={1}>
                      <Typography sx={{ fontSize: '2rem' }}>📱</Typography>
                      <Typography fontWeight="bold">Chia Sẻ</Typography>
                    </Stack>
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Quiz ID: {quizId} | Multiplayer Quiz Game
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            🎉 Cảm ơn bạn đã chơi! Hẹn gặp lại trong game tiếp theo!
          </Typography>
        </Box>
      </Container>
    </GradientBox>
  );
};

export default FinalResults;