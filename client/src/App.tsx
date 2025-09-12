
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import JoinQuiz from "./components/JoinQuiz";
import WaitingRoom from "./components/WaitingRoom";
import QuizPlay from "./components/QuizPlay";
import Leaderboard from "./components/Leaderboard";
import QuizController from "./components/QuizController";
import FinalResults from "./components/FinalResults"
import Home from "./components/Home"
import Login from "./components/Login";
import Register from "./components/Register";
import CreateQuiz from "./components/CreateQuiz";
import GenQuiz from './components/GenQuiz';
import Notfound from './components/NotFoundPage';
import VerifyOtp from './components/VerifyOtp';
import ProtectedRoute from './ProtectedRoute';
import UserAnswerDetail from './components/UserAnswerDetail';

function App() {
  return (
    <>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/quiz/:quizId" element={<Navigate to="join" />} />
            <Route path="/quiz/:quizId/join" element={<JoinQuiz />} />
            <Route path="/quiz/new" element={<CreateQuiz />} />
            <Route path="/quiz/generate" element={<GenQuiz />} />
            {/* 
              Các route cho một phòng chơi cụ thể.
              Tất cả các trang liên quan đến một game đang diễn ra đều cần cả quizId và roomId.
            */}
            <Route path="/quiz/:quizId/room/:roomId" element={<QuizController />} />
            <Route
              path="/quiz/:quizId/room/:roomId/waiting"
              element={
                <ProtectedRoute>
                  <WaitingRoom />
                </ProtectedRoute>
              }
            />
            <Route path="/quiz/room/:roomId/user-answer" element={
              <ProtectedRoute>
                <UserAnswerDetail />
              </ProtectedRoute>
            } />
            <Route path="/quiz/:quizId/room/:roomId/play" element={<QuizPlay />} />
            <Route path="/quiz/:quizId/room/:roomId/leaderboard" element={<Leaderboard />} />
            <Route path='/quiz/:quizId/room/:roomId/final-results' element={<FinalResults />} />
            <Route path='/verify-otp' element={ <VerifyOtp />} />
            {/* Trang 404 */}
            <Route path='/404' element={<Notfound/> } />
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </div>
      </Router>
    </>

  );
}

export default App;
