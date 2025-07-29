
// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ref, onValue, update, db } from "../config/firebase";
// import { LeaderboardEntry } from "../types";

// const Leaderboard: React.FC = () => {
//   const [leaderboard, setLeaderboard] = useState<[string, LeaderboardEntry][]>([]);
//   const [participants, setParticipants] = useState<Record<string, any>>({});
//   const [quizInfo, setQuizInfo] = useState<any>(null);
//   const [playHistory, setPlayHistory] = useState<Record<string, any>>({});
//   const [selectedPlayer, setSelectedPlayer] = useState<string>("");
//   const [loading, setLoading] = useState(true);
  
//   // CHANGED: Lấy cả quizId và roomId
//   const { quizId, roomId } = useParams<{ quizId: string; roomId: string }>();
//   const navigate = useNavigate();
//   const userName = localStorage.getItem("userName");

//   useEffect(() => {
//     if (!quizId || !roomId) { navigate('/'); return; }

//     // PATH UPDATE: Lấy thông tin chung của bộ đề
//     const infoRef = ref(db, `quizzes/${quizId}/info`);
//     const unsubscribeInfo = onValue(infoRef, (snapshot) => setQuizInfo(snapshot.val()));

//     // PATH UPDATE: Lấy leaderboard của phòng
//     const leaderboardRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/leaderboard`);
//     const unsubscribeLeaderboard = onValue(leaderboardRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         setLeaderboard(Object.entries(data).sort((a, b) => b[1].bestScore - a[1].bestScore));
//       }
//       setLoading(false);
//     });

//     // PATH UPDATE: Lấy participants của phòng (để lấy điểm hiện tại)
//     const participantsRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/participants`);
//     const unsubscribeParticipants = onValue(participantsRef, (snapshot) => setParticipants(snapshot.val() || {}));

//     // PATH UPDATE: Lấy lịch sử chơi của phòng
//     const historyRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/playHistory`);
//     const unsubscribeHistory = onValue(historyRef, (snapshot) => setPlayHistory(snapshot.val() || {}));

//     return () => { unsubscribeInfo(); unsubscribeLeaderboard(); unsubscribeParticipants(); unsubscribeHistory(); };
//   }, [quizId, roomId, navigate]);

//   const finalizeLeaderboard = async () => {
//     if (!quizId || !roomId) return;
//     try {
//       const updates: Record<string, any> = {};
//       leaderboard.forEach(([userName], index) => {
//         updates[`leaderboard/${userName}/rank`] = index + 1;
//       });
//       updates['status/isCompleted'] = true;
//       updates['status/completedAt'] = Date.now();
      
//       await update(ref(db, `quizzes/${quizId}/rooms/${roomId}`), updates);
//       alert("Bảng xếp hạng đã được chốt chính thức!");
//     } catch (error) { console.error("Lỗi khi chốt BXH:", error); alert("Đã có lỗi!"); }
//   };
  
//   const getPlayerStats = (playerName: string) => {
//     const attempts = Object.values(playHistory[playerName]?.attempts || {}) as any[];
//     if (attempts.length === 0) return null;
//     const correctAnswers = attempts.filter(a => a.isCorrect).length;
//     const totalQuestions = attempts.length;
//     const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
//     const averageTimeLeft = Math.round(attempts.reduce((sum, a) => sum + (a.timeLeft || 0), 0) / attempts.length);
//     return { accuracy, correctAnswers, totalQuestions, averageTimeLeft };
//   };

//   if (loading) { return <div className="flex items-center justify-center min-h-screen"><p>Đang tải...</p></div>; }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
//       <div className="container mx-auto px-4">
        
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold">🏆 Bảng Xếp Hạng 🏆</h1>
//           {quizInfo && <p className="text-xl">{quizInfo.title}</p>}
//           <p className="text-sm text-gray-500">Room ID: {roomId}</p>
//         </div>

//         <div className="flex justify-center mb-8 space-x-2">
//             <button onClick={() => navigate(`/quiz/${quizId}/room/${roomId}/final-results`)} className="px-4 py-2 bg-purple-500 text-white rounded-lg">🎉 Kết Quả Cuối</button>
//             <button onClick={() => navigate(`/quiz/${quizId}/join`)} className="px-4 py-2 bg-green-500 text-white rounded-lg">🔄 Chơi Lại</button>
//             <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-500 text-white rounded-lg">🏠 Trang Chủ</button>
//         </div>

//         <div className="lg:col-span-2 bg-white rounded-lg shadow-2xl p-6">
//           {leaderboard.length > 0 ? (
//             <div className="space-y-3">
//               {leaderboard.map(([name, info], index) => {
//                 const currentScore = participants[name]?.score || info.bestScore;
//                 const stats = getPlayerStats(name);
//                 return (
//                   <div key={name} className={`p-4 rounded-lg border-2 ${name === userName ? 'bg-yellow-50 border-yellow-400' : 'bg-white'}`}>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center space-x-4">
//                         <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-blue-400 text-white">#{index + 1}</div>
//                         <div>
//                           <p className="font-bold text-lg">{name} {name === userName && '(Bạn)'}</p>
//                           <span className="text-sm text-gray-600">Điểm: {currentScore}</span>
//                         </div>
//                       </div>
//                       <div className="text-2xl font-bold">{info.bestScore}</div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           ) : ( <div className="text-center py-12"><p>Chưa có dữ liệu bảng xếp hạng.</p></div> )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Leaderboard;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, update, db } from "../config/firebase";
import { LeaderboardEntry } from "../types";

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<[string, LeaderboardEntry][]>([]);
  const [participants, setParticipants] = useState<Record<string, any>>({});
  const [quizInfo, setQuizInfo] = useState<any>(null);
  const [playHistory, setPlayHistory] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  
  const { quizId, roomId } = useParams<{ quizId: string; roomId: string }>();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    if (!quizId || !roomId) { navigate('/'); return; }

    const infoRef = ref(db, `quizzes/${quizId}/info`);
    const unsubscribeInfo = onValue(infoRef, (snapshot) => setQuizInfo(snapshot.val()));

    const leaderboardRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/leaderboard`);
    const unsubscribeLeaderboard = onValue(leaderboardRef, (snapshot) => {
      // FIX: Cast snapshot.val() to the correct type
      const data = snapshot.val() as Record<string, LeaderboardEntry>;
      if (data) {
        // Now TypeScript knows that b[1] has a `bestScore` property
        const sortedData = Object.entries(data).sort((a, b) => b[1].bestScore - a[1].bestScore);
        setLeaderboard(sortedData);
      } else {
        setLeaderboard([]);
      }
      setLoading(false);
    });

    const participantsRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/participants`);
    const unsubscribeParticipants = onValue(participantsRef, (snapshot) => setParticipants(snapshot.val() || {}));

    const historyRef = ref(db, `quizzes/${quizId}/rooms/${roomId}/playHistory`);
    const unsubscribeHistory = onValue(historyRef, (snapshot) => setPlayHistory(snapshot.val() || {}));

    return () => { unsubscribeInfo(); unsubscribeLeaderboard(); unsubscribeParticipants(); unsubscribeHistory(); };
  }, [quizId, roomId, navigate]);

  if (loading) { 
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-700">Đang tải bảng xếp hạng...</p>
      </div>
    ); 
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">🏆 Bảng Xếp Hạng 🏆</h1>
          {quizInfo && <p className="text-xl mt-2">{quizInfo.title}</p>}
          <p className="text-sm text-gray-500 mt-1">Room ID: {roomId}</p>
        </div>

        <div className="flex justify-center mb-8 space-x-2">
            <button onClick={() => navigate(`/quiz/${quizId}/room/${roomId}/final-results`)} className="px-4 py-2 bg-purple-500 text-white rounded-lg">🎉 Xem Podium</button>
            <button onClick={() => navigate(`/quiz/${quizId}/join`)} className="px-4 py-2 bg-green-500 text-white rounded-lg">🔄 Chơi Lại</button>
            <button onClick={() => navigate('/')} className="px-4 py-2 bg-gray-500 text-white rounded-lg">🏠 Trang Chủ</button>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-2xl p-6">
          {leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map(([name, info], index) => {
                const isCurrentUser = name === userName;
                return (
                  <div key={name} className={`p-4 rounded-lg border-2 transition-transform duration-200 ${isCurrentUser ? 'bg-yellow-50 border-yellow-400 scale-105' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'}`}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-lg">{info.displayName || name} {isCurrentUser && '(Bạn)'}</p>
                          <span className="text-sm text-gray-600">Điểm: {info.bestScore}</span>
                        </div>
                      </div>
                      <div className="text-3xl font-bold">{info.bestScore}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : ( <div className="text-center py-12"><p className="text-xl text-gray-600">Chưa có ai trên bảng xếp hạng.</p></div> )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;