import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, db } from "../config/firebase";
import confetti from "canvas-confetti";
import { motion, Variants,Transition } from "framer-motion";
import apiService from "../services/api";
import styles from '../styles/FinalResults.module.css';

interface Player {
  displayName: string;
  score: number;
  avatar?: string;
}

const FinalResults: React.FC = () => {
  const { quizId, roomId } = useParams<{ quizId: string; roomId: string }>();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [saved, setSaved] = useState(false);
  const [showTop3, setShowTop3] = useState(false);
  const [showTop2, setShowTop2] = useState(false);
  const [showTop1, setShowTop1] = useState(false);

  useEffect(() => {
    const participantsRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/participants`);
    const unsubscribe = onValue(participantsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val()) as Player[];
        const sorted = data.sort((a, b) => b.score - a.score);
        setPlayers(sorted);

        // Sequential animations with optimized timing
        setTimeout(() => {
          setShowTop3(true);
          confetti({
            particleCount: 50, // Giảm số lượng hạt để tối ưu hiệu suất
            spread: 60,
            origin: { y: 0.2 },
          });
        }, 1200);

        setTimeout(() => {
          setShowTop2(true);
          confetti({
            particleCount: 60, // Giảm số lượng hạt
            spread: 80,
            origin: { x: 0.3 },
          });
        }, 2800);

        setTimeout(() => {
          setShowTop1(true);
          confetti({
            particleCount: 80, // Giảm số lượng hạt
            spread: 100,
            origin: { x: 0.5, y: 0.3 },
          });
        }, 4500);
      }
    });

    return () => unsubscribe();
  }, [quizId, roomId]);

  useEffect(() => {
    if (players.length > 0 && !saved) {
      setSaved(true);
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
        ).catch(err => console.error("Lỗi lưu kết quả:", err));
      }
    }
  }, [players, quizId, saved]);

  const podiumVariants: Variants = {
    hidden: { opacity: 0, y: 120 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100, // Giảm stiffness để chuyển động mềm mại hơn
        damping: 15, // Tăng damping để giảm dao động
        mass: 0.8, // Thêm mass để làm chậm chuyển động
      },
    },
  };

  const trophyVariants: Variants = {
    hidden: { y: -250, opacity: 0, rotate: -15 },
    visible: {
      y: 0,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 120, // Giảm stiffness cho cúp
        damping: 18, // Tăng damping để giảm dao động
        mass: 0.7, // Thêm mass để làm chậm chuyển động
      },
    },
  };

  const bounceAnimation = {
  animate: {
    y: [0, -8, 0],
    transition: {
      repeat: Infinity,
      repeatType: "loop" as const,
      duration: 2,
      ease: "easeInOut" as const, // Explicitly use a valid easing value
    } as Transition, // Explicitly type as Transition
  },
};

  // Sử dụng useMemo để tối ưu hóa render top3 và otherPlayers
  const top3 = useMemo(() => players.slice(0, 3), [players]);
  const otherPlayers = useMemo(() => players.slice(3), [players]);

  if (!players.length) return <div className={styles.loading}>Đang tải kết quả...</div>;

  return (
    <div className={styles.container}      style={{
       backgroundImage: "linear-gradient(135deg, rgba(167,243,208,0.7), rgba(224,242,254,0.7)), url('/img/mau-background-dep-46.jpg')",
       backgroundSize: "cover",
       backgroundPosition: "center",
       backgroundRepeat: "no-repeat"
     }}>
      {showTop1 && (
        <motion.div
          variants={trophyVariants}
          initial="hidden"
          animate="visible"
          className={styles.trophy}
        >
          🏆
        </motion.div>
      )}

      <div className={styles.podium}>
        <div className={styles.playerSecond}>
          {showTop2 && top3[1] ? (
            <motion.div variants={podiumVariants} initial="hidden" animate="visible">
              <motion.div {...bounceAnimation} className={styles.avatarWrapper}>
                <img
                  src={top3[1].avatar || `https://via.placeholder.com/90?text=${top3[1].displayName.charAt(0)}`}
                  alt={top3[1].displayName}
                  className={styles.avatar}
                />
              </motion.div>
              <div className={styles.scoreBox}>
                <span className={styles.rankNumber}>Top 2:</span>
                <span className={styles.playerName}>{top3[1].displayName}</span>
                <br />
                <span className={styles.score}>{top3[1].score} điểm</span>
              </div>
            </motion.div>
          ) : (
            <div style={{ visibility: 'hidden' }}>
              <div className={styles.avatarWrapper}>
                <img
                  src="https://via.placeholder.com/90"
                  alt="placeholder"
                  className={styles.avatar}
                />
              </div>
              <div className={styles.scoreBox}>
                <span className={styles.rankNumber}>Top 2:</span>
                <span className={styles.playerName}>Placeholder</span>
                <br />
                <span className={styles.score}>0 điểm</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.playerFirst}>
          {showTop1 && top3[0] ? (
            <motion.div variants={podiumVariants} initial="hidden" animate="visible">
              <motion.div {...bounceAnimation} className={styles.avatarWrapper}>
                <img
                  src={top3[0].avatar || `https://via.placeholder.com/110?text=${top3[0].displayName.charAt(0)}`}
                  alt={top3[0].displayName}
                  className={styles.avatar}
                />
              </motion.div>
              <div className={styles.scoreBox}>
                <span className={styles.rankNumber}>Top 1:</span>
                <span className={styles.playerName}>{top3[0].displayName}</span>
                <br />
                <span className={styles.score}>{top3[0].score} điểm</span>
              </div>
            </motion.div>
          ) : (
            <div style={{ visibility: 'hidden' }}>
              <div className={styles.avatarWrapper}>
                <img
                  src="https://via.placeholder.com/110"
                  alt="placeholder"
                  className={styles.avatar}
                />
              </div>
              <div className={styles.scoreBox}>
                <span className={styles.rankNumber}>Top 1:</span>
                <span className={styles.playerName}>Placeholder</span>
                <br />
                <span className={styles.score}>0 điểm</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.playerThird}>
          {showTop3 && top3[2] ? (
            <motion.div variants={podiumVariants} initial="hidden" animate="visible">
              <motion.div {...bounceAnimation} className={styles.avatarWrapper}>
                <img
                  src={top3[2].avatar || `https://via.placeholder.com/80?text=${top3[2].displayName.charAt(0)}`}
                  alt={top3[2].displayName}
                  className={styles.avatar}
                />
              </motion.div>
              <div className={styles.scoreBox}>
                <span className={styles.rankNumber}>Top 3:</span>
                <span className={styles.playerName}>{top3[2].displayName}</span>
                <br />
                <span className={styles.score}>{top3[2].score} điểm</span>
              </div>
            </motion.div>
          ) : (
            <div style={{ visibility: 'hidden' }}>
              <div className={styles.avatarWrapper}>
                <img
                  src="https://via.placeholder.com/80"
                  alt="placeholder"
                  className={styles.avatar}
                />
              </div>
              <div className={styles.scoreBox}>
                <span className={styles.rankNumber}>Top 3:</span>
                <span className={styles.playerName}>Placeholder</span>
                <br />
                <span className={styles.score}>0 điểm</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.leaderboard}>
        <h2 className={styles.leaderboardTitle}>📜 Bảng xếp hạng</h2>
        {players.length === 0 ? (
          <p className={styles.noPlayers}>Không có người chơi</p>
        ) : (
          <div className={styles.rankList}>
            {showTop1 && top3[0] && (
              <div className={styles.rankItem}>
                <span className={styles.rankNumber}>1</span>
                <img
                  src={top3[0].avatar || `https://via.placeholder.com/40?text=${top3[0].displayName.charAt(0)}`}
                  alt={top3[0].displayName}
                  className={styles.rankAvatar}
                />
                <span className={styles.rankName}>{top3[0].displayName}</span>
                <span className={styles.rankScore}>{top3[0].score} điểm</span>
              </div>
            )}
            {showTop2 && top3[1] && (
              <div className={styles.rankItem}>
                <span className={styles.rankNumber}>2</span>
                <img
                  src={top3[1].avatar || `https://via.placeholder.com/40?text=${top3[1].displayName.charAt(0)}`}
                  alt={top3[1].displayName}
                  className={styles.rankAvatar}
                />
                <span className={styles.rankName}>{top3[1].displayName}</span>
                <span className={styles.rankScore}>{top3[1].score} điểm</span>
              </div>
            )}
            {showTop3 && top3[2] && (
              <div className={styles.rankItem}>
                <span className={styles.rankNumber}>3</span>
                <img
                  src={top3[2].avatar || `https://via.placeholder.com/40?text=${top3[2].displayName.charAt(0)}`}
                  alt={top3[2].displayName}
                  className={styles.rankAvatar}
                />
                <span className={styles.rankName}>{top3[2].displayName}</span>
                <span className={styles.rankScore}>{top3[2].score} điểm</span>
              </div>
            )}
            {otherPlayers.map((player, index) => (
              <div key={index + 3} className={styles.rankItem}>
                <span className={styles.rankNumber}>{index + 4}</span>
                <img
                  src={player.avatar || `https://via.placeholder.com/40?text=${player.displayName.charAt(0)}`}
                  alt={player.displayName}
                  className={styles.rankAvatar}
                />
                <span className={styles.rankName}>{player.displayName}</span>
                <span className={styles.rankScore}>{player.score} điểm</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button className={styles.homeButton} onClick={() => navigate("/")}>
        Về trang chủ
      </button>
    </div>
  );
};

export default FinalResults;