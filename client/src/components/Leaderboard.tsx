import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, db } from "../config/firebase";
import { LeaderboardEntry } from "../types";
import { Avatar } from "@mui/material";
import { motion } from "framer-motion";

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<[string, LeaderboardEntry][]>([]);
  const [quizInfo, setQuizInfo] = useState<any>(null);
  const [participants, setParticipants] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const { quizId, roomId } = useParams<{ quizId: string; roomId: string }>();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "";

  useEffect(() => {
    if (!quizId || !roomId) { navigate("/"); return; }

    const infoRef = ref(db, `quizzes/${quizId}/info`);
    const unsubInfo = onValue(infoRef, (snap) => setQuizInfo(snap.val()));

    const lbRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/leaderboard`);
    const unsubLB = onValue(lbRef, (snap) => {
      const data = (snap.val() || {}) as Record<string, LeaderboardEntry>;
      const top10 = Object
        .entries(data)
        .sort((a, b) => (b[1].bestScore || 0) - (a[1].bestScore || 0))
        .slice(0, 10);
      setLeaderboard(top10);
      setLoading(false);
    });

    const participantsRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/participants`);
    const unsubParticipants = onValue(participantsRef, (snap) => {
      setParticipants(snap.val() || {});
    });

    return () => { unsubInfo(); unsubLB(); unsubParticipants(); };
  }, [quizId, roomId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        <p className="ml-4 text-lg text-gray-700">Đang tải bảng xếp hạng...</p>
      </div>
    );
  }

  const rankStyles = [
    { bg: "bg-yellow-400", text: "text-yellow-900", label: "🥇" },
    { bg: "bg-gray-300", text: "text-gray-900", label: "🥈" },
    { bg: "bg-orange-400", text: "text-orange-900", label: "🥉" },
  ];

  const getDisplayName = (name: string, info?: LeaderboardEntry) => {
    const p = participants?.[name];
    return p?.displayName || info?.displayName || name;
  };

  const getAvatarUrl = (name: string) => {
    const p = participants?.[name];
    // tuỳ DB của bạn: avatar | photoURL | avatarUrl...
    return p?.avatar || p?.photoURL || p?.avatarUrl || undefined;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-700">🏆 Bảng Xếp Hạng 🏆</h1>
          {quizInfo && <p className="text-xl mt-2">{quizInfo.title}</p>}
          <p className="text-sm text-gray-500 mt-1">Room ID: {roomId}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-center mb-8 space-x-2">
          <button
            onClick={() => navigate(`/quiz/${quizId}/room/${roomId}/final-results`)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 transition"
          >
            🎉 Xem Podium
          </button>
          <button
            onClick={() => navigate(`/quiz/${quizId}/join`)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
          >
            🔄 Chơi Lại
          </button>
          <button
            onClick={() => navigate(`/`)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition"
          >
            🏠 Trang Chủ
          </button>
        </div>

        {/* List */}
        <div className="bg-white rounded-xl shadow-2xl p-6">
          {leaderboard.length ? (
            <div className="space-y-3">
              {leaderboard.map(([name, info], index) => {
                const isMe = name === userName;
                const style = rankStyles[index] || { bg: "bg-blue-500", text: "text-white", label: `#${index + 1}` };
                const displayName = getDisplayName(name, info);
                const avatarUrl = getAvatarUrl(name);

                return (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      isMe ? "border-yellow-400 bg-yellow-50" : "border-transparent bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${style.bg} ${style.text}`}>
                        {style.label}
                      </div>

                      <Avatar
                        src={avatarUrl}
                        sx={{ width: 48, height: 48, fontSize: 18, bgcolor: "#3f51b5" }}
                      >
                        {!avatarUrl && displayName.charAt(0).toUpperCase()}
                      </Avatar>

                      <div>
                        <p className="font-bold text-lg">
                          {displayName} {isMe && <span className="text-yellow-600">(Bạn)</span>}
                        </p>
                        <span className="text-sm text-gray-600">Điểm: {info.bestScore}</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-indigo-700">{info.bestScore}</div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">Chưa có ai trên bảng xếp hạng.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
