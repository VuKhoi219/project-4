// import { useState, useEffect } from 'react';

// export const useQuizAnimations = (gameState: string, timeLeft: number, questions: any[], currentQuestionIndex: number, leaderboard: any[]) => {
//   const [animatedTimeLeft, setAnimatedTimeLeft] = useState(timeLeft);
//   const [animatedScore, setAnimatedScore] = useState(0);
//   const [displayLeaderboard, setDisplayLeaderboard] = useState<any[]>([]);

//   // Smooth animation for time left & score in playing state
//   useEffect(() => {
//     if (gameState === 'playing' && questions[currentQuestionIndex]) {
//       const questionTime = (questions[currentQuestionIndex]?.timeLimit || 30) * 1000;
//       const start = performance.now();
//       const tick = (now: number) => {
//         const elapsed = now - start;
//         const remainingMs = Math.max(0, questionTime - elapsed);
//         setAnimatedTimeLeft(remainingMs / 1000);
//         const score = (remainingMs / questionTime) * 1000;
//         setAnimatedScore(Math.max(0, score));
//         if (remainingMs > 0 && gameState === 'playing') {
//           requestAnimationFrame(tick);
//         }
//       };
//       requestAnimationFrame(tick);
//     }
//   }, [gameState, currentQuestionIndex, questions]);

//   // Animate leaderboard scores
//   useEffect(() => {
//     if (gameState === 'leaderboard' && leaderboard.length > 0) {
//       let frame = 0;
//       const duration = 1500;
//       const totalFrames = duration / 16;
//       const interval = setInterval(() => {
//         frame++;
//         setDisplayLeaderboard(
//           leaderboard.map((p) => ({
//             ...p,
//             score: Math.round((p.score * frame) / totalFrames),
//           }))
//         );
//         if (frame >= totalFrames) {
//           clearInterval(interval);
//           setDisplayLeaderboard(leaderboard);
//         }
//       }, 16);
//       return () => clearInterval(interval);
//     }
//   }, [gameState, leaderboard]);

//   return {
//     animatedTimeLeft,
//     animatedScore,
//     displayLeaderboard
//   };
// };
import { useState, useEffect, useRef } from 'react';

export const useQuizAnimations = (
  gameState: string, 
  timeLeft: number, 
  questions: any[], 
  currentQuestionIndex: number, 
  leaderboard: any[]
) => {
  const [animatedTimeLeft, setAnimatedTimeLeft] = useState(timeLeft);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [displayLeaderboard, setDisplayLeaderboard] = useState<any[]>([]);
  
  // Ref để theo dõi việc dọn dẹp animation
  const animationRef = useRef<number | null>(null);

  // Đồng bộ animatedTimeLeft với timeLeft thực tế từ Firebase
  useEffect(() => {
    setAnimatedTimeLeft(timeLeft);
    
    // Tính điểm dựa trên timeLeft thực tế
    if (gameState === 'playing' && questions[currentQuestionIndex]) {
      const maxTime = questions[currentQuestionIndex]?.timeLimit || 30;
      const score = Math.max(0, Math.floor((timeLeft / maxTime) * 1000));
      setAnimatedScore(score);
    }
  }, [timeLeft, gameState, currentQuestionIndex, questions]);

  // Reset khi chuyển câu hỏi
  useEffect(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (gameState === 'playing' && questions[currentQuestionIndex]) {
      const maxTime = questions[currentQuestionIndex]?.timeLimit || 30;
      setAnimatedTimeLeft(timeLeft);
      setAnimatedScore(Math.max(0, Math.floor((timeLeft / maxTime) * 1000)));
    }
  }, [currentQuestionIndex]);

  // Animate leaderboard scores (giữ nguyên logic này vì hoạt động tốt)
  useEffect(() => {
    if (gameState === 'leaderboard' && leaderboard.length > 0) {
      let frame = 0;
      const duration = 1500;
      const totalFrames = duration / 16;
      const interval = setInterval(() => {
        frame++;
        setDisplayLeaderboard(
          leaderboard.map((p) => ({
            ...p,
            score: Math.round((p.score * frame) / totalFrames),
          }))
        );
        if (frame >= totalFrames) {
          clearInterval(interval);
          setDisplayLeaderboard(leaderboard);
        }
      }, 16);
      
      return () => clearInterval(interval);
    } else {
      // Reset khi không phải leaderboard state
      setDisplayLeaderboard([]);
    }
  }, [gameState, leaderboard]);

  // Cleanup animation khi component unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    animatedTimeLeft,
    animatedScore,
    displayLeaderboard
  };
};