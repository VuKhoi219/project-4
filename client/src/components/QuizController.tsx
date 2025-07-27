import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, set, get, DatabaseReference, db } from "../config/firebase";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  Paper,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Search as SearchIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  Login as LoginIcon,
  Home as HomeIcon,
  Map as MapIcon,
  PersonAdd as PersonAddIcon,
  HourglassEmpty as HourglassEmptyIcon,
  PlayArrow as PlayArrowIcon,
  EmojiEvents as EmojiEventsIcon
} from '@mui/icons-material';
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
  const [status, setStatus] = useState<string>("Đang kiểm tra...");
  
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!quizId) {
      navigate('/');
      return;
    }

    checkAndRedirect();
  }, [quizId]);

  const checkAndRedirect = async () => {
    try {
      setStatus("Đang kiểm tra trạng thái quiz...");
      
      // Check if quiz exists
      const statusRef = ref(db, `quizzes/${quizId}/status`);
      const statusSnapshot = await get(statusRef);
      const quizStatus = statusSnapshot.val();

      const userName = localStorage.getItem("userName");
      
      // Case 1: Quiz doesn't exist - redirect to join to create new room
      if (!quizStatus) {
        setStatus("Quiz không tồn tại. Chuyển đến trang tạo phòng...");
        setTimeout(() => {
          navigate(`/quiz/${quizId}/join`);
        }, 1500);
        return;
      }

      // Case 2: No username - need to join first
      if (!userName) {
        setStatus("Chưa có tên người chơi. Chuyển đến trang tham gia...");
        setTimeout(() => {
          navigate(`/quiz/${quizId}/join`);
        }, 1500);
        return;
      }

      // Case 3: Check if user exists in participants
      const userRef = ref(db, `quizzes/${quizId}/participants/${userName}`);
      const userSnapshot = await get(userRef);

      if (!userSnapshot.exists()) {
        setStatus("Bạn chưa tham gia quiz này. Chuyển đến trang tham gia...");
        setTimeout(() => {
          navigate(`/quiz/${quizId}/join`);
        }, 1500);
        return;
      }

      // Case 4: User exists, determine current state
      setStatus("Đang xác định trạng thái hiện tại...");

      // Check current state for more precise navigation
      const currentStateRef = ref(db, `quizzes/${quizId}/currentState`);
      const currentStateSnapshot = await get(currentStateRef);
      const currentState = currentStateSnapshot.val();

      // Quiz completed - go to final results
      if (quizStatus.isCompleted) {
        setStatus("Quiz đã hoàn thành. Chuyển đến kết quả cuối cùng...");
        setTimeout(() => {
          navigate(`/quiz/${quizId}/final-results`);
        }, 1500);
        return;
      }

      // Quiz started and in progress
      if (quizStatus.isStarted && !quizStatus.isCompleted) {
        // Check current phase
        if (currentState?.phase === 'waiting') {
          setStatus("Quiz đang trong phòng chờ...");
          setTimeout(() => {
            navigate(`/quiz/${quizId}/waiting`);
          }, 1500);
        } else {
          setStatus("Quiz đang diễn ra. Tham gia ngay...");
          setTimeout(() => {
            navigate(`/quiz/${quizId}/play`);
          }, 1500);
        }
        return;
      }

      // Quiz not started - go to waiting room
      if (!quizStatus.isStarted) {
        setStatus("Quiz chưa bắt đầu. Chuyển đến phòng chờ...");
        setTimeout(() => {
          navigate(`/quiz/${quizId}/waiting`);
        }, 1500);
        return;
      }

      // Default fallback
      setStatus("Không xác định được trạng thái. Chuyển đến trang chính...");
      setTimeout(() => {
        navigate(`/quiz/${quizId}/join`);
      }, 2000);

    } catch (error) {
      console.error("Error in quiz controller:", error);
      setError("Có lỗi xảy ra khi kiểm tra quiz. Thử lại sau vài giây...");
      
      setTimeout(() => {
        navigate(`/quiz/${quizId}/join`);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError("");
    checkAndRedirect();
  };

  const handleGoHome = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("quizId");
    navigate('/');
  };

  return (
    <GradientBox>
      <StyledCard>
        <CardContent sx={{ p: 4 }}>
          
          {/* Loading State */}
          {loading && !error && (
            <Box textAlign="center">
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <CircularProgress size={64} thickness={4} />
              </Box>
              
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                <SearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Đang Kiểm Tra
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {status}
              </Typography>
              
              <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                  <Chip
                    label={`Quiz ID: ${quizId}`}
                    variant="outlined"
                    size="small"
                    sx={{ fontFamily: 'monospace' }}
                  />
                  <Chip
                    label={`User: ${localStorage.getItem("userName") || "Chưa có"}`}
                    variant="outlined"
                    size="small"
                  />
                </Stack>
              </Paper>
            </Box>
          )}

          {/* Error State */}
          {error && (
            <Box textAlign="center">
              <IconContainer>
                <ErrorIcon color="error" sx={{ fontSize: 'inherit' }} />
              </IconContainer>
              
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'error.main' }}>
                Có Lỗi Xảy Ra
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {error}
              </Typography>
              
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<RefreshIcon />}
                  onClick={handleRetry}
                  fullWidth
                >
                  Thử Lại
                </Button>
                
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate(`/quiz/${quizId}/join`)}
                  fullWidth
                >
                  Tham Gia Quiz
                </Button>
                
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  startIcon={<HomeIcon />}
                  onClick={handleGoHome}
                  fullWidth
                >
                  Về Trang Chủ
                </Button>
              </Stack>
            </Box>
          )}

          {/* Success State with delayed redirect */}
          {!loading && !error && (
            <Box textAlign="center">
              <IconContainer>
                <CheckCircleIcon color="success" sx={{ fontSize: 'inherit' }} />
              </IconContainer>
              
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'success.main' }}>
                Đang Chuyển Hướng
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {status}
              </Typography>
              
              <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                <AlertTitle sx={{ fontWeight: 'bold' }}>Thông tin phiên</AlertTitle>
                <Typography variant="body2">
                  <strong>Quiz ID:</strong> {quizId}
                </Typography>
                <Typography variant="body2">
                  <strong>User:</strong> {localStorage.getItem("userName")}
                </Typography>
              </Alert>

              <Button
                variant="text"
                color="primary"
                size="small"
                onClick={() => navigate('/')}
                sx={{ textDecoration: 'underline' }}
              >
                Hủy và về trang chủ
              </Button>
            </Box>
          )}

          {/* Navigation Help */}
          <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2, fontWeight: 'bold' }}>
              <MapIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 'small' }} />
              Hướng dẫn điều hướng:
            </Typography>
            
            <List dense sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <PersonAddIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText 
                  primary="Quiz chưa tồn tại → Tạo phòng mới"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <LoginIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText 
                  primary="Chưa tham gia → Trang tham gia"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <HourglassEmptyIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText 
                  primary="Quiz chưa bắt đầu → Phòng chờ"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <PlayArrowIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText 
                  primary="Quiz đang diễn ra → Trang chơi"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <EmojiEventsIcon fontSize="small" color="action" />
                </ListItemIcon>
                <ListItemText 
                  primary="Quiz đã kết thúc → Kết quả cuối"
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            </List>
          </Box>
        </CardContent>
      </StyledCard>
    </GradientBox>
  );
};

export default QuizController;