// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ref, onValue, update, get, DatabaseReference, db } from "../config/firebase";
// import { LeaderboardEntry } from "../types";

// const FinalResults: React.FC = () => {
//   const [finalLeaderboard, setFinalLeaderboard] = useState<Array<{name: string, score: number, rank: number}>>([]);
//   const [participants, setParticipants] = useState<Record<string, any>>({});
//   const [quizInfo, setQuizInfo] = useState<any>(null);
//   const [showCelebration, setShowCelebration] = useState(true);
//   const [loading, setLoading] = useState(true);
//   const [playHistory, setPlayHistory] = useState<Record<string, any>>({});
//   const [selectedPlayer, setSelectedPlayer] = useState<string>("");
//   const [showConfetti, setShowConfetti] = useState(true);
  
//   const { quizId } = useParams<{ quizId: string }>();
//   const navigate = useNavigate();
//   const userName = localStorage.getItem("userName");

//   useEffect(() => {
//     if (!quizId) {
//       navigate('/');
//       return;
//     }

//     loadFinalResults();
//   }, [quizId]);

//   const loadFinalResults = async () => {
//     try {
//       // Load quiz info
//       const infoRef = ref(db, `quizzes/${quizId}/info`);
//       const infoSnapshot = await get(infoRef);
//       setQuizInfo(infoSnapshot.val());

//       // Load participants to calculate final leaderboard
//       const participantsRef = ref(db, `quizzes/${quizId}/participants`);
//       const participantsSnapshot = await get(participantsRef);
//       const participantsData = participantsSnapshot.val() || {};
//       setParticipants(participantsData);

//       // Load play history
//       const historyRef = ref(db, `quizzes/${quizId}/playHistory`);
//       const historySnapshot = await get(historyRef);
//       setPlayHistory(historySnapshot.val() || {});

//       // Calculate and set final leaderboard
//       const leaderboardArray = Object.entries(participantsData)
//         .map(([name, data]: [string, any]) => ({
//           name,
//           score: data.score || 0,
//           rank: 0
//         }))
//         .sort((a, b) => b.score - a.score)
//         .map((player, index) => ({
//           ...player,
//           rank: index + 1
//         }));

//       setFinalLeaderboard(leaderboardArray);

//       // Update Firebase leaderboard
//       await updateFinalLeaderboard(leaderboardArray);

//       setLoading(false);

//       // Hide celebration animation after 5 seconds
//       setTimeout(() => {
//         setShowCelebration(false);
//       }, 5000);

//       // Hide confetti after 8 seconds
//       setTimeout(() => {
//         setShowConfetti(false);
//       }, 8000);

//     } catch (error) {
//       console.error("Error loading final results:", error);
//       setLoading(false);
//     }
//   };

//   const updateFinalLeaderboard = async (leaderboardArray: Array<{name: string, score: number, rank: number}>) => {
//     try {
//       const updates: Record<string, any> = {};
      
//       leaderboardArray.forEach((player) => {
//         updates[`leaderboard/${player.name}`] = {
//           rank: player.rank,
//           bestScore: player.score,
//           averageScore: Math.round(player.score / (quizInfo?.totalQuestions || 5)),
//           lastPlayed: Date.now()
//         };
//       });
      
//       await update(ref(db, `quizzes/${quizId}`), updates);
//       console.log("Final leaderboard updated successfully");
//     } catch (error) {
//       console.error("Error updating final leaderboard:", error);
//     }
//   };

//   const getPlayerStats = (playerName: string) => {
//     const history = playHistory[playerName]?.attempts || {};
//     const attempts = Object.values(history) as any[];
    
//     if (attempts.length === 0) return null;

//     const correctAnswers = attempts.filter(a => a.isCorrect).length;
//     const totalQuestions = attempts.length;
//     const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
//     const averageTimeLeft = Math.round(
//       attempts.reduce((sum: number, a: any) => sum + (a.timeLeft || 0), 0) / attempts.length
//     );

//     return {
//       accuracy,
//       correctAnswers,
//       totalQuestions,
//       averageTimeLeft,
//       bestAnswer: attempts.reduce((best, current) =>
//         (current.score || 0) > (best.score || 0) ? current : best, attempts[0])
//     };
//   };

//   const shareResults = () => {
//     const userRank = finalLeaderboard.findIndex(p => p.name === userName) + 1;
//     const userScore = finalLeaderboard.find(p => p.name === userName)?.score || 0;
    
//     const shareText = `🎉 Tôi vừa hoàn thành Quiz Multiplayer!
    
// 📊 Kết quả của tôi:
// 🏆 Xếp hạng: #${userRank}/${finalLeaderboard.length}
// ⭐ Điểm số: ${userScore}
// 🎮 Quiz: ${quizInfo?.title || 'Multiplayer Quiz'}

// Thử thách bản thân tại: ${window.location.origin}/quiz/${quizId}`;

//     if (navigator.share) {
//       navigator.share({
//         title: 'Quiz Multiplayer Results',
//         text: shareText,
//       });
//     } else {
//       navigator.clipboard.writeText(shareText).then(() => {
//         alert('✅ Đã copy kết quả để chia sẻ!');
//       });
//     }
//   };

//   const createNewRoom = () => {
//     const newRoomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
//     localStorage.setItem("quizId", newRoomId);
//     navigate(`/quiz/${newRoomId}/join`);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-6"></div>
//           <p className="text-xl text-gray-700">Đang tính toán kết quả cuối cùng...</p>
//           <p className="text-sm text-gray-500 mt-2">Vui lòng đợi một chút</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200 relative overflow-hidden">
      
//       {/* Confetti Animation */}
//       {showConfetti && (
//         <div className="fixed inset-0 pointer-events-none z-50">
//           {[...Array(50)].map((_, i) => (
//             <div
//               key={i}
//               className="absolute animate-bounce"
//               style={{
//                 left: `${Math.random() * 100}%`,
//                 top: `${Math.random() * 100}%`,
//                 animationDelay: `${Math.random() * 3}s`,
//                 animationDuration: `${2 + Math.random() * 2}s`
//               }}
//             >
//               {['🎉', '🎊', '✨', '🏆', '🥇', '🌟'][Math.floor(Math.random() * 6)]}
//             </div>
//           ))}
//         </div>
//       )}

//       <div className="container mx-auto px-4 py-8">
        
//         {/* Main Celebration Header */}
//         {showCelebration && (
//           <div className="text-center mb-12 animate-bounce">
//             <div className="text-8xl md:text-9xl mb-4">🏆</div>
//             <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 mb-4">
//               HOÀN THÀNH!
//             </h1>
//             <p className="text-2xl md:text-3xl text-gray-700 font-semibold">
//               Quiz Multiplayer đã kết thúc
//             </p>
//           </div>
//         )}

//         {/* Quiz Info */}
//         {quizInfo && (
//           <div className="text-center mb-8">
//             <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl mx-auto border border-gray-200">
//               <h2 className="text-3xl font-bold text-gray-800 mb-2">{quizInfo.title}</h2>
//               <div className="flex flex-wrap justify-center gap-6 text-gray-600">
//                 <div className="flex items-center space-x-2">
//                   <span className="text-2xl">👥</span>
//                   <span className="font-semibold">{finalLeaderboard.length} người chơi</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <span className="text-2xl">❓</span>
//                   <span className="font-semibold">{quizInfo.totalQuestions || 5} câu hỏi</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <span className="text-2xl">⏱️</span>
//                   <span className="font-semibold">30s/câu</span>
//                 </div>
//                 <div className="flex items-center space-x-2">
//                   <span className="text-2xl">🎯</span>
//                   <span className="font-semibold">Tối đa {quizInfo.pointsPerQuestion || 100} điểm/câu</span>
//                 </div>
//               </div>
//               <p className="text-sm text-gray-500 mt-4">
//                 Room ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{quizId}</span>
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Podium for Top 3 */}
//         {finalLeaderboard.length >= 3 && (
//           <div className="mb-12">
//             <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">🏅 PODIUM TOP 3</h3>
//             <div className="flex justify-center items-end space-x-4 max-w-4xl mx-auto">
              
//               {/* 2nd Place */}
//               <div className="bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-3xl p-6 text-center relative transform hover:scale-105 transition-transform">
//                 <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
//                   <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-lg">
//                     🥈
//                   </div>
//                 </div>
//                 <div className="mt-8 text-white">
//                   <p className="text-2xl font-bold mb-2">{finalLeaderboard[1]?.name}</p>
//                   <p className="text-xl font-semibold">{finalLeaderboard[1]?.score} điểm</p>
//                 </div>
//                 <div className="h-24 bg-gray-400 rounded-b-lg mt-4 flex items-center justify-center text-white font-bold">
//                   #2
//                 </div>
//               </div>

//               {/* 1st Place */}
//               <div className="bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-t-3xl p-8 text-center relative transform hover:scale-105 transition-transform">
//                 <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
//                   <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-4xl border-4 border-white shadow-xl animate-pulse">
//                     🥇
//                   </div>
//                 </div>
//                 <div className="mt-10 text-white">
//                   <p className="text-3xl font-bold mb-2">{finalLeaderboard[0]?.name}</p>
//                   <p className="text-2xl font-semibold">{finalLeaderboard[0]?.score} điểm</p>
//                   <p className="text-lg">🎉 CHAMPION!</p>
//                 </div>
//                 <div className="h-32 bg-yellow-500 rounded-b-lg mt-4 flex items-center justify-center text-white font-bold text-xl">
//                   #1
//                 </div>
//               </div>

//               {/* 3rd Place */}
//               <div className="bg-gradient-to-t from-orange-400 to-orange-500 rounded-t-3xl p-6 text-center relative transform hover:scale-105 transition-transform">
//                 <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
//                   <div className="w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-lg">
//                     🥉
//                   </div>
//                 </div>
//                 <div className="mt-8 text-white">
//                   <p className="text-2xl font-bold mb-2">{finalLeaderboard[2]?.name}</p>
//                   <p className="text-xl font-semibold">{finalLeaderboard[2]?.score} điểm</p>
//                 </div>
//                 <div className="h-24 bg-orange-500 rounded-b-lg mt-4 flex items-center justify-center text-white font-bold">
//                   #3
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Full Leaderboard */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
//           {/* Main Results */}
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
//               <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
//                 <h3 className="text-2xl font-bold">📊 Bảng Xếp Hạng Cuối Cùng</h3>
//                 <p className="text-purple-100 mt-1">Kết quả chính thức của tất cả người chơi</p>
//               </div>
              
//               <div className="p-6">
//                 {finalLeaderboard.length > 0 ? (
//                   <div className="space-y-4">
//                     {finalLeaderboard.map((player, index) => {
//                       const stats = getPlayerStats(player.name);
//                       const isCurrentUser = player.name === userName;
                      
//                       return (
//                         <div
//                           key={player.name}
//                           className={`p-5 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
//                             isCurrentUser
//                               ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-400 ring-2 ring-yellow-300 scale-105 transform'
//                               : selectedPlayer === player.name
//                               ? 'bg-blue-50 border-blue-400'
//                               : index < 3
//                               ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
//                               : 'bg-white border-gray-200 hover:border-gray-300'
//                           }`}
//                           onClick={() => setSelectedPlayer(selectedPlayer === player.name ? "" : player.name)}
//                         >
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center space-x-4">
//                               {/* Rank Badge */}
//                               <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl ${
//                                 index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
//                                 index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
//                                 index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
//                                 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
//                               }`}>
//                                 {index === 0 ? '👑' :
//                                  index === 1 ? '🥈' :
//                                  index === 2 ? '🥉' :
//                                  `#${index + 1}`}
//                               </div>
                              
//                               {/* Player Info */}
//                               <div>
//                                 <p className="font-bold text-xl text-gray-800">
//                                   {player.name}
//                                   {isCurrentUser && ' (Bạn)'}
//                                 </p>
//                                 <div className="flex space-x-4 text-sm text-gray-600">
//                                   <span>🏆 {player.score} điểm</span>
//                                   {stats && (
//                                     <>
//                                       <span>🎯 {stats.accuracy}% đúng</span>
//                                       <span>⚡ {stats.averageTimeLeft}s TB</span>
//                                     </>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
                            
//                             {/* Score Display */}
//                             <div className="text-right">
//                               <div className="text-3xl font-bold text-gray-800">
//                                 {player.score}
//                               </div>
//                               <div className="text-sm text-gray-500">
//                                 điểm
//                               </div>
//                             </div>
//                           </div>
                          
//                           {/* Expanded Stats */}
//                           {selectedPlayer === player.name && stats && (
//                             <div className="mt-6 pt-4 border-t border-gray-200">
//                               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                                 <div className="bg-green-100 p-4 rounded-lg text-center">
//                                   <div className="text-2xl font-bold text-green-600">
//                                     {stats.correctAnswers}/{stats.totalQuestions}
//                                   </div>
//                                   <div className="text-sm text-gray-600">Câu đúng</div>
//                                 </div>
//                                 <div className="bg-blue-100 p-4 rounded-lg text-center">
//                                   <div className="text-2xl font-bold text-blue-600">
//                                     {stats.accuracy}%
//                                   </div>
//                                   <div className="text-sm text-gray-600">Độ chính xác</div>
//                                 </div>
//                                 <div className="bg-purple-100 p-4 rounded-lg text-center">
//                                   <div className="text-2xl font-bold text-purple-600">
//                                     {stats.averageTimeLeft}s
//                                   </div>
//                                   <div className="text-sm text-gray-600">TB thời gian</div>
//                                 </div>
//                                 <div className="bg-orange-100 p-4 rounded-lg text-center">
//                                   <div className="text-2xl font-bold text-orange-600">
//                                     {Math.round(player.score / (quizInfo?.totalQuestions || 5))}
//                                   </div>
//                                   <div className="text-sm text-gray-600">Điểm/câu</div>
//                                 </div>
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 ) : (
//                   <div className="text-center py-12">
//                     <div className="text-6xl mb-4">🤔</div>
//                     <p className="text-2xl text-gray-600">Không có dữ liệu</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
            
//             {/* Personal Achievement */}
//             {userName && finalLeaderboard.find(p => p.name === userName) && (
//               <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl shadow-xl p-6 border border-yellow-300">
//                 <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">🎯 Thành Tích Của Bạn</h4>
//                 {(() => {
//                   const userRank = finalLeaderboard.findIndex(p => p.name === userName) + 1;
//                   const userScore = finalLeaderboard.find(p => p.name === userName)?.score || 0;
//                   const userStats = getPlayerStats(userName);
                  
//                   return (
//                     <div className="space-y-4">
//                       <div className="text-center">
//                         <div className="text-4xl font-bold text-yellow-600 mb-2">#{userRank}</div>
//                         <p className="text-gray-700">Xếp hạng cuối cùng</p>
//                       </div>
                      
//                       <div className="grid grid-cols-2 gap-3">
//                         <div className="bg-white bg-opacity-60 p-3 rounded-lg text-center">
//                           <div className="text-xl font-bold text-green-600">{userScore}</div>
//                           <div className="text-xs text-gray-600">Tổng điểm</div>
//                         </div>
//                         <div className="bg-white bg-opacity-60 p-3 rounded-lg text-center">
//                           <div className="text-xl font-bold text-blue-600">
//                             {userStats ? `${userStats.accuracy}%` : '0%'}
//                           </div>
//                           <div className="text-xs text-gray-600">Độ chính xác</div>
//                         </div>
//                       </div>

//                       {userRank === 1 && (
//                         <div className="bg-yellow-400 text-yellow-900 p-3 rounded-lg text-center font-bold">
//                           🏆 CHÚC MỪNG! BẠN LÀ NHẤT!
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })()}
//               </div>
//             )}

//             {/* Statistics */}
//             <div className="bg-white rounded-2xl shadow-xl p-6">
//               <h4 className="text-xl font-bold text-gray-800 mb-4">📈 Thống Kê Game</h4>
//               <div className="space-y-4">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Tổng người chơi:</span>
//                   <span className="font-bold text-blue-600">{finalLeaderboard.length}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Điểm cao nhất:</span>
//                   <span className="font-bold text-green-600">
//                     {finalLeaderboard.length > 0 ? finalLeaderboard[0].score : 0}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Điểm trung bình:</span>
//                   <span className="font-bold text-purple-600">
//                     {finalLeaderboard.length > 0
//                       ? Math.round(finalLeaderboard.reduce((sum, p) => sum + p.score, 0) / finalLeaderboard.length)
//                       : 0
//                     }
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Hoàn thành lúc:</span>
//                   <span className="font-bold text-orange-600 text-sm">
//                     {new Date().toLocaleTimeString('vi-VN')}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="bg-white rounded-2xl shadow-xl p-6">
//               <h4 className="text-xl font-bold text-gray-800 mb-4">⚡ Hành Động</h4>
//               <div className="space-y-3">
//                 <button
//                   onClick={shareResults}
//                   className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
//                 >
//                   📤 Chia Sẻ Kết Quả
//                 </button>
//                 <button
//                   onClick={() => navigate(`/quiz/${quizId}/leaderboard`)}
//                   className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
//                 >
//                   📊 Xem Chi Tiết
//                 </button>
//                 <button
//                   onClick={createNewRoom}
//                   className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
//                 >
//                   🆕 Chơi Lại
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Actions */}
//         <div className="text-center">
//           <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
//             <h3 className="text-2xl font-bold text-gray-800 mb-4">🎮 Chơi Tiếp?</h3>
//             <p className="text-gray-600 mb-6">
//               Cảm ơn bạn đã tham gia! Hãy thử thách bản thân với một quiz mới hoặc mời bạn bè cùng chơi.
//             </p>
            
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <button
//                 onClick={createNewRoom}
//                 className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
//               >
//                 <div className="text-2xl mb-2">🆕</div>
//                 <div>Tạo Phòng Mới</div>
//               </button>
              
//               <button
//                 onClick={() => navigate('/')}
//                 className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
//               >
//                 <div className="text-2xl mb-2">🏠</div>
//                 <div>Trang Chủ</div>
//               </button>
              
//               <button
//                 onClick={shareResults}
//                 className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
//               >
//                 <div className="text-2xl mb-2">📱</div>
//                 <div>Chia Sẻ</div>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="mt-8 text-center text-gray-500 text-sm">
//           <p>Quiz ID: {quizId} | Multiplayer Quiz Game</p>
//           <p className="mt-1">🎉 Cảm ơn bạn đã chơi! Hẹn gặp lại trong game tiếp theo!</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FinalResults;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, update, db } from "../config/firebase";
import { LeaderboardEntry } from "../types";

const FinalResults: React.FC = () => {
  const [finalLeaderboard, setFinalLeaderboard] = useState<Array<{name: string, score: number, rank: number}>>([]);
  const [participants, setParticipants] = useState<Record<string, any>>({});
  const [quizInfo, setQuizInfo] = useState<any>(null);
  const [showCelebration, setShowCelebration] = useState(true);
  const [loading, setLoading] = useState(true);
  const [playHistory, setPlayHistory] = useState<Record<string, any>>({});
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [showConfetti, setShowConfetti] = useState(true);
  
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    if (!quizId) {
      navigate('/');
      return;
    }

    // Load quiz info
    const infoRef = ref(db, `quizzes/${quizId}/info`);
    const unsubscribeInfo = onValue(infoRef, (snapshot) => {
      setQuizInfo(snapshot.val());
    });

    // Load participants
    const participantsRef = ref(db, `quizzes/${quizId}/participants`);
    const unsubscribeParticipants = onValue(participantsRef, (snapshot) => {
      setParticipants(snapshot.val() || {});
    });

    // Load play history
    const historyRef = ref(db, `quizzes/${quizId}/playHistory`);
    const unsubscribeHistory = onValue(historyRef, (snapshot) => {
      setPlayHistory(snapshot.val() || {});
    });

    // Load leaderboard data
    const leaderboardRef = ref(db, `quizzes/${quizId}/leaderboard`);
    const unsubscribeLeaderboard = onValue(leaderboardRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const leaderboardData = data as Record<string, LeaderboardEntry>;
        const sorted = Object.entries(leaderboardData)
          .map(([name, info]) => ({
            name,
            score: info.bestScore,
            rank: info.rank || 0
          }))
          .sort((a, b) => b.score - a.score)
          .map((player, index) => ({
            ...player,
            rank: player.rank || index + 1
          }));
        setFinalLeaderboard(sorted);
      }
      setLoading(false);
    });

    // Hide celebration animation after 5 seconds
    const celebrationTimer = setTimeout(() => {
      setShowCelebration(false);
    }, 5000);

    // Hide confetti after 8 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 8000);

    return () => {
      unsubscribeInfo();
      unsubscribeParticipants();
      unsubscribeHistory();
      unsubscribeLeaderboard();
      clearTimeout(celebrationTimer);
      clearTimeout(confettiTimer);
    };
  }, [quizId, navigate]);

  const updateFinalLeaderboard = async () => {
    try {
      const updates: Record<string, any> = {};
      
      finalLeaderboard.forEach((player, index) => {
        updates[`leaderboard/${player.name}`] = {
          rank: index + 1,
          bestScore: player.score,
          averageScore: Math.round(player.score / (quizInfo?.totalQuestions || 5)),
          lastPlayed: Date.now()
        };
      });
      
      await update(ref(db, `quizzes/${quizId}`), updates);
      console.log("Final leaderboard updated successfully");
    } catch (error) {
      console.error("Error updating final leaderboard:", error);
    }
  };

  const getPlayerStats = (playerName: string) => {
    const history = playHistory[playerName]?.attempts || {};
    const attempts = Object.values(history) as any[];
    
    if (attempts.length === 0) return null;

    const correctAnswers = attempts.filter(a => a.isCorrect).length;
    const totalQuestions = attempts.length;
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    const averageTimeLeft = Math.round(
      attempts.reduce((sum: number, a: any) => sum + (a.timeLeft || 0), 0) / attempts.length
    );

    return {
      accuracy,
      correctAnswers,
      totalQuestions,
      averageTimeLeft,
      bestAnswer: attempts.reduce((best, current) => 
        (current.score || 0) > (best.score || 0) ? current : best, attempts[0])
    };
  };

  const shareResults = () => {
    const userRank = finalLeaderboard.findIndex(p => p.name === userName) + 1;
    const userScore = finalLeaderboard.find(p => p.name === userName)?.score || 0;
    
    const shareText = `🎉 Tôi vừa hoàn thành Quiz Multiplayer!
    
📊 Kết quả của tôi:
🏆 Xếp hạng: #${userRank}/${finalLeaderboard.length}
⭐ Điểm số: ${userScore}
🎮 Quiz: ${quizInfo?.title || 'Multiplayer Quiz'}

Thử thách bản thân tại: ${window.location.origin}/quiz/${quizId}`;

    if (navigator.share) {
      navigator.share({
        title: 'Quiz Multiplayer Results',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('✅ Đã copy kết quả để chia sẻ!');
      });
    }
  };

  const createNewRoom = () => {
    const newRoomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem("quizId", newRoomId);
    navigate(`/quiz/${newRoomId}/join`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-700">Đang tính toán kết quả cuối cùng...</p>
          <p className="text-sm text-gray-500 mt-2">Vui lòng đợi một chút</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-200 relative overflow-hidden">
      
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {['🎉', '🎊', '✨', '🏆', '🥇', '🌟'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        
        {/* Main Celebration Header */}
        {showCelebration && (
          <div className="text-center mb-12 animate-bounce">
            <div className="text-8xl md:text-9xl mb-4">🏆</div>
            <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 mb-4">
              HOÀN THÀNH!
            </h1>
            <p className="text-2xl md:text-3xl text-gray-700 font-semibold">
              Quiz Multiplayer đã kết thúc
            </p>
          </div>
        )}

        {/* Quiz Info */}
        {quizInfo && (
          <div className="text-center mb-8">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl mx-auto border border-gray-200">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{quizInfo.title}</h2>
              <div className="flex flex-wrap justify-center gap-6 text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">👥</span>
                  <span className="font-semibold">{finalLeaderboard.length} người chơi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">❓</span>
                  <span className="font-semibold">{quizInfo.totalQuestions || 5} câu hỏi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">⏱️</span>
                  <span className="font-semibold">30s/câu</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🎯</span>
                  <span className="font-semibold">Tối đa {quizInfo.pointsPerQuestion || 100} điểm/câu</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Room ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{quizId}</span>
              </p>
            </div>
          </div>
        )}

        {/* Podium for Top 3 */}
        {finalLeaderboard.length >= 3 && (
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">🏅 PODIUM TOP 3</h3>
            <div className="flex justify-center items-end space-x-4 max-w-4xl mx-auto">
              
              {/* 2nd Place */}
              <div className="bg-gradient-to-t from-gray-300 to-gray-400 rounded-t-3xl p-6 text-center relative transform hover:scale-105 transition-transform">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-lg">
                    🥈
                  </div>
                </div>
                <div className="mt-8 text-white">
                  <p className="text-2xl font-bold mb-2">{finalLeaderboard[1]?.name}</p>
                  <p className="text-xl font-semibold">{finalLeaderboard[1]?.score} điểm</p>
                </div>
                <div className="h-24 bg-gray-400 rounded-b-lg mt-4 flex items-center justify-center text-white font-bold">
                  #2
                </div>
              </div>

              {/* 1st Place */}
              <div className="bg-gradient-to-t from-yellow-400 to-yellow-500 rounded-t-3xl p-8 text-center relative transform hover:scale-105 transition-transform">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-4xl border-4 border-white shadow-xl animate-pulse">
                    🥇
                  </div>
                </div>
                <div className="mt-10 text-white">
                  <p className="text-3xl font-bold mb-2">{finalLeaderboard[0]?.name}</p>
                  <p className="text-2xl font-semibold">{finalLeaderboard[0]?.score} điểm</p>
                  <p className="text-lg">🎉 CHAMPION!</p>
                </div>
                <div className="h-32 bg-yellow-500 rounded-b-lg mt-4 flex items-center justify-center text-white font-bold text-xl">
                  #1
                </div>
              </div>

              {/* 3rd Place */}
              <div className="bg-gradient-to-t from-orange-400 to-orange-500 rounded-t-3xl p-6 text-center relative transform hover:scale-105 transition-transform">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-16 h-16 bg-orange-400 rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-lg">
                    🥉
                  </div>
                </div>
                <div className="mt-8 text-white">
                  <p className="text-2xl font-bold mb-2">{finalLeaderboard[2]?.name}</p>
                  <p className="text-xl font-semibold">{finalLeaderboard[2]?.score} điểm</p>
                </div>
                <div className="h-24 bg-orange-500 rounded-b-lg mt-4 flex items-center justify-center text-white font-bold">
                  #3
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Main Results */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                <h3 className="text-2xl font-bold">📊 Bảng Xếp Hạng Cuối Cùng</h3>
                <p className="text-purple-100 mt-1">Kết quả chính thức của tất cả người chơi</p>
              </div>
              
              <div className="p-6">
                {finalLeaderboard.length > 0 ? (
                  <div className="space-y-4">
                    {finalLeaderboard.map((player, index) => {
                      const stats = getPlayerStats(player.name);
                      const isCurrentUser = player.name === userName;
                      
                      return (
                        <div
                          key={player.name}
                          className={`p-5 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                            isCurrentUser
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-400 ring-2 ring-yellow-300 scale-105 transform'
                              : selectedPlayer === player.name
                              ? 'bg-blue-50 border-blue-400'
                              : index < 3
                              ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedPlayer(selectedPlayer === player.name ? "" : player.name)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {/* Rank Badge */}
                              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl ${
                                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                                index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                                'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                              }`}>
                                {index === 0 ? '👑' : 
                                 index === 1 ? '🥈' : 
                                 index === 2 ? '🥉' : 
                                 `#${index + 1}`}
                              </div>
                              
                              {/* Player Info */}
                              <div>
                                <p className="font-bold text-xl text-gray-800">
                                  {player.name}
                                  {isCurrentUser && ' (Bạn)'}
                                </p>
                                <div className="flex space-x-4 text-sm text-gray-600">
                                  <span>🏆 {player.score} điểm</span>
                                  {stats && (
                                    <>
                                      <span>🎯 {stats.accuracy}% đúng</span>
                                      <span>⚡ {stats.averageTimeLeft}s TB</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {/* Score Display */}
                            <div className="text-right">
                              <div className="text-3xl font-bold text-gray-800">
                                {player.score}
                              </div>
                              <div className="text-sm text-gray-500">
                                điểm
                              </div>
                            </div>
                          </div>
                          
                          {/* Expanded Stats */}
                          {selectedPlayer === player.name && stats && (
                            <div className="mt-6 pt-4 border-t border-gray-200">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-green-100 p-4 rounded-lg text-center">
                                  <div className="text-2xl font-bold text-green-600">
                                    {stats.correctAnswers}/{stats.totalQuestions}
                                  </div>
                                  <div className="text-sm text-gray-600">Câu đúng</div>
                                </div>
                                <div className="bg-blue-100 p-4 rounded-lg text-center">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {stats.accuracy}%
                                  </div>
                                  <div className="text-sm text-gray-600">Độ chính xác</div>
                                </div>
                                <div className="bg-purple-100 p-4 rounded-lg text-center">
                                  <div className="text-2xl font-bold text-purple-600">
                                    {stats.averageTimeLeft}s
                                  </div>
                                  <div className="text-sm text-gray-600">TB thời gian</div>
                                </div>
                                <div className="bg-orange-100 p-4 rounded-lg text-center">
                                  <div className="text-2xl font-bold text-orange-600">
                                    {Math.round(player.score / (quizInfo?.totalQuestions || 5))}
                                  </div>
                                  <div className="text-sm text-gray-600">Điểm/câu</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🤔</div>
                    <p className="text-2xl text-gray-600">Không có dữ liệu</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Personal Achievement */}
            {userName && finalLeaderboard.find(p => p.name === userName) && (
              <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl shadow-xl p-6 border border-yellow-300">
                <h4 className="text-xl font-bold text-gray-800 mb-4 text-center">🎯 Thành Tích Của Bạn</h4>
                {(() => {
                  const userRank = finalLeaderboard.findIndex(p => p.name === userName) + 1;
                  const userScore = finalLeaderboard.find(p => p.name === userName)?.score || 0;
                  const userStats = getPlayerStats(userName);
                  
                  return (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-yellow-600 mb-2">#{userRank}</div>
                        <p className="text-gray-700">Xếp hạng cuối cùng</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white bg-opacity-60 p-3 rounded-lg text-center">
                          <div className="text-xl font-bold text-green-600">{userScore}</div>
                          <div className="text-xs text-gray-600">Tổng điểm</div>
                        </div>
                        <div className="bg-white bg-opacity-60 p-3 rounded-lg text-center">
                          <div className="text-xl font-bold text-blue-600">
                            {userStats ? `${userStats.accuracy}%` : '0%'}
                          </div>
                          <div className="text-xs text-gray-600">Độ chính xác</div>
                        </div>
                      </div>

                      {userRank === 1 && (
                        <div className="bg-yellow-400 text-yellow-900 p-3 rounded-lg text-center font-bold">
                          🏆 CHÚC MỪNG! BẠN LÀ NHẤT!
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Statistics */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4">📈 Thống Kê Game</h4>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tổng người chơi:</span>
                  <span className="font-bold text-blue-600">{finalLeaderboard.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Điểm cao nhất:</span>
                  <span className="font-bold text-green-600">
                    {finalLeaderboard.length > 0 ? finalLeaderboard[0].score : 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Điểm trung bình:</span>
                  <span className="font-bold text-purple-600">
                    {finalLeaderboard.length > 0 
                      ? Math.round(finalLeaderboard.reduce((sum, p) => sum + p.score, 0) / finalLeaderboard.length)
                      : 0
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hoàn thành lúc:</span>
                  <span className="font-bold text-orange-600 text-sm">
                    {new Date().toLocaleTimeString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h4 className="text-xl font-bold text-gray-800 mb-4">⚡ Hành Động</h4>
              <div className="space-y-3">
                <button
                  onClick={shareResults}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  📤 Chia Sẻ Kết Quả
                </button>
                <button
                  onClick={() => navigate(`/quiz/${quizId}/leaderboard`)}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  📊 Xem Chi Tiết
                </button>
                <button
                  onClick={createNewRoom}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  🆕 Chơi Lại
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">🎮 Chơi Tiếp?</h3>
            <p className="text-gray-600 mb-6">
              Cảm ơn bạn đã tham gia! Hãy thử thách bản thân với một quiz mới hoặc mời bạn bè cùng chơi.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={createNewRoom}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="text-2xl mb-2">🆕</div>
                <div>Tạo Phòng Mới</div>
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="text-2xl mb-2">🏠</div>
                <div>Trang Chủ</div>
              </button>
              
              <button
                onClick={shareResults}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="text-2xl mb-2">📱</div>
                <div>Chia Sẻ</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Quiz ID: {quizId} | Multiplayer Quiz Game</p>
          <p className="mt-1">🎉 Cảm ơn bạn đã chơi! Hẹn gặp lại trong game tiếp theo!</p>
        </div>
      </div>
    </div>
  );
};

export default FinalResults;