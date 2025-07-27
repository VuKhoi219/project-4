import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, set, get, DatabaseReference, db } from "../config/firebase";
import { Participant } from "../types";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Container,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  CircularProgress,
  Stack,
  Divider,
  Paper,
  Backdrop
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import PersonIcon from '@mui/icons-material/Person';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CasinoIcon from '@mui/icons-material/Casino';
import RocketIcon from '@mui/icons-material/Rocket';
import GroupIcon from '@mui/icons-material/Group';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QuizIcon from '@mui/icons-material/Quiz';
import ShareIcon from '@mui/icons-material/Share';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

// Styled components
const GradientBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #e8f5e8 0%, #e3f2fd 100%)',
  minHeight: '100vh',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  marginBottom: theme.spacing(3),
  backgroundColor: '#fff',
  border: `2px solid ${theme.palette.success.light}`,
  boxShadow: theme.shadows[8],
}));

const MainCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  width: '100%',
  marginBottom: theme.spacing(3),
  boxShadow: theme.shadows[8],
  border: `1px solid ${theme.palette.grey[200]}`,
}));

const CountdownCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  width: '100%',
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.success.light,
  border: `2px solid ${theme.palette.success.main}`,
  boxShadow: theme.shadows[12],
}));

const ParticipantItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== 'isCurrentUser',
})<{ isCurrentUser?: boolean }>(({ theme, isCurrentUser }) => ({
  backgroundColor: isCurrentUser ? theme.palette.primary.light : theme.palette.grey[50],
  border: isCurrentUser ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.grey[200]}`,
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  transform: isCurrentUser ? 'scale(1.02)' : 'scale(1)',
  transition: 'all 0.2s ease-in-out',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(2, 4),
  fontSize: '1.1rem',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[4],
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'scale(0.98)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
}));

const WaitingRoom: React.FC = () => {
  const [participants, setParticipants] = useState<[string, Participant][]>([]);
  const [quizInfo, setQuizInfo] = useState<any>(null);
  const [isQuizStarted, setIsQuizStarted] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Trạng thái cho form nhập tên
  const [userName, setUserName] = useState<string>("");
  const [hasJoinedRoom, setHasJoinedRoom] = useState<boolean>(false);
  const [joinLoading, setJoinLoading] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<string>("");
  const [showQrScanner, setShowQrScanner] = useState(false);

  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const handleScan = (data: string | null) => {
    if (data) {
      const match = data.match(/\/quiz\/(.+)\/waiting/);
      if (match && match[1]) {
        const scannedQuizId = match[1];
        navigate(`/quiz/${scannedQuizId}/waiting`);
      }
    }
  };

  const handleError = (err: any) => {
    console.error("QR Scan error:", err);
  };

  useEffect(() => {
    if (!quizId) {
      navigate('/');
      return;
    }

    // Kiểm tra xem đã có userName và quizId trong localStorage chưa
    const savedUserName = localStorage.getItem("userName");
    const savedQuizId = localStorage.getItem("quizId");

    // Chỉ đặt hasJoinedRoom = true nếu userName tồn tại và quizId khớp
    if (savedUserName && savedQuizId === quizId) {
      setUserName(savedUserName);
      setHasJoinedRoom(true);
    } else {
      // Xóa userName khỏi localStorage nếu quizId không khớp
      if (savedQuizId !== quizId) {
        localStorage.removeItem("userName");
      }
    }

    let countdownTimer: NodeJS.Timeout;

    // Lắng nghe thông tin quiz
    const infoRef = ref(db, `quizzes/${quizId}/info`);
    const unsubscribeInfo = onValue(infoRef, (snapshot) => {
      const info = snapshot.val();
      setQuizInfo(info);
      setLoading(false);
    });

    // Chỉ lắng nghe participants nếu đã join
    let unsubscribeParticipants: (() => void) | null = null;
    let unsubscribeStatus: (() => void) | null = null;
    let unsubscribeCurrentState: (() => void) | null = null;

    if (hasJoinedRoom) {
      // Lắng nghe danh sách participants
      const participantsRef: DatabaseReference = ref(db, `quizzes/${quizId}/participants`);
      unsubscribeParticipants = onValue(participantsRef, (snapshot) => {
        const data = snapshot.val();
        const participantsList = data ? Object.entries(data) as [string, Participant][] : [];
        setParticipants(participantsList);
      });

      // Lắng nghe trạng thái quiz
      const quizStatusRef: DatabaseReference = ref(db, `quizzes/${quizId}/status`);
      unsubscribeStatus = onValue(quizStatusRef, async (snapshot) => {
        const status = snapshot.val();
        
        if (status?.createdBy === savedUserName) {
          setIsHost(true);
        }
        
        if (status?.isStarted === true) {
          setIsQuizStarted(true);
          
          // Countdown 3 giây trước khi chuyển
          setCountdown(3);
          countdownTimer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdownTimer);
                navigate(`/quiz/${quizId}/play`);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      });

      // Lắng nghe currentState để chuyển trạng thái
      const currentStateRef = ref(db, `quizzes/${quizId}/currentState`);
      unsubscribeCurrentState = onValue(currentStateRef, (snapshot) => {
        const state = snapshot.val();
        if (state?.phase === 'get-ready' || state?.phase === 'playing') {
          navigate(`/quiz/${quizId}/play`);
        }
      });
    }

    // Cleanup listeners
    return () => {
      unsubscribeInfo();
      if (unsubscribeParticipants) unsubscribeParticipants();
      if (unsubscribeStatus) unsubscribeStatus();
      if (unsubscribeCurrentState) unsubscribeCurrentState();
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    };
  }, [quizId, navigate, hasJoinedRoom]);

  const generateRandomName = () => {
    const adjectives = ["Thông minh", "Nhanh nhẹn", "Siêu", "Pro", "Vui vẻ", "Tài giỏi", "Xuất sắc"];
    const nouns = ["Player", "Gamer", "User", "Hero", "Champion", "Master", "Legend"];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    return `${randomAdj} ${randomNoun} ${randomNum}`;
  };

  const handleJoinWithName = async () => {
    if (!userName.trim()) {
      setShowWarning("Vui lòng nhập tên!");
      return;
    }

    if (!quizId) return;

    setJoinLoading(true);
    setShowWarning("");

    try {
      // Kiểm tra tên đã tồn tại trong phòng
      const userRef = ref(db, `quizzes/${quizId}/participants/${userName}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists()) {
        setShowWarning(`Tên "${userName}" đã được sử dụng! Vui lòng chọn tên khác.`);
        setJoinLoading(false);
        return;
      }

      // Thêm người chơi vào phòng
      const participant: Participant = {
        joinedAt: Date.now(),
        score: 0,
        bestScore: 0,
        isActive: true
      };
      await set(userRef, participant);
      
      // Khởi tạo leaderboard entry
      const leaderboardRef = ref(db, `quizzes/${quizId}/leaderboard/${userName}`);
      await set(leaderboardRef, {
        bestScore: 0,
        averageScore: 0,
        lastPlayed: Date.now(),
        rank: 0
      });

      // Kiểm tra xem đây có phải người đầu tiên không
      const participantsRef = ref(db, `quizzes/${quizId}/participants`);
      const participantsSnapshot = await get(participantsRef);
      const participantsData = participantsSnapshot.val();
      const participantCount = participantsData ? Object.keys(participantsData).length : 0;

      // Nếu là người đầu tiên, set làm createdBy
      if (participantCount <= 1) {
        const statusRef = ref(db, `quizzes/${quizId}/status`);
        const statusSnapshot = await get(statusRef);
        const currentStatus = statusSnapshot.val() || {};
        
        await set(statusRef, {
          ...currentStatus,
          createdBy: userName
        });
        setIsHost(true);
      }

      // Lưu thông tin vào localStorage
      localStorage.setItem("userName", userName);
      localStorage.setItem("quizId", quizId);
      
      setHasJoinedRoom(true);
      console.log(`User ${userName} joined room ${quizId} successfully`);
      
    } catch (error) {
      console.error("Lỗi khi tham gia:", error);
      setShowWarning("Đã có lỗi xảy ra! Vui lòng thử lại.");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinWithName();
    }
  };

  const handleStartQuiz = async () => {
    if (!quizId || !userName || participants.length === 0) return;

    try {
      // Cập nhật trạng thái quiz
      const statusRef: DatabaseReference = ref(db, `quizzes/${quizId}/status`);
      await set(statusRef, {
        isStarted: true,
        startedAt: Date.now(),
        startedBy: userName,
        isCompleted: false,
        completedAt: null,
        createdBy: userName,
        createdAt: Date.now()
      });

      // Set current state to get-ready
      const currentStateRef = ref(db, `quizzes/${quizId}/currentState`);
      await set(currentStateRef, {
        questionIndex: 0,
        timeLeft: 30,
        phase: 'get-ready',
        maxTimePerQuestion: 30
      });
      
      console.log("Quiz đã được bắt đầu!");
    } catch (error) {
      console.error("Lỗi khi bắt đầu quiz:", error);
      alert("Đã có lỗi xảy ra khi bắt đầu quiz!");
    }
  };

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/quiz/${quizId}/waiting`;
    navigator.clipboard.writeText(roomLink).then(() => {
      alert("Đã copy link phòng!");
    }).catch(() => {
      prompt("Copy link này để chia sẻ:", roomLink);
    });
  };

  if (loading) {
    return (
      <Backdrop open={loading} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box textAlign="center">
          <CircularProgress color="inherit" size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Đang tải phòng chờ...</Typography>
        </Box>
      </Backdrop>
    );
  }

  // Nếu chưa nhập tên hoặc quizId không khớp, hiển thị form nhập tên
  if (!hasJoinedRoom) {
    return (
      <GradientBox>
        {/* Header */}
        <HeaderCard>
          <CardContent sx={{ textAlign: 'center', py: 2 }}>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} mb={1}>
              <SportsEsportsIcon color="success" fontSize="large" />
              <Typography variant="h6" fontWeight="bold" color="success.dark">
                PHÒNG CHỜ QUIZ
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Nhập tên để tham gia
            </Typography>
          </CardContent>
        </HeaderCard>

        {/* Quiz Info */}
        {quizInfo && (
          <MainCard>
            <CardContent>
              <Typography variant="h6" textAlign="center" fontWeight="bold" color="text.primary" mb={2}>
                {quizInfo.title}
              </Typography>
              <Stack spacing={1} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  📝 Tổng số câu hỏi: <Box component="span" fontWeight="bold">{quizInfo.totalQuestions || 5}</Box>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ⭐ Điểm tối đa/câu: <Box component="span" fontWeight="bold">{quizInfo.pointsPerQuestion || 100}</Box>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ⏱️ Thời gian/câu: <Box component="span" fontWeight="bold">30 giây</Box>
                </Typography>
              </Stack>
            </CardContent>
          </MainCard>
        )}

        {/* Room Info */}
        <MainCard>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Room ID</Typography>
            <Typography variant="h5" fontWeight="bold" color="primary.main" fontFamily="monospace">
              {quizId}
            </Typography>
          </CardContent>
        </MainCard>

        {/* Name Input Form */}
        <MainCard>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h5" textAlign="center" fontWeight="bold" color="text.primary" mb={3}>
              Nhập tên của bạn
            </Typography>
            
            {/* Warning Message */}
            {showWarning && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {showWarning}
              </Alert>
            )}

            <Box mb={3}>
              <Typography variant="body2" color="text.secondary" mb={1} fontWeight="medium">
                Tên hiển thị
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tên của bạn"
                  disabled={joinLoading}
                  inputProps={{ maxLength: 20 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <IconButton
                  onClick={() => setUserName(generateRandomName())}
                  disabled={joinLoading}
                  color="primary"
                  title="Tạo tên ngẫu nhiên"
                >
                  <CasinoIcon />
                </IconButton>
              </Stack>
              <Typography variant="caption" color="text.secondary" mt={0.5}>
                Tối đa 20 ký tự
              </Typography>
            </Box>

            <ActionButton
              variant="contained"
              color="success"
              onClick={handleJoinWithName}
              disabled={joinLoading || !userName.trim()}
              startIcon={joinLoading ? <CircularProgress size={20} color="inherit" /> : <RocketIcon />}
              fullWidth
            >
              {joinLoading ? 'Đang tham gia...' : 'Tham Gia Phòng'}
            </ActionButton>

            <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
              Nhấn Enter hoặc click nút để tham gia
            </Typography>
          </CardContent>
        </MainCard>

        {/* Quick Actions */}
        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
          <Button
            startIcon={<CasinoIcon />}
            onClick={() => setUserName(generateRandomName())}
            disabled={joinLoading}
            color="success"
            variant="text"
            size="small"
          >
            Tên ngẫu nhiên
          </Button>
          <Typography color="text.secondary">•</Typography>
          <Button
            onClick={() => setUserName("Player" + Date.now().toString().slice(-3))}
            disabled={joinLoading}
            color="success"
            variant="text"
            size="small"
          >
            🧪 Test User
          </Button>
        </Stack>

        {/* Game Rules */}
        <Paper elevation={2} sx={{ p: 2, maxWidth: 400, width: '100%' }}>
          <Typography variant="subtitle1" fontWeight="bold" textAlign="center" mb={1}>
            📋 Luật chơi
          </Typography>
          <List dense>
            {[
              'Điểm số giảm dần theo thời gian trả lời',
              'Sau mỗi câu hỏi sẽ hiển thị bảng xếp hạng',
              'Top 3 cuối game sẽ lên podium',
              'Trả lời nhanh để được điểm cao!'
            ].map((rule, index) => (
              <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                <ListItemText 
                  primary={`• ${rule}`}
                  primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </GradientBox>
    );
  }

  // Sau khi đã nhập tên - hiển thị phòng chờ
  return (
    <GradientBox>
      {/* Header */}
      <HeaderCard>
        <CardContent sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="h6" fontWeight="bold" color="success.dark">
            🎮 PHÒNG CHỜ MULTIPLAYER
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Đang chờ bắt đầu quiz...
          </Typography>
        </CardContent>
      </HeaderCard>

      {/* Quiz Info */}
      {quizInfo && (
        <MainCard>
          <CardContent>
            <Typography variant="h6" textAlign="center" fontWeight="bold" color="text.primary" mb={2}>
              {quizInfo.title}
            </Typography>
            <Stack spacing={1} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                📝 Tổng số câu hỏi: <Box component="span" fontWeight="bold">{quizInfo.totalQuestions || 5}</Box>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ⭐ Điểm tối đa/câu: <Box component="span" fontWeight="bold">{quizInfo.pointsPerQuestion || 100}</Box>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ⏱️ Thời gian/câu: <Box component="span" fontWeight="bold">30 giây</Box>
              </Typography>
            </Stack>
          </CardContent>
        </MainCard>
      )}

      {/* Room Info & Share */}
      <MainCard>
        <CardContent>
          <Box textAlign="center" mb={2}>
            <Typography variant="body2" color="text.secondary">Room ID</Typography>
            <Typography variant="h5" fontWeight="bold" color="primary.main" fontFamily="monospace">
              {quizId}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={copyRoomLink}
            startIcon={<ShareIcon />}
            fullWidth
          >
            Copy Link Mời Bạn Bè
          </Button>
        </CardContent>
      </MainCard>

      {/* Countdown for starting */}
      {isQuizStarted && countdown > 0 && (
        <CountdownCard>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" fontWeight="bold" color="success.dark" mb={1}>
              🚀 Quiz đang bắt đầu!
            </Typography>
            <Typography variant="h2" fontWeight="bold" color="success.dark" sx={{ animation: 'pulse 1s infinite' }}>
              {countdown}
            </Typography>
            <Typography variant="body2" color="success.dark" mt={1}>
              Chuẩn bị sẵn sàng...
            </Typography>
          </CardContent>
        </CountdownCard>
      )}

      {/* Participants List */}
      <MainCard>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} mb={2}>
            <GroupIcon color="primary" />
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              Người chơi ({participants.length})
            </Typography>
          </Stack>
          
          {participants.length > 0 ? (
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {participants.map(([name, info], index) => (
                <ParticipantItem key={name} isCurrentUser={name === userName}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {index + 1}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="body1" fontWeight="bold">
                          {name}
                          {name === userName && ' (Bạn)'}
                          {isHost && name === userName && ' 👑'}
                        </Typography>
                      </Stack>
                    }
                    secondary={`Tham gia: ${new Date(info.joinedAt).toLocaleTimeString('vi-VN')}`}
                  />
                  <Chip
                    label={info.isActive ? '🟢 Online' : '🔴 Offline'}
                    size="small"
                    color={info.isActive ? 'success' : 'error'}
                    variant="outlined"
                  />
                </ParticipantItem>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h2" mb={1}>😔</Typography>
              <Typography variant="body1" color="text.secondary">
                Chỉ có bạn trong phòng
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Chia sẻ link để mời bạn bè!
              </Typography>
            </Box>
          )}
        </CardContent>
      </MainCard>

      {/* Start Button */}
      {isHost && !isQuizStarted && (
        <Box mb={3} textAlign="center">
          <ActionButton
            variant="contained"
            color="success"
            onClick={handleStartQuiz}
            disabled={participants.length === 0}
            startIcon={<PlayArrowIcon />}
            size="large"
          >
            {participants.length === 0 
              ? "⏳ Có thể chơi 1 mình..." 
              : `Bắt đầu Quiz (${participants.length} người)`
            }
          </ActionButton>
          
          <Typography variant="body2" color="text.secondary" mt={1}>
            Bạn là host - nhấn để bắt đầu cho tất cả người chơi
          </Typography>
        </Box>
      )}

      {/* Waiting message for non-host */}
      {!isHost && !isQuizStarted && (
        <Alert severity="info" sx={{ maxWidth: 400, width: '100%' }}>
          <Typography variant="body2" fontWeight="bold">
            ⏳ Đang chờ host bắt đầu quiz...
          </Typography>
          <Typography variant="body2" mt={0.5}>
            Host sẽ quyết định khi nào bắt đầu
          </Typography>
        </Alert>
      )}

      {/* Debug info */}
      <Paper elevation={1} sx={{ p: 1, mt: 2, bgcolor: 'grey.100' }}>
        <Stack spacing={0.5} textAlign="center">
          <Typography variant="caption" color="text.secondary">
            Room: {quizId}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            User: {userName} {isHost && '(Host)'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Status: {isQuizStarted ? 'Starting...' : 'Waiting'}
          </Typography>
        </Stack>
      </Paper>
    </GradientBox>
  );
};

export default WaitingRoom;