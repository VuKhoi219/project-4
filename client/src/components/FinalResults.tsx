import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, db } from "../config/firebase";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  Avatar
} from "@mui/material";
import { motion, Variants } from "framer-motion";
import confetti from "canvas-confetti";
import apiService from "../services/api";

interface Player {
  displayName: string;
  score: number;
  avatar?: string;
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

  // 🎯 Hiệu ứng podium
  const podiumVariants: Variants = {
    hidden: { opacity: 0, y: 100 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.3,
        type: 'spring' as const,
        stiffness: 100,
        damping: 8
      }
    })
  };

  // 🎯 Hiệu ứng cúp rơi
  const trophyVariants: Variants = {
    hidden: { y: -300, opacity: 0, rotate: -20 },
    visible: {
      y: 0,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 120,
        damping: 8,
        bounce: 0.5
      }
    }
  };

  // 🎯 Bật confetti khi load trang
  useEffect(() => {
    if (players.length > 0) {
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.2 }
        });
      }, 800);
    }
  }, [players]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (players.length > 0 && !saved) {
      setSaved(true); // ✅ chặn gọi nhiều lần

      const token = localStorage.getItem("token");
      const userName = localStorage.getItem("userName");

      const currentPlayer = players.find(p => p.displayName === userName);

      if (currentPlayer) {
        apiService.createFinalResults(
          Number(quizId),
          currentPlayer.score,
          currentPlayer.displayName,
          token || undefined
        ).catch(err => console.error("Lỗi lưu kết quả:", err));
      } else {
        apiService.createFinalResults(
          Number(quizId),
          players[0].score,
          "chưa login"
        );
      }
    }
  }, [players, quizId, saved]);


  // 🎯 Avatar bounce
  const bounceAnimation = {
    animate: {
      y: [0, -10, 0],
      transition: {
        repeat: Infinity,
        repeatType: "loop" as const,
        duration: 1.5
      }
    }
  };

  if (!players.length) return <Typography>Đang tải kết quả...</Typography>;

  const top3 = players.slice(0, 3);
  const others = players.slice(3);

  const renderAvatar = (player: Player, size: number, color: string) => (
    <motion.div {...bounceAnimation}>
      <Avatar
        src={player.avatar || undefined}
        sx={{
          width: size,
          height: size,
          fontSize: size / 2,
          border: `3px solid ${color}`,
          boxShadow: `0 0 20px ${color}, 0 0 40px ${color}`
        }}
      >
        {!player.avatar && player.displayName.charAt(0).toUpperCase()}
      </Avatar>
    </motion.div>
  );

  return (
    <Box
      sx={{
        textAlign: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #2ffff1, #25e8eb)",
        backgroundSize: "400% 400%",
        animation: "gradientBG 10s ease infinite",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 4,
        pt: 2,
        "@keyframes gradientBG": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" }
        }
      }}
    >
      {/* Trophy icon */}
      <motion.div
        variants={trophyVariants}
        initial="hidden"
        animate="visible"
        style={{
          fontSize: "5rem",
          marginBottom: "20px",
          textShadow: "0 0 25px gold, 0 0 50px gold"
        }}
      >
        🏆
      </motion.div>

      {/* Podium */}
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, mb: 8 }}>
        {top3[1] && (
          <motion.div custom={0} variants={podiumVariants} initial="hidden" animate="visible">
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              {renderAvatar(top3[1], 90, "#C0C0C0")}
              <Paper sx={{ mt: 2, background: "#C0C0C0", p: 2, borderRadius: "10px" }}>
                <Typography variant="h6">🥈 {top3[1].displayName}</Typography>
                <Typography>{top3[1].score} điểm</Typography>
              </Paper>
            </Box>
          </motion.div>
        )}

        {top3[0] && (
          <motion.div custom={1} variants={podiumVariants} initial="hidden" animate="visible">
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              {renderAvatar(top3[0], 110, "#FFD700")}
              <Paper sx={{
                mt: 2,
                background: "#FFD700",
                p: 2,
                borderRadius: "10px",
                boxShadow: "0 0 25px gold, 0 0 50px gold"
              }}>
                <Typography variant="h5" fontWeight="bold">🥇 {top3[0].displayName}</Typography>
                <Typography>{top3[0].score} điểm</Typography>
              </Paper>
            </Box>
          </motion.div>
        )}

        {top3[2] && (
          <motion.div custom={2} variants={podiumVariants} initial="hidden" animate="visible">
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
              {renderAvatar(top3[2], 80, "#CD7F32")}
              <Paper sx={{ mt: 2, background: "#CD7F32", p: 2, borderRadius: "10px" }}>
                <Typography variant="h6">🥉 {top3[2].displayName}</Typography>
                <Typography>{top3[2].score} điểm</Typography>
              </Paper>
            </Box>
          </motion.div>
        )}
      </Box>

      {/* Ranking table */}
      <Paper
        sx={{
          maxWidth: 800, // 👈 Tăng từ 500 lên 800
          width: "90%",  // 👈 Để khi nhỏ hơn vẫn responsive
          mx: "auto",
          p: 2,
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(8px)",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{ textAlign: "center", fontWeight: "bold", color: "#fff", mb: 2 }}
        >
          📜 Bảng xếp hạng
        </Typography>
        <List>
          {others.map((player, index) => {
            const colors = ["#4cafef", "#ff9800", "#9c27b0", "#00e676", "#ff1744"];
            const color = colors[index % colors.length];

            return (
              <ListItem
                key={index}
                sx={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "8px",
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  px: 2
                }}
              >
                <Typography
                  sx={{
                    color: "#ffcc00",
                    fontWeight: "bold",
                    width: "30px",
                    textAlign: "center"
                  }}
                >
                  {index + 4}
                </Typography>

                <Avatar
                  src={player.avatar || undefined}
                  sx={{
                    width: 40,
                    height: 40,
                    fontSize: 18,
                    mr: 2,
                    border: `2px solid ${color}`,
                    boxShadow: `0 0 8px ${color}`
                  }}
                >
                  {!player.avatar && player.displayName.charAt(0).toUpperCase()}
                </Avatar>

                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: "bold", color: "#fff" }}>
                      {player.displayName}
                    </Typography>
                  }
                  secondary={
                    <Typography sx={{ color: "#ccc" }}>
                      {player.score} điểm
                    </Typography>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </Paper>

      <Button
        variant="contained"
        sx={{
          mt: 4,
          background: "linear-gradient(90deg, #ff512f, #dd2476)",
          "&:hover": { background: "linear-gradient(90deg, #dd2476, #ff512f)" },
          fontWeight: "bold",
          px: 4,
          py: 1.2,
          fontSize: "1rem"
        }}
        onClick={() => navigate("/")}
      >
        Về trang chủ
      </Button>
    </Box>
  );
};

export default FinalResults;
