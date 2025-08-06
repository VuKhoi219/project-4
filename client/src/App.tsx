// import React from 'react';
// import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import JoinQuiz from "./components/JoinQuiz";
import WaitingRoom from "./components/WaitingRoom";
import QuizPlay from "./components/QuizPlay";
import Leaderboard from "./components/Leaderboard";
import QuizController from "./components/QuizController";
import FinalResult from "./components/FinalResults"
import Home from "./components/Home"
import AddQuestion from "./components/AddQuestion";
import Login from "./components/Login";
import Register from "./components/Register";

function App() {
  return (
    <>
      <Router>
        <div className="min-h-screen bg-gray-100">
          {/* <Routes>
            <Route path="/quiz/:quizId" element={<QuizController />} />
            <Route path="/quiz/:quizId/join" element={<JoinQuiz />} />
            <Route path="/quiz/:quizId/waiting" element={<WaitingRoom />} />
            <Route path="/quiz/:quizId/play" element={<QuizPlay />} />
            <Route path="/quiz/:quizId/leaderboard" element={<Leaderboard />} />
            <Route path="/quiz/:quizId/room-manager" element={<RoomManager />} />
            <Route path='/quiz/:quizId/final-results' element={<FinalResult/>}/>
          </Routes> */}
                  <Routes>
            {/* 
              Route mặc định để tạo/tham gia quiz.
              - /quiz/new -> Người dùng muốn tạo một bộ đề quiz mới (tính năng tương lai).
              - /quiz/:quizId -> Người dùng muốn xem/tham gia một bộ đề có sẵn, sẽ được chuyển đến trang JoinQuiz để tạo phòng.
            */}
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
            <Route path='/quiz/:quizId/room/:roomId/final-results' element={<FinalResult />} />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </>

  );
}

export default App;
