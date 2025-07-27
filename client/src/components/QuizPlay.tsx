import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, set, get, update, db } from "../config/firebase";
import { Question } from "../types";

// Mock API - sẽ thay thế bằng API thật
const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    correctAnswer: "Paris",
    timeLimit: 30
  },
  {
    id: 2,
    text: "Which planet is known as the Red Planet?",
    options: ["Mars", "Jupiter", "Venus", "Mercury"],
    correctAnswer: "Mars",
    timeLimit: 30
  },
  {
    id: 3,
    text: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4",
    timeLimit: 30
  },
  {
    id: 4,
    text: "Who painted the Mona Lisa?",
    options: ["Leonardo da Vinci", "Pablo Picasso", "Vincent van Gogh", "Michelangelo"],
    correctAnswer: "Leonardo da Vinci",
    timeLimit: 30
  },
  {
    id: 5,
    text: "What is the largest ocean on Earth?",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
    correctAnswer: "Pacific Ocean",
    timeLimit: 30
  }
];

// Hàm tính điểm theo thời gian (điểm giảm dần)
const calculateScore = (timeLeft: number, maxTime: number, maxPoints: number = 100): number => {
  if (timeLeft <= 0) return 0;
  // Điểm = maxPoints * (timeLeft / maxTime)
  // Đảm bảo ít nhất 10% điểm nếu trả lời đúng
  const minScore = Math.floor(maxPoints * 0.1);
  const timeScore = Math.floor(maxPoints * (timeLeft / maxTime));
  return Math.max(minScore, timeScore);
};

const QuizPlay: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  
  // Game states: get-ready, playing, show-answer, leaderboard, final-results
  const [gameState, setGameState] = useState<'get-ready' | 'playing' | 'show-answer' | 'leaderboard' | 'final-results'>('get-ready');
  const [participants, setParticipants] = useState<Record<string, any>>({});
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [quizStatus, setQuizStatus] = useState<any>({});
  const [leaderboardCountdown, setLeaderboardCountdown] = useState<number>(5);
  const [showAnswerCountdown, setShowAnswerCountdown] = useState<number>(3);

  // Sử dụng useRef để tránh stale closure
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameStateRef = useRef(gameState);
  const timeLeftRef = useRef(timeLeft);
  const currentQuestionRef = useRef(currentQuestion);

  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "TestUser";

  const isHost = useMemo(() => {
    return quizStatus.createdBy === userName || quizStatus.startedBy === userName;
  }, [quizStatus, userName]);

  // Tính toán leaderboard từ participants
  const leaderboard = useMemo(() => {
    return Object.entries(participants)
      .map(([name, data]: [string, any]) => ({
        name,
        score: data.score || 0,
        isCurrentPlayer: name === userName
      }))
      .sort((a, b) => b.score - a.score);
  }, [participants, userName]);

  // Top 5 cho bảng xếp hạng tạm thời
  const topLeaderboard = useMemo(() => leaderboard.slice(0, 5), [leaderboard]);

  // Cập nhật refs khi state thay đổi
  useEffect(() => {
    gameStateRef.current = gameState;
    timeLeftRef.current = timeLeft;
    currentQuestionRef.current = currentQuestion;
  }, [gameState, timeLeft, currentQuestion]);

  // Cleanup timer khi component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Reset answer state khi chuyển câu hỏi mới
  useEffect(() => {
    console.log('Resetting answer state for new question:', currentQuestion);
    setHasAnswered(false);
    setSelectedAnswer("");
    setShowResult(false);
    setIsCorrect(false);
    setEarnedPoints(0);
  }, [currentQuestion]); // Chỉ trigger khi currentQuestion thay đổi

  // Reset timer khi bắt đầu phase playing
  useEffect(() => {
    if (gameState === 'playing' && !hasAnswered) {
      const currentQ = questions[currentQuestion];
      setTimeLeft(currentQ?.timeLimit || 30);
    }
  }, [gameState, currentQuestion, hasAnswered, questions]);

  // Client timer cho non-host
  useEffect(() => {
    if (isHost || gameState !== 'playing') return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev > 1) return prev - 1;
        return 0;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isHost, gameState]);

  // Host timer - điều khiển toàn bộ game flow
  useEffect(() => {
    if (!isHost) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (gameState === 'get-ready') {
      // 3 giây chuẩn bị
      let countdown = 3;
      timerRef.current = setInterval(async () => {
        countdown--;
        if (countdown <= 0) {
          clearInterval(timerRef.current!);
          await startQuestion();
        }
      }, 1000);
      
    } else if (gameState === 'playing') {
      // Timer cho câu hỏi
      timerRef.current = setInterval(async () => {
        const currentTime = timeLeftRef.current;
        const newTime = Math.max(0, currentTime - 1);
        
        try {
          await set(ref(db, `quizzes/${quizId}/currentState/timeLeft`), newTime);
          
          if (newTime <= 0) {
            clearInterval(timerRef.current!);
            await showCorrectAnswer();
          }
        } catch (error) {
          console.error("Error updating timer:", error);
          setTimeLeft(newTime);
          if (newTime <= 0) {
            clearInterval(timerRef.current!);
            await showCorrectAnswer();
          }
        }
      }, 1000);
      
    } else if (gameState === 'show-answer') {
      // 3 giây hiển thị đáp án
      let countdown = 3;
      setShowAnswerCountdown(countdown);
      
      timerRef.current = setInterval(async () => {
        countdown--;
        setShowAnswerCountdown(countdown);
        
        if (countdown <= 0) {
          clearInterval(timerRef.current!);
          await showLeaderboard();
        }
      }, 1000);
      
    } else if (gameState === 'leaderboard') {
      // 5 giây hiển thị bảng xếp hạng
      let countdown = 5;
      setLeaderboardCountdown(countdown);
      
      timerRef.current = setInterval(async () => {
        countdown--;
        setLeaderboardCountdown(countdown);
        
        if (countdown <= 0) {
          clearInterval(timerRef.current!);
          await moveToNextQuestion();
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isHost, gameState, quizId]);

  // Main Firebase listeners
  useEffect(() => {
    if (!quizId || !userName) {
      navigate('/');
      return;
    }

    const statusRef = ref(db, `quizzes/${quizId}/status`);
    const unsub1 = onValue(statusRef, (snapshot) => {
      const status = snapshot.val();
      if (!status) { 
        navigate('/'); 
        return; 
      }
      setQuizStatus(status);
      setLoading(false);
      if (status.isCompleted) { 
        navigate(`/quiz/${quizId}/final-results`); 
      }
    });

    const participantsRef = ref(db, `quizzes/${quizId}/participants`);
    const unsub2 = onValue(participantsRef, (snapshot) => { 
      setParticipants(snapshot.val() || {}); 
    });

    const currentStateRef = ref(db, `quizzes/${quizId}/currentState`);
    const unsub3 = onValue(currentStateRef, (snapshot) => {
      const state = snapshot.val();
      
      if (state) {
        const isNewQuestion = state.questionIndex !== currentQuestionRef.current;
        const newGameState = state.phase || 'get-ready';
        
        console.log('Firebase state update:', { 
          isNewQuestion, 
          newGameState, 
          questionIndex: state.questionIndex, 
          timeLeft: state.timeLeft 
        });
        
        setCurrentQuestion(state.questionIndex || 0);
        setTimeLeft(state.timeLeft || 30);
        setGameState(newGameState);
        
        // CHỈ reset khi thực sự chuyển sang câu hỏi mới
        if (isNewQuestion) {
          console.log('New question detected, resetting answer states');
          setHasAnswered(false);
          setSelectedAnswer("");
          setShowResult(false);
          setIsCorrect(false);
          setEarnedPoints(0);
        }
        
        // Reset countdown cho các phase mới
        if (newGameState === 'leaderboard') {
          setLeaderboardCountdown(5);
        } else if (newGameState === 'show-answer') {
          setShowAnswerCountdown(3);
        }
      }
    });

    return () => { 
      unsub1(); 
      unsub2(); 
      unsub3(); 
    };
  }, [quizId, userName, navigate]);

  // Host functions
  const startQuestion = async () => {
    try {
      await set(ref(db, `quizzes/${quizId}/currentState`), {
        questionIndex: currentQuestionRef.current,
        timeLeft: questions[currentQuestionRef.current]?.timeLimit || 30,
        phase: 'playing',
        maxTimePerQuestion: 30
      });
    } catch (error) {
      console.error("Error starting question:", error);
    }
  };

  const showCorrectAnswer = async () => {
    try {
      await set(ref(db, `quizzes/${quizId}/currentState/phase`), 'show-answer');
    } catch (error) {
      console.error("Error showing answer:", error);
    }
  };

  const showLeaderboard = async () => {
    try {
      await set(ref(db, `quizzes/${quizId}/currentState/phase`), 'leaderboard');
    } catch (error) {
      console.error("Error showing leaderboard:", error);
    }
  };

  const moveToNextQuestion = async () => {
    try {
      const nextQuestionIndex = currentQuestionRef.current + 1;
      
      if (nextQuestionIndex < questions.length) {
        // Chuyển câu tiếp theo
        await set(ref(db, `quizzes/${quizId}/currentState`), {
          questionIndex: nextQuestionIndex,
          timeLeft: questions[nextQuestionIndex].timeLimit || 30,
          phase: 'playing'
        });
      } else {
        // Kết thúc quiz
        await update(ref(db, `quizzes/${quizId}/status`), {
          isCompleted: true,
          completedAt: Date.now()
        });
        
        // Cập nhật leaderboard cuối cùng
        await updateFinalLeaderboard();
      }
    } catch (error) {
      console.error("Error moving to next question:", error);
    }
  };

  const updateFinalLeaderboard = async () => {
    try {
      const updates: Record<string, any> = {};
      
      leaderboard.forEach((player, index) => {
        updates[`leaderboard/${player.name}`] = {
          rank: index + 1,
          bestScore: player.score,
          averageScore: player.score / questions.length,
          lastPlayed: Date.now()
        };
      });
      
      await update(ref(db, `quizzes/${quizId}`), updates);
    } catch (error) {
      console.error("Error updating final leaderboard:", error);
    }
  };

  // Player functions
  const handleAnswer = async (answer: string) => {
    console.log('handleAnswer called:', { 
      hasAnswered, 
      gameState, 
      timeLeft, 
      currentQuestion,
      answer 
    });
    
    // Kiểm tra điều kiện nghiêm ngặt
    if (hasAnswered || gameState !== 'playing' || timeLeft <= 0) {
      console.log('Cannot answer - conditions not met:', { hasAnswered, gameState, timeLeft });
      return;
    }
    
    console.log('Processing answer...');
    
    const currentQ = questions[currentQuestion];
    const correct = answer === currentQ.correctAnswer;
    const points = correct ? calculateScore(timeLeft, currentQ.timeLimit || 30) : 0;
    const newTotal = totalScore + points;
    
    // Set state ngay lập tức để prevent double clicks
    setHasAnswered(true);
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setShowResult(true);
    setEarnedPoints(points);
    setTotalScore(newTotal);
    
    console.log('Answer processed:', { answer, correct, points, newTotal });
    
    try {
      // Cập nhật Firebase
      await update(ref(db, `quizzes/${quizId}/participants/${userName}`), { 
        score: newTotal,
        lastAnswered: Date.now(),
        hasAnsweredCurrentQuestion: true,
        currentQuestionAnswered: currentQuestion
      });
      
      const attemptRef = ref(db, `quizzes/${quizId}/playHistory/${userName}/attempts/${Date.now()}`);
      await set(attemptRef, {
        questionId: currentQuestion + 1,
        answer: answer,
        isCorrect: correct,
        score: points,
        timeLeft: timeLeft,
        playedAt: Date.now()
      });
      
      console.log('Firebase updated successfully');
      
    } catch (error) { 
      console.error("Error saving answer:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Đang tải quiz...</p>
        </div>
      </div>
    );
  }
  
  // Get Ready Screen
  if (gameState === 'get-ready') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gradient-to-br from-indigo-600 to-purple-700 p-4">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold animate-pulse mb-4">Sẵn sàng!</h1>
          <p className="text-xl md:text-2xl mb-8">Quiz sắp bắt đầu...</p>
          
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 max-w-md">
            <p className="text-lg mb-2">Câu hỏi đầu tiên:</p>
            <p className="text-sm bg-indigo-700 bg-opacity-50 p-3 rounded">
              {questions[0]?.text}
            </p>
          </div>
          
          <div className="mt-8 text-sm opacity-75">
            <p>💡 Trả lời nhanh để được điểm cao!</p>
            <p>🏆 Điểm số sẽ giảm dần theo thời gian</p>
          </div>
        </div>
      </div>
    );
  }

  // Show Answer Screen
  if (gameState === 'show-answer') {
    const currentQ = questions[currentQuestion];
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-orange-500 to-red-600 text-white">
        <div className="w-full max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">📝 Đáp án đúng</h1>
          
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 mb-6">
            <p className="text-xl mb-4">{currentQ.text}</p>
            <div className="text-3xl font-bold bg-green-500 bg-opacity-80 p-4 rounded-lg">
              ✅ {currentQ.correctAnswer}
            </div>
          </div>

          {/* Personal Result */}
          {showResult && (
            <div className={`mb-6 p-4 rounded-lg ${
              isCorrect 
                ? 'bg-green-500 bg-opacity-80' 
                : 'bg-red-500 bg-opacity-80'
            }`}>
              <p className="text-2xl font-bold mb-2">
                {isCorrect ? '🎉 Chính xác!' : '❌ Sai rồi!'}
              </p>
              <p className="text-lg">
                Bạn được: <span className="font-bold">{earnedPoints} điểm</span>
              </p>
              <p className="text-sm opacity-90">
                Tổng điểm: {totalScore}
              </p>
            </div>
          )}

          <div className="text-center">
            <p className="text-lg mb-2">Hiển thị bảng xếp hạng sau:</p>
            <div className="text-4xl font-bold animate-pulse">{showAnswerCountdown}</div>
          </div>
        </div>
      </div>
    );
  }

  // Leaderboard Screen
  if (gameState === 'leaderboard') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-purple-600 to-blue-600 text-white">
        <div className="w-full max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">🏆 Bảng Xếp Hạng</h1>
          <p className="text-xl mb-2">Sau câu hỏi {currentQuestion + 1}/{questions.length}</p>
          
          {/* Countdown */}
          <div className="mb-8">
            <p className="text-lg mb-2">
              {currentQuestion + 1 < questions.length ? 'Câu tiếp theo sau:' : 'Kết thúc sau:'}
            </p>
            <div className="text-6xl font-bold animate-pulse">{leaderboardCountdown}</div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6">
            <div className="space-y-3">
              {topLeaderboard.map((player, index) => (
                <div
                  key={player.name}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                    player.isCurrentPlayer
                      ? 'bg-yellow-400 bg-opacity-30 ring-2 ring-yellow-300 scale-105 transform'
                      : 'bg-white bg-opacity-10'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-400 text-orange-900' :
                      'bg-blue-400 text-blue-900'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1)}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg">
                        {player.name}
                        {player.isCurrentPlayer && ' (Bạn)'}
                      </p>
                      <p className="text-sm opacity-90">
                        Rank #{index + 1}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {player.score}
                    </div>
                    <div className="text-sm opacity-90">
                      điểm
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((5 - leaderboardCountdown) / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Playing Screen
  if (!questions || !questions[currentQuestion]) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Lỗi tải câu hỏi.</p>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const participantCount = Object.keys(participants).length;

  // Debug logging cho render
  console.log('Render state:', { 
    hasAnswered, 
    gameState, 
    timeLeft, 
    currentQuestion,
    selectedAnswer 
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
            <p className="text-sm text-blue-600 font-semibold mb-1">
              🎮 MULTIPLAYER QUIZ - {participantCount} người chơi
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Câu hỏi {currentQuestion + 1}/{questions.length}
            </h1>
            <div className="flex justify-center items-center space-x-6 mt-2">
              <p className="text-lg font-semibold text-green-600">
                💰 Tổng điểm: {totalScore}
              </p>
              <p className="text-sm text-gray-600">
                🏅 Rank: #{leaderboard.findIndex(p => p.name === userName) + 1}
              </p>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6 text-center">
          <p className="text-xl md:text-2xl font-medium text-gray-800">
            {currentQ.text}
          </p>
        </div>

        {/* Timer */}
        {gameState === 'playing' && !hasAnswered && (
          <div className="mb-6 text-center">
            <p className={`text-lg font-bold mb-2 ${
              timeLeft <= 10 ? 'text-red-500' : 'text-blue-600'
            }`}>
              ⏱️ {timeLeft}s
            </p>
            <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
              <div
                className={`h-4 rounded-full transition-all duration-1000 ease-linear ${
                  timeLeft <= 10 ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${(timeLeft / (currentQ.timeLimit || 30)) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              💡 Điểm hiện tại nếu trả lời đúng: {calculateScore(timeLeft, currentQ.timeLimit || 30)} điểm
            </p>
          </div>
        )}

        {/* Personal Result */}
        {showResult && (
          <div className={`mb-6 p-4 rounded-lg text-center ${
            isCorrect 
              ? 'bg-green-100 border-2 border-green-400' 
              : 'bg-red-100 border-2 border-red-400'
          }`}>
            <p className={`text-xl font-bold mb-2 ${
              isCorrect ? 'text-green-700' : 'text-red-700'
            }`}>
              {isCorrect ? '🎉 Chính xác!' : '❌ Sai rồi!'}
            </p>
            <p className="text-lg font-semibold">
              Bạn được: <span className="text-blue-600">+{earnedPoints} điểm</span>
            </p>
          </div>
        )}

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {currentQ.options.map((option, index) => {
            const isDisabled = hasAnswered || gameState !== 'playing' || timeLeft <= 0;
            const isCorrectAnswer = option === currentQ.correctAnswer;
            const isSelectedAnswer = option === selectedAnswer;
            
            return (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={isDisabled}
                className={`p-4 rounded-lg font-medium transition-all text-left border-2 ${
                  isDisabled
                    ? isCorrectAnswer
                      ? 'bg-green-500 text-white border-green-600 ring-4 ring-green-300 transform scale-105'
                      : isSelectedAnswer
                      ? 'bg-red-500 text-white border-red-600'
                      : 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-800 border-gray-300 hover:bg-blue-50 hover:border-blue-400 active:scale-95 shadow-lg hover:shadow-xl cursor-pointer'
                }`}
              >
                <span className="text-sm font-bold mr-3 px-2 py-1 bg-gray-200 rounded text-gray-700">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
              </button>
            );
          })}
        </div>

        {/* Status Messages */}
        {hasAnswered && gameState === 'playing' && (
          <div className="text-center text-gray-600 bg-white p-4 rounded-lg shadow">
            <p className="font-semibold">✅ Đã trả lời!</p>
            <p className="text-sm">Đang chờ hết thời gian... ({timeLeft}s)</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-xs text-gray-500 text-center space-y-1">
        <p>Room: {quizId} | Player: {userName} {isHost && '(Host)'}</p>
        <p>State: {gameState} | hasAnswered: {hasAnswered.toString()}</p>
      </div>
    </div>
  );
};

export default QuizPlay;