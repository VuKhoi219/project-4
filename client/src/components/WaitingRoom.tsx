import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, set, get, update, db } from "../config/firebase";
import { Participant } from "../types";
import {
  Box, Button, Card, CardContent, Typography, Alert, TextField, InputAdornment, IconButton,
  Avatar, CircularProgress, Stack, Paper, Backdrop, Dialog, DialogTitle,
  DialogContent, DialogActions, Container, useTheme, useMediaQuery, List, ListItem, ListItemAvatar, ListItemText, Grid
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { Casino as CasinoIcon, Share as ShareIcon, PlayArrow as PlayArrowIcon, QrCode as QrCodeIcon } from '@mui/icons-material';
import { Center } from "@react-three/drei";

const GradientBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #e8f5e8 0%, #e3f2fd 100%)',
  minHeight: '100vh',
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  width: '100%',
  backgroundColor: '#fff',
  border: `2px solid ${theme.palette.success.light}`,
  boxShadow: theme.shadows[4],
  marginBottom: theme.spacing(2)
}));

const MainCard = styled(Card)(({ theme }) => ({
  width: '100%',
  boxShadow: theme.shadows[4],
  border: `1px solid ${theme.palette.grey[200]}`,
  marginBottom: theme.spacing(2)
}));

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const CountdownCard = styled(Card)(({ theme }) => ({
  width: '100%',
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.success.light,
  border: `2px solid ${theme.palette.success.main}`,
  boxShadow: theme.shadows[8],
  animation: `${pulseAnimation} 1.5s ease-in-out infinite`
}));

const ParticipantItem = styled(ListItem)<{ isCurrentUser?: boolean }>(({ theme, isCurrentUser }) => ({
  backgroundColor: isCurrentUser ? theme.palette.primary.light : theme.palette.grey[50],
  border: isCurrentUser ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.grey[200]}`,
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  fontSize: '1rem',
  fontWeight: 600,
  borderRadius: theme.spacing(1),
}));

const WaitingRoom: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [participants, setParticipants] = useState<[string, Participant][]>([]);
  const [quizInfo, setQuizInfo] = useState<any>(null);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [isQuizStarted, setIsQuizStarted] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("");
  const [hasJoinedRoom, setHasJoinedRoom] = useState<boolean>(false);
  const [joinLoading, setJoinLoading] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<string>("");
  const [showQRDialog, setShowQRDialog] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [imageList, setImageList] = useState<any[]>([]);

  // Chọn avatar
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");

  const { quizId, roomId } = useParams<{ quizId: string; roomId: string }>();
  const navigate = useNavigate();

  const getRandomLightColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * (70 - 40) + 40);
    const lightness = Math.floor(Math.random() * (90 - 70) + 70);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  useEffect(() => {
    fetch('/img/listImage.json')
      .then(res => res.json())
      .then(data => setImageList(data))
      .catch(err => console.error(err));
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

  const handleJoinWithName = async () => {
    if (!userName.trim() || !quizId || !roomId) { 
      setShowWarning("Vui lòng nhập tên!"); 
      return; 
    }
    if (userName.length > 20) { 
      setShowWarning("Tên không được quá 20 ký tự!"); 
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

      const randomAvatar = imageList[Math.floor(Math.random() * imageList.length)];
      const avatarUrl = `/img/${randomAvatar}`;
      const backgroundColor = getRandomLightColor();

      await set(userRef, { 
        joinedAt: Date.now(), 
        score: 0, 
        isActive: true, 
        displayName: userName,
        avatar: avatarUrl,
        background: backgroundColor
      });

      await set(ref(db, `quizzes/${quizId}/rooms/${roomId}/leaderboard/${userName}`), { 
        bestScore: 0, 
        lastPlayed: Date.now(), 
        displayName: userName, 
        rank: 0,
        avatar: avatarUrl
      });

      if (!roomInfo?.createdBy || roomInfo.createdBy === 'system') {
        await update(ref(db, `quizzes/${quizId}/rooms/${roomId}/info`), { createdBy: userName });
        setIsHost(true);
      }

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
        <Container maxWidth="sm">
          <HeaderCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold">
                PHÒNG CHỜ QUIZ
              </Typography>
            </CardContent>
          </HeaderCard>

          <MainCard>
            <CardContent>
              <Typography variant="h5" textAlign="center" fontWeight="bold" mb={2}>
                {quizInfo?.title || 'Quiz Game'}
              </Typography>
              <Typography variant="body1" textAlign="center" mb={3} fontFamily="monospace" color="text.secondary">
                Room ID: {roomId}
              </Typography>

              {showWarning && <Alert severity="warning" sx={{ mb: 2 }}>{showWarning}</Alert>}

              <TextField
                fullWidth
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleJoinWithName()}
                placeholder="Nhập tên của bạn (tối đa 20 ký tự)"
                disabled={joinLoading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton title="Tên ngẫu nhiên" onClick={generateRandomName}>
                        <CasinoIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{ mb: 2 }}
              />

              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleJoinWithName}
                disabled={joinLoading}
                sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold', borderRadius: '8px' }}
              >
                {joinLoading ? <CircularProgress size={24} /> : "Tham gia phòng"}
              </Button>
            </CardContent>
          </MainCard>
        </Container>
      </GradientBox>
    );
  }

  return (
    <GradientBox>
      <Container maxWidth="md">
        <HeaderCard>
          <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">
              {quizInfo?.title || 'Quiz Game'}
            </Typography>
            <Typography variant="body1" fontFamily="monospace">
              Room ID: {roomId}
            </Typography>
          </CardContent>
        </HeaderCard>

        {countdown > 0 && (
          <CountdownCard>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight="bold" color="white">
                Bắt đầu trong {countdown}...
              </Typography>
            </CardContent>
          </CountdownCard>
        )}

        <MainCard>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Người tham gia ({participants.length})
              </Typography>
              <Stack direction="row" spacing={1}>
                <ActionButton variant="outlined" startIcon={<ShareIcon />} onClick={copyRoomLink}>
                  Chia sẻ
                </ActionButton>
                {/* Nếu vẫn muốn có nút QR thì giữ lại */}
                {/* <ActionButton variant="outlined" startIcon={<QrCodeIcon />} onClick={showQRCode}>
                  QR
                </ActionButton> */}
              </Stack>
            </Stack>
            <Grid container spacing={2} alignItems="flex-start">
              {/* Cột QR Code */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Box display="flex" justifyContent="center" p={2}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                      window.location.href.replace('/waiting', '')
                    )}`}
                    alt="QR Code"
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "12px",
                      padding: "8px",
                      backgroundColor: "#fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                </Box>
              </Grid>

              {/* Cột danh sách người tham gia */}
              <Grid size={{ xs: 12, md: 6 }}>
                <List>
                  {participants.map(([name, player]) => {
                    const isCurrentUser = name === userName;
                    return (
                      <ParticipantItem
                        key={name}
                        isCurrentUser={isCurrentUser}
                        style={{
                          backgroundColor: player.background || getRandomLightColor(),
                          padding: 10,
                          display: "flex",
                          marginBottom: 8, // thêm khoảng cách giữa các item
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar src={player.avatar} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={player.displayName}
                          secondary={player.score !== undefined ? `${player.score} điểm` : null}
                        />
                        {isCurrentUser && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setShowAvatarDialog(true)}
                          >
                            Đổi Avatar
                          </Button>
                        )}
                      </ParticipantItem>
                    );
                  })}
                </List>
              </Grid>
            </Grid>



          </CardContent>
        </MainCard>


        {isHost && (
          <ActionButton
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={handleStartQuiz}
            sx={{ mt: 2 }}
          >
            Bắt đầu Quiz
          </ActionButton>
        )}
      </Container>

      {/* Dialog chọn avatar */}
      <Dialog open={showAvatarDialog} onClose={() => setShowAvatarDialog(false)}   maxWidth="md" fullWidth>
        <DialogTitle>Chọn Avatar Mới</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", // rộng hơn
              gap: 2,
              justifyItems: "center"
            }}
          >
            {imageList.map((img, i) => (
              <Avatar
                key={i}
                src={`/img/${img}`}
                sx={{
                  width: 64,
                  height: 64,
                  cursor: "pointer",
                  border: selectedAvatar === img ? "2px solid #1976d2" : "2px solid transparent",
                  transition: "0.2s",
                  "&:hover": { transform: "scale(1.1)" }
                }}
                onClick={() => setSelectedAvatar(img)}
              />
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAvatarDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            disabled={!selectedAvatar}
            onClick={async () => {
              const avatarUrl = `/img/${selectedAvatar}`;
              await update(ref(db, `quizzes/${quizId}/rooms/${roomId}/participants/${userName}`), {
                avatar: avatarUrl
              });
              await update(ref(db, `quizzes/${quizId}/rooms/${roomId}/leaderboard/${userName}`), {
                avatar: avatarUrl
              });
              setShowAvatarDialog(false);
            }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog hiển thị QR Code */}
      <Dialog open={showQRDialog} onClose={() => setShowQRDialog(false)}>
        <DialogTitle>Mã QR phòng</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="QR Code" style={{ width: "200px", height: "200px" }} />
          ) : (
            <Typography>Đang tạo mã QR...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQRDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

    </GradientBox>
  );
};

export default WaitingRoom;
