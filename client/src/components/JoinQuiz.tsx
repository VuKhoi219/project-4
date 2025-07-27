import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, set, get, DatabaseReference, db } from "../config/firebase";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Container,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Paper,
  Chip,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import RocketIcon from '@mui/icons-material/Rocket';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import HomeIcon from '@mui/icons-material/Home';
import StarIcon from '@mui/icons-material/Star';

// Styled components for custom styling
const GradientBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #e3f2fd 0%, #c5cae9 100%)',
  minHeight: '100vh',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const HeaderCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  marginBottom: theme.spacing(4),
  backgroundColor: '#fff',
  border: `2px solid ${theme.palette.primary.light}`,
  boxShadow: theme.shadows[8],
}));

const MainCard = styled(Card)(({ theme }) => ({
  maxWidth: 400,
  width: '100%',
  boxShadow: theme.shadows[16],
  border: `1px solid ${theme.palette.grey[200]}`,
}));

const RoomIdBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.light,
  borderRadius: theme.spacing(1),
  border: `2px solid ${theme.palette.primary.main}`,
  marginBottom: theme.spacing(3),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(2),
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

const JoinQuiz: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<string>("");
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const generateRoomId = () => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `room_${timestamp}_${randomStr}`;
  };

  const handleJoinRoom = async () => {
    setLoading(true);
    setShowWarning("");

    try {
      let targetRoomId: string;

      // Nếu không có quizId, tạo phòng mới
      if (!quizId) {
        targetRoomId = generateRoomId();
        setShowWarning("Đang tạo phòng mới...");
      } else {
        // Kiểm tra trạng thái phòng hiện tại
        const statusRef = ref(db, `quizzes/${quizId}/status`);
        const statusSnapshot = await get(statusRef);
        const status = statusSnapshot.val();

        // Nếu quiz đã bắt đầu hoặc đã hoàn thành, tạo phòng mới
        if (status?.isStarted || status?.isCompleted) {
          targetRoomId = generateRoomId();
          setShowWarning("Tạo phòng mới vì quiz đang chạy/đã kết thúc...");
        } else {
          targetRoomId = quizId;
        }
      }

      // Khởi tạo trạng thái quiz nếu chưa có
      const statusRef = ref(db, `quizzes/${targetRoomId}/status`);
      const statusSnapshot = await get(statusRef);
      if (!statusSnapshot.exists()) {
        await set(statusRef, {
          isStarted: false,
          startedAt: null,
          startedBy: null,
          isCompleted: false,
          completedAt: null,
          createdBy: null, // Sẽ set khi có người đầu tiên nhập tên
          createdAt: Date.now()
        });
      }

      // Khởi tạo currentState
      const currentStateRef = ref(db, `quizzes/${targetRoomId}/currentState`);
      const currentStateSnapshot = await get(currentStateRef);
      if (!currentStateSnapshot.exists()) {
        await set(currentStateRef, {
          questionIndex: 0,
          timeLeft: 30,
          phase: 'waiting',
          maxTimePerQuestion: 30
        });
      }

      // Khởi tạo quiz info
      const infoRef = ref(db, `quizzes/${targetRoomId}/info`);
      const infoSnapshot = await get(infoRef);
      if (!infoSnapshot.exists()) {
        await set(infoRef, {
          title: `Quiz Room ${targetRoomId.split('_')[1]}`,
          totalQuestions: 5,
          pointsPerQuestion: 100,
          description: "Multiplayer Quiz Game",
          createdAt: Date.now()
        });
      }
      
      // Lưu room ID vào localStorage (chưa có userName)
      localStorage.setItem("quizId", targetRoomId);
      localStorage.removeItem("userName"); // Xóa userName cũ nếu có
      
      console.log(`Joining room ${targetRoomId}`);
      
      // Chuyển đến phòng chờ
      navigate(`/quiz/${targetRoomId}/waiting`);
      
    } catch (error) {
      console.error("Lỗi khi tham gia:", error);
      setShowWarning("Đã có lỗi xảy ra! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    setShowWarning("Đang tạo phòng mới...");

    try {
      const newRoomId = generateRoomId();
      
      // Khởi tạo phòng mới
      const statusRef = ref(db, `quizzes/${newRoomId}/status`);
      await set(statusRef, {
        isStarted: false,
        startedAt: null,
        startedBy: null,
        isCompleted: false,
        completedAt: null,
        createdBy: null, // Sẽ set khi có người đầu tiên nhập tên
        createdAt: Date.now()
      });

      const currentStateRef = ref(db, `quizzes/${newRoomId}/currentState`);
      await set(currentStateRef, {
        questionIndex: 0,
        timeLeft: 30,
        phase: 'waiting',
        maxTimePerQuestion: 30
      });

      const infoRef = ref(db, `quizzes/${newRoomId}/info`);
      await set(infoRef, {
        title: `Quiz Room ${newRoomId.split('_')[1]}`,
        totalQuestions: 5,
        pointsPerQuestion: 100,
        description: "Multiplayer Quiz Game",
        createdAt: Date.now()
      });
      
      localStorage.setItem("quizId", newRoomId);
      localStorage.removeUser("userName"); // Xóa userName cũ nếu có
      
      console.log(`Created new room ${newRoomId}`);
      
      // Chuyển đến phòng chờ
      navigate(`/quiz/${newRoomId}/waiting`);
      
    } catch (error) {
      console.error("Lỗi khi tạo phòng:", error);
      setShowWarning("Đã có lỗi xảy ra! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByRoomId = () => {
    const roomId = prompt("Nhập Room ID để tham gia:");
    if (roomId) {
      navigate(`/quiz/${roomId}`);
    }
  };

  return (
    <GradientBox>
      {/* Header */}
      <HeaderCard>
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} mb={1}>
            <SportsEsportsIcon color="primary" fontSize="large" />
            <Typography variant="h6" component="div" fontWeight="bold" color="primary">
              MULTIPLAYER QUIZ
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Tham gia hoặc tạo phòng chơi mới
          </Typography>
        </CardContent>
      </HeaderCard>

      <MainCard>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" textAlign="center" mb={3} fontWeight="bold" color="text.primary">
            {quizId ? 'Tham gia Quiz' : 'Quiz Game'}
          </Typography>
          
          {quizId && (
            <RoomIdBox>
              <Typography variant="body2" color="primary" textAlign="center" fontWeight="medium">
                Room ID:
              </Typography>
              <Typography 
                variant="h5" 
                component="div" 
                textAlign="center" 
                fontWeight="bold" 
                color="primary.dark"
                fontFamily="monospace"
                mt={1}
              >
                {quizId}
              </Typography>
              <Box textAlign="center" mt={2}>
                <Chip 
                  label="✨ Hệ thống sẽ tự động tạo phòng mới nếu cần" 
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </RoomIdBox>
          )}

          {/* Warning Message */}
          {showWarning && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2" fontWeight="medium">
                {showWarning}
              </Typography>
            </Alert>
          )}

          {/* Action Buttons */}
          <Stack spacing={2}>
            {quizId ? (
              // Nếu có quizId, chỉ hiển thị nút tham gia
              <ActionButton
                variant="contained"
                color="primary"
                onClick={handleJoinRoom}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RocketIcon />}
                fullWidth
              >
                {loading ? 'Đang vào phòng...' : 'Vào Phòng Chờ'}
              </ActionButton>
            ) : (
              // Nếu không có quizId, hiển thị 2 tùy chọn
              <>
                <ActionButton
                  variant="contained"
                  color="success"
                  onClick={handleCreateRoom}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                  fullWidth
                >
                  {loading ? 'Đang tạo phòng...' : 'Tạo Phòng Mới'}
                </ActionButton>

                <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                  <Divider sx={{ flex: 1 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                    hoặc
                  </Typography>
                  <Divider sx={{ flex: 1 }} />
                </Box>

                <ActionButton
                  variant="outlined"
                  color="primary"
                  onClick={handleJoinByRoomId}
                  disabled={loading}
                  startIcon={<LinkIcon />}
                  fullWidth
                >
                  Tham Gia Bằng Room ID
                </ActionButton>
              </>
            )}
          </Stack>

          <Typography variant="body2" color="text.secondary" textAlign="center" mt={3}>
            {quizId ? (
              'Bạn sẽ nhập tên trong phòng chờ'
            ) : (
              'Chọn tạo phòng mới hoặc tham gia phòng có sẵn'
            )}
          </Typography>
        </CardContent>
      </MainCard>

      {/* Quick Actions */}
      <Box mt={3}>
        <Button
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          color="inherit"
          sx={{ textDecoration: 'underline', color: 'text.secondary' }}
        >
          Trang chủ
        </Button>
      </Box>

      {/* Features Info */}
      <Box mt={4} maxWidth={400} width="100%">
        <Paper elevation={2} sx={{ p: 3, border: '1px solid', borderColor: 'grey.300' }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <StarIcon color="warning" />
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              Tính năng
            </Typography>
          </Stack>
          <List dense>
            {[
              'Multiplayer real-time',
              'Điểm số giảm dần theo thời gian',
              'Bảng xếp hạng live',
              'Tự động tạo phòng mới khi cần',
              'Podium cho top 3',
              'Nhập tên trong phòng chờ'
            ].map((feature, index) => (
              <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
                <ListItemText 
                  primary={`• ${feature}`}
                  primaryTypographyProps={{ 
                    variant: 'body2', 
                    color: 'text.secondary' 
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </GradientBox>
  );
};

export default JoinQuiz;