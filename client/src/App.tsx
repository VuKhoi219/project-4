
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

            {/* 
              Các route cho một phòng chơi cụ thể.
              Tất cả các trang liên quan đến một game đang diễn ra đều cần cả quizId và roomId.
            */}
            <Route path="/quiz/:quizId/room/:roomId" element={<QuizController />} />
            <Route path="/quiz/:quizId/room/:roomId/waiting" element={<WaitingRoom />} />
            <Route path="/quiz/:quizId/room/:roomId/play" element={<QuizPlay />} />
            <Route path="/quiz/:quizId/room/:roomId/leaderboard" element={<Leaderboard />} />
            <Route path='/quiz/:quizId/room/:roomId/final-results' element={<FinalResults />} />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </>

  );
}

export default App;
