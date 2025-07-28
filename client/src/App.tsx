// import React from 'react';
// import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JoinQuiz from "./components/JoinQuiz";
import WaitingRoom from "./components/WaitingRoom";
import QuizPlay from "./components/QuizPlay";
import Leaderboard from "./components/Leaderboard";
import QuizController from "./components/QuizController";
import RoomManager from "./components/RoomManager"
import FinalResult from "./components/FinalResults"
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/quiz/:quizId" element={<QuizController />} />
          <Route path="/quiz/:quizId/join" element={<JoinQuiz />} />
          <Route path="/quiz/:quizId/waiting" element={<WaitingRoom />} />
          <Route path="/quiz/:quizId/play" element={<QuizPlay />} />
          <Route path="/quiz/:quizId/leaderboard" element={<Leaderboard />} />
          <Route path="/quiz/:quizId/room-manager" element={<RoomManager />} />
          <Route path='/quiz/:quizId/final-results' element={<FinalResult/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
