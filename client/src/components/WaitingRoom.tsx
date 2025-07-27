// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ref, onValue, set, get, DatabaseReference, db } from "../config/firebase";
// import { Participant } from "../types";

// const WaitingRoom: React.FC = () => {
//   const [participants, setParticipants] = useState<[string, Participant][]>([]);
//   const [quizInfo, setQuizInfo] = useState<any>(null);
//   const [isQuizStarted, setIsQuizStarted] = useState<boolean>(false);
//   const [countdown, setCountdown] = useState<number>(0);
//   const [isHost, setIsHost] = useState<boolean>(false);
//   const [loading, setLoading] = useState<boolean>(true);
  
//   const { quizId } = useParams<{ quizId: string }>();
//   const navigate = useNavigate();
//   const userName = localStorage.getItem("userName");

//   useEffect(() => {
//     if (!quizId || !userName) {
//       navigate('/');
//       return;
//     }

//     let countdownTimer: NodeJS.Timeout;

//     // Lắng nghe thông tin quiz
//     const infoRef = ref(db, `quizzes/${quizId}/info`);
//     const unsubscribeInfo = onValue(infoRef, (snapshot) => {
//       const info = snapshot.val();
//       setQuizInfo(info);
//     });

//     // Lắng nghe danh sách participants
//     const participantsRef: DatabaseReference = ref(db, `quizzes/${quizId}/participants`);
//     const unsubscribeParticipants = onValue(participantsRef, (snapshot) => {
//       const data = snapshot.val();
//       // Cách 1: Sử dụng type assertion
//       const participantsList = data ? Object.entries(data) as [string, Participant][] : [];
      
//       // Cách 2: Hoặc bạn có thể sử dụng type guard để an toàn hơn
//       // const participantsList: [string, Participant][] = data
//       //   ? Object.entries(data).filter((entry): entry is [string, Participant] => {
//       //       const [_, participant] = entry;
//       //       return participant && typeof participant === 'object';
//       //     })
//       //   : [];
      
//       setParticipants(participantsList);
//       setLoading(false);
//     });

//     // Lắng nghe trạng thái quiz
//     const quizStatusRef: DatabaseReference = ref(db, `quizzes/${quizId}/status`);
//     const unsubscribeStatus = onValue(quizStatusRef, async (snapshot) => {
//       const status = snapshot.val();
      
//       if (status?.createdBy === userName) {
//         setIsHost(true);
//       }
      
//       if (status?.isStarted === true) {
//         setIsQuizStarted(true);
        
//         // Countdown 3 giây trước khi chuyển
//         setCountdown(3);
//         countdownTimer = setInterval(() => {
//           setCountdown((prev) => {
//             if (prev <= 1) {
//               clearInterval(countdownTimer);
//               navigate(`/quiz/${quizId}/play`);
//               return 0;
//             }
//             return prev - 1;
//           });
//         }, 1000);
//       }
//     });

//     // Lắng nghe currentState để chuyển trạng thái
//     const currentStateRef = ref(db, `quizzes/${quizId}/currentState`);
//     const unsubscribeCurrentState = onValue(currentStateRef, (snapshot) => {
//       const state = snapshot.val();
//       if (state?.phase === 'get-ready' || state?.phase === 'playing') {
//         navigate(`/quiz/${quizId}/play`);
//       }
//     });

//     // Cleanup listeners
//     return () => {
//       unsubscribeInfo();
//       unsubscribeParticipants();
//       unsubscribeStatus();
//       unsubscribeCurrentState();
//       if (countdownTimer) {
//         clearInterval(countdownTimer);
//       }
//     };
//   }, [quizId, userName, navigate]);

//   const handleStartQuiz = async () => {
//     if (!quizId || !userName || participants.length === 0) return;

//     try {
//       // Cập nhật trạng thái quiz
//       const statusRef: DatabaseReference = ref(db, `quizzes/${quizId}/status`);
//       await set(statusRef, {
//         isStarted: true,
//         startedAt: Date.now(),
//         startedBy: userName,
//         isCompleted: false,
//         completedAt: null,
//         createdBy: userName,
//         createdAt: Date.now()
//       });

//       // Set current state to get-ready
//       const currentStateRef = ref(db, `quizzes/${quizId}/currentState`);
//       await set(currentStateRef, {
//         questionIndex: 0,
//         timeLeft: 30,
//         phase: 'get-ready',
//         maxTimePerQuestion: 30
//       });
      
//       console.log("Quiz đã được bắt đầu!");
//     } catch (error) {
//       console.error("Lỗi khi bắt đầu quiz:", error);
//       alert("Đã có lỗi xảy ra khi bắt đầu quiz!");
//     }
//   };

//   const copyRoomLink = () => {
//     const roomLink = `${window.location.origin}/quiz/${quizId}`;
//     navigator.clipboard.writeText(roomLink).then(() => {
//       alert("Đã copy link phòng!");
//     }).catch(() => {
//       prompt("Copy link này để chia sẻ:", roomLink);
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-lg">Đang tải phòng chờ...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-green-50 to-blue-50">
//       {/* Header */}
//       <div className="bg-white border border-green-200 text-green-800 px-6 py-3 rounded-lg mb-6 shadow-lg">
//         <p className="font-bold text-center">🎮 PHÒNG CHỜ MULTIPLAYER</p>
//         <p className="text-sm text-center mt-1">Đang chờ bắt đầu quiz...</p>
//       </div>

//       {/* Quiz Info */}
//       {quizInfo && (
//         <div className="bg-white p-4 rounded-lg shadow-lg mb-6 max-w-md w-full border border-gray-200">
//           <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
//             {quizInfo.title}
//           </h2>
//           <div className="text-sm text-gray-600 text-center space-y-1">
//             <p>📝 Tổng số câu hỏi: <span className="font-semibold">{quizInfo.totalQuestions || 5}</span></p>
//             <p>⭐ Điểm tối đa/câu: <span className="font-semibold">{quizInfo.pointsPerQuestion || 100}</span></p>
//             <p>⏱️ Thời gian/câu: <span className="font-semibold">30 giây</span></p>
//           </div>
//         </div>
//       )}

//       {/* Room Info & Share */}
//       <div className="bg-white p-4 rounded-lg shadow-lg mb-6 max-w-md w-full border border-gray-200">
//         <div className="text-center mb-3">
//           <p className="text-sm text-gray-600">Room ID</p>
//           <p className="font-mono text-lg font-bold text-blue-600">{quizId}</p>
//         </div>
//         <button
//           onClick={copyRoomLink}
//           className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
//         >
//           📋 Copy Link Mời Bạn Bè
//         </button>
//       </div>

//       {/* Countdown for starting */}
//       {isQuizStarted && countdown > 0 && (
//         <div className="bg-green-100 border border-green-400 text-green-800 p-6 rounded-lg mb-6 text-center shadow-lg">
//           <p className="text-lg font-bold mb-2">🚀 Quiz đang bắt đầu!</p>
//           <div className="text-4xl font-bold animate-pulse">{countdown}</div>
//           <p className="text-sm mt-2">Chuẩn bị sẵn sàng...</p>
//         </div>
//       )}

//       {/* Participants List */}
//       <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mb-6 border border-gray-200">
//         <h2 className="text-lg font-bold text-center mb-4 text-gray-800">
//           👥 Người chơi ({participants.length})
//         </h2>
        
//         {participants.length > 0 ? (
//           <div className="space-y-2 max-h-60 overflow-y-auto">
//             {participants.map(([name, info], index) => (
//               <div
//                 key={name}
//                 className={`flex items-center justify-between p-3 rounded-lg transition-all ${
//                   name === userName
//                     ? 'bg-blue-100 border-2 border-blue-400 scale-105'
//                     : 'bg-gray-50 border border-gray-200'
//                 }`}
//               >
//                 <div className="flex items-center space-x-3">
//                   <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
//                     {index + 1}
//                   </div>
//                   <div>
//                     <p className="font-semibold text-gray-800">
//                       {name}
//                       {name === userName && ' (Bạn)'}
//                       {isHost && name === userName && ' 👑'}
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       Tham gia: {new Date(info.joinedAt).toLocaleTimeString('vi-VN')}
//                     </p>
//                   </div>
//                 </div>
//                 <div className={`px-2 py-1 rounded-full text-xs font-medium ${
//                   info.isActive
//                     ? 'bg-green-200 text-green-800'
//                     : 'bg-red-200 text-red-800'
//                 }`}>
//                   {info.isActive ? '🟢 Online' : '🔴 Offline'}
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="text-center py-8">
//             <div className="animate-pulse">
//               <div className="text-4xl mb-2">😔</div>
//               <p className="text-gray-600">Chưa có người chơi nào khác</p>
//               <p className="text-sm text-gray-500 mt-2">Chia sẻ link để mời bạn bè!</p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Start Button */}
//       {isHost && !isQuizStarted && (
//         <div className="mb-6">
//           <button
//             onClick={handleStartQuiz}
//             disabled={participants.length === 0}
//             className={`px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg ${
//               participants.length === 0
//                 ? "bg-gray-400 text-gray-600 cursor-not-allowed"
//                 : "bg-green-500 text-white hover:bg-green-600 active:scale-95 hover:shadow-xl"
//             }`}
//           >
//             {participants.length === 0
//               ? "⏳ Đang chờ người chơi..."
//               : `🚀 Bắt đầu Quiz (${participants.length} người)`
//             }
//           </button>
          
//           {participants.length > 0 && (
//             <p className="text-sm text-gray-600 mt-2 text-center">
//               Bạn là host - nhấn để bắt đầu cho tất cả người chơi
//             </p>
//           )}
//         </div>
//       )}

//       {/* Waiting message for non-host */}
//       {!isHost && !isQuizStarted && (
//         <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded-lg text-center">
//           <p className="font-semibold">⏳ Đang chờ host bắt đầu quiz...</p>
//           <p className="text-sm mt-1">Host sẽ quyết định khi nào bắt đầu</p>
//         </div>
//       )}

//       {/* Game Rules */}
//       <div className="bg-white p-4 rounded-lg shadow max-w-md w-full border border-gray-200">
//         <h3 className="font-bold text-gray-800 mb-2 text-center">📋 Luật chơi</h3>
//         <ul className="text-sm text-gray-600 space-y-1">
//           <li>• Điểm số giảm dần theo thời gian trả lời</li>
//           <li>• Sau mỗi câu hỏi sẽ hiển thị bảng xếp hạng</li>
//           <li>• Top 3 cuối game sẽ lên podium</li>
//           <li>• Trả lời nhanh để được điểm cao!</li>
//         </ul>
//       </div>

//       {/* Debug info */}
//       <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
//         <p>Room: {quizId}</p>
//         <p>User: {userName} {isHost && '(Host)'}</p>
//         <p>Status: {isQuizStarted ? 'Starting...' : 'Waiting'}</p>
//       </div>
//     </div>
//   );
// };

// export default WaitingRoom;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, set, get, DatabaseReference, db } from "../config/firebase";
import { Participant } from "../types";

const WaitingRoom: React.FC = () => {
  const [participants, setParticipants] = useState<[string, Participant][]>([]);
  const [quizInfo, setQuizInfo] = useState<any>(null);
  const [isQuizStarted, setIsQuizStarted] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Trạng thái cho form nhập tên
  const [userName, setUserName] = useState<string>("");
  const [hasJoinedRoom, setHasJoinedRoom] = useState<boolean>(false);
  const [joinLoading, setJoinLoading] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<string>("");
  
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!quizId) {
      navigate('/');
      return;
    }

    // Kiểm tra xem đã có userName trong localStorage chưa
    const savedUserName = localStorage.getItem("userName");
    if (savedUserName) {
      setUserName(savedUserName);
      setHasJoinedRoom(true);
    }

    let countdownTimer: NodeJS.Timeout;

    // Lắng nghe thông tin quiz
    const infoRef = ref(db, `quizzes/${quizId}/info`);
    const unsubscribeInfo = onValue(infoRef, (snapshot) => {
      const info = snapshot.val();
      setQuizInfo(info);
      setLoading(false);
    });

    // Chỉ lắng nghe participants nếu đã join
    let unsubscribeParticipants: (() => void) | null = null;
    let unsubscribeStatus: (() => void) | null = null;
    let unsubscribeCurrentState: (() => void) | null = null;

    if (hasJoinedRoom) {
      // Lắng nghe danh sách participants
      const participantsRef: DatabaseReference = ref(db, `quizzes/${quizId}/participants`);
      unsubscribeParticipants = onValue(participantsRef, (snapshot) => {
        const data = snapshot.val();
        const participantsList = data ? Object.entries(data) as [string, Participant][] : [];
        setParticipants(participantsList);
      });

      // Lắng nghe trạng thái quiz
      const quizStatusRef: DatabaseReference = ref(db, `quizzes/${quizId}/status`);
      unsubscribeStatus = onValue(quizStatusRef, async (snapshot) => {
        const status = snapshot.val();
        
        if (status?.createdBy === savedUserName) {
          setIsHost(true);
        }
        
        if (status?.isStarted === true) {
          setIsQuizStarted(true);
          
          // Countdown 3 giây trước khi chuyển
          setCountdown(3);
          countdownTimer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(countdownTimer);
                navigate(`/quiz/${quizId}/play`);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      });

      // Lắng nghe currentState để chuyển trạng thái
      const currentStateRef = ref(db, `quizzes/${quizId}/currentState`);
      unsubscribeCurrentState = onValue(currentStateRef, (snapshot) => {
        const state = snapshot.val();
        if (state?.phase === 'get-ready' || state?.phase === 'playing') {
          navigate(`/quiz/${quizId}/play`);
        }
      });
    }

    // Cleanup listeners
    return () => {
      unsubscribeInfo();
      if (unsubscribeParticipants) unsubscribeParticipants();
      if (unsubscribeStatus) unsubscribeStatus();
      if (unsubscribeCurrentState) unsubscribeCurrentState();
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    };
  }, [quizId, navigate, hasJoinedRoom]);

  const generateRandomName = () => {
    const adjectives = ["Thông minh", "Nhanh nhẹn", "Siêu", "Pro", "Vui vẻ", "Tài giỏi", "Xuất sắc"];
    const nouns = ["Player", "Gamer", "User", "Hero", "Champion", "Master", "Legend"];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    return `${randomAdj} ${randomNoun} ${randomNum}`;
  };

  const handleJoinWithName = async () => {
    if (!userName.trim()) {
      setShowWarning("Vui lòng nhập tên!");
      return;
    }

    if (!quizId) return;

    setJoinLoading(true);
    setShowWarning("");

    try {
      // Kiểm tra tên đã tồn tại trong phòng
      const userRef = ref(db, `quizzes/${quizId}/participants/${userName}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists()) {
        setShowWarning(`Tên "${userName}" đã được sử dụng! Vui lòng chọn tên khác.`);
        setJoinLoading(false);
        return;
      }

      // Thêm người chơi vào phòng
      const participant: Participant = {
        joinedAt: Date.now(),
        score: 0,
        bestScore: 0,
        isActive: true
      };
      await set(userRef, participant);
      
      // Khởi tạo leaderboard entry
      const leaderboardRef = ref(db, `quizzes/${quizId}/leaderboard/${userName}`);
      await set(leaderboardRef, {
        bestScore: 0,
        averageScore: 0,
        lastPlayed: Date.now(),
        rank: 0
      });

      // Kiểm tra xem đây có phải người đầu tiên không
      const participantsRef = ref(db, `quizzes/${quizId}/participants`);
      const participantsSnapshot = await get(participantsRef);
      const participantsData = participantsSnapshot.val();
      const participantCount = participantsData ? Object.keys(participantsData).length : 0;

      // Nếu là người đầu tiên, set làm createdBy
      if (participantCount <= 1) {
        const statusRef = ref(db, `quizzes/${quizId}/status`);
        const statusSnapshot = await get(statusRef);
        const currentStatus = statusSnapshot.val() || {};
        
        await set(statusRef, {
          ...currentStatus,
          createdBy: userName
        });
        setIsHost(true);
      }

      // Lưu thông tin vào localStorage
      localStorage.setItem("userName", userName);
      localStorage.setItem("quizId", quizId);
      
      setHasJoinedRoom(true);
      console.log(`User ${userName} joined room ${quizId} successfully`);
      
    } catch (error) {
      console.error("Lỗi khi tham gia:", error);
      setShowWarning("Đã có lỗi xảy ra! Vui lòng thử lại.");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinWithName();
    }
  };

  const handleStartQuiz = async () => {
    if (!quizId || !userName || participants.length === 0) return;

    try {
      // Cập nhật trạng thái quiz
      const statusRef: DatabaseReference = ref(db, `quizzes/${quizId}/status`);
      await set(statusRef, {
        isStarted: true,
        startedAt: Date.now(),
        startedBy: userName,
        isCompleted: false,
        completedAt: null,
        createdBy: userName,
        createdAt: Date.now()
      });

      // Set current state to get-ready
      const currentStateRef = ref(db, `quizzes/${quizId}/currentState`);
      await set(currentStateRef, {
        questionIndex: 0,
        timeLeft: 30,
        phase: 'get-ready',
        maxTimePerQuestion: 30
      });
      
      console.log("Quiz đã được bắt đầu!");
    } catch (error) {
      console.error("Lỗi khi bắt đầu quiz:", error);
      alert("Đã có lỗi xảy ra khi bắt đầu quiz!");
    }
  };

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/quiz/${quizId}/waiting`;
    navigator.clipboard.writeText(roomLink).then(() => {
      alert("Đã copy link phòng!");
    }).catch(() => {
      prompt("Copy link này để chia sẻ:", roomLink);
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Đang tải phòng chờ...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa nhập tên, hiển thị form nhập tên
  if (!hasJoinedRoom) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header */}
        <div className="bg-white border border-green-200 text-green-800 px-6 py-4 rounded-lg mb-8 max-w-md text-center shadow-lg">
          <p className="font-bold text-lg">🎮 PHÒNG CHỜ QUIZ</p>
          <p className="text-sm mt-1">Nhập tên để tham gia</p>
        </div>

        {/* Quiz Info */}
        {quizInfo && (
          <div className="bg-white p-4 rounded-lg shadow-lg mb-6 max-w-md w-full border border-gray-200">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
              {quizInfo.title}
            </h2>
            <div className="text-sm text-gray-600 text-center space-y-1">
              <p>📝 Tổng số câu hỏi: <span className="font-semibold">{quizInfo.totalQuestions || 5}</span></p>
              <p>⭐ Điểm tối đa/câu: <span className="font-semibold">{quizInfo.pointsPerQuestion || 100}</span></p>
              <p>⏱️ Thời gian/câu: <span className="font-semibold">30 giây</span></p>
            </div>
          </div>
        )}

        {/* Room Info */}
        <div className="bg-white p-4 rounded-lg shadow-lg mb-6 max-w-md w-full border border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600">Room ID</p>
            <p className="font-mono text-lg font-bold text-blue-600">{quizId}</p>
          </div>
        </div>

        {/* Name Input Form */}
        <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 mb-6">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Nhập tên của bạn
          </h1>
          
          {/* Warning Message */}
          {showWarning && (
            <div className="mb-4 p-3 bg-orange-100 border border-orange-400 text-orange-700 rounded-lg">
              <p className="text-sm font-medium text-center">{showWarning}</p>
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
              Tên hiển thị
            </label>
            <div className="flex gap-2">
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tên của bạn"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                disabled={joinLoading}
                maxLength={20}
              />
              <button
                type="button"
                onClick={() => setUserName(generateRandomName())}
                className="px-3 py-3 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                disabled={joinLoading}
                title="Tạo tên ngẫu nhiên"
              >
                🎲
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Tối đa 20 ký tự</p>
          </div>

          <button
            onClick={handleJoinWithName}
            disabled={joinLoading || !userName.trim()}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
              joinLoading || !userName.trim()
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600 active:scale-95 shadow-lg hover:shadow-xl'
            }`}
          >
            {joinLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Đang tham gia...
              </div>
            ) : (
              '🚀 Tham Gia Phòng'
            )}
          </button>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Nhấn Enter hoặc click nút để tham gia</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setUserName(generateRandomName())}
            disabled={joinLoading}
            className="text-green-600 hover:text-green-800 text-sm underline font-medium"
          >
            🎲 Tên ngẫu nhiên
          </button>
          <span className="text-gray-400">•</span>
          <button
            onClick={() => setUserName("Player" + Date.now().toString().slice(-3))}
            disabled={joinLoading}
            className="text-green-600 hover:text-green-800 text-sm underline font-medium"
          >
            🧪 Test User
          </button>
        </div>

        {/* Game Rules */}
        <div className="bg-white p-4 rounded-lg shadow max-w-md w-full border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-2 text-center">📋 Luật chơi</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Điểm số giảm dần theo thời gian trả lời</li>
            <li>• Sau mỗi câu hỏi sẽ hiển thị bảng xếp hạng</li>
            <li>• Top 3 cuối game sẽ lên podium</li>
            <li>• Trả lời nhanh để được điểm cao!</li>
          </ul>
        </div>
      </div>
    );
  }

  // Sau khi đã nhập tên - hiển thị phòng chờ
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border border-green-200 text-green-800 px-6 py-3 rounded-lg mb-6 shadow-lg">
        <p className="font-bold text-center">🎮 PHÒNG CHỜ MULTIPLAYER</p>
        <p className="text-sm text-center mt-1">Đang chờ bắt đầu quiz...</p>
      </div>

      {/* Quiz Info */}
      {quizInfo && (
        <div className="bg-white p-4 rounded-lg shadow-lg mb-6 max-w-md w-full border border-gray-200">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-2">
            {quizInfo.title}
          </h2>
          <div className="text-sm text-gray-600 text-center space-y-1">
            <p>📝 Tổng số câu hỏi: <span className="font-semibold">{quizInfo.totalQuestions || 5}</span></p>
            <p>⭐ Điểm tối đa/câu: <span className="font-semibold">{quizInfo.pointsPerQuestion || 100}</span></p>
            <p>⏱️ Thời gian/câu: <span className="font-semibold">30 giây</span></p>
          </div>
        </div>
      )}

      {/* Room Info & Share */}
      <div className="bg-white p-4 rounded-lg shadow-lg mb-6 max-w-md w-full border border-gray-200">
        <div className="text-center mb-3">
          <p className="text-sm text-gray-600">Room ID</p>
          <p className="font-mono text-lg font-bold text-blue-600">{quizId}</p>
        </div>
        <button
          onClick={copyRoomLink}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          📋 Copy Link Mời Bạn Bè
        </button>
      </div>

      {/* Countdown for starting */}
      {isQuizStarted && countdown > 0 && (
        <div className="bg-green-100 border border-green-400 text-green-800 p-6 rounded-lg mb-6 text-center shadow-lg">
          <p className="text-lg font-bold mb-2">🚀 Quiz đang bắt đầu!</p>
          <div className="text-4xl font-bold animate-pulse">{countdown}</div>
          <p className="text-sm mt-2">Chuẩn bị sẵn sàng...</p>
        </div>
      )}

      {/* Participants List */}
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mb-6 border border-gray-200">
        <h2 className="text-lg font-bold text-center mb-4 text-gray-800">
          👥 Người chơi ({participants.length})
        </h2>
        
        {participants.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {participants.map(([name, info], index) => (
              <div
                key={name}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  name === userName
                    ? 'bg-blue-100 border-2 border-blue-400 scale-105'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {name}
                      {name === userName && ' (Bạn)'}
                      {isHost && name === userName && ' 👑'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Tham gia: {new Date(info.joinedAt).toLocaleTimeString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  info.isActive 
                    ? 'bg-green-200 text-green-800' 
                    : 'bg-red-200 text-red-800'
                }`}>
                  {info.isActive ? '🟢 Online' : '🔴 Offline'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="text-4xl mb-2">😔</div>
              <p className="text-gray-600">Chỉ có bạn trong phòng</p>
              <p className="text-sm text-gray-500 mt-2">Chia sẻ link để mời bạn bè!</p>
            </div>
          </div>
        )}
      </div>

      {/* Start Button */}
      {isHost && !isQuizStarted && (
        <div className="mb-6">
          <button
            onClick={handleStartQuiz}
            disabled={participants.length === 0}
            className={`px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg ${
              participants.length === 0 
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-green-500 text-white hover:bg-green-600 active:scale-95 hover:shadow-xl"
            }`}
          >
            {participants.length === 0 
              ? "⏳ Có thể chơi 1 mình..." 
              : `🚀 Bắt đầu Quiz (${participants.length} người)`
            }
          </button>
          
          <p className="text-sm text-gray-600 mt-2 text-center">
            Bạn là host - nhấn để bắt đầu cho tất cả người chơi
          </p>
        </div>
      )}

      {/* Waiting message for non-host */}
      {!isHost && !isQuizStarted && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-4 rounded-lg text-center">
          <p className="font-semibold">⏳ Đang chờ host bắt đầu quiz...</p>
          <p className="text-sm mt-1">Host sẽ quyết định khi nào bắt đầu</p>
        </div>
      )}

      {/* Debug info */}
      <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
        <p>Room: {quizId}</p>
        <p>User: {userName} {isHost && '(Host)'}</p>
        <p>Status: {isQuizStarted ? 'Starting...' : 'Waiting'}</p>
      </div>
    </div>
  );
};

export default WaitingRoom;