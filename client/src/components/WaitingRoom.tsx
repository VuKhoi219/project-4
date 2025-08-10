import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, set, get, update, db } from "../config/firebase";
import { Participant } from "../types";
import {
  FormControl, SelectChangeEvent, InputLabel, Select, MenuItem, Box, Button, Card, CardContent, 
  Typography, Alert, TextField, InputAdornment, IconButton, List, ListItem, ListItemAvatar, 
  ListItemText, Avatar, Chip, CircularProgress, Stack, Paper, Backdrop, Dialog, DialogTitle, 
  DialogContent, DialogActions, Container, Grid, useTheme, useMediaQuery
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  SportsEsports as SportsEsportsIcon, Person as PersonIcon, Casino as CasinoIcon, 
  Rocket as RocketIcon, Group as GroupIcon, Share as ShareIcon, PlayArrow as PlayArrowIcon, 
  QrCode as QrCodeIcon, Close as CloseIcon
} from '@mui/icons-material';
import { AvatarCreator } from '@readyplayerme/react-avatar-creator';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import type { AvatarCreatorConfig } from '@readyplayerme/react-avatar-creator';
import { AvatarWithAnimation } from "./AvatarWithAnimation";

// Responsive Styled components
const GradientBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #e8f5e8 0%, #e3f2fd 100%)',
  minHeight: '100vh',
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(2),
    justifyContent: 'center',
  },
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: '100%',
  marginBottom: theme.spacing(2),
  backgroundColor: '#fff',
  border: `2px solid ${theme.palette.success.light}`,
  boxShadow: theme.shadows[4],
  [theme.breakpoints.up('sm')]: {
    maxWidth: 500,
    marginBottom: theme.spacing(3),
    boxShadow: theme.shadows[8],
  },
}));

const MainCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: '100%',
  marginBottom: theme.spacing(2),
  boxShadow: theme.shadows[4],
  border: `1px solid ${theme.palette.grey[200]}`,
  [theme.breakpoints.up('sm')]: {
    maxWidth: 500,
    marginBottom: theme.spacing(3),
    boxShadow: theme.shadows[8],
  },
}));

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const CountdownCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: '100%',
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.success.light,
  border: `2px solid ${theme.palette.success.main}`,
  boxShadow: theme.shadows[8],
  animation: `${pulseAnimation} 1.5s ease-in-out infinite`,
  [theme.breakpoints.up('sm')]: {
    maxWidth: 500,
    marginBottom: theme.spacing(3),
    boxShadow: theme.shadows[12],
  },
}));

const ParticipantItem = styled(ListItem, { 
  shouldForwardProp: (prop) => prop !== 'isCurrentUser' 
})<{ isCurrentUser?: boolean }>(({ theme, isCurrentUser }) => ({
  backgroundColor: isCurrentUser ? theme.palette.primary.light : theme.palette.grey[50],
  border: isCurrentUser ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.grey[200]}`,
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  transform: isCurrentUser ? 'scale(1.02)' : 'scale(1)',
  transition: 'all 0.2s ease-in-out',
  padding: theme.spacing(1),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1.5),
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: theme.spacing(1),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1.5, 4),
    fontSize: '1.1rem',
  },
}));

const ResponsiveCanvas = styled(Box)(({ theme }) => ({
  height: 300,
  width: '100%',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    height: 400,
  },
  [theme.breakpoints.up('md')]: {
    height: 500,
  },
}));

const AvatarCreatorBox = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 600,
  margin: 'auto',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    maxWidth: 500,
    height: 800,
  },
  [theme.breakpoints.up('md')]: {
    height: 1000,
  },
}));

// Animation Selector Component
const AnimationSelector: React.FC<{ onSelect: (url: string) => void }> = ({ onSelect }) => {
  const [animations, setAnimations] = useState<string[]>([]);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    fetch('/animations/animations.json')
      .then((res) => res.json())
      .then((data) => setAnimations(data))
      .catch((err) => console.error('Lỗi tải animations:', err));
  }, []);

  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setSelected(value);
    onSelect(value);
  };

  return (
    <FormControl fullWidth>
      <Select
        labelId="animation-select-label"
        value={selected}
        onChange={handleChange}
        size="medium"
      >
        {animations.map((url, index) => (
          <MenuItem key={index} value={url}>
            Chuyển động ăn mừng {index + 1}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

const WaitingRoom: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [participants, setParticipants] = useState<[string, Participant][]>([]);
  const [quizInfo, setQuizInfo] = useState<any>(null);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [isQuizStarted, setIsQuizStarted] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>("");
  const [hasJoinedRoom, setHasJoinedRoom] = useState<boolean>(false);
  const [joinLoading, setJoinLoading] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<string>("");
  const [showQRDialog, setShowQRDialog] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [animations, setAnimations] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedAnim, setSelectedAnim] = useState<string | null>(null);

  const { quizId, roomId } = useParams<{ quizId: string; roomId: string }>();
  const navigate = useNavigate();

  const config: AvatarCreatorConfig = {
    clearCache: true,
    bodyType: 'fullbody',
    quickStart: false
  };

  useEffect(() => {
    fetch('/animations/animations.json')
      .then((res) => res.json())
      .then((data) => setAnimations(data))
      .catch((err) => console.error('Lỗi tải animations:', err));
  }, []);

  useEffect(() => {
    if (!quizId || !roomId) { 
      navigate('/'); 
      return; 
    }

    const savedUserName = localStorage.getItem("userName");
    const savedQuizId = localStorage.getItem("quizId");
    const savedRoomId = localStorage.getItem("roomId");
    
    if (savedUserName && savedQuizId === quizId && savedRoomId === roomId) {
      setUserName(savedUserName);
      setHasJoinedRoom(true);
    } else {
      localStorage.removeItem("userName");
    }

    const quizTemplateInfoRef = ref(db, `quizzes/${quizId}/info`);
    const unsubscribeQuizInfo = onValue(quizTemplateInfoRef, (snapshot) => {
      setQuizInfo(snapshot.val());
      if (snapshot.exists()) setLoading(false);
    });

    const roomInfoRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/info`);
    const unsubscribeRoomInfo = onValue(roomInfoRef, (snapshot) => {
      const info = snapshot.val();
      setRoomInfo(info);
      if (info?.createdBy === savedUserName && savedUserName) setIsHost(true);
    });

    return () => { 
      unsubscribeQuizInfo(); 
      unsubscribeRoomInfo(); 
    };
  }, [quizId, roomId, navigate]);

  useEffect(() => {
    if (!hasJoinedRoom || !quizId || !roomId) return;
    
    let countdownTimer: NodeJS.Timeout;
    
    const participantsRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/participants`);
    const unsubscribeParticipants = onValue(participantsRef, (snapshot) => 
      setParticipants(snapshot.val() ? Object.entries(snapshot.val()) : [])
    );

    const roomStatusRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/status`);
    const unsubscribeStatus = onValue(roomStatusRef, (snapshot) => {
      if (snapshot.val()?.isStarted) setIsQuizStarted(true);
    });

    const currentStateRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/currentState`);
    const unsubscribeCurrentState = onValue(currentStateRef, (snapshot) => {
      const state = snapshot.val();
      if (state?.phase === 'get-ready' || state?.phase === 'playing') {
        setCountdown(3);
        countdownTimer = setInterval(() => setCountdown(p => p > 1 ? p - 1 : 0), 1000);
        setTimeout(() => navigate(`/quiz/${quizId}/room/${roomId}/play`), 3000);
      }
    });

    return () => {
      unsubscribeParticipants(); 
      unsubscribeStatus(); 
      unsubscribeCurrentState();
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [hasJoinedRoom, quizId, roomId, navigate]);

  const generateRandomName = () => {
    const adjectives = ["Cool", "Smart", "Fast", "Super", "Happy", "Mighty", "Great"];
    const nouns = ["Player", "Gamer", "Master", "Hero", "Legend", "Dude", "Cat"];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 100);
    setUserName(`${randomAdj}${randomNoun}${randomNum}`);
  };

  const handleOnAvatarExported = (event: any) => {
    const url = event.data.url;
    setAvatarUrl(url);
  };

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    setSelectedAnim(animations[index]);
  };

  const handleJoinWithName = async () => {
    if (!userName.trim() || !quizId || !roomId) { 
      setShowWarning("Vui lòng nhập tên!"); 
      return; 
    }
    if (userName.length > 20) { 
      setShowWarning("Tên không được quá 20 ký tự!"); 
      return; 
    }
    if (!avatarUrl || !selectedAnim) { 
      setShowWarning("Vui lòng tạo avatar và chọn chuyển động trước!"); 
      return; 
    }

    setJoinLoading(true);
    setShowWarning("");

    try {
      const userRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/participants/${userName}`);
      if ((await get(userRef)).exists()) {
        setShowWarning(`Tên "${userName}" đã được sử dụng!`);
        setJoinLoading(false);
        return;
      }

      // Lưu vào participants
      await set(userRef, { 
        joinedAt: Date.now(), 
        score: 0, 
        isActive: true, 
        displayName: userName,
        avatarUrl: avatarUrl,
        animationUrl: selectedAnim
      });

      // Lưu vào leaderboard
      await set(ref(db, `quizzes/${quizId}/rooms/${roomId}/leaderboard/${userName}`), { 
        bestScore: 0, 
        lastPlayed: Date.now(), 
        displayName: userName, 
        rank: 0 
      });

      // Nếu là host
      if (!roomInfo?.createdBy || roomInfo.createdBy === 'system') {
        await update(ref(db, `quizzes/${quizId}/rooms/${roomId}/info`), { createdBy: userName });
        setIsHost(true);
      }

      // Lưu localStorage
      localStorage.setItem("userName", userName); 
      localStorage.setItem("quizId", quizId); 
      localStorage.setItem("roomId", roomId);

      setHasJoinedRoom(true);

    } catch (error) { 
      console.error(error); 
      setShowWarning("Đã có lỗi xảy ra!");
    } finally { 
      setJoinLoading(false); 
    }
  };

  const handleStartQuiz = async () => {
    if (!quizId || !roomId || !isHost) return;
    try {
      await update(ref(db, `quizzes/${quizId}/rooms/${roomId}/status`), { 
        isStarted: true, 
        startedAt: Date.now(), 
        startedBy: userName 
      });
      await set(ref(db, `quizzes/${quizId}/rooms/${roomId}/currentState`), { 
        phase: 'get-ready', 
        questionIndex: 0, 
        timeLeft: 30, 
        maxTimePerQuestion: 30 
      });
    } catch (error) { 
      console.error(error); 
      alert("Lỗi khi bắt đầu quiz!"); 
    }
  };

  const copyRoomLink = () => {
    const roomLink = window.location.href.replace('/waiting', '');
    navigator.clipboard.writeText(roomLink).then(() => alert("Đã copy link phòng!"));
  };

  const showQRCode = () => {
    const roomLink = window.location.href.replace('/waiting', '');
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(roomLink)}`;
    setQrCodeUrl(qrUrl);
    setShowQRDialog(true);
  };

  const closeQRDialog = () => {
    setShowQRDialog(false);
  };

  if (loading) {
    return (
      <Backdrop open={loading} sx={{ color: '#fff' }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    );
  }

  if (!hasJoinedRoom) {
    return (
      <GradientBox>
        <Container maxWidth="sm" sx={{ padding: { xs: 1, sm: 2 } }}>
          <HeaderCard>
            <CardContent sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
                PHÒNG CHỜ QUIZ
              </Typography>
            </CardContent>
          </HeaderCard>

          <MainCard>
            <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                textAlign="center" 
                fontWeight="bold" 
                mb={2}
              >
                {quizInfo?.title || 'Quiz Game'}
              </Typography>
              <Typography 
                variant="body1" 
                textAlign="center" 
                mb={3} 
                fontFamily="monospace" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
              >
                Room ID: {roomId}
              </Typography>

              {showWarning && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {showWarning}
                </Alert>
              )}

              <TextField 
                fullWidth 
                value={userName} 
                onChange={(e) => setUserName(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && handleJoinWithName()} 
                placeholder="Nhập tên của bạn (tối đa 20 ký tự)" 
                disabled={joinLoading}
                size={isMobile ? "small" : "medium"}
                InputProps={{ 
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        title="Tên ngẫu nhiên" 
                        onClick={generateRandomName}
                        size={isMobile ? "small" : "medium"}
                      >
                        <CasinoIcon />
                      </IconButton>
                    </InputAdornment>
                  ) 
                }} 
              />

              {/* Avatar Creator - Responsive */}
              {!avatarUrl && (
                <AvatarCreatorBox>
                  <AvatarCreator
                    subdomain="quiz-8clzwi"
                    config={config}
                    onAvatarExported={handleOnAvatarExported}
                    style={{ width: '100%', height: '100%' }}
                  />
                </AvatarCreatorBox>
              )}

              {avatarUrl && (
                <>
                  {/* Canvas hiển thị avatar - Responsive */}
                  <ResponsiveCanvas>
                    <Canvas camera={{ position: [0, 2, 5] }}>
                      <ambientLight intensity={1} />
                      <directionalLight position={[5, 5, 5]} />
                      <OrbitControls enablePan={false} enableZoom={!isMobile} />
                      {avatarUrl && selectedAnim && (
                        <AvatarWithAnimation
                          avatarUrl={avatarUrl}
                          animationUrl={`/animations/${selectedAnim}`}
                        />
                      )}
                    </Canvas>
                  </ResponsiveCanvas>

                  {/* Animation Selector - Responsive */}
                  <Typography 
                    variant={isMobile ? "body1" : "h6"} 
                    sx={{ mb: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    Chọn chuyển động:
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mb: 2, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                  >
                    Vui lòng chọn một chuyển động, nhân vật sẽ hiển thị chuyển động này khi tham gia quiz
                  </Typography>
                  <AnimationSelector onSelect={(url) => setSelectedAnim(url)} />
                </>
              )}

              <ActionButton 
                variant="contained" 
                color="success" 
                onClick={handleJoinWithName} 
                disabled={joinLoading || !userName.trim()} 
                fullWidth 
                sx={{ mt: 2 }}
                startIcon={joinLoading ? <CircularProgress size={20} /> : <RocketIcon />}
              >
                Tham Gia Phòng
              </ActionButton>
            </CardContent>
          </MainCard>
        </Container>
      </GradientBox>
    );
  }

  return (
    <GradientBox>
      <Container maxWidth="sm" sx={{ padding: { xs: 1, sm: 2 } }}>
        <HeaderCard>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
            <Typography variant={isMobile ? "body1" : "h6"} fontWeight="bold">
              {quizInfo?.title}
            </Typography>
          </CardContent>
        </HeaderCard>

        <MainCard>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography textAlign="center" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Mời bạn bè với Room ID:
            </Typography>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              textAlign="center" 
              fontWeight="bold" 
              fontFamily="monospace" 
              color="primary.main" 
              mb={2}
            >
              {roomId}
            </Typography>
            <Stack 
              direction={isMobile ? "column" : "row"} 
              spacing={1} 
              sx={{ gap: { xs: 1, sm: 1 } }}
            >
              <Button 
                variant="contained" 
                onClick={copyRoomLink} 
                startIcon={<ShareIcon />} 
                sx={{ flex: 1, fontSize: { xs: '0.8rem', sm: '1rem' } }}
                size={isMobile ? "medium" : "large"}
              >
                Copy Link
              </Button>
              <Button 
                variant="outlined" 
                onClick={showQRCode} 
                startIcon={<QrCodeIcon />} 
                sx={{ flex: 1, fontSize: { xs: '0.8rem', sm: '1rem' } }}
                size={isMobile ? "medium" : "large"}
              >
                QR Code
              </Button>
            </Stack>
          </CardContent>
        </MainCard>
        
        {countdown > 0 && (
          <CountdownCard>
            <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
              <Typography variant={isMobile ? "h6" : "h5"} color="success.dark">
                Quiz Bắt Đầu Sau
              </Typography>
              <Typography variant={isMobile ? "h3" : "h2"} fontWeight="bold">
                {countdown}
              </Typography>
            </CardContent>
          </CountdownCard>
        )}
        
        <MainCard>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              fontWeight="bold" 
              textAlign="center" 
              mb={2}
            >
              <GroupIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> 
              Người chơi ({participants.length})
            </Typography>
            <Box sx={{ maxHeight: { xs: 200, sm: 250 }, overflowY: 'auto', p: 1 }}>
              {participants.length > 0 ? (
                participants.map(([name, info], index) => (
                  <ParticipantItem key={name} isCurrentUser={name === userName}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}>
                        {info.displayName.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={
                        <Typography 
                          fontWeight="bold" 
                          sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                        >
                          {info.displayName}
                          {name === userName ? ' (Bạn)' : ''}
                          {roomInfo?.createdBy === info.displayName ? ' 👑' : ''}
                        </Typography>
                      } 
                    />
                  </ParticipantItem>
                ))
              ) : (
                <Typography 
                  textAlign="center" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  Chưa có ai tham gia, hãy mời bạn bè!
                </Typography>
              )}
            </Box>
          </CardContent>
        </MainCard>
        
        {isHost && !isQuizStarted && (
          <Box textAlign="center" mt={2}>
            <ActionButton 
              variant="contained" 
              color="success" 
              onClick={handleStartQuiz} 
              startIcon={<PlayArrowIcon />} 
              size={isMobile ? "medium" : "large"}
              sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }}
            >
              Bắt đầu cho {participants.length} người
            </ActionButton>
            <Typography 
              variant="caption" 
              display="block" 
              mt={1}
              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
            >
              Bạn là chủ phòng, hãy bắt đầu khi sẵn sàng!
            </Typography>
          </Box>
        )}
        
        {!isHost && !isQuizStarted && (
          <Alert 
            severity="info" 
            sx={{ 
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              '& .MuiAlert-message': { fontSize: 'inherit' }
            }}
          >
            Đang chờ chủ phòng ({roomInfo?.createdBy || '...'}) bắt đầu...
          </Alert>
        )}

        {/* QR Code Dialog - Responsive */}
        <Dialog 
          open={showQRDialog} 
          onClose={closeQRDialog} 
          maxWidth="sm" 
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle sx={{ textAlign: 'center', position: 'relative', p: { xs: 2, sm: 3 } }}>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
              Quét QR Code để tham gia
            </Typography>
            <IconButton 
              onClick={closeQRDialog}
              sx={{ 
                position: 'absolute', 
                right: { xs: 8, sm: 16 }, 
                top: { xs: 8, sm: 16 } 
              }}
              size={isMobile ? "small" : "medium"}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', pb: 3, px: { xs: 2, sm: 3 } }}>
            {qrCodeUrl && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 }, display: 'inline-block' }}>
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code" 
                    style={{ 
                      width: isMobile ? '180px' : '200px', 
                      height: isMobile ? '180px' : '200px', 
                      display: 'block' 
                    }}
                  />
                </Paper>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  Người khác có thể quét mã này để tham gia phòng
                </Typography>
                <Typography 
                  variant="body2" 
                  fontFamily="monospace" 
                  color="primary.main"
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  Room ID: {roomId}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2, px: { xs: 2, sm: 3 } }}>
            <Button 
              onClick={copyRoomLink} 
              variant="outlined" 
              startIcon={<ShareIcon />}
              size={isMobile ? "medium" : "large"}
              sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}
            >
              Copy Link
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </GradientBox>
  );
};

export default WaitingRoom;