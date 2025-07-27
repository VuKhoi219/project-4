// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ref, onValue, set, get, DatabaseReference, db } from "../config/firebase";

// const QuizController: React.FC = () => {
//   const [quizStatus, setQuizStatus] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const { quizId } = useParams<{ quizId: string }>();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!quizId) {
//       navigate('/');
//       return;
//     }

//     checkAndRedirect();
//   }, [quizId]);

//   const checkAndRedirect = async () => {
//     try {
//       // Check if quiz exists
//       const statusRef = ref(db, `quizzes/${quizId}/status`);
//       const statusSnapshot = await get(statusRef);
//       const status = statusSnapshot.val();

//       const userName = localStorage.getItem("userName");
      
//       if (!status) {
//         // Quiz doesn't exist, redirect to join to create it
//         navigate(`/quiz/${quizId}/join`);
//         return;
//       }

//       if (!userName) {
//         // No username, need to join first
//         navigate(`/quiz/${quizId}/join`);
//         return;
//       }

//       // Check if user exists in participants
//       const userRef = ref(db, `quizzes/${quizId}/participants/${userName}`);
//       const userSnapshot = await get(userRef);

//       if (!userSnapshot.exists()) {
//         // User not in participants, redirect to join
//         navigate(`/quiz/${quizId}/join`);
//         return;
//       }

//       // User exists, check quiz status
//       if (!status.isStarted) {
//         // Quiz not started, go to waiting room
//         navigate(`/quiz/${quizId}/waiting`);
//       } else if (status.isStarted && !status.isCompleted) {
//         // Quiz in progress, go to play
//         navigate(`/quiz/${quizId}/play`);
//       } else if (status.isCompleted) {
//         // Quiz completed, go to final leaderboard
//         navigate(`/quiz/${quizId}/leaderboard`);
//       }

//     } catch (error) {
//       console.error("Error in quiz controller:", error);
//       navigate(`/quiz/${quizId}/join`);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center h-screen">
//       <div className="text-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
//         <p className="text-lg">Đang kiểm tra trạng thái quiz...</p>
//         <p className="text-sm text-gray-600 mt-2">Quiz ID: {quizId}</p>
//       </div>
//     </div>
//   );
// };

// export default QuizController;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, set, get, DatabaseReference, db } from "../config/firebase";

const QuizController: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<string>("Đang kiểm tra...");
  
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!quizId) {
      navigate('/');
      return;
    }

    checkAndRedirect();
  }, [quizId]);

  const checkAndRedirect = async () => {
    try {
      setStatus("Đang kiểm tra trạng thái quiz...");
      
      // Check if quiz exists
      const statusRef = ref(db, `quizzes/${quizId}/status`);
      const statusSnapshot = await get(statusRef);
      const quizStatus = statusSnapshot.val();

      const userName = localStorage.getItem("userName");
      
      // Case 1: Quiz doesn't exist - redirect to join to create new room
      if (!quizStatus) {
        setStatus("Quiz không tồn tại. Chuyển đến trang tạo phòng...");
        setTimeout(() => {
          navigate(`/quiz/${quizId}/join`);
        }, 1500);
        return;
      }

      // Case 2: No username - need to join first
      if (!userName) {
        setStatus("Chưa có tên người chơi. Chuyển đến trang tham gia...");
        setTimeout(() => {
          navigate(`/quiz/${quizId}/join`);
        }, 1500);
        return;
      }

      // Case 3: Check if user exists in participants
      const userRef = ref(db, `quizzes/${quizId}/participants/${userName}`);
      const userSnapshot = await get(userRef);

      if (!userSnapshot.exists()) {
        setStatus("Bạn chưa tham gia quiz này. Chuyển đến trang tham gia...");
        setTimeout(() => {
          navigate(`/quiz/${quizId}/join`);
        }, 1500);
        return;
      }

      // Case 4: User exists, determine current state
      setStatus("Đang xác định trạng thái hiện tại...");

      // Check current state for more precise navigation
      const currentStateRef = ref(db, `quizzes/${quizId}/currentState`);
      const currentStateSnapshot = await get(currentStateRef);
      const currentState = currentStateSnapshot.val();

      // Quiz completed - go to final results
      if (quizStatus.isCompleted) {
        setStatus("Quiz đã hoàn thành. Chuyển đến kết quả cuối cùng...");
        setTimeout(() => {
          navigate(`/quiz/${quizId}/final-results`);
        }, 1500);
        return;
      }

      // Quiz started and in progress
      if (quizStatus.isStarted && !quizStatus.isCompleted) {
        // Check current phase
        if (currentState?.phase === 'waiting') {
          setStatus("Quiz đang trong phòng chờ...");
          setTimeout(() => {
            navigate(`/quiz/${quizId}/waiting`);
          }, 1500);
        } else {
          setStatus("Quiz đang diễn ra. Tham gia ngay...");
          setTimeout(() => {
            navigate(`/quiz/${quizId}/play`);
          }, 1500);
        }
        return;
      }

      // Quiz not started - go to waiting room
      if (!quizStatus.isStarted) {
        setStatus("Quiz chưa bắt đầu. Chuyển đến phòng chờ...");
        setTimeout(() => {
          navigate(`/quiz/${quizId}/waiting`);
        }, 1500);
        return;
      }

      // Default fallback
      setStatus("Không xác định được trạng thái. Chuyển đến trang chính...");
      setTimeout(() => {
        navigate(`/quiz/${quizId}/join`);
      }, 2000);

    } catch (error) {
      console.error("Error in quiz controller:", error);
      setError("Có lỗi xảy ra khi kiểm tra quiz. Thử lại sau vài giây...");
      
      setTimeout(() => {
        navigate(`/quiz/${quizId}/join`);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setLoading(true);
    setError("");
    checkAndRedirect();
  };

  const handleGoHome = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("quizId");
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full mx-4">
        
        {/* Loading State */}
        {loading && !error && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔍 Đang Kiểm Tra</h2>
            <p className="text-gray-600 mb-2">{status}</p>
            <div className="text-sm text-gray-500">
              <p>Quiz ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{quizId}</span></p>
              <p className="mt-1">User: {localStorage.getItem("userName") || "Chưa có"}</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Có Lỗi Xảy Ra</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            
            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                🔄 Thử Lại
              </button>
              
              <button
                onClick={() => navigate(`/quiz/${quizId}/join`)}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                ➡️ Tham Gia Quiz
              </button>
              
              <button
                onClick={handleGoHome}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                🏠 Về Trang Chủ
              </button>
            </div>
          </div>
        )}

        {/* Success State with delayed redirect */}
        {!loading && !error && (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Đang Chuyển Hướng</h2>
            <p className="text-gray-600 mb-4">{status}</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-700">
                <p><strong>Quiz ID:</strong> {quizId}</p>
                <p><strong>User:</strong> {localStorage.getItem("userName")}</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/')}
              className="text-blue-500 hover:text-blue-700 text-sm underline"
            >
              Hủy và về trang chủ
            </button>
          </div>
        )}

        {/* Navigation Help */}
        <div className="mt-6 text-xs text-gray-500 text-center border-t pt-4">
          <p className="font-semibold mb-2">🗺️ Hướng dẫn điều hướng:</p>
          <ul className="text-left space-y-1">
            <li>• Quiz chưa tồn tại → Tạo phòng mới</li>
            <li>• Chưa tham gia → Trang tham gia</li>
            <li>• Quiz chưa bắt đầu → Phòng chờ</li>
            <li>• Quiz đang diễn ra → Trang chơi</li>
            <li>• Quiz đã kết thúc → Kết quả cuối</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QuizController;