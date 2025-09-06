// src/components/JoinQuiz.tsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, set, db } from "../config/firebase";
import apiService from "../services/api";
import { 
  Box, Button, Card, CardContent, Typography, CircularProgress, 
  Paper, Stack, Alert, FormControlLabel, Checkbox, Divider 
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Avatar } from "@mui/material";


// Interface cho dữ liệu quiz detail
interface QuizDetailData {
  title: string;
  description: string;
  summary: string;
  totalQuestions: number;
}

// Styled components
const GradientBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #e3f2fd 0%, #c5cae9 100%)',
  minHeight: '100vh',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const MainCard = styled(Card)(({ theme }) => ({
  maxWidth: '90%',
  width: '100%',
  boxShadow: theme.shadows[16],
  borderRadius: Number(theme.shape.borderRadius) * 2,
  marginBottom: theme.spacing(3),
  [theme.breakpoints.up('sm')]: {
    maxWidth: 600,
  },
  [theme.breakpoints.up('md')]: {
    maxWidth: 800,
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: 1000,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(2),
  fontSize: '1.1rem',
  fontWeight: 600,
  borderRadius: theme.spacing(1),
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'scale(1.02)'
  }
}));

const SettingsCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#f8f9ff',
  border: '1px solid #e3f2fd',
  marginBottom: theme.spacing(2),
}));

const JoinQuiz: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>("");
  const [quizInfo, setQuizInfo] = useState<QuizDetailData | null>(null);
  const [hostControlEnabled, setHostControlEnabled] = useState(false);

  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [avatarList, setAvatarList] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [showAvatarList, setShowAvatarList] = useState(false);

  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!quizId) {
      setError("Không tìm thấy ID của bộ đề quiz.");
      setLoading(false);
      return;
    }

    // Kiểm tra xem quizId có phải là số không
    const numericQuizId = parseInt(quizId);
    if (isNaN(numericQuizId)) {
      navigate('/404'); // Chuyển đến trang 404 nếu ID không hợp lệ
      return;
    }

    const fetchQuizInfo = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiService.findDetailQuiz(numericQuizId);
        
        if (response.success && response.data) {
            const mapped: QuizDetailData = {
              title: response.data.title,
              description: response.data.description,
              summary: response.data.summary || "",
              totalQuestions: response.data.totalQuestions,
            };
            setQuizInfo(mapped);
        } else {
          // Xử lý trường hợp API trả về success: false
          console.error("API Error:", response.error || response.message);
          
          // Kiểm tra các trường hợp lỗi cụ thể
          if (response.message?.toLowerCase().includes('not found') || 
              response.error?.toLowerCase().includes('not found')) {
            navigate('/404'); // Chuyển đến trang 404
            return;
          }
          
          setError(response.message || "Không thể tải thông tin quiz");
        }
      } catch (err: any) {
        console.error("Network/API Error:", err);
        
        // Xử lý các loại lỗi khác nhau
        if (err.response?.status === 404) {
          navigate('/404');
          return;
        }
        
        if (err.response?.status === 403) {
          navigate('/403'); // Nếu có trang 403
          return;
        }
        
        if (err.response?.status >= 500) {
          setError("Lỗi máy chủ. Vui lòng thử lại sau.");
        } else if (err.code === 'NETWORK_ERROR' || !err.response) {
          setError("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.");
        } else {
          setError("Đã có lỗi xảy ra khi tải thông tin quiz. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuizInfo();
  }, [quizId, navigate]);
  const handleCreateAndPlay = async () => {
    if (!quizId || !quizInfo) return;

    setIsCreating(true);
    setError("");

    try {
      const roomId = `room_${Date.now()}`;
      const roomPath = `quizzes/${quizId}/rooms/${roomId}`;
      const roomRef = ref(db, roomPath);

      const roomData = {
        info: {
          roomName: `Phòng chơi lúc ${new Date().toLocaleTimeString('vi-VN')}`,
          createdBy: "system",
          createdAt: Date.now(),
          maxParticipants: 20,
          hostControlEnabled: hostControlEnabled,
          hostName: "system",
          quizTitle: quizInfo.title,
          quizDescription: quizInfo.description,
          totalQuestions: quizInfo.totalQuestions,
        },
        status: {
          isStarted: true,  // ✅ cho trạng thái đã bắt đầu luôn
          startedAt: Date.now(),
          startedBy: "system",
          isCompleted: false,
          completedAt: null,
        },
        currentState: {
          phase: 'playing', // ✅ trạng thái đang chơi
          questionIndex: 0,
          timeLeft: 30,
          waitingForHost: false,
        },
        participants: {},
        leaderboard: {},
        playHistory: {}
      };
      
      await set(roomRef, roomData);

      localStorage.removeItem("userName");
      localStorage.setItem("quizId", quizId);
      localStorage.setItem("roomId", roomId);

      // ✅ Chuyển thẳng vào trang chơi luôn
      navigate(`/quiz/${quizId}/room/${roomId}/play`);

    } catch (error) {
      console.error("Lỗi khi tạo phòng:", error);
      setError("Đã có lỗi xảy ra khi tạo phòng! Vui lòng thử lại.");
      setIsCreating(false);
    }
  };
  const handleCreateRoom = async () => {
    if (!quizId || !quizInfo) return;

    setIsCreating(true);
    setError("");

    try {
      const roomId = `room_${Date.now()}`;
      const roomPath = `quizzes/${quizId}/rooms/${roomId}`;
      const roomRef = ref(db, roomPath);

      const roomData = {
        info: {
          roomName: `Phòng chơi lúc ${new Date().toLocaleTimeString('vi-VN')}`,
          createdBy: "system",
          createdAt: Date.now(),
          maxParticipants: 20,
          hostControlEnabled: hostControlEnabled,
          hostName: "system",
          // Thêm thông tin quiz từ API
          quizTitle: quizInfo.title,
          quizDescription: quizInfo.description,
          totalQuestions: quizInfo.totalQuestions,
        },
        status: {
          isStarted: false,
          startedAt: null,
          startedBy: null,
          isCompleted: false,
          completedAt: null,
        },
        currentState: {
          phase: 'waiting',
          questionIndex: 0,
          timeLeft: 30,
          waitingForHost: false,
        },
        participants: {},
        leaderboard: {},
        playHistory: {}
      };
      
      await set(roomRef, roomData);

      localStorage.removeItem("userName");
      localStorage.setItem("quizId", quizId);
      localStorage.setItem("roomId", roomId);

      navigate(`/quiz/${quizId}/room/${roomId}/waiting`);

    } catch (error) {
      console.error("Lỗi khi tạo phòng:", error);
      setError("Đã có lỗi xảy ra khi tạo phòng! Vui lòng thử lại.");
      setIsCreating(false);
    }
  };
  const handleOpenJoinDialog = async () => {
    try {
      const res = await fetch("/img/listImage.json");
      const list = await res.json();
      setAvatarList(list);

      // chọn avatar random mặc định
      const randomAvatar = list[Math.floor(Math.random() * list.length)];
      setSelectedAvatar(randomAvatar);

      // tạo tên random mặc định
      const adjectives = ["Cool", "Smart", "Fast", "Happy"];
      const nouns = ["Player", "Hero", "Cat", "Dude"];
      const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${
        nouns[Math.floor(Math.random() * nouns.length)]
      }${Math.floor(Math.random() * 100)}`;
      setPlayerName(randomName);

      setOpenJoinDialog(true);
    } catch (err) {
      console.error("Lỗi load avatar:", err);
    }
  };
  const handleStartSoloGame = async () => {
    if (!quizId || !quizInfo || !playerName) return;

    setIsCreating(true);
    setError("");

    try {
      const roomId = `room_${Date.now()}`;
      const roomPath = `quizzes/${quizId}/rooms/${roomId}`;
      const roomRef = ref(db, roomPath);

      const roomData = {
        info: {
          roomName: `Phòng solo - ${playerName}`,
          createdBy: playerName,
          createdAt: Date.now(),
          maxParticipants: 1,
          hostControlEnabled: false,
          hostName: playerName,
          quizTitle: quizInfo.title,
          quizDescription: quizInfo.description,
          totalQuestions: quizInfo.totalQuestions,
        },
        status: {
          isStarted: true,
          startedAt: Date.now(),
          startedBy: playerName,
          isCompleted: false,
          completedAt: null,
        },
        currentState: {
          phase: "playing",
          questionIndex: 0,
          timeLeft: 30,
          waitingForHost: false,
        },
        participants: {
          [playerName]: {
            joinedAt: Date.now(),
            score: 0,
            isActive: true,
            displayName: playerName,
            avatar: `/img/${selectedAvatar}`,
          }
        },
        leaderboard: {
          [playerName]: {
            bestScore: 0,
            lastPlayed: Date.now(),
            displayName: playerName,
            avatar: `/img/${selectedAvatar}`,
          }
        },
        playHistory: {}
      };

      await set(roomRef, roomData);

      // Lưu localStorage
      localStorage.setItem("userName", playerName);
      localStorage.setItem("quizId", quizId);
      localStorage.setItem("roomId", roomId);

      navigate(`/quiz/${quizId}/room/${roomId}/play`);
    } catch (error) {
      console.error("Lỗi khi tạo phòng solo:", error);
      setError("Không thể bắt đầu chơi. Vui lòng thử lại!");
    } finally {
      setIsCreating(false);
      setOpenJoinDialog(false);
    }
  };

  // Hiển thị loading
  if (loading) {
    return (
      <GradientBox>
        <CircularProgress size={60} />
        <Typography sx={{ color: 'text.primary', mt: 2, fontSize: '1.1rem' }}>
          Đang kiểm tra bộ đề...
        </Typography>
      </GradientBox>
    );
  }

  // Hiển thị lỗi nếu không có thông tin quiz
  if (!quizInfo && !loading) {
    return (
      <GradientBox>
        <MainCard>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" color="error" mb={2}>
              Không thể tải thông tin quiz
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            <Stack spacing={2}>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                disabled={loading}
              >
                Thử lại
              </Button>
              
              <Button
                variant="contained"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
              >
                Về Trang chủ
              </Button>
            </Stack>
          </CardContent>
        </MainCard>
      </GradientBox>
    );
  }

  return (
    <GradientBox>
      <MainCard>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" textAlign="center" mb={1} fontWeight="bold">
            Sẵn sàng chơi?
          </Typography>
          
          {quizInfo && (
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.100', mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" textAlign="center" mb={1}>
                {quizInfo.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
                {quizInfo.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap">
                <Box textAlign="center">
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {quizInfo.totalQuestions}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Câu hỏi
                  </Typography>
                </Box>
              </Stack>
              
              {quizInfo.summary && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    {quizInfo.summary}
                  </Typography>
                </>
              )}
            </Paper>
          )}

          {/* Cài đặt phòng */}
          <SettingsCard>
            <CardContent sx={{ p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <SettingsIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">Cài đặt phòng</Typography>
              </Stack>
              
              <Stack direction="row" spacing={4} flexWrap="wrap">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={hostControlEnabled}
                      onChange={(e) => setHostControlEnabled(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        Chủ phòng điều khiển chuyển câu
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Khi bật, chủ phòng sẽ cần bấm "Câu tiếp theo" để chuyển câu hỏi mới thay vì tự động
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start', mb: 1 }}
                />
              </Stack>
            </CardContent>
          </SettingsCard>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}

          <Stack spacing={2}>
            <ActionButton
              variant="contained"
              color="success"
              onClick={handleCreateRoom}
              disabled={isCreating || !!error || !quizInfo}
              startIcon={isCreating ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
              fullWidth
            >
              {isCreating ? 'Đang tạo phòng...' : 'Chơi với bạn bè'}
            </ActionButton>
          </Stack>
            <ActionButton
              variant="contained"
              color="primary"
              onClick={handleOpenJoinDialog}   // ✅ đổi chỗ này
              disabled={isCreating || !!error || !quizInfo}
              startIcon={isCreating ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
              fullWidth
            >
              {isCreating ? 'Đang vào...' : 'Vào Chơi Ngay'}
            </ActionButton>

          <Typography variant="body2" color="text.secondary" textAlign="center" mt={3}>
            Một phòng chơi mới sẽ được tạo cho bộ đề này.
          </Typography>
        </CardContent>
      </MainCard>
      <Dialog open={openJoinDialog} onClose={() => setOpenJoinDialog(false)}>
        <DialogTitle>Chọn tên và Avatar</DialogTitle>
        <DialogContent>
          {/* Avatar + Nút đổi */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar src={`/img/${selectedAvatar}`} sx={{ width: 80, height: 80, mr: 2 }} />
            <Button variant="outlined" onClick={() => setShowAvatarList(true)}>
              Đổi Avatar
            </Button>
          </Box>

          {/* Hiển thị list avatar khi bấm "Đổi Avatar" */}
          {showAvatarList && (
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 60px)", gap: 2, mb: 2 }}>
              {avatarList.map((img, i) => (
                <Avatar
                  key={i}
                  src={`/img/${img}`}
                  sx={{
                    width: 60,
                    height: 60,
                    cursor: "pointer",
                    border: selectedAvatar === img ? "2px solid #1976d2" : "2px solid transparent"
                  }}
                  onClick={() => {
                    setSelectedAvatar(img);
                    setShowAvatarList(false); // ẩn list sau khi chọn
                  }}
                />
              ))}
            </Box>
          )}

          {/* Input + random tên */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <TextField
              fullWidth
              label="Tên hiển thị"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
            <Button
              variant="outlined"
              sx={{ ml: 2, whiteSpace: "nowrap" }}
              onClick={() => {
                const adjectives = ["Cool", "Smart", "Fast", "Happy"];
                const nouns = ["Player", "Hero", "Cat", "Dude"];
                const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${
                  nouns[Math.floor(Math.random() * nouns.length)]
                }${Math.floor(Math.random() * 100)}`;
                setPlayerName(randomName);
              }}
            >
              Đổi tên
            </Button>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenJoinDialog(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleStartSoloGame}>
            Bắt đầu chơi
          </Button>
        </DialogActions>
      </Dialog>



      {/* Nút "Về Trang chủ" */}
      <Button 
        startIcon={<HomeIcon />} 
        onClick={() => navigate('/')} 
        color="inherit" 
        sx={{ 
          textTransform: 'none',
          mt: 2,
          mb: 2
        }}
      >
        Về Trang chủ
      </Button>
    </GradientBox>
  );
};

export default JoinQuiz;