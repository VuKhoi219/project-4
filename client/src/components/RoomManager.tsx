import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, get, set, DatabaseReference, db } from "../config/firebase";

const RoomManager: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [quizStatus, setQuizStatus] = useState<any>(null);
  const [showOptions, setShowOptions] = useState(false);
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    checkQuizStatus();
  }, [quizId]);

  const checkQuizStatus = async () => {
    if (!quizId) return;

    try {
      const statusRef = ref(db, `quizzes/${quizId}/status`);
      const statusSnapshot = await get(statusRef);
      const status = statusSnapshot.val();

      setQuizStatus(status);
      setLoading(false);

      if (!status) {
        // Quiz doesn't exist, redirect to join
        navigate(`/quiz/${quizId}/join`);
      } else if (!status.isStarted) {
        // Quiz not started, check if user is already joined
        if (userName) {
          const userRef = ref(db, `quizzes/${quizId}/participants/${userName}`);
          const userSnapshot = await get(userRef);
          
          if (userSnapshot.exists()) {
            // User already joined, go to waiting room
            navigate(`/quiz/${quizId}/waiting`);
          } else {
            // User not joined, go to join page
            navigate(`/quiz/${quizId}/join`);
          }
        } else {
          navigate(`/quiz/${quizId}/join`);
        }
      } else {
        // Quiz is active, show options
        setShowOptions(true);
      }
    } catch (error) {
      console.error("Error checking quiz status:", error);
      setLoading(false);
    }
  };

  const createNewRoom = async () => {
    if (!quizId) return;

    try {
      setLoading(true);
      
      // Generate new room ID based on original quiz
      const timestamp = Date.now();
      const newRoomId = `${quizId}_room_${timestamp}`;
      
      // Create new room with same base quiz ID but independent state
      const newRoomRef = ref(db, `quizzes/${newRoomId}`);
      await set(newRoomRef, {
        originalQuizId: quizId,
        createdAt: timestamp,
        status: {
          isStarted: false,
          startedAt: null,
          startedBy: null,
          isCompleted: false,
          completedAt: null
        },
        participants: {},
        leaderboard: {},
        playHistory: {}
      });

      console.log(`Created new room: ${newRoomId}`);
      
      // Redirect to new room
      navigate(`/quiz/${newRoomId}/join`);
      
    } catch (error) {
      console.error("Error creating new room:", error);
      alert("Không thể tạo phòng mới!");
      setLoading(false);
    }
  };

  const joinActiveQuiz = async () => {
    // For now, we'll create a new room since joining mid-game is complex
    // In a full implementation, you'd need to sync the current question state
    createNewRoom();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Đang kiểm tra trạng thái quiz...</p>
        </div>
      </div>
    );
  }

  if (!showOptions) {
    return null; // Will redirect automatically
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('vi-VN');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Quiz Đang Hoạt Động</h1>
          <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded">
            <p className="font-semibold">⚡ Quiz này đang được chơi</p>
            <p className="text-sm mt-1">
              Bắt đầu: {quizStatus?.startedAt ? formatTime(quizStatus.startedAt) : 'Không rõ'}
            </p>
            <p className="text-sm">
              Bởi: {quizStatus?.startedBy || 'Không rõ'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border">
            <h3 className="font-semibold text-blue-800 mb-2">🎮 Tạo Phòng Mới</h3>
            <p className="text-sm text-blue-600 mb-3">
              Tạo một phòng chơi mới với cùng bộ câu hỏi. Bạn có thể mời bạn bè tham gia!
            </p>
            <button
              onClick={createNewRoom}
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 font-semibold transition-colors"
            >
              Tạo Phòng Mới
            </button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-semibold text-gray-700 mb-2">⏳ Chờ Phòng Hiện Tại</h3>
            <p className="text-sm text-gray-600 mb-3">
              Đợi cho đến khi quiz hiện tại kết thúc (không khuyến nghị)
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500 font-semibold transition-colors"
            >
              Kiểm Tra Lại
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-500 hover:text-blue-700 text-sm underline"
          >
            ← Về trang chủ
          </button>
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>Quiz ID: {quizId}</p>
          <p>Hệ thống tự động tạo phòng mới để không làm gián đoạn người chơi khác</p>
        </div>
      </div>
    </div>
  );
};

export default RoomManager;