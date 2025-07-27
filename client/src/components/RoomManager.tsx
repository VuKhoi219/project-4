import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, get, set, DatabaseReference, db } from "../config/firebase";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Backdrop,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RoomIcon from '@mui/icons-material/Room';

// Styled components
const GradientBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f5f5f5 0%, #e8eaf6 100%)',
  minHeight: '100vh',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const MainCard = styled(Card)(({ theme }) => ({
  maxWidth: 500,
  width: '100%',
  boxShadow: theme.shadows[12],
  border: `1px solid ${theme.palette.grey[200]}`,
}));

const OptionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 3),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  borderRadius: theme.spacing(1),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(0.98)',
  },
}));

const RoomManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [quizStatus, setQuizStatus] = useState<any>(null);
  const [showOptions, setShowOptions] = useState(false);
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    checkQuizStatus();
  }, [quizId]);

  const checkQuizStatus = async () => {
    if (!quizId) return;

    try {
      const statusRef = ref(db, `quizzes/${quizId}/status`);
      const statusSnapshot = await get(statusRef);
      const status = statusSnapshot.val();

      setQuizStatus(status);
      setLoading(false);

      if (!status) {
        // Quiz doesn't exist, redirect to join
        navigate(`/quiz/${quizId}/join`);
      } else if (!status.isStarted) {
        // Quiz not started, check if user is already joined
        if (userName) {
          const userRef = ref(db, `quizzes/${quizId}/participants/${userName}`);
          const userSnapshot = await get(userRef);
          
          if (userSnapshot.exists()) {
            // User already joined, go to waiting room
            navigate(`/quiz/${quizId}/waiting`);
          } else {
            // User not joined, go to join page
            navigate(`/quiz/${quizId}/join`);
          }
        } else {
          navigate(`/quiz/${quizId}/join`);
        }
      } else {
        // Quiz is active, show options
        setShowOptions(true);
      }
    } catch (error) {
      console.error("Error checking quiz status:", error);
      setLoading(false);
    }
  };

  const createNewRoom = async () => {
    if (!quizId) return;

    try {
      setLoading(true);
      
      // Generate new room ID based on original quiz
      const timestamp = Date.now();
      const newRoomId = `${quizId}_room_${timestamp}`;
      
      // Create new room with same base quiz ID but independent state
      const newRoomRef = ref(db, `quizzes/${newRoomId}`);
      await set(newRoomRef, {
        originalQuizId: quizId,
        createdAt: timestamp,
        status: {
          isStarted: false,
          startedAt: null,
          startedBy: null,
          isCompleted: false,
          completedAt: null
        },
        participants: {},
        leaderboard: {},
        playHistory: {}
      });

      console.log(`Created new room: ${newRoomId}`);
      
      // Redirect to new room
      navigate(`/quiz/${newRoomId}/join`);
      
    } catch (error) {
      console.error("Error creating new room:", error);
      alert("Không thể tạo phòng mới!");
      setLoading(false);
    }
  };

  const joinActiveQuiz = async () => {
    // For now, we'll create a new room since joining mid-game is complex
    // In a full implementation, you'd need to sync the current question state
    createNewRoom();
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  if (loading) {
    return (
      <Backdrop open={loading} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box textAlign="center">
          <CircularProgress color="inherit" size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Đang kiểm tra trạng thái quiz...</Typography>
        </Box>
      </Backdrop>
    );
  }

  if (!showOptions) {
    return null; // Will redirect automatically
  }

  return (
    <GradientBox>
      <MainCard>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} mb={2}>
              <PlayArrowIcon color="warning" fontSize="large" />
              <Typography variant="h5" component="h1" fontWeight="bold" color="text.primary">
                Quiz Đang Hoạt Động
              </Typography>
            </Stack>
            
            <Alert severity="warning" sx={{ textAlign: 'left' }}>
              <Typography variant="body2" fontWeight="bold" mb={1}>
                ⚡ Quiz này đang được chơi
              </Typography>
              <Stack spacing={0.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <AccessTimeIcon fontSize="small" />
                  <Typography variant="body2">
                    Bắt đầu: {quizStatus?.startedAt ? formatTime(quizStatus.startedAt) : 'Không rõ'}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <PersonIcon fontSize="small" />
                  <Typography variant="body2">
                    Bởi: {quizStatus?.startedBy || 'Không rõ'}
                  </Typography>
                </Box>
              </Stack>
            </Alert>
          </Box>

          {/* Options */}
          <Stack spacing={3}>
            {/* Create New Room Option */}
            <OptionCard elevation={2} sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <AddIcon />
                <Typography variant="h6" fontWeight="bold">
                  Tạo Phòng Mới
                </Typography>
              </Stack>
              <Typography variant="body2" mb={3} sx={{ opacity: 0.9 }}>
                Tạo một phòng chơi mới với cùng bộ câu hỏi. Bạn có thể mời bạn bè tham gia!
              </Typography>
              <ActionButton
                variant="contained"
                onClick={createNewRoom}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RoomIcon />}
                fullWidth
                sx={{ 
                  bgcolor: 'primary.dark',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.main' }
                }}
              >
                {loading ? 'Đang tạo...' : 'Tạo Phòng Mới'}
              </ActionButton>
            </OptionCard>

            {/* Wait for Current Room Option */}
            <OptionCard elevation={1} sx={{ bgcolor: 'grey.100' }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <AccessTimeIcon color="action" />
                <Typography variant="h6" fontWeight="bold" color="text.secondary">
                  Chờ Phòng Hiện Tại
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Đợi cho đến khi quiz hiện tại kết thúc (không khuyến nghị)
              </Typography>
              <ActionButton
                variant="outlined"
                onClick={() => window.location.reload()}
                startIcon={<RefreshIcon />}
                fullWidth
                color="inherit"
                sx={{ 
                  borderColor: 'grey.400',
                  color: 'text.secondary',
                  '&:hover': { 
                    borderColor: 'grey.600',
                    bgcolor: 'grey.200'
                  }
                }}
              >
                Kiểm Tra Lại
              </ActionButton>
            </OptionCard>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Navigation */}
          <Box textAlign="center" mb={3}>
            <Button
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              color="primary"
              variant="text"
              sx={{ textDecoration: 'underline' }}
            >
              Về trang chủ
            </Button>
          </Box>

          {/* Debug Info */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Stack spacing={0.5} textAlign="center">
              <Typography variant="caption" color="text.secondary">
                Quiz ID: {quizId}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Hệ thống tự động tạo phòng mới để không làm gián đoạn người chơi khác
              </Typography>
            </Stack>
          </Paper>
        </CardContent>
      </MainCard>
    </GradientBox>
  );
};

export default RoomManager;