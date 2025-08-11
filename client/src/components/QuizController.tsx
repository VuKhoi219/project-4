import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, get, db } from "../config/firebase";
import { Box, Card, CardContent, Typography, CircularProgress, Chip, Stack, Alert, Button } from '@mui/material';
import { Search as SearchIcon, Error as ErrorIcon, CheckCircle as CheckCircleIcon, Home as HomeIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 480,
  width: '100%',
  margin: theme.spacing(2),
  boxShadow: theme.shadows[8],
  borderRadius: theme.spacing(2),
}));

const GradientBox = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)',
}));

const IconContainer = styled(Box)(({ theme }) => ({
  fontSize: '4rem',
  marginBottom: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
}));

const QuizController: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<string>("Đang kiểm tra phiên làm việc...");
  
  const { quizId, roomId } = useParams<{ quizId: string; roomId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!quizId || !roomId) {
      setError("URL không hợp lệ. Thiếu Quiz ID hoặc Room ID.");
      setLoading(false);
      return;
    }

    const checkAndRedirect = async () => {
      try {
        setStatus("Đang kiểm tra trạng thái phòng...");
        
        const roomStatusRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/status`);
        const roomStatusSnapshot = await get(roomStatusRef);
        const roomStatus = roomStatusSnapshot.val();

        const localQuizId = localStorage.getItem("quizId");
        const localRoomId = localStorage.getItem("roomId");
        const userName = localStorage.getItem("userName");
        
        // Case 1: Room does not exist
        if (!roomStatus) {
          setStatus(`Phòng chơi "${roomId}" không tồn tại. Chuyển hướng...`);
          setTimeout(() => navigate(`/quiz/${quizId}/join`), 2500);
          return;
        }

        // Case 2: User is new or joining a different room
        if (!userName || localQuizId !== quizId || localRoomId !== roomId) {
          setStatus("Bạn chưa tham gia phòng này. Chuyển đến phòng chờ để nhập tên...");
          localStorage.setItem("quizId", quizId);
          localStorage.setItem("roomId", roomId);
          localStorage.removeItem("userName");
          setTimeout(() => navigate(`/quiz/${quizId}/room/${roomId}/waiting`), 2000);
          return;
        }

        // Case 3: User is already in session, check room status
        setStatus("Đang xác định trạng thái hiện tại...");

        if (roomStatus.isCompleted) {
          setStatus("Quiz đã hoàn thành. Chuyển đến kết quả cuối cùng...");
          setTimeout(() => navigate(`/quiz/${quizId}/room/${roomId}/final-results`), 1500);
          return;
        }

        if (roomStatus.isStarted) {
          setStatus("Quiz đang diễn ra. Tham gia ngay...");
          setTimeout(() => navigate(`/quiz/${quizId}/room/${roomId}/play`), 1500);
          return;
        }

        if (!roomStatus.isStarted) {
          setStatus("Quiz chưa bắt đầu. Chuyển đến phòng chờ...");
          setTimeout(() => navigate(`/quiz/${quizId}/room/${roomId}/waiting`), 1500);
          return;
        }

        // Fallback
        setStatus("Không xác định được trạng thái. Chuyển đến phòng chờ...");
        setTimeout(() => navigate(`/quiz/${quizId}/room/${roomId}/waiting`), 2000);

      } catch (e) {
        console.error("Lỗi trong QuizController:", e);
        setError("Có lỗi xảy ra khi kiểm tra. Đang chuyển về trang tạo phòng...");
        setTimeout(() => navigate(`/quiz/${quizId}/join`), 3000);
      } finally {
        setLoading(false);
      }
    };

    checkAndRedirect();
  }, [quizId, roomId, navigate]);

  const renderContent = () => {
    if (loading) {
      return (
        <Box textAlign="center">
          <CircularProgress size={64} sx={{ mb: 3 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold">Đang Kiểm Tra</Typography>
          <Typography color="text.secondary">{status}</Typography>
        </Box>
      );
    }
    if (error) {
      return (
        <Box textAlign="center">
          <IconContainer><ErrorIcon color="error" sx={{ fontSize: 'inherit' }} /></IconContainer>
          <Typography variant="h4" gutterBottom fontWeight="bold" color="error.main">Có Lỗi Xảy Ra</Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>{error}</Typography>
          <Button variant="contained" onClick={() => navigate(`/quiz/${quizId}/join`)} startIcon={<HomeIcon/>}>Quay lại trang chính</Button>
        </Box>
      );
    }
    return (
      <Box textAlign="center">
        <IconContainer><CheckCircleIcon color="success" sx={{ fontSize: 'inherit' }} /></IconContainer>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="success.main">Đang Chuyển Hướng</Typography>
        <Typography color="text.secondary">{status}</Typography>
        <Stack direction="column" spacing={1} mt={2}>
          <Chip label={`Quiz ID: ${quizId}`} />
          <Chip label={`Room ID: ${roomId}`} />
        </Stack>
      </Box>
    );
  };
  
  return (
    <GradientBox>
      <StyledCard>
        <CardContent sx={{ p: 4 }}>
          {renderContent()}
        </CardContent>
      </StyledCard>
    </GradientBox>
  );
};

export default QuizController;