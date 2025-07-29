// src/components/JoinQuiz.tsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, set, get, db } from "../config/firebase";
import { Box, Button, Card, CardContent, Typography, CircularProgress, Paper, Stack, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';

// Styled components
const GradientBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #e3f2fd 0%, #c5cae9 100%)',
  minHeight: '100vh',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
}));

const MainCard = styled(Card)(({ theme }) => ({
  maxWidth: 450,
  width: '100%',
  boxShadow: theme.shadows[16],
  borderRadius: Number(theme.shape.borderRadius) * 2,
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

const JoinQuiz: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string>("");
  const [quizInfo, setQuizInfo] = useState<any>(null);

  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!quizId) {
      setError("Không tìm thấy ID của bộ đề quiz.");
      setLoading(false);
      return;
    }

    const fetchQuizInfo = async () => {
      const infoRef = ref(db, `quizzes/${quizId}/info`);
      try {
        const snapshot = await get(infoRef);

        // LOGIC MỚI: "Tạo nếu chưa tồn tại"
        if (snapshot.exists()) {
          // Nếu quiz đã tồn tại, chỉ cần lấy thông tin
          setQuizInfo(snapshot.val());
        } else {
          // Nếu quiz CHƯA tồn tại, tạo thông tin mặc định
          console.log(`Quiz with ID "${quizId}" not found. Creating a default one.`);
          
          const defaultQuizInfo = {
            title: `Bộ Đề Mặc Định (${quizId})`,
            description: "Đây là một bộ đề được tạo tự động.",
            totalQuestions: 5, // Dựa trên MOCK_QUESTIONS
            pointsPerQuestion: 100
          };

          // Ghi thông tin mặc định này vào Firebase
          await set(infoRef, defaultQuizInfo);

          // Sau khi tạo, cập nhật state để hiển thị
          setQuizInfo(defaultQuizInfo);
        }
      } catch (err) {
        console.error(err);
        setError("Lỗi khi tải hoặc tạo thông tin quiz. Vui lòng kiểm tra kết nối mạng và quyền truy cập Firebase.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizInfo();
  }, [quizId]);

  const handleCreateRoom = async () => {
    if (!quizId) return;

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

  if (loading) {
    return (
      <GradientBox>
        <CircularProgress />
        <Typography sx={{ color: 'text.primary', mt: 2 }}>Đang kiểm tra bộ đề...</Typography>
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
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.100', mb: 3, textAlign: 'center', borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold">{quizInfo.title}</Typography>
              <Typography variant="body2" color="text.secondary">{quizInfo.description || 'Tham gia và thể hiện kiến thức của bạn!'}</Typography>
            </Paper>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}

          <Stack spacing={2}>
            <ActionButton
              variant="contained"
              color="success"
              onClick={handleCreateRoom}
              disabled={isCreating || !!error}
              startIcon={isCreating ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
              fullWidth
            >
              {isCreating ? 'Đang tạo phòng...' : 'Tạo Phòng Chơi Mới'}
            </ActionButton>
          </Stack>
          
          <Typography variant="body2" color="text.secondary" textAlign="center" mt={3}>
            Một phòng chơi mới sẽ được tạo cho bộ đề này.
          </Typography>
        </CardContent>
      </MainCard>
      <Box mt={3}>
        <Button startIcon={<HomeIcon />} onClick={() => navigate('/')} color="inherit" sx={{ textTransform: 'none' }}>
          Về Trang chủ
        </Button>
      </Box>
    </GradientBox>
  );
};

export default JoinQuiz;