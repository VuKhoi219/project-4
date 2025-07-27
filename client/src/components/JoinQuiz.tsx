
// import { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ref, set, get, DatabaseReference, db } from "../config/firebase";
// import { Participant } from "../types";

// const JoinQuiz: React.FC = () => {
//   const [userName, setUserName] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);
//   const [showWarning, setShowWarning] = useState<string>("");
//   const { quizId } = useParams<{ quizId: string }>();
//   const navigate = useNavigate();

//   const generateRoomId = () => {
//     const timestamp = Date.now();
//     const randomStr = Math.random().toString(36).substring(2, 8);
//     return `room_${timestamp}_${randomStr}`;
//   };

//   const handleJoin = async () => {
//     if (!userName.trim()) {
//       setShowWarning("Vui lòng nhập tên!");
//       return;
//     }

//     setLoading(true);
//     setShowWarning("");

//     try {
//       let targetRoomId: string; // Explicit type declaration

//       // Nếu không có quizId, tạo phòng mới
//       if (!quizId) {
//         targetRoomId = generateRoomId();
//       } else {
//         // Kiểm tra trạng thái phòng hiện tại
//         const statusRef = ref(db, `quizzes/${quizId}/status`);
//         const statusSnapshot = await get(statusRef);
//         const status = statusSnapshot.val();

//         // Nếu quiz đã bắt đầu hoặc đã hoàn thành, tạo phòng mới
//         if (status?.isStarted || status?.isCompleted) {
//           targetRoomId = generateRoomId();
//           setShowWarning("Tạo phòng mới vì quiz đang chạy/đã kết thúc...");
//         } else {
//           targetRoomId = quizId; // Assign quizId to targetRoomId
//         }
//       }

//       // Now targetRoomId is guaranteed to be a string
      
//       // Kiểm tra tên đã tồn tại trong phòng
//       const userRef = ref(db, `quizzes/${targetRoomId}/participants/${userName}`);
//       const userSnapshot = await get(userRef);
      
//       if (userSnapshot.exists()) {
//         setShowWarning(`Tên "${userName}" đã được sử dụng! Vui lòng chọn tên khác.`);
//         setLoading(false);
//         return;
//       }

//       // Thêm người chơi vào phòng
//       const participant: Participant = {
//         joinedAt: Date.now(),
//         score: 0,
//         bestScore: 0,
//         isActive: true
//         // Removed lastAnswered property
//       };
//       await set(userRef, participant);
      
//       // Khởi tạo leaderboard entry
//       const leaderboardRef = ref(db, `quizzes/${targetRoomId}/leaderboard/${userName}`);
//       await set(leaderboardRef, {
//         bestScore: 0,
//         averageScore: 0,
//         lastPlayed: Date.now(),
//         rank: 0
//       });

//       // Khởi tạo trạng thái quiz nếu chưa có
//       const statusRef = ref(db, `quizzes/${targetRoomId}/status`);
//       const statusSnapshot = await get(statusRef);
//       if (!statusSnapshot.exists()) {
//         await set(statusRef, {
//           isStarted: false,
//           startedAt: null,
//           startedBy: null,
//           isCompleted: false,
//           completedAt: null,
//           createdBy: userName,
//           createdAt: Date.now()
//         });
//       }

//       // Khởi tạo currentState
//       const currentStateRef = ref(db, `quizzes/${targetRoomId}/currentState`);
//       const currentStateSnapshot = await get(currentStateRef);
//       if (!currentStateSnapshot.exists()) {
//         await set(currentStateRef, {
//           questionIndex: 0,
//           timeLeft: 30,
//           phase: 'waiting', // waiting, get-ready, playing, leaderboard, completed
//           maxTimePerQuestion: 30
//         });
//       }

//       // Khởi tạo quiz info
//       const infoRef = ref(db, `quizzes/${targetRoomId}/info`);
//       const infoSnapshot = await get(infoRef);
//       if (!infoSnapshot.exists()) {
//         await set(infoRef, {
//           title: `Quiz Room ${targetRoomId.split('_')[1]}`, // Now safe to use
//           totalQuestions: 5,
//           pointsPerQuestion: 100,
//           description: "Multiplayer Quiz Game",
//           createdAt: Date.now()
//         });
//       }
      
//       // Lưu thông tin vào localStorage
//       localStorage.setItem("userName", userName);
//       localStorage.setItem("quizId", targetRoomId); // Now guaranteed to be string
      
//       console.log(`User ${userName} joined room ${targetRoomId} successfully`);
      
//       // Chuyển đến phòng chờ
//       navigate(`/quiz/${targetRoomId}/waiting`);
      
//     } catch (error) {
//       console.error("Lỗi khi tham gia:", error);
//       setShowWarning("Đã có lỗi xảy ra! Vui lòng thử lại.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       handleJoin();
//     }
//   };

//   const generateRandomName = () => {
//     const adjectives = ["Thông minh", "Nhanh nhẹn", "Siêu", "Pro", "Vui vẻ", "Tài giỏi", "Xuất sắc"];
//     const nouns = ["Player", "Gamer", "User", "Hero", "Champion", "Master", "Legend"];
//     const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
//     const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
//     const randomNum = Math.floor(Math.random() * 1000);
//     return `${randomAdj} ${randomNoun} ${randomNum}`;
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
//       {/* Header */}
//       <div className="bg-white border border-blue-200 text-blue-800 px-6 py-4 rounded-lg mb-8 max-w-md text-center shadow-lg">
//         <p className="font-bold text-lg">🎮 MULTIPLAYER QUIZ</p>
//         <p className="text-sm mt-1">Tham gia hoặc tạo phòng chơi mới</p>
//       </div>

//       <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-200">
//         <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
//           Tham gia Quiz
//         </h1>
        
//         {quizId && (
//           <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
//             <p className="text-sm text-blue-700">
//               <span className="font-semibold">Room ID:</span> {quizId}
//             </p>
//             <p className="text-xs text-blue-600 mt-1">
//               ✨ Hệ thống sẽ tự động tạo phòng mới nếu cần
//             </p>
//           </div>
//         )}

//         {/* Warning Message */}
//         {showWarning && (
//           <div className="mb-4 p-3 bg-orange-100 border border-orange-400 text-orange-700 rounded-lg">
//             <p className="text-sm font-medium">{showWarning}</p>
//           </div>
//         )}

//         <div className="mb-6">
//           <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
//             Tên của bạn
//           </label>
//           <div className="flex gap-2">
//             <input
//               id="userName"
//               type="text"
//               value={userName}
//               onChange={(e) => setUserName(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder="Nhập tên của bạn"
//               className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//               disabled={loading}
//               maxLength={20}
//             />
//             <button
//               type="button"
//               onClick={() => setUserName(generateRandomName())}
//               className="px-3 py-3 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
//               disabled={loading}
//               title="Tạo tên ngẫu nhiên"
//             >
//               🎲
//             </button>
//           </div>
//           <p className="text-xs text-gray-500 mt-1">Tối đa 20 ký tự</p>
//         </div>

//         <button
//           onClick={handleJoin}
//           disabled={loading || !userName.trim()}
//           className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
//             loading || !userName.trim()
//               ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
//               : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95 shadow-lg hover:shadow-xl'
//           }`}
//         >
//           {loading ? (
//             <div className="flex items-center justify-center">
//               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//               Đang xử lý...
//             </div>
//           ) : (
//             '🚀 Tham gia Quiz'
//           )}
//         </button>

//         <div className="mt-6 text-center text-sm text-gray-500">
//           <p>Nhấn Enter hoặc click nút để tham gia</p>
//           <p className="mt-2">🎯 Hệ thống tự động quản lý phòng chơi</p>
//         </div>
//       </div>

//       {/* Quick Actions */}
//       <div className="mt-6 flex gap-4">
//         <button
//           onClick={() => setUserName(generateRandomName())}
//           disabled={loading}
//           className="text-blue-600 hover:text-blue-800 text-sm underline font-medium"
//         >
//           🎲 Tên ngẫu nhiên
//         </button>
//         <span className="text-gray-400">•</span>
//         <button
//           onClick={() => setUserName("TestUser" + Date.now().toString().slice(-3))}
//           disabled={loading}
//           className="text-blue-600 hover:text-blue-800 text-sm underline font-medium"
//         >
//           🧪 Test User
//         </button>
//         <span className="text-gray-400">•</span>
//         <button
//           onClick={() => navigate('/')}
//           className="text-gray-500 hover:text-gray-700 text-sm underline"
//         >
//           ← Trang chủ
//         </button>
//       </div>

//       {/* Features Info */}
//       <div className="mt-8 max-w-md w-full">
//         <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
//           <h3 className="font-semibold text-gray-800 mb-2">🌟 Tính năng</h3>
//           <ul className="text-sm text-gray-600 space-y-1">
//             <li>• Multiplayer real-time</li>
//             <li>• Điểm số giảm dần theo thời gian</li>
//             <li>• Bảng xếp hạng live</li>
//             <li>• Tự động tạo phòng mới</li>
//             <li>• Podium cho top 3</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default JoinQuiz;
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, set, get, DatabaseReference, db } from "../config/firebase";

const JoinQuiz: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showWarning, setShowWarning] = useState<string>("");
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const generateRoomId = () => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `room_${timestamp}_${randomStr}`;
  };

  const handleJoinRoom = async () => {
    setLoading(true);
    setShowWarning("");

    try {
      let targetRoomId: string;

      // Nếu không có quizId, tạo phòng mới
      if (!quizId) {
        targetRoomId = generateRoomId();
        setShowWarning("Đang tạo phòng mới...");
      } else {
        // Kiểm tra trạng thái phòng hiện tại
        const statusRef = ref(db, `quizzes/${quizId}/status`);
        const statusSnapshot = await get(statusRef);
        const status = statusSnapshot.val();

        // Nếu quiz đã bắt đầu hoặc đã hoàn thành, tạo phòng mới
        if (status?.isStarted || status?.isCompleted) {
          targetRoomId = generateRoomId();
          setShowWarning("Tạo phòng mới vì quiz đang chạy/đã kết thúc...");
        } else {
          targetRoomId = quizId;
        }
      }

      // Khởi tạo trạng thái quiz nếu chưa có
      const statusRef = ref(db, `quizzes/${targetRoomId}/status`);
      const statusSnapshot = await get(statusRef);
      if (!statusSnapshot.exists()) {
        await set(statusRef, {
          isStarted: false,
          startedAt: null,
          startedBy: null,
          isCompleted: false,
          completedAt: null,
          createdBy: null, // Sẽ set khi có người đầu tiên nhập tên
          createdAt: Date.now()
        });
      }

      // Khởi tạo currentState
      const currentStateRef = ref(db, `quizzes/${targetRoomId}/currentState`);
      const currentStateSnapshot = await get(currentStateRef);
      if (!currentStateSnapshot.exists()) {
        await set(currentStateRef, {
          questionIndex: 0,
          timeLeft: 30,
          phase: 'waiting',
          maxTimePerQuestion: 30
        });
      }

      // Khởi tạo quiz info
      const infoRef = ref(db, `quizzes/${targetRoomId}/info`);
      const infoSnapshot = await get(infoRef);
      if (!infoSnapshot.exists()) {
        await set(infoRef, {
          title: `Quiz Room ${targetRoomId.split('_')[1]}`,
          totalQuestions: 5,
          pointsPerQuestion: 100,
          description: "Multiplayer Quiz Game",
          createdAt: Date.now()
        });
      }
      
      // Lưu room ID vào localStorage (chưa có userName)
      localStorage.setItem("quizId", targetRoomId);
      localStorage.removeItem("userName"); // Xóa userName cũ nếu có
      
      console.log(`Joining room ${targetRoomId}`);
      
      // Chuyển đến phòng chờ
      navigate(`/quiz/${targetRoomId}/waiting`);
      
    } catch (error) {
      console.error("Lỗi khi tham gia:", error);
      setShowWarning("Đã có lỗi xảy ra! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    setShowWarning("Đang tạo phòng mới...");

    try {
      const newRoomId = generateRoomId();
      
      // Khởi tạo phòng mới
      const statusRef = ref(db, `quizzes/${newRoomId}/status`);
      await set(statusRef, {
        isStarted: false,
        startedAt: null,
        startedBy: null,
        isCompleted: false,
        completedAt: null,
        createdBy: null, // Sẽ set khi có người đầu tiên nhập tên
        createdAt: Date.now()
      });

      const currentStateRef = ref(db, `quizzes/${newRoomId}/currentState`);
      await set(currentStateRef, {
        questionIndex: 0,
        timeLeft: 30,
        phase: 'waiting',
        maxTimePerQuestion: 30
      });

      const infoRef = ref(db, `quizzes/${newRoomId}/info`);
      await set(infoRef, {
        title: `Quiz Room ${newRoomId.split('_')[1]}`,
        totalQuestions: 5,
        pointsPerQuestion: 100,
        description: "Multiplayer Quiz Game",
        createdAt: Date.now()
      });
      
      localStorage.setItem("quizId", newRoomId);
      localStorage.removeItem("userName"); // Xóa userName cũ nếu có
      
      console.log(`Created new room ${newRoomId}`);
      
      // Chuyển đến phòng chờ
      navigate(`/quiz/${newRoomId}/waiting`);
      
    } catch (error) {
      console.error("Lỗi khi tạo phòng:", error);
      setShowWarning("Đã có lỗi xảy ra! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border border-blue-200 text-blue-800 px-6 py-4 rounded-lg mb-8 max-w-md text-center shadow-lg">
        <p className="font-bold text-lg">🎮 MULTIPLAYER QUIZ</p>
        <p className="text-sm mt-1">Tham gia hoặc tạo phòng chơi mới</p>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border border-gray-200">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          {quizId ? 'Tham gia Quiz' : 'Quiz Game'}
        </h1>
        
        {quizId && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 text-center">
              <span className="font-semibold">Room ID:</span> 
            </p>
            <p className="font-mono text-xl font-bold text-blue-800 text-center mt-1">
              {quizId}
            </p>
            <p className="text-xs text-blue-600 mt-2 text-center">
              ✨ Hệ thống sẽ tự động tạo phòng mới nếu cần
            </p>
          </div>
        )}

        {/* Warning Message */}
        {showWarning && (
          <div className="mb-4 p-3 bg-orange-100 border border-orange-400 text-orange-700 rounded-lg">
            <p className="text-sm font-medium text-center">{showWarning}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {quizId ? (
            // Nếu có quizId, chỉ hiển thị nút tham gia
            <button
              onClick={handleJoinRoom}
              disabled={loading}
              className={`w-full py-4 px-4 rounded-lg font-semibold text-lg transition-all ${
                loading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang vào phòng...
                </div>
              ) : (
                '🚀 Vào Phòng Chờ'
              )}
            </button>
          ) : (
            // Nếu không có quizId, hiển thị 2 tùy chọn
            <>
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className={`w-full py-4 px-4 rounded-lg font-semibold text-lg transition-all ${
                  loading
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600 active:scale-95 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang tạo phòng...
                  </div>
                ) : (
                  '🆕 Tạo Phòng Mới'
                )}
              </button>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="px-4 text-gray-500 text-sm">hoặc</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              <button
                onClick={() => {
                  const roomId = prompt("Nhập Room ID để tham gia:");
                  if (roomId) {
                    navigate(`/quiz/${roomId}`);
                  }
                }}
                disabled={loading}
                className={`w-full py-4 px-4 rounded-lg font-semibold text-lg transition-all border-2 ${
                  loading
                    ? 'bg-gray-100 text-gray-600 border-gray-300 cursor-not-allowed'
                    : 'bg-white text-blue-500 border-blue-500 hover:bg-blue-50 active:scale-95 shadow-lg hover:shadow-xl'
                }`}
              >
                🔗 Tham Gia Bằng Room ID
              </button>
            </>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          {quizId ? (
            <p>Bạn sẽ nhập tên trong phòng chờ</p>
          ) : (
            <p>Chọn tạo phòng mới hoặc tham gia phòng có sẵn</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => navigate('/')}
          className="text-gray-500 hover:text-gray-700 text-sm underline"
        >
          ← Trang chủ
        </button>
      </div>

      {/* Features Info */}
      <div className="mt-8 max-w-md w-full">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-2">🌟 Tính năng</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Multiplayer real-time</li>
            <li>• Điểm số giảm dần theo thời gian</li>
            <li>• Bảng xếp hạng live</li>
            <li>• Tự động tạo phòng mới khi cần</li>
            <li>• Podium cho top 3</li>
            <li>• Nhập tên trong phòng chờ</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JoinQuiz;