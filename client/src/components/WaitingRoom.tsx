

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, set, get, update, db } from "../config/firebase";
import { Participant } from "../types";
import { Box, Button, Card, CardContent, Typography, Alert, TextField, InputAdornment, IconButton, List, ListItem, ListItemAvatar, ListItemText, Avatar, Chip, CircularProgress, Stack, Paper, Backdrop } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { SportsEsports as SportsEsportsIcon, Person as PersonIcon, Casino as CasinoIcon, Rocket as RocketIcon, Group as GroupIcon, Share as ShareIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';

// Styled components
const GradientBox = styled(Box)(({ theme }) => ({ background: 'linear-gradient(135deg, #e8f5e8 0%, #e3f2fd 100%)', minHeight: '100vh', padding: theme.spacing(2), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', }));
const HeaderCard = styled(Card)(({ theme }) => ({ maxWidth: 450, width: '100%', marginBottom: theme.spacing(3), backgroundColor: '#fff', border: `2px solid ${theme.palette.success.light}`, boxShadow: theme.shadows[8], }));
const MainCard = styled(Card)(({ theme }) => ({ maxWidth: 450, width: '100%', marginBottom: theme.spacing(3), boxShadow: theme.shadows[8], border: `1px solid ${theme.palette.grey[200]}`, }));
const pulseAnimation = keyframes`0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); }`;
const CountdownCard = styled(Card)(({ theme }) => ({ maxWidth: 450, width: '100%', marginBottom: theme.spacing(3), backgroundColor: theme.palette.success.light, border: `2px solid ${theme.palette.success.main}`, boxShadow: theme.shadows[12], animation: `${pulseAnimation} 1.5s ease-in-out infinite` }));
const ParticipantItem = styled(ListItem, { shouldForwardProp: (prop) => prop !== 'isCurrentUser' })<{ isCurrentUser?: boolean }>(({ theme, isCurrentUser }) => ({ backgroundColor: isCurrentUser ? theme.palette.primary.light : theme.palette.grey[50], border: isCurrentUser ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.grey[200]}`, borderRadius: theme.spacing(1), marginBottom: theme.spacing(1), transform: isCurrentUser ? 'scale(1.02)' : 'scale(1)', transition: 'all 0.2s ease-in-out', }));
const ActionButton = styled(Button)(({ theme }) => ({ padding: theme.spacing(1.5, 4), fontSize: '1.1rem', fontWeight: 600, textTransform: 'none', borderRadius: theme.spacing(1) }));

const WaitingRoom: React.FC = () => {
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
  const { quizId, roomId } = useParams<{ quizId: string; roomId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!quizId || !roomId) { navigate('/'); return; }
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
    return () => { unsubscribeQuizInfo(); unsubscribeRoomInfo(); };
  }, [quizId, roomId, navigate]);

  useEffect(() => {
    if (!hasJoinedRoom || !quizId || !roomId) return;
    let countdownTimer: NodeJS.Timeout;
    const participantsRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/participants`);
    const unsubscribeParticipants = onValue(participantsRef, (snapshot) => setParticipants(snapshot.val() ? Object.entries(snapshot.val()) : []));
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
      unsubscribeParticipants(); unsubscribeStatus(); unsubscribeCurrentState();
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
    if (!userName.trim() || !quizId || !roomId) { setShowWarning("Vui lòng nhập tên!"); return; }
    if (userName.length > 20) { setShowWarning("Tên không được quá 20 ký tự!"); return; }
    setJoinLoading(true);
    setShowWarning("");
    try {
      const userRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/participants/${userName}`);
      if ((await get(userRef)).exists()) {
        setShowWarning(`Tên "${userName}" đã được sử dụng!`);
        setJoinLoading(false); return;
      }
      await set(userRef, { joinedAt: Date.now(), score: 0, isActive: true, displayName: userName });
      await set(ref(db, `quizzes/${quizId}/rooms/${roomId}/leaderboard/${userName}`), { bestScore: 0, lastPlayed: Date.now(), displayName: userName, rank: 0 });
      if (!roomInfo?.createdBy || roomInfo.createdBy === 'system') {
        await update(ref(db, `quizzes/${quizId}/rooms/${roomId}/info`), { createdBy: userName });
        setIsHost(true);
      }
      localStorage.setItem("userName", userName); localStorage.setItem("quizId", quizId); localStorage.setItem("roomId", roomId);
      setHasJoinedRoom(true);
    } catch (error) { console.error(error); setShowWarning("Đã có lỗi xảy ra!");
    } finally { setJoinLoading(false); }
  };

  const handleStartQuiz = async () => {
    if (!quizId || !roomId || !isHost) return;
    try {
      await update(ref(db, `quizzes/${quizId}/rooms/${roomId}/status`), { isStarted: true, startedAt: Date.now(), startedBy: userName });
      await set(ref(db, `quizzes/${quizId}/rooms/${roomId}/currentState`), { phase: 'get-ready', questionIndex: 0, timeLeft: 30, maxTimePerQuestion: 30 });
    } catch (error) { console.error(error); alert("Lỗi khi bắt đầu quiz!"); }
  };

  const copyRoomLink = () => {
    const roomLink = window.location.href.replace('/waiting', '');
    navigator.clipboard.writeText(roomLink).then(() => alert("Đã copy link phòng!"));
  };

  if (loading) return <Backdrop open={loading} sx={{ color: '#fff' }}><CircularProgress color="inherit" /></Backdrop>;

  if (!hasJoinedRoom) {
    return (
      <GradientBox>
        <HeaderCard><CardContent sx={{p:2, textAlign:'center'}}><Typography variant="h6" fontWeight="bold">PHÒNG CHỜ QUIZ</Typography></CardContent></HeaderCard>
        <MainCard>
          <CardContent sx={{p:4}}>
            <Typography variant="h5" textAlign="center" fontWeight="bold" mb={2}>{quizInfo?.title || 'Quiz Game'}</Typography>
            <Typography variant="body1" textAlign="center" mb={3} fontFamily="monospace" color="text.secondary">Room ID: {roomId}</Typography>
            {showWarning && <Alert severity="warning" sx={{ mb: 2 }}>{showWarning}</Alert>}
            <TextField fullWidth value={userName} onChange={(e) => setUserName(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleJoinWithName()} placeholder="Nhập tên của bạn (tối đa 20 ký tự)" disabled={joinLoading} InputProps={{endAdornment: <InputAdornment position="end"><IconButton title="Tên ngẫu nhiên" onClick={generateRandomName}><CasinoIcon /></IconButton></InputAdornment>}}/>
            <Button variant="contained" color="success" onClick={handleJoinWithName} disabled={joinLoading || !userName.trim()} fullWidth sx={{mt:2, p:1.5}} startIcon={joinLoading ? <CircularProgress size={20}/> : <RocketIcon/>}>Tham Gia Phòng</Button>
          </CardContent>
        </MainCard>
      </GradientBox>
    );
  }

  return (
    <GradientBox>
      <HeaderCard><CardContent sx={{p:2, textAlign:'center'}}><Typography variant="h6" fontWeight="bold">{quizInfo?.title}</Typography></CardContent></HeaderCard>
      <MainCard>
        <CardContent>
          <Typography textAlign="center" color="text.secondary">Mời bạn bè với Room ID:</Typography>
          <Typography variant="h5" textAlign="center" fontWeight="bold" fontFamily="monospace" color="primary.main" mb={2}>{roomId}</Typography>
          <Button variant="contained" fullWidth onClick={copyRoomLink} startIcon={<ShareIcon />}>Copy Link Phòng</Button>
        </CardContent>
      </MainCard>
      {countdown > 0 && <CountdownCard><CardContent sx={{textAlign:'center'}}><Typography variant="h5" color="success.dark">Quiz Bắt Đầu Sau</Typography><Typography variant="h2" fontWeight="bold">{countdown}</Typography></CardContent></CountdownCard>}
      <MainCard>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" textAlign="center" mb={2}><GroupIcon sx={{verticalAlign:'middle', mr:1}}/> Người chơi ({participants.length})</Typography>
          <Box sx={{maxHeight: 250, overflowY: 'auto', p:1}}>
            {participants.length > 0 ? participants.map(([name, info], index) => (
              <ParticipantItem key={name} isCurrentUser={name === userName}>
                <ListItemAvatar><Avatar>{info.displayName.charAt(0).toUpperCase()}</Avatar></ListItemAvatar>
                <ListItemText primary={<Typography fontWeight="bold">{info.displayName}{name === userName ? ' (Bạn)' : ''}{roomInfo?.createdBy === info.displayName ? ' 👑' : ''}</Typography>} />
              </ParticipantItem>
            )) : <Typography textAlign="center" color="text.secondary">Chưa có ai tham gia, hãy mời bạn bè!</Typography>}
          </Box>
        </CardContent>
      </MainCard>
      {isHost && !isQuizStarted && (
        <Box textAlign="center" mt={2}>
          <ActionButton variant="contained" color="success" onClick={handleStartQuiz} startIcon={<PlayArrowIcon/>} size="large">Bắt đầu cho {participants.length} người</ActionButton>
          <Typography variant="caption" display="block" mt={1}>Bạn là chủ phòng, hãy bắt đầu khi sẵn sàng!</Typography>
        </Box>
      )}
      {!isHost && !isQuizStarted && <Alert severity="info">Đang chờ chủ phòng ({roomInfo?.createdBy || '...'}) bắt đầu...</Alert>}
    </GradientBox>
  );
};

export default WaitingRoom;