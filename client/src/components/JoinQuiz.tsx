// // src/components/JoinQuiz.tsx

// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ref, set, db } from "../config/firebase";
// import apiService from "../services/api";
// import { 
//   Box, Button, Card, CardContent, Typography, CircularProgress, 
//   Paper, Stack, Alert, FormControlLabel, Checkbox, Divider 
// } from '@mui/material';
// import { styled } from '@mui/material/styles';
// import AddIcon from '@mui/icons-material/Add';
// import HomeIcon from '@mui/icons-material/Home';
// import SettingsIcon from '@mui/icons-material/Settings';
// import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Avatar } from "@mui/material";


// // Interface cho dữ liệu quiz detail
// interface QuizDetailData {
//   title: string;
//   description: string;
//   summary: string;
//   totalQuestions: number;
// }

// // Styled components
// const GradientBox = styled(Box)(({ theme }) => ({
//   background: 'linear-gradient(135deg, #e3f2fd 0%, #c5cae9 100%)',
//   minHeight: '100vh',
//   padding: theme.spacing(2),
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
//   justifyContent: 'flex-start',
//   paddingTop: theme.spacing(4),
//   paddingBottom: theme.spacing(4),
// }));

// const MainCard = styled(Card)(({ theme }) => ({
//   maxWidth: '90%',
//   width: '100%',
//   boxShadow: theme.shadows[16],
//   borderRadius: Number(theme.shape.borderRadius) * 2,
//   marginBottom: theme.spacing(3),
//   [theme.breakpoints.up('sm')]: {
//     maxWidth: 600,
//   },
//   [theme.breakpoints.up('md')]: {
//     maxWidth: 800,
//   },
//   [theme.breakpoints.up('lg')]: {
//     maxWidth: 1000,
//   },
// }));

// const ActionButton = styled(Button)(({ theme }) => ({
//   padding: theme.spacing(2),
//   fontSize: '1.1rem',
//   fontWeight: 600,
//   borderRadius: theme.spacing(1),
//   transition: 'transform 0.2s',
//   '&:hover': {
//     transform: 'scale(1.02)'
//   }
// }));

// const SettingsCard = styled(Card)(({ theme }) => ({
//   backgroundColor: '#f8f9ff',
//   border: '1px solid #e3f2fd',
//   marginBottom: theme.spacing(2),
// }));

// const JoinQuiz: React.FC = () => {
//   const [loading, setLoading] = useState(true);
//   const [isCreating, setIsCreating] = useState(false);
//   const [error, setError] = useState<string>("");
//   const [quizInfo, setQuizInfo] = useState<QuizDetailData | null>(null);
//   const [hostControlEnabled, setHostControlEnabled] = useState(false);

//   const [openJoinDialog, setOpenJoinDialog] = useState(false);
//   const [playerName, setPlayerName] = useState("");
//   const [avatarList, setAvatarList] = useState<string[]>([]);
//   const [selectedAvatar, setSelectedAvatar] = useState("");
//   const [showAvatarList, setShowAvatarList] = useState(false);

//   const { quizId } = useParams<{ quizId: string }>();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!quizId) {
//       setError("Không tìm thấy ID của bộ đề quiz.");
//       setLoading(false);
//       return;
//     }

//     // Kiểm tra xem quizId có phải là số không
//     const numericQuizId = parseInt(quizId);
//     if (isNaN(numericQuizId)) {
//       navigate('/404'); // Chuyển đến trang 404 nếu ID không hợp lệ
//       return;
//     }

//     const fetchQuizInfo = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await apiService.findDetailQuiz(numericQuizId);
        
//         if (response.success && response.data) {
//             const mapped: QuizDetailData = {
//               title: response.data.title,
//               description: response.data.description,
//               summary: response.data.summary || "",
//               totalQuestions: response.data.totalQuestions,
//             };
//             setQuizInfo(mapped);
//         } else {
//           // Xử lý trường hợp API trả về success: false
//           console.error("API Error:", response.error || response.message);
          
//           // Kiểm tra các trường hợp lỗi cụ thể
//           if (response.message?.toLowerCase().includes('not found') || 
//               response.error?.toLowerCase().includes('not found')) {
//             navigate('/404'); // Chuyển đến trang 404
//             return;
//           }
          
//           setError(response.message || "Không thể tải thông tin quiz");
//         }
//       } catch (err: any) {
//         console.error("Network/API Error:", err);
        
//         // Xử lý các loại lỗi khác nhau
//         if (err.response?.status === 404) {
//           navigate('/404');
//           return;
//         }
        
//         if (err.response?.status === 403) {
//           navigate('/403'); // Nếu có trang 403
//           return;
//         }
        
//         if (err.response?.status >= 500) {
//           setError("Lỗi máy chủ. Vui lòng thử lại sau.");
//         } else if (err.code === 'NETWORK_ERROR' || !err.response) {
//           setError("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.");
//         } else {
//           setError("Đã có lỗi xảy ra khi tải thông tin quiz. Vui lòng thử lại.");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchQuizInfo();
//   }, [quizId, navigate]);
//   const handleCreateAndPlay = async () => {
//     if (!quizId || !quizInfo) return;

//     setIsCreating(true);
//     setError("");

//     try {
//       const roomId = `room_${Date.now()}`;
//       const roomPath = `quizzes/${quizId}/rooms/${roomId}`;
//       const roomRef = ref(db, roomPath);

//       const roomData = {
//         info: {
//           roomName: `Phòng chơi lúc ${new Date().toLocaleTimeString('vi-VN')}`,
//           createdBy: "system",
//           createdAt: Date.now(),
//           maxParticipants: 20,
//           hostControlEnabled: hostControlEnabled,
//           hostName: "system",
//           quizTitle: quizInfo.title,
//           quizDescription: quizInfo.description,
//           totalQuestions: quizInfo.totalQuestions,
//         },
//         status: {
//           isStarted: true,  // ✅ cho trạng thái đã bắt đầu luôn
//           startedAt: Date.now(),
//           startedBy: "system",
//           isCompleted: false,
//           completedAt: null,
//         },
//         currentState: {
//           phase: 'playing', // ✅ trạng thái đang chơi
//           questionIndex: 0,
//           timeLeft: 30,
//           waitingForHost: false,
//         },
//         participants: {},
//         leaderboard: {},
//         playHistory: {}
//       };
      
//       await set(roomRef, roomData);

//       localStorage.removeItem("userName");
//       localStorage.setItem("quizId", quizId);
//       localStorage.setItem("roomId", roomId);

//       // ✅ Chuyển thẳng vào trang chơi luôn
//       navigate(`/quiz/${quizId}/room/${roomId}/play`);

//     } catch (error) {
//       console.error("Lỗi khi tạo phòng:", error);
//       setError("Đã có lỗi xảy ra khi tạo phòng! Vui lòng thử lại.");
//       setIsCreating(false);
//     }
//   };
//   const handleCreateRoom = async () => {
//     if (!quizId || !quizInfo) return;

//     setIsCreating(true);
//     setError("");

//     try {
//       const roomId = `room_${Date.now()}`;
//       const roomPath = `quizzes/${quizId}/rooms/${roomId}`;
//       const roomRef = ref(db, roomPath);

//       const roomData = {
//         info: {
//           roomName: `Phòng chơi lúc ${new Date().toLocaleTimeString('vi-VN')}`,
//           createdBy: "system",
//           createdAt: Date.now(),
//           maxParticipants: 20,
//           hostControlEnabled: hostControlEnabled,
//           hostName: "system",
//           // Thêm thông tin quiz từ API
//           quizTitle: quizInfo.title,
//           quizDescription: quizInfo.description,
//           totalQuestions: quizInfo.totalQuestions,
//         },
//         status: {
//           isStarted: false,
//           startedAt: null,
//           startedBy: null,
//           isCompleted: false,
//           completedAt: null,
//         },
//         currentState: {
//           phase: 'waiting',
//           questionIndex: 0,
//           timeLeft: 30,
//           waitingForHost: false,
//         },
//         participants: {},
//         leaderboard: {},
//         playHistory: {}
//       };
      
//       await set(roomRef, roomData);

//       localStorage.removeItem("userName");
//       localStorage.setItem("quizId", quizId);
//       localStorage.setItem("roomId", roomId);

//       navigate(`/quiz/${quizId}/room/${roomId}/waiting`);

//     } catch (error) {
//       console.error("Lỗi khi tạo phòng:", error);
//       setError("Đã có lỗi xảy ra khi tạo phòng! Vui lòng thử lại.");
//       setIsCreating(false);
//     }
//   };
//   const handleOpenJoinDialog = async () => {
//     try {
//       const res = await fetch("/img/listImage.json");
//       const list = await res.json();
//       setAvatarList(list);

//       // chọn avatar random mặc định
//       const randomAvatar = list[Math.floor(Math.random() * list.length)];
//       setSelectedAvatar(randomAvatar);

//       // tạo tên random mặc định
//       const adjectives = ["Cool", "Smart", "Fast", "Happy"];
//       const nouns = ["Player", "Hero", "Cat", "Dude"];
//       const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${
//         nouns[Math.floor(Math.random() * nouns.length)]
//       }${Math.floor(Math.random() * 100)}`;
//       setPlayerName(randomName);

//       setOpenJoinDialog(true);
//     } catch (err) {
//       console.error("Lỗi load avatar:", err);
//     }
//   };
//   const handleStartSoloGame = async () => {
//     if (!quizId || !quizInfo || !playerName) return;

//     setIsCreating(true);
//     setError("");

//     try {
//       const roomId = `room_${Date.now()}`;
//       const roomPath = `quizzes/${quizId}/rooms/${roomId}`;
//       const roomRef = ref(db, roomPath);

//       const roomData = {
//         info: {
//           roomName: `Phòng solo - ${playerName}`,
//           createdBy: playerName,
//           createdAt: Date.now(),
//           maxParticipants: 1,
//           hostControlEnabled: false,
//           hostName: playerName,
//           quizTitle: quizInfo.title,
//           quizDescription: quizInfo.description,
//           totalQuestions: quizInfo.totalQuestions,
//         },
//         status: {
//           isStarted: true,
//           startedAt: Date.now(),
//           startedBy: playerName,
//           isCompleted: false,
//           completedAt: null,
//         },
//         currentState: {
//           phase: "playing",
//           questionIndex: 0,
//           timeLeft: 30,
//           waitingForHost: false,
//         },
//         participants: {
//           [playerName]: {
//             joinedAt: Date.now(),
//             score: 0,
//             isActive: true,
//             displayName: playerName,
//             avatar: `/img/${selectedAvatar}`,
//           }
//         },
//         leaderboard: {
//           [playerName]: {
//             bestScore: 0,
//             lastPlayed: Date.now(),
//             displayName: playerName,
//             avatar: `/img/${selectedAvatar}`,
//           }
//         },
//         playHistory: {}
//       };

//       await set(roomRef, roomData);

//       // Lưu localStorage
//       localStorage.setItem("userName", playerName);
//       localStorage.setItem("quizId", quizId);
//       localStorage.setItem("roomId", roomId);

//       navigate(`/quiz/${quizId}/room/${roomId}/play`);
//     } catch (error) {
//       console.error("Lỗi khi tạo phòng solo:", error);
//       setError("Không thể bắt đầu chơi. Vui lòng thử lại!");
//     } finally {
//       setIsCreating(false);
//       setOpenJoinDialog(false);
//     }
//   };

//   // Hiển thị loading
//   if (loading) {
//     return (
//       <GradientBox>
//         <CircularProgress size={60} />
//         <Typography sx={{ color: 'text.primary', mt: 2, fontSize: '1.1rem' }}>
//           Đang kiểm tra bộ đề...
//         </Typography>
//       </GradientBox>
//     );
//   }

//   // Hiển thị lỗi nếu không có thông tin quiz
//   if (!quizInfo && !loading) {
//     return (
//       <GradientBox>
//         <MainCard>
//           <CardContent sx={{ p: 4, textAlign: 'center' }}>
//             <Typography variant="h5" color="error" mb={2}>
//               Không thể tải thông tin quiz
//             </Typography>
            
//             {error && (
//               <Alert severity="error" sx={{ mb: 3 }}>
//                 {error}
//               </Alert>
//             )}
            
//             <Stack spacing={2}>
//               <Button
//                 variant="outlined"
//                 onClick={() => window.location.reload()}
//                 disabled={loading}
//               >
//                 Thử lại
//               </Button>
              
//               <Button
//                 variant="contained"
//                 startIcon={<HomeIcon />}
//                 onClick={() => navigate('/')}
//               >
//                 Về Trang chủ
//               </Button>
//             </Stack>
//           </CardContent>
//         </MainCard>
//       </GradientBox>
//     );
//   }

//   return (
//     <GradientBox>
//       <MainCard>
//         <CardContent sx={{ p: 4 }}>
//           <Typography variant="h4" component="h1" textAlign="center" mb={1} fontWeight="bold">
//             Sẵn sàng chơi?
//           </Typography>
          
//           {quizInfo && (
//             <Paper elevation={0} sx={{ p: 3, bgcolor: 'grey.100', mb: 3, borderRadius: 2 }}>
//               <Typography variant="h6" fontWeight="bold" textAlign="center" mb={1}>
//                 {quizInfo.title}
//               </Typography>
//               <Typography variant="body2" color="text.secondary" textAlign="center" mb={2}>
//                 {quizInfo.description}
//               </Typography>
              
//               <Divider sx={{ my: 2 }} />
              
//               <Stack direction="row" spacing={3} justifyContent="center" flexWrap="wrap">
//                 <Box textAlign="center">
//                   <Typography variant="h6" color="primary" fontWeight="bold">
//                     {quizInfo.totalQuestions}
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary">
//                     Câu hỏi
//                   </Typography>
//                 </Box>
//               </Stack>
              
//               {quizInfo.summary && (
//                 <>
//                   <Divider sx={{ my: 2 }} />
//                   <Typography variant="body2" color="text.secondary" textAlign="center">
//                     {quizInfo.summary}
//                   </Typography>
//                 </>
//               )}
//             </Paper>
//           )}

//           {/* Cài đặt phòng */}
//           <SettingsCard>
//             <CardContent sx={{ p: 2 }}>
//               <Stack direction="row" alignItems="center" spacing={1} mb={2}>
//                 <SettingsIcon color="primary" />
//                 <Typography variant="h6" fontWeight="bold">Cài đặt phòng</Typography>
//               </Stack>
              
//               <Stack direction="row" spacing={4} flexWrap="wrap">
//                 <FormControlLabel
//                   control={
//                     <Checkbox
//                       checked={hostControlEnabled}
//                       onChange={(e) => setHostControlEnabled(e.target.checked)}
//                       color="primary"
//                     />
//                   }
//                   label={
//                     <Box>
//                       <Typography variant="body1" fontWeight="medium">
//                         Chủ phòng điều khiển chuyển câu
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         Khi bật, chủ phòng sẽ cần bấm "Câu tiếp theo" để chuyển câu hỏi mới thay vì tự động
//                       </Typography>
//                     </Box>
//                   }
//                   sx={{ alignItems: 'flex-start', mb: 1 }}
//                 />
//               </Stack>
//             </CardContent>
//           </SettingsCard>

//           {error && (
//             <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
//           )}

//           <Stack spacing={2}>
//             <ActionButton
//               variant="contained"
//               color="success"
//               onClick={handleCreateRoom}
//               disabled={isCreating || !!error || !quizInfo}
//               startIcon={isCreating ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
//               fullWidth
//             >
//               {isCreating ? 'Đang tạo phòng...' : 'Chơi với bạn bè'}
//             </ActionButton>
//           </Stack>
//             <ActionButton
//               variant="contained"
//               color="primary"
//               onClick={handleOpenJoinDialog}   // ✅ đổi chỗ này
//               disabled={isCreating || !!error || !quizInfo}
//               startIcon={isCreating ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
//               fullWidth
//             >
//               {isCreating ? 'Đang vào...' : 'Vào Chơi Ngay'}
//             </ActionButton>

//           <Typography variant="body2" color="text.secondary" textAlign="center" mt={3}>
//             Một phòng chơi mới sẽ được tạo cho bộ đề này.
//           </Typography>
//         </CardContent>
//       </MainCard>
//       <Dialog open={openJoinDialog} onClose={() => setOpenJoinDialog(false)}>
//         <DialogTitle>Chọn tên và Avatar</DialogTitle>
//         <DialogContent>
//           {/* Avatar + Nút đổi */}
//           <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
//             <Avatar src={`/img/${selectedAvatar}`} sx={{ width: 80, height: 80, mr: 2 }} />
//             <Button variant="outlined" onClick={() => setShowAvatarList(true)}>
//               Đổi Avatar
//             </Button>
//           </Box>

//           {/* Hiển thị list avatar khi bấm "Đổi Avatar" */}
//           {showAvatarList && (
//             <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 60px)", gap: 2, mb: 2 }}>
//               {avatarList.map((img, i) => (
//                 <Avatar
//                   key={i}
//                   src={`/img/${img}`}
//                   sx={{
//                     width: 60,
//                     height: 60,
//                     cursor: "pointer",
//                     border: selectedAvatar === img ? "2px solid #1976d2" : "2px solid transparent"
//                   }}
//                   onClick={() => {
//                     setSelectedAvatar(img);
//                     setShowAvatarList(false); // ẩn list sau khi chọn
//                   }}
//                 />
//               ))}
//             </Box>
//           )}

//           {/* Input + random tên */}
//           <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
//             <TextField
//               fullWidth
//               label="Tên hiển thị"
//               value={playerName}
//               onChange={(e) => setPlayerName(e.target.value)}
//             />
//             <Button
//               variant="outlined"
//               sx={{ ml: 2, whiteSpace: "nowrap" }}
//               onClick={() => {
//                 const adjectives = ["Cool", "Smart", "Fast", "Happy"];
//                 const nouns = ["Player", "Hero", "Cat", "Dude"];
//                 const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]}${
//                   nouns[Math.floor(Math.random() * nouns.length)]
//                 }${Math.floor(Math.random() * 100)}`;
//                 setPlayerName(randomName);
//               }}
//             >
//               Đổi tên
//             </Button>
//           </Box>
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={() => setOpenJoinDialog(false)}>Hủy</Button>
//           <Button variant="contained" onClick={handleStartSoloGame}>
//             Bắt đầu chơi
//           </Button>
//         </DialogActions>
//       </Dialog>



//       {/* Nút "Về Trang chủ" */}
//       <Button 
//         startIcon={<HomeIcon />} 
//         onClick={() => navigate('/')} 
//         color="inherit" 
//         sx={{ 
//           textTransform: 'none',
//           mt: 2,
//           mb: 2
//         }}
//       >
//         Về Trang chủ
//       </Button>
//     </GradientBox>
//   );
// };

// export default JoinQuiz;
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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import GroupIcon from '@mui/icons-material/Group';
import QuizIcon from '@mui/icons-material/Quiz';
import PersonIcon from '@mui/icons-material/Person';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Avatar } from "@mui/material";

// Interface cho dữ liệu quiz detail
interface QuizDetailData {
  title: string;
  description: string;
  summary: string;
  totalQuestions: number;
}

// Styled components với thiết kế hiện đại
const GradientBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  minHeight: '100vh',
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(6),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.1
  }
}));

const MainCard = styled(Card)(({ theme }) => ({
  maxWidth: '90%',
  width: '100%',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(2),
  border: '1px solid rgba(255, 255, 255, 0.2)',
  position: 'relative',
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    background: 'linear-gradient(135deg, #667eea, #764ba2, #f093fb, #f5576c)',
    borderRadius: theme.spacing(2),
    zIndex: -1,
    opacity: 0.1
  },
  [theme.breakpoints.up('sm')]: {
    maxWidth: 500,   // 🔥 nhỏ lại
  },
  [theme.breakpoints.up('md')]: {
    maxWidth: 650,   // 🔥 nhỏ hơn trước
  },
  [theme.breakpoints.up('lg')]: {
    maxWidth: 1200,   // 🔥 vừa mắt trên màn hình lớn
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(2.5, 4),
  fontSize: '1.1rem',
  fontWeight: 700,
  borderRadius: theme.spacing(2),
  textTransform: 'none',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.3)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.3)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: -100,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  }
}));

const PlayButton = styled(ActionButton)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
    transform: 'translateY(-3px) scale(1.02)',
  }
}));

const MultiplayerButton = styled(ActionButton)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(135deg, #ec4899 0%, #ef4444 100%)',
    transform: 'translateY(-3px) scale(1.02)',
  }
}));

const SettingsCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(102, 126, 234, 0.2)',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(2),
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 6px 25px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-1px)',
  }
}));

const QuizInfoCard = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
  border: '2px solid rgba(102, 126, 234, 0.2)',
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
    borderRadius: '50%',
  }
}));

const StatsBox = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(2),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    left: -50,
    width: 100,
    height: 100,
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
  }
}));

const HomeButton = styled(Button)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.9)',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  }
}));

const LoadingBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(3),
  color: 'white',
  '& .MuiCircularProgress-root': {
    color: 'rgba(255, 255, 255, 0.9)',
  }
}));

const ModernDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(3),
    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    minWidth: 400,
    [theme.breakpoints.down('sm')]: {
      minWidth: '90%',
      margin: theme.spacing(2),
    }
  }
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
        <LoadingBox>
          <CircularProgress size={80} thickness={4} />
          <Typography sx={{ fontSize: '1.3rem', fontWeight: 600, textAlign: 'center' }}>
            Đang kiểm tra bộ đề...
          </Typography>
          <Typography sx={{ fontSize: '1rem', opacity: 0.8, textAlign: 'center' }}>
            Vui lòng đợi trong giây lát
          </Typography>
        </LoadingBox>
      </GradientBox>
    );
  }

  // Hiển thị lỗi nếu không có thông tin quiz
  if (!quizInfo && !loading) {
    return (
      <GradientBox>
        <MainCard>
          <CardContent sx={{ p: 5, textAlign: 'center' }}>
            <QuizIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" color="error" mb={1} fontWeight="bold">
              Không thể tải thông tin quiz
            </Typography>
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 4, 
                  borderRadius: 2,
                  '& .MuiAlert-message': { fontSize: '1.1rem' }
                }}
              >
                {error}
              </Alert>
            )}
            
            <Stack spacing={3} sx={{ mt: 4 }}>
              <ActionButton
                variant="contained"
                onClick={() => window.location.reload()}
                disabled={loading}
                sx={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white'
                }}
              >
                Thử lại
              </ActionButton>
              
              <ActionButton
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
                sx={{ 
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': { 
                    borderColor: '#5a67d8',
                    backgroundColor: 'rgba(102, 126, 234, 0.04)'
                  }
                }}
              >
                Về Trang chủ
              </ActionButton>
            </Stack>
          </CardContent>
        </MainCard>
      </GradientBox>
    );
  }

  return (
    <GradientBox>
      <MainCard>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h4"
              component="h2"
              fontWeight="800"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
              }}
            >
              Sẵn sàng chinh phục?
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight="300">
              Hãy chọn cách chơi phù hợp với bạn
            </Typography>
          </Box>

          {quizInfo && (
            <QuizInfoCard elevation={0}>
              <Box
                sx={{ textAlign: "center", position: "relative", zIndex: 1 }}
              >
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  mb={1}
                  sx={{ color: "#2d3748" }}
                >
                  {quizInfo.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  mb={1.5}
                  sx={{ fontSize: "1.1rem", lineHeight: 1.2 }}
                >
                  {quizInfo.description}
                </Typography>

                <Divider
                  sx={{ my: 1, borderColor: "rgba(102, 126, 234, 0.2)" }}
                />

                <Box
                  sx={{ display: "flex", justifyContent: "center", mb: 0.1 }}
                >
                  <StatsBox>
                    <QuizIcon sx={{ fontSize: 20, mb: 0.1 }} />
                    <Typography variant="h5" fontWeight="bold">
                      {quizInfo.totalQuestions}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Câu hỏi thú vị
                    </Typography>
                  </StatsBox>
                </Box>

                {quizInfo.summary && (
                  <>
                    <Divider
                      sx={{ my: 1, borderColor: "rgba(102, 126, 234, 0.2)" }}
                    />
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{
                        fontSize: "1rem",
                        fontStyle: "italic",
                        background: "rgba(102, 126, 234, 0.05)",
                        padding: 1,
                        borderRadius: 2,
                        border: "1px solid rgba(102, 126, 234, 0.1)",
                      }}
                    >
                      {quizInfo.summary}
                    </Typography>
                  </>
                )}
              </Box>
            </QuizInfoCard>
          )}

          {/* Cài đặt phòng */}
          <SettingsCard>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "50%",
                    p: 1,
                    mr: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <SettingsIcon sx={{ color: "white", fontSize: 20 }} />
                </Box>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{ color: "#2d3748" }}
                >
                  Cài đặt phòng chơi
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={hostControlEnabled}
                    onChange={(e) => setHostControlEnabled(e.target.checked)}
                    sx={{
                      "&.Mui-checked": {
                        color: "#667eea",
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ ml: 1 }}>
                    <Typography
                      variant="body1"
                      fontWeight="600"
                      sx={{ color: "#2d3748" }}
                    >
                      Chủ phòng điều khiển chuyển câu
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Khi bật, chủ phòng sẽ cần bấm "Câu tiếp theo" để chuyển
                      câu hỏi mới thay vì tự động
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: "flex-start", width: "100%" }}
              />
            </CardContent>
          </SettingsCard>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                "& .MuiAlert-message": { fontSize: "1.1rem" },
              }}
            >
              {error}
            </Alert>
          )}

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <MultiplayerButton
              onClick={handleCreateRoom}
              disabled={isCreating || !!error || !quizInfo}
              startIcon={
                isCreating ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <GroupIcon />
                )
              }
              sx={{ flex: 1 }} // 🔥 để chia đều chiều ngang
            >
              {isCreating ? "Đang tạo phòng..." : "Chơi với bạn bè"}
            </MultiplayerButton>

            <PlayButton
              onClick={handleOpenJoinDialog}
              disabled={isCreating || !!error || !quizInfo}
              startIcon={
                isCreating ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <PlayArrowIcon />
                )
              }
              sx={{ flex: 1 }} // 🔥 để chia đều chiều ngang
            >
              {isCreating ? "Đang vào..." : "Vào Chơi Ngay"}
            </PlayButton>
          </Stack>
        </CardContent>
      </MainCard>

      {/* Dialog hiện đại cho việc chọn tên và avatar */}
      <ModernDialog
        open={openJoinDialog}
        onClose={() => setOpenJoinDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            pb: 1,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            fontWeight: "bold",
            fontSize: "1.5rem",
          }}
        >
          <PersonIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Tạo nhân vật của bạn
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {/* Avatar Selection */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h6"
              fontWeight="600"
              mb={2}
              sx={{ color: "#2d3748" }}
            >
              Chọn Avatar
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <Avatar
                src={`/img/${selectedAvatar}`}
                sx={{
                  width: 100,
                  height: 100,
                  mr: 3,
                  border: "4px solid #667eea",
                  boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 12px 35px rgba(102, 126, 234, 0.4)",
                  },
                }}
              />
              <ActionButton
                variant="outlined"
                onClick={() => setShowAvatarList(true)}
                sx={{
                  borderColor: "#667eea",
                  color: "#667eea",
                  "&:hover": {
                    borderColor: "#5a67d8",
                    backgroundColor: "rgba(102, 126, 234, 0.04)",
                  },
                }}
              >
                Đổi Avatar
              </ActionButton>
            </Box>

            {/* Avatar Grid */}
            {showAvatarList && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, 70px)",
                  gap: 2,
                  mb: 3,
                  justifyContent: "center",
                  p: 3,
                  background: "rgba(102, 126, 234, 0.05)",
                  borderRadius: 2,
                  border: "2px solid rgba(102, 126, 234, 0.1)",
                  maxHeight: 300,
                  overflowY: "auto",
                }}
              >
                {avatarList.map((img, i) => (
                  <Avatar
                    key={i}
                    src={`/img/${img}`}
                    sx={{
                      width: 70,
                      height: 70,
                      cursor: "pointer",
                      border:
                        selectedAvatar === img
                          ? "3px solid #667eea"
                          : "3px solid transparent",
                      boxShadow:
                        selectedAvatar === img
                          ? "0 4px 15px rgba(102, 126, 234, 0.4)"
                          : "0 2px 8px rgba(0,0,0,0.1)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                        boxShadow: "0 6px 20px rgba(102, 126, 234, 0.3)",
                      },
                    }}
                    onClick={() => {
                      setSelectedAvatar(img);
                      setShowAvatarList(false);
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Name Input */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h6"
              fontWeight="600"
              mb={2}
              sx={{ color: "#2d3748" }}
            >
              Tên hiển thị
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Nhập tên của bạn..."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#667eea",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#667eea",
                    },
                  },
                }}
              />
              <ActionButton
                variant="outlined"
                onClick={() => {
                  const adjectives = [
                    "Cool",
                    "Smart",
                    "Fast",
                    "Happy",
                    "Lucky",
                    "Brave",
                  ];
                  const nouns = [
                    "Player",
                    "Hero",
                    "Cat",
                    "Dude",
                    "Star",
                    "Ninja",
                  ];
                  const randomName = `${
                    adjectives[Math.floor(Math.random() * adjectives.length)]
                  }${
                    nouns[Math.floor(Math.random() * nouns.length)]
                  }${Math.floor(Math.random() * 100)}`;
                  setPlayerName(randomName);
                }}
                sx={{
                  whiteSpace: "nowrap",
                  borderColor: "#667eea",
                  color: "#667eea",
                  "&:hover": {
                    borderColor: "#5a67d8",
                    backgroundColor: "rgba(102, 126, 234, 0.04)",
                  },
                }}
              >
                🎲 Random
              </ActionButton>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0, justifyContent: "space-between" }}>
          <Button
            onClick={() => setOpenJoinDialog(false)}
            sx={{
              color: "#64748b",
              "&:hover": {
                backgroundColor: "rgba(100, 116, 139, 0.04)",
              },
            }}
          >
            Hủy
          </Button>
          <PlayButton
            onClick={handleStartSoloGame}
            disabled={!playerName.trim() || isCreating}
            startIcon={
              isCreating ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <PlayArrowIcon />
              )
            }
            sx={{ minWidth: 180 }}
          >
            {isCreating ? "Đang vào..." : "Bắt đầu chơi"}
          </PlayButton>
        </DialogActions>
      </ModernDialog>

      {/* Home Button */}
      <HomeButton
        startIcon={<HomeIcon />}
        onClick={() => navigate("/")}
        sx={{ mt: 3, mb: 2 }}
      >
        Về Trang chủ
      </HomeButton>
    </GradientBox>
  );
};

export default JoinQuiz;