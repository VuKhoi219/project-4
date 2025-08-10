// // src/components/FinalResults.tsx

// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ref, onValue, db } from "../config/firebase";
// // DỌN DẸP: Xóa Paper, Collapse, TrophyIcon, ShareIcon không dùng đến
// import { Box, Card, CardContent, Typography, Button, CircularProgress, Chip, Grid, Avatar, Stack, Container, Fade, Zoom, Slide } from '@mui/material';
// import { Home as HomeIcon, Refresh as RefreshIcon, BarChart as ChartIcon, Groups as GroupsIcon, Quiz as QuizIcon } from '@mui/icons-material';
// import { styled, keyframes } from '@mui/material/styles';

// // Keyframes and Styled Components (Giữ nguyên)
// const bounce = keyframes`0%,20%,53%,80%,100%{transform:translateY(0)}40%,43%{transform:translateY(-30px)}70%{transform:translateY(-15px)}90%{transform:translateY(-4px)}`;
// const confettiFloat = keyframes`0%{transform:translateY(-10vh) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(720deg);opacity:0}`;
// const trophyFloat = keyframes`0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-10px) rotate(5deg)}`;
// const sparkle = keyframes`0%,100%{opacity:0;transform:scale(.5)}50%{opacity:1;transform:scale(1)}`;
// const GradientBox = styled(Box)(({ theme }) => ({ minHeight: '100vh', background: 'linear-gradient(135deg, #f3e5f5 0%, #e3f2fd 50%, #e8eaf6 100%)', position: 'relative', overflow: 'hidden' }));
// const CelebrationHeader = styled(Box)(({ theme }) => ({ textAlign: 'center', marginBottom: theme.spacing(4), position: 'relative' }));
// const FloatingTrophy = styled(Typography)(({ theme }) => ({ animation: `${trophyFloat} 3s ease-in-out infinite, ${sparkle} 2s ease-in-out infinite`, cursor: 'pointer', transition: 'transform 0.3s ease', '&:hover': { transform: 'scale(1.1)' } }));
// const GradientText = styled(Typography)(({ theme }) => ({ background: 'linear-gradient(45deg, #FFD700 30%, #FF6B6B 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold', animation: `${bounce} 2s infinite` }));
// const ConfettiBox = styled(Box)(({ theme }) => ({ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }));
// const ConfettiItem = styled(Box)<{ delay: number; duration: number; left: number }>(({ delay, duration, left }) => ({ position: 'absolute', left: `${left}%`, top: '-10px', fontSize: '2rem', animation: `${confettiFloat} ${duration}s ${delay}s infinite linear` }));
// const PodiumCard = styled(Card)<{ rank: number }>(({ theme, rank }) => {
//     const colors: {[key: number]: {from: string, to: string}} = { 1: { from: '#FFD700', to: '#FFA000' }, 2: { from: '#C0C0C0', to: '#9E9E9E' }, 3: { from: '#CD7F32', to: '#FF8F00' } };
//     const color = colors[rank];
//     return { background: `linear-gradient(135deg, ${color.from} 0%, ${color.to} 100%)`, color: 'white', transform: 'translateY(0)', transition: 'all 0.3s ease-in-out', cursor: 'pointer', position: 'relative', overflow: 'hidden', '&:hover': { transform: 'translateY(-8px) scale(1.02)', boxShadow: theme.shadows[12] } };
// });
// const PlayerCard = styled(Card)<{ isCurrentUser?: boolean }>(({ theme, isCurrentUser }) => ({ margin: theme.spacing(1, 0), transition: 'all 0.3s ease-in-out', transform: isCurrentUser ? 'scale(1.02)' : 'scale(1)', background: isCurrentUser ? 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)' : '#FFFFFF', border: isCurrentUser ? `2px solid ${theme.palette.warning.main}` : `1px solid ${theme.palette.divider}`, '&:hover': { boxShadow: theme.shadows[8], transform: isCurrentUser ? 'scale(1.03)' : 'scale(1.01)' } }));
// const RankAvatar = styled(Avatar)<{ rank: number }>(({ theme, rank }) => {
//     const getBackgroundColor = () => { switch (rank) { case 1: return 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)'; case 2: return 'linear-gradient(135deg, #C0C0C0 0%, #9E9E9E 100%)'; case 3: return 'linear-gradient(135deg, #CD7F32 0%, #FF8F00 100%)'; default: return 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'; } };
//     return { width: 56, height: 56, background: getBackgroundColor(), fontSize: '1.5rem', fontWeight: 'bold' };
// });


// const FinalResults: React.FC = () => {
//   const [finalLeaderboard, setFinalLeaderboard] = useState<Array<{name: string, score: number, rank: number}>>([]);
//   const [quizInfo, setQuizInfo] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [confettiItems, setConfettiItems] = useState<Array<any>>([]);
  
//   const { quizId, roomId } = useParams<{ quizId: string; roomId: string }>();
//   const navigate = useNavigate();
//   const userName = localStorage.getItem("userName");

//   useEffect(() => {
//     const emojis = ['🎉', '🎊', '✨', '🏆', '🥇', '🌟', '🎈'];
//     setConfettiItems(Array.from({ length: 100 }, (_, i) => ({ id: i, emoji: emojis[Math.floor(Math.random() * emojis.length)], delay: Math.random() * 5, duration: 3 + Math.random() * 4, left: Math.random() * 100 })));
//   }, []);

//   useEffect(() => {
//     if (!quizId || !roomId) { navigate('/'); return; }
//     const infoRef = ref(db, `quizzes/${quizId}/info`);
//     const unsubInfo = onValue(infoRef, (snapshot) => setQuizInfo(snapshot.val()));
//     const leaderboardRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/leaderboard`);
//     const unsubLeaderboard = onValue(leaderboardRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const sorted = Object.entries(data)
//           .map(([name, info]: [string, any]) => ({ name: info.displayName || name, score: info.bestScore, rank: info.rank || 0 }))
//           .sort((a, b) => b.score - a.score)
//           .map((player, index) => ({ ...player, rank: index + 1 }));
//         setFinalLeaderboard(sorted);
//       }
//       setLoading(false);
//     });
//     return () => { unsubInfo(); unsubLeaderboard(); };
//   }, [quizId, roomId, navigate]);
  
//   const createNewRoom = () => navigate(`/quiz/${quizId}/join`);

//   if (loading) return <GradientBox display="flex" alignItems="center" justifyContent="center"><CircularProgress size={64} /></GradientBox>;

//   return (
//     <GradientBox>
//       <ConfettiBox>{confettiItems.map((item) => (<ConfettiItem key={item.id} {...item}>{item.emoji}</ConfettiItem>))}</ConfettiBox>
//       <Container maxWidth="xl" sx={{ py: 4 }}>
//         <Fade in={true} timeout={1000}><CelebrationHeader><FloatingTrophy sx={{ fontSize: '8rem' }}>🏆</FloatingTrophy><GradientText variant="h1" sx={{ fontSize: { xs: '3rem', md: '5rem' } }}>HOÀN THÀNH!</GradientText></CelebrationHeader></Fade>
//         {quizInfo && <Zoom in={true} timeout={800}><Card sx={{ maxWidth: 800, mx: 'auto', mb: 6, boxShadow: 8 }}><CardContent sx={{ p: 4, textAlign: 'center' }}><Typography variant="h4" fontWeight="bold" gutterBottom>{quizInfo.title}</Typography><Stack direction="row" flexWrap="wrap" justifyContent="center" gap={3} mt={2}><Chip icon={<GroupsIcon/>} label={`${finalLeaderboard.length} người chơi`} /><Chip icon={<QuizIcon/>} label={`${quizInfo.totalQuestions || 5} câu hỏi`} /></Stack><Chip label={`Room ID: ${roomId}`} variant="outlined" sx={{ mt: 3, fontFamily: 'monospace' }} /></CardContent></Card></Zoom>}
//         {finalLeaderboard.length >= 3 && (
//           <Box sx={{ mb: 8 }}>
//             <Typography variant="h4" fontWeight="bold" textAlign="center" sx={{ mb: 4 }}>🏅 PODIUM VINH QUANG 🏅</Typography>
//             <Box display="flex" justifyContent="center" alignItems="flex-end" gap={{xs: 2, sm: 4}} flexWrap="wrap">
//               {[finalLeaderboard[1], finalLeaderboard[0], finalLeaderboard[2]].map((player) => {
//                   if (!player) return null;
//                   const rank = player.rank;
//                   const height = rank === 1 ? 250 : 200;
//                   const icon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
//                   return (
//                     <Slide key={rank} direction={rank === 1 ? "up" : "down"} in={true} timeout={800 + rank * 200}>
//                       <Box sx={{flex:1, minWidth:220, maxWidth: 250}}>
//                         <PodiumCard rank={rank} sx={{ height }}>
//                           <CardContent sx={{ textAlign: 'center', p: 2 }}>
//                             <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 1, fontSize:'2rem' }}>{icon}</Avatar>
//                             <Typography variant="h5" fontWeight="bold" noWrap>{player.name}</Typography>
//                             <Typography variant="h6">{player.score} điểm</Typography>
//                             <Typography variant="h4" fontWeight="bold" mt={1}>#{player.rank}</Typography>
//                           </CardContent>
//                         </PodiumCard>
//                       </Box>
//                     </Slide>
//                   );
//               })}
//             </Box>
//           </Box>
//         )}
//         <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
//           <Box sx={{ flex: { lg: '2' } }}>
//             <Card sx={{ boxShadow: 8 }}>
//               <CardContent>
//                 <Typography variant="h5" fontWeight="bold">📊 Bảng Xếp Hạng Cuối Cùng</Typography>
//                 <Stack spacing={2} mt={2}>
//                   {finalLeaderboard.map((player) => (
//                     <PlayerCard key={player.name} isCurrentUser={player.name === userName}>
//                       <CardContent>
//                         <Stack direction="row" justifyContent="space-between" alignItems="center">
//                           <Stack direction="row" spacing={2} alignItems="center">
//                             <RankAvatar rank={player.rank}>{player.rank > 3 ? `#${player.rank}` : player.rank === 1 ? '🏆' : player.rank === 2 ? '🥈' : '🥉'}</RankAvatar>
//                             <Box><Typography variant="h6" fontWeight="bold">{player.name}{player.name === userName && ' (Bạn)'}</Typography></Box>
//                           </Stack>
//                           <Typography variant="h4" fontWeight="bold">{player.score}</Typography>
//                         </Stack>
//                       </CardContent>
//                     </PlayerCard>
//                   ))}
//                 </Stack>
//               </CardContent>
//             </Card>
//           </Box>
//           <Box sx={{ flex: { lg: '1' } }}>
//             <Stack spacing={3}>
//               <Card sx={{boxShadow: 6}}>
//                 <CardContent>
//                   <Typography variant="h6" fontWeight="bold" gutterBottom>⚡ Hành Động</Typography>
//                   <Stack spacing={2}>
//                     <Button variant="contained" fullWidth startIcon={<RefreshIcon />} onClick={createNewRoom}>Chơi Lại (Phòng mới)</Button>
//                     <Button variant="outlined" fullWidth startIcon={<HomeIcon />} onClick={() => navigate('/')}>Về Trang Chủ</Button>
//                   </Stack>
//                 </CardContent>
//               </Card>
//             </Stack>
//           </Box>
//         </Box>
//       </Container>
//     </GradientBox>
//   );
// };

// export default FinalResults;
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, db } from "../config/firebase";
import { Box, Typography, Paper, List, ListItem, ListItemText, Button } from "@mui/material";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { AvatarWithAnimation } from "./AvatarWithAnimation";

interface Player {
  displayName: string;
  score: number;
  avatarUrl?: string;
  animationUrl?: string;
}

const FinalResults: React.FC = () => {
  const { quizId, roomId } = useParams<{ quizId: string; roomId: string }>();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const participantsRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/participants`);
    onValue(participantsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val()) as Player[];
        const sorted = data.sort((a, b) => b.score - a.score);
        setPlayers(sorted);
      }
    });
  }, [quizId, roomId]);

  const podiumVariants: any = {
    hidden: { opacity: 0, y: 100 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.3,
        type: "spring",
        stiffness: 100,
        damping: 8
      }
    })
  };

  if (!players.length) return <Typography>Đang tải kết quả...</Typography>;

  const top3 = players.slice(0, 3);
  const others = players.slice(3);

  return (
    <Box
      sx={{
        textAlign: "center",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0f2027, #203a43, #2c5364)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 4,
        pt: 2
      }}
    >
      {/* Hiệu ứng cúp rơi */}
      <motion.div
        initial={{ y: -200, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 10 }}
        style={{ fontSize: "4rem", marginBottom: "20px" }}
      >
        🏆
      </motion.div>

      {/* Podium */}
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 6, mb: 8 }}>
        {/* Hạng 2 */}
        <motion.div custom={0} variants={podiumVariants} initial="hidden" animate="visible">
          {top3[1] && (
            <Box sx={{ textAlign: "center", position: "relative" }}>
              <Box sx={{ height: 280, position: "relative", zIndex: 2 }}>
                <Canvas camera={{ position: [0, 1.5, 5], fov: 65 }}>
                  <ambientLight intensity={0.8} />
                  <directionalLight position={[5, 5, 5]} />
                  <AvatarWithAnimation
                    avatarUrl={top3[1].avatarUrl!}
                    animationUrl={
                      top3[1].animationUrl?.startsWith("/animations/")
                        ? top3[1].animationUrl
                        : `/animations/${top3[1].animationUrl}`
                    }
                    scale={1.2}
                  />
                </Canvas>
              </Box>
              <Paper sx={{ 
                mt: -8, 
                background: "#C0C0C0", 
                p: 2, 
                borderRadius: "10px",
                position: "relative",
                zIndex: 1
              }}>
                <Typography variant="h6">🥈 {top3[1].displayName}</Typography>
                <Typography>{top3[1].score} điểm</Typography>
              </Paper>
            </Box>
          )}
        </motion.div>

        {/* Hạng 1 */}
        <motion.div custom={1} variants={podiumVariants} initial="hidden" animate="visible">
          {top3[0] && (
            <Box sx={{ textAlign: "center", position: "relative" }}>
              <Box sx={{ height: 320, position: "relative", zIndex: 2 }}>
                <Canvas camera={{ position: [0, 1.5 , 5], fov: 65 }} style={{ height: "480px" }}>
                  <ambientLight intensity={0.8} />
                  <directionalLight position={[5, 5, 5]} />
                  <AvatarWithAnimation
                    avatarUrl={top3[0].avatarUrl!}
                    animationUrl={
                      top3[0].animationUrl?.startsWith("/animations/")
                        ? top3[0].animationUrl
                        : `/animations/${top3[0].animationUrl}`
                    }
                    scale={1.3}
                  />
                </Canvas>
              </Box>
              <Paper sx={{ 
                mt: -10, 
                background: "#FFD700", 
                p: 2, 
                borderRadius: "10px", 
                boxShadow: "0 0 25px gold",
                position: "relative",
                zIndex: 1
              }}>
                <Typography variant="h5" fontWeight="bold">🥇 {top3[0].displayName}</Typography>
                <Typography>{top3[0].score} điểm</Typography>
              </Paper>
            </Box>
          )}
        </motion.div>

        {/* Hạng 3 */}
        <motion.div custom={2} variants={podiumVariants} initial="hidden" animate="visible">
          {top3[2] && (
            <Box sx={{ textAlign: "center", position: "relative" }}>
              <Box sx={{ height: 260, position: "relative", zIndex: 2 }}>
                <Canvas camera={{ position: [0, 1.5, 5], fov: 65 }}>
                  <ambientLight intensity={0.8} />
                  <directionalLight position={[5, 5, 5]} />
                  <AvatarWithAnimation
                    avatarUrl={top3[2].avatarUrl!}
                    animationUrl={
                      top3[2].animationUrl?.startsWith("/animations/")
                        ? top3[2].animationUrl
                        : `/animations/${top3[2].animationUrl}`
                    }
                    scale={1.1}
                  />
                </Canvas>
              </Box>
              <Paper sx={{ 
                mt: -8, 
                background: "#CD7F32", 
                p: 2, 
                borderRadius: "10px",
                position: "relative",
                zIndex: 1
              }}>
                <Typography variant="h6">🥉 {top3[2].displayName}</Typography>
                <Typography>{top3[2].score} điểm</Typography>
              </Paper>
            </Box>
          )}
        </motion.div>
      </Box>

      {/* Others */}
      <Paper sx={{ maxWidth: 500, mx: "auto", p: 2 }}>
        <Typography variant="h6" gutterBottom>Bảng xếp hạng</Typography>
        <List>
          {others.map((player, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={`${index + 4}. ${player.displayName}`}
                secondary={`${player.score} điểm`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Nút về trang chủ */}
      <Button
        variant="contained"
        sx={{ mt: 4, background: "#ff9800", "&:hover": { background: "#e68900" } }}
        onClick={() => navigate("/")}
      >
        Về trang chủ
      </Button>
    </Box>
  );
};

export default FinalResults;