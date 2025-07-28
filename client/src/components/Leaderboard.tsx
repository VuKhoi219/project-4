
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ref, onValue, update, get, DatabaseReference, db } from "../config/firebase";
import { LeaderboardEntry } from "../types";

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<[string, LeaderboardEntry][]>([]);
  const [participants, setParticipants] = useState<Record<string, any>>({});
  const [quizInfo, setQuizInfo] = useState<any>(null);
  const [playHistory, setPlayHistory] = useState<Record<string, any>>({});
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
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

    // Load leaderboard data
    const leaderboardRef: DatabaseReference = ref(db, `quizzes/${quizId}/leaderboard`);
    const unsubscribeLeaderboard = onValue(leaderboardRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const leaderboardData = data as Record<string, LeaderboardEntry>;
        const sorted = Object.entries(leaderboardData).sort((a, b) => b[1].bestScore - a[1].bestScore);
        setLeaderboard(sorted);
      }
      setLoading(false);
    });

    // Load participants for current scores
    const participantsRef = ref(db, `quizzes/${quizId}/participants`);
    const unsubscribeParticipants = onValue(participantsRef, (snapshot) => {
      setParticipants(snapshot.val() || {});
    });

    // Load play history
    const historyRef = ref(db, `quizzes/${quizId}/playHistory`);
    const unsubscribeHistory = onValue(historyRef, (snapshot) => {
      setPlayHistory(snapshot.val() || {});
    });

    return () => {
      unsubscribeInfo();
      unsubscribeLeaderboard();
      unsubscribeParticipants();
      unsubscribeHistory();
    };
  }, [quizId, navigate]);

  const finalizeLeaderboard = async () => {
    if (!quizId) return;

    try {
      const updates: Record<string, any> = {};
      
      // Update final ranks and timestamps
      leaderboard.forEach(([userName], index) => {
        updates[`leaderboard/${userName}/rank`] = index + 1;
        updates[`leaderboard/${userName}/lastPlayed`] = Date.now();
      });

      // Mark quiz as officially completed
      updates['status/isCompleted'] = true;
      updates['status/completedAt'] = Date.now();
      
      await update(ref(db, `quizzes/${quizId}`), updates);
      alert("Bảng xếp hạng đã được chốt chính thức!");
    } catch (error) {
      console.error("Lỗi khi chốt bảng xếp hạng:", error);
      alert("Đã có lỗi xảy ra!");
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
      averageTimeLeft
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Đang tải bảng xếp hạng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            🏆 Bảng Xếp Hạng
          </h1>
          {quizInfo && (
            <div className="bg-white rounded-lg shadow-lg p-4 max-w-md mx-auto">
              <p className="text-xl font-semibold text-gray-800">{quizInfo.title}</p>
              <p className="text-sm text-gray-600 mt-1">
                {leaderboard.length} người chơi • {quizInfo.totalQuestions || 5} câu hỏi
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Room ID: {quizId}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-lg p-2 flex space-x-2">
            <button
              onClick={() => navigate(`/quiz/${quizId}/final-results`)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
            >
              🎉 Kết Quả Cuối
            </button>
            <button
              onClick={() => navigate(`/quiz/${quizId}/join`)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
            >
              🔄 Chơi Lại
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              🏠 Trang Chủ
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <h2 className="text-2xl font-bold">📊 Xếp Hạng Chính Thức</h2>
                <p className="text-blue-100 mt-1">Dựa trên điểm số cao nhất</p>
              </div>
              
              <div className="p-6">
                {leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map(([name, info], index) => {
                      const currentScore = participants[name]?.score || 0;
                      const stats = getPlayerStats(name);
                      
                      return (
                        <div
                          key={name}
                          className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-lg ${
                            name === userName
                              ? 'bg-yellow-50 border-yellow-400 scale-105 transform'
                              : selectedPlayer === name
                              ? 'bg-blue-50 border-blue-400'
                              : index < 3
                              ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedPlayer(selectedPlayer === name ? "" : name)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {/* Rank Badge */}
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                index === 1 ? 'bg-gray-300 text-gray-700' :
                                index === 2 ? 'bg-orange-400 text-orange-900' :
                                'bg-blue-400 text-blue-900'
                              }`}>
                                {index === 0 ? '🥇' : 
                                 index === 1 ? '🥈' : 
                                 index === 2 ? '🥉' : 
                                 `#${index + 1}`}
                              </div>
                              
                              {/* Player Info */}
                              <div>
                                <p className="font-bold text-lg text-gray-800">
                                  {name}
                                  {name === userName && ' (Bạn)'}
                                </p>
                                <div className="flex space-x-4 text-sm text-gray-600">
                                  <span>🏆 Best: {info.bestScore}</span>
                                  <span>📈 Current: {currentScore}</span>
                                  {stats && <span>🎯 {stats.accuracy}% đúng</span>}
                                </div>
                              </div>
                            </div>
                            
                            {/* Score Display */}
                            <div className="text-right">
                              <div className="text-2xl font-bold text-gray-800">
                                {info.bestScore}
                              </div>
                              <div className="text-sm text-gray-500">
                                điểm cao nhất
                              </div>
                            </div>
                          </div>
                          
                          {/* Expanded Details */}
                          {selectedPlayer === name && stats && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                <div className="bg-green-100 p-3 rounded-lg">
                                  <div className="text-2xl font-bold text-green-600">
                                    {stats.correctAnswers}/{stats.totalQuestions}
                                  </div>
                                  <div className="text-sm text-gray-600">Đúng/Tổng</div>
                                </div>
                                <div className="bg-blue-100 p-3 rounded-lg">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {stats.accuracy}%
                                  </div>
                                  <div className="text-sm text-gray-600">Độ chính xác</div>
                                </div>
                                <div className="bg-purple-100 p-3 rounded-lg">
                                  <div className="text-2xl font-bold text-purple-600">
                                    {stats.averageTimeLeft}s
                                  </div>
                                  <div className="text-sm text-gray-600">TB thời gian còn lại</div>
                                </div>
                                <div className="bg-orange-100 p-3 rounded-lg">
                                  <div className="text-2xl font-bold text-orange-600">
                                    {Math.round(info.bestScore / (quizInfo?.totalQuestions || 5))}
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
                    <p className="text-xl text-gray-600">Chưa có dữ liệu bảng xếp hạng</p>
                    <p className="text-sm text-gray-500 mt-2">Hãy bắt đầu chơi để thấy kết quả!</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Admin Actions */}
            {userName && leaderboard.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ Hành Động</h3>
                <div className="space-y-3">
                  <button
                    onClick={finalizeLeaderboard}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    🔒 Chốt Bảng Xếp Hạng Chính Thức
                  </button>
                  <p className="text-sm text-gray-600">
                    Chốt sẽ cập nhật thời gian hoàn thành và đánh dấu quiz đã kết thúc
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Thống Kê Nhanh</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng người chơi:</span>
                  <span className="font-bold text-blue-600">{leaderboard.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Điểm cao nhất:</span>
                  <span className="font-bold text-green-600">
                    {leaderboard.length > 0 ? leaderboard[0][1].bestScore : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Điểm trung bình:</span>
                  <span className="font-bold text-purple-600">
                    {leaderboard.length > 0 
                      ? Math.round(leaderboard.reduce((sum, [, info]) => sum + info.bestScore, 0) / leaderboard.length)
                      : 0
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Số câu hỏi:</span>
                  <span className="font-bold text-orange-600">{quizInfo?.totalQuestions || 5}</span>
                </div>
              </div>
            </div>

            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">🏅 Top 3</h3>
                <div className="space-y-3">
                  {leaderboard.slice(0, 3).map(([name, info], index) => (
                    <div
                      key={name}
                      className={`p-3 rounded-lg flex items-center space-x-3 ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200' :
                        index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200' :
                        'bg-gradient-to-r from-orange-100 to-orange-200'
                      }`}
                    >
                      <div className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{name}</p>
                        <p className="text-sm text-gray-600">{info.bestScore} điểm</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Performance */}
            {userName && leaderboard.find(([name]) => name === userName) && (
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🎯 Thành Tích Của Bạn</h3>
                {(() => {
                  const userIndex = leaderboard.findIndex(([name]) => name === userName);
                  const userInfo = leaderboard[userIndex][1];
                  const userStats = getPlayerStats(userName);
                  
                  return (
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          #{userIndex + 1}
                        </div>
                        <p className="text-sm text-gray-600">Xếp hạng của bạn</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-center">
                        <div className="bg-white bg-opacity-50 p-3 rounded-lg">
                          <div className="text-xl font-bold text-green-600">{userInfo.bestScore}</div>
                          <div className="text-xs text-gray-600">Điểm cao nhất</div>
                        </div>
                        <div className="bg-white bg-opacity-50 p-3 rounded-lg">
                          <div className="text-xl font-bold text-purple-600">
                            {participants[userName]?.score || 0}
                          </div>
                          <div className="text-xs text-gray-600">Điểm hiện tại</div>
                        </div>
                      </div>
                      
                      {userStats && (
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="bg-white bg-opacity-50 p-3 rounded-lg">
                            <div className="text-xl font-bold text-orange-600">{userStats.accuracy}%</div>
                            <div className="text-xs text-gray-600">Độ chính xác</div>
                          </div>
                          <div className="bg-white bg-opacity-50 p-3 rounded-lg">
                            <div className="text-xl font-bold text-red-600">{userStats.averageTimeLeft}s</div>
                            <div className="text-xs text-gray-600">TB thời gian</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">⏰ Hoạt Động Gần Đây</h3>
              <div className="space-y-3">
                {leaderboard
                  .sort((a, b) => (b[1].lastPlayed || 0) - (a[1].lastPlayed || 0))
                  .slice(0, 5)
                  .map(([name, info]) => (
                    <div key={name} className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-800">{name}</span>
                      <span className="text-gray-500">
                        {info.lastPlayed 
                          ? new Date(info.lastPlayed).toLocaleTimeString('vi-VN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })
                          : 'Chưa xác định'
                        }
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* Game Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">ℹ️ Thông Tin Game</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Room ID:</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {quizId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạo lúc:</span>
                  <span className="text-gray-800">
                    {quizInfo?.createdAt 
                      ? new Date(quizInfo.createdAt).toLocaleString('vi-VN')
                      : 'Không rõ'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="text-green-600 font-medium">
                    Đã hoàn thành
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🎮 Tiếp Tục Chơi?</h3>
            <p className="text-gray-600 mb-6">
              Thử thách bản thân với một phòng chơi mới hoặc xem lại kết quả cuối cùng
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  const newRoomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
                  localStorage.setItem("quizId", newRoomId);
                  navigate(`/quiz/${newRoomId}/join`);
                }}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                🆕 Tạo Phòng Mới
              </button>
              <button
                onClick={() => navigate(`/quiz/${quizId}/final-results`)}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                🏆 Xem Podium
              </button>
              <button
                onClick={() => {
                  const shareText = `Tôi vừa hoàn thành quiz multiplayer với điểm số ${
                    leaderboard.find(([name]) => name === userName)?.[1].bestScore || 0
                  }! Hãy thử thách tại: ${window.location.origin}/quiz/${quizId}`;
                  
                  if (navigator.share) {
                    navigator.share({
                      title: 'Quiz Multiplayer Results',
                      text: shareText,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(shareText);
                    alert('Đã copy link chia sẻ!');
                  }
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                📤 Chia Sẻ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;