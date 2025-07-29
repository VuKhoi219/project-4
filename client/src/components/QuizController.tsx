// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ref, get, db } from "../config/firebase";
// import {
//   Box, Card, CardContent, Typography, CircularProgress, Chip, List, ListItem,
//   ListItemIcon, ListItemText, Stack, Paper, Alert, AlertTitle, Button
// } from '@mui/material';
// import {
//   Search as SearchIcon,
//   Error as ErrorIcon,
//   CheckCircle as CheckCircleIcon,
//   Refresh as RefreshIcon,
//   Login as LoginIcon,
//   Home as HomeIcon,
//   Map as MapIcon,
//   PersonAdd as PersonAddIcon,
//   HourglassEmpty as HourglassEmptyIcon,
//   PlayArrow as PlayArrowIcon,
//   EmojiEvents as EmojiEventsIcon
// } from '@mui/icons-material';
// import { styled } from '@mui/material/styles';

// const StyledCard = styled(Card)(({ theme }) => ({
//   maxWidth: 480,
//   width: '100%',
//   margin: theme.spacing(2),
//   boxShadow: theme.shadows[8],
//   borderRadius: theme.spacing(2),
// }));

// const GradientBox = styled(Box)(({ theme }) => ({
//   minHeight: '100vh',
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   background: 'linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)',
// }));

// const IconContainer = styled(Box)(({ theme }) => ({
//   fontSize: '4rem',
//   marginBottom: theme.spacing(2),
//   display: 'flex',
//   justifyContent: 'center',
// }));


// const QuizController: React.FC = () => {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string>("");
//   const [status, setStatus] = useState<string>("Đang kiểm tra...");
  
//   // CHANGED: Lấy cả quizId và roomId từ URL
//   const { quizId, roomId } = useParams<{ quizId?: string; roomId?: string }>();
//   const navigate = useNavigate();

//   useEffect(() => {
//     // FIX: Kiểm tra cả quizId và roomId
//     if (!quizId || !roomId) {
//       setError("Thiếu thông tin Quiz ID hoặc Room ID");
//       setLoading(false);
//       return;
//     }

//     checkAndRedirect();
//   }, [quizId, roomId]); // FIX: Thêm roomId vào dependency array

//  const checkAndRedirect = async () => {
//     // FIX: Early return nếu thiếu params
//     if (!quizId || !roomId) {
//       setError("Thiếu thông tin Quiz ID hoặc Room ID");
//       setLoading(false);
//       return;
//     }

//     try {
//       setStatus("Đang kiểm tra trạng thái phòng...");
      
//       // PATH UPDATE: Trỏ đến status của phòng cụ thể
//       const roomStatusRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/status`);
//       const roomStatusSnapshot = await get(roomStatusRef);
//       const roomStatus = roomStatusSnapshot.val();

//       // Lấy thông tin user từ localStorage
//       const localQuizId = localStorage.getItem("quizId");
//       const localRoomId = localStorage.getItem("roomId");
//       const userName = localStorage.getItem("userName");
      
//       // Case 1: Phòng không tồn tại
//       if (!roomStatus) {
//         setStatus("Phòng không tồn tại. Chuyển đến trang tạo phòng mới...");
//         setTimeout(() => {
//           // Điều hướng đến trang tạo phòng cho quizId này
//           navigate(`/quiz/${quizId}/join`);
//         }, 2000);
//         return;
//       }

//       // Case 2: User chưa tham gia phòng này (chưa có userName hoặc sai quiz/room id)
//       if (!userName || localQuizId !== quizId || localRoomId !== roomId) {
//         setStatus("Bạn chưa tham gia phòng này. Chuyển đến phòng chờ để nhập tên...");
//         localStorage.setItem("quizId", quizId); // Cập nhật để vào đúng phòng
//         localStorage.setItem("roomId", roomId);
//         localStorage.removeItem("userName");
//         setTimeout(() => {
//           navigate(`/quiz/${quizId}/room/${roomId}/waiting`);
//         }, 2000);
//         return;
//       }

//       // Case 3: User đã có thông tin, kiểm tra trạng thái phòng
//       setStatus("Đang xác định trạng thái hiện tại...");

//       // Phòng đã hoàn thành
//       if (roomStatus.isCompleted) {
//         setStatus("Quiz đã hoàn thành. Chuyển đến kết quả cuối cùng...");
//         setTimeout(() => {
//           navigate(`/quiz/${quizId}/room/${roomId}/final-results`);
//         }, 1500);
//         return;
//       }

//       // Phòng đang diễn ra
//       if (roomStatus.isStarted) {
//         setStatus("Quiz đang diễn ra. Tham gia ngay...");
//         setTimeout(() => {
//           navigate(`/quiz/${quizId}/room/${roomId}/play`);
//         }, 1500);
//         return;
//       }

//       // Phòng chưa bắt đầu
//       if (!roomStatus.isStarted) {
//         setStatus("Quiz chưa bắt đầu. Chuyển đến phòng chờ...");
//         setTimeout(() => {
//           navigate(`/quiz/${quizId}/room/${roomId}/waiting`);
//         }, 1500);
//         return;
//       }

//       // Fallback
//       setStatus("Không xác định được trạng thái. Chuyển đến phòng chờ...");
//       setTimeout(() => {
//         navigate(`/quiz/${quizId}/room/${roomId}/waiting`);
//       }, 2000);

//     } catch (e) {
//       console.error("Lỗi trong QuizController:", e);
//       setError("Có lỗi xảy ra. Đang chuyển về trang tạo phòng...");
//       setTimeout(() => {
//         if (quizId) {
//           navigate(`/quiz/${quizId}/join`);
//         } else {
//           navigate('/');
//         }
//       }, 3000);
//     } finally {
//       setLoading(false);
//     }
//   };
//   const handleRetry = () => {
//     setLoading(true);
//     setError("");
//     checkAndRedirect();
//   };

//   const handleGoHome = () => {
//     localStorage.removeItem("userName");
//     localStorage.removeItem("quizId");
//     navigate('/');
//   };

//   return (
//     <GradientBox>
//       <StyledCard>
//         <CardContent sx={{ p: 4 }}>
          
//           {/* Loading State */}
//           {loading && !error && (
//             <Box textAlign="center">
//               <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
//                 <CircularProgress size={64} thickness={4} />
//               </Box>
              
//               <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
//                 <SearchIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
//                 Đang Kiểm Tra
//               </Typography>
              
//               <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
//                 {status}
//               </Typography>
              
//               <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50' }}>
//                 <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
//                   <Chip
//                     label={`Quiz ID: ${quizId}`}
//                     variant="outlined"
//                     size="small"
//                     sx={{ fontFamily: 'monospace' }}
//                   />
//                   <Chip
//                     label={`User: ${localStorage.getItem("userName") || "Chưa có"}`}
//                     variant="outlined"
//                     size="small"
//                   />
//                 </Stack>
//               </Paper>
//             </Box>
//           )}

//           {/* Error State */}
//           {error && (
//             <Box textAlign="center">
//               <IconContainer>
//                 <ErrorIcon color="error" sx={{ fontSize: 'inherit' }} />
//               </IconContainer>
              
//               <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'error.main' }}>
//                 Có Lỗi Xảy Ra
//               </Typography>
              
//               <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
//                 {error}
//               </Typography>
              
//               <Stack spacing={2}>
//                 <Button
//                   variant="contained"
//                   color="primary"
//                   size="large"
//                   startIcon={<RefreshIcon />}
//                   onClick={handleRetry}
//                   fullWidth
//                 >
//                   Thử Lại
//                 </Button>
                
//                 <Button
//                   variant="contained"
//                   color="success"
//                   size="large"
//                   startIcon={<LoginIcon />}
//                   onClick={() => navigate(`/quiz/${quizId}/join`)}
//                   fullWidth
//                 >
//                   Tham Gia Quiz
//                 </Button>
                
//                 <Button
//                   variant="outlined"
//                   color="inherit"
//                   size="large"
//                   startIcon={<HomeIcon />}
//                   onClick={handleGoHome}
//                   fullWidth
//                 >
//                   Về Trang Chủ
//                 </Button>
//               </Stack>
//             </Box>
//           )}

//           {/* Success State with delayed redirect */}
//           {!loading && !error && (
//             <Box textAlign="center">
//               <IconContainer>
//                 <CheckCircleIcon color="success" sx={{ fontSize: 'inherit' }} />
//               </IconContainer>
              
//               <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'success.main' }}>
//                 Đang Chuyển Hướng
//               </Typography>
              
//               <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
//                 {status}
//               </Typography>
              
//               <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
//                 <AlertTitle sx={{ fontWeight: 'bold' }}>Thông tin phiên</AlertTitle>
//                 <Typography variant="body2">
//                   <strong>Quiz ID:</strong> {quizId}
//                 </Typography>
//                 <Typography variant="body2">
//                   <strong>User:</strong> {localStorage.getItem("userName")}
//                 </Typography>
//               </Alert>

//               <Button
//                 variant="text"
//                 color="primary"
//                 size="small"
//                 onClick={() => navigate('/')}
//                 sx={{ textDecoration: 'underline' }}
//               >
//                 Hủy và về trang chủ
//               </Button>
//             </Box>
//           )}

//           {/* Navigation Help */}
//           <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
//             <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2, fontWeight: 'bold' }}>
//               <MapIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: 'small' }} />
//               Hướng dẫn điều hướng:
//             </Typography>
            
//             <List dense sx={{ bgcolor: 'grey.50', borderRadius: 1 }}>
//               <ListItem>
//                 <ListItemIcon sx={{ minWidth: 36 }}>
//                   <PersonAddIcon fontSize="small" color="action" />
//                 </ListItemIcon>
//                 <ListItemText
//                   primary="Quiz chưa tồn tại → Tạo phòng mới"
//                   primaryTypographyProps={{ variant: 'body2' }}
//                 />
//               </ListItem>
              
//               <ListItem>
//                 <ListItemIcon sx={{ minWidth: 36 }}>
//                   <LoginIcon fontSize="small" color="action" />
//                 </ListItemIcon>
//                 <ListItemText
//                   primary="Chưa tham gia → Trang tham gia"
//                   primaryTypographyProps={{ variant: 'body2' }}
//                 />
//               </ListItem>
              
//               <ListItem>
//                 <ListItemIcon sx={{ minWidth: 36 }}>
//                   <HourglassEmptyIcon fontSize="small" color="action" />
//                 </ListItemIcon>
//                 <ListItemText
//                   primary="Quiz chưa bắt đầu → Phòng chờ"
//                   primaryTypographyProps={{ variant: 'body2' }}
//                 />
//               </ListItem>
              
//               <ListItem>
//                 <ListItemIcon sx={{ minWidth: 36 }}>
//                   <PlayArrowIcon fontSize="small" color="action" />
//                 </ListItemIcon>
//                 <ListItemText
//                   primary="Quiz đang diễn ra → Trang chơi"
//                   primaryTypographyProps={{ variant: 'body2' }}
//                 />
//               </ListItem>
              
//               <ListItem>
//                 <ListItemIcon sx={{ minWidth: 36 }}>
//                   <EmojiEventsIcon fontSize="small" color="action" />
//                 </ListItemIcon>
//                 <ListItemText
//                   primary="Quiz đã kết thúc → Kết quả cuối"
//                   primaryTypographyProps={{ variant: 'body2' }}
//                 />
//               </ListItem>
//             </List>
//           </Box>
//         </CardContent>
//       </StyledCard>
//     </GradientBox>
//   );
// };

// export default QuizController;
// src/components/QuizController.tsx

// src/components/QuizController.tsx

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