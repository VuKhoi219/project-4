
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