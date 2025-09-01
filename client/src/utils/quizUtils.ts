// Score Calculation
export const calculateScore = (timeLeft: number, maxTime: number, maxPoints: number = 1000): number => {
  if (timeLeft <= 0) return 0;
  const minScore = Math.floor(maxPoints * 0.1);
  const timeScore = Math.floor(maxPoints * (timeLeft / maxTime));
  return Math.max(minScore, timeScore);
};