import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RacingBearsProps {
  onComplete: (score: number, accuracy: number, strategies: string[]) => void;
  onExit: () => void;
}

export function RacingBears({ onComplete, onExit }: RacingBearsProps) {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ message: string; type: "correct" | "incorrect" | "" }>({ message: "", type: "" });
  const [strategiesUsed, setStrategiesUsed] = useState<string[]>([]);
  const [gameComplete, setGameComplete] = useState(false);

  // Racing Bears focuses on +0, +1, +2 facts
  const problems = [
    { problem: "5 + 0", answer: 5, strategy: "adding zero" },
    { problem: "7 + 1", answer: 8, strategy: "adding one" },
    { problem: "3 + 2", answer: 5, strategy: "adding two" },
    { problem: "9 + 0", answer: 9, strategy: "adding zero" },
    { problem: "4 + 1", answer: 5, strategy: "adding one" },
    { problem: "6 + 2", answer: 8, strategy: "adding two" },
    { problem: "8 + 0", answer: 8, strategy: "adding zero" },
    { problem: "2 + 1", answer: 3, strategy: "adding one" },
    { problem: "7 + 2", answer: 9, strategy: "adding two" },
    { problem: "1 + 1", answer: 2, strategy: "adding one" },
  ];

  const currentQ = problems[currentProblem] || problems[0];
  const correctAnswers = strategiesUsed.filter(s => s !== "incorrect").length;
  const accuracy = Math.round((correctAnswers / Math.max(currentProblem, 1)) * 100);

  useEffect(() => {
    if (currentProblem >= problems.length) {
      setGameComplete(true);
    }
  }, [currentProblem]);

  const handleSubmitAnswer = () => {
    if (!currentQ || currentProblem >= problems.length) return;
    
    const answer = parseInt(userAnswer);
    const isCorrect = answer === currentQ.answer;
    
    if (isCorrect) {
      setScore(score + 10);
      setFeedback({ message: "Great job! The bears are racing ahead! 🐻", type: "correct" });
      setStrategiesUsed([...strategiesUsed, currentQ.strategy]);
    } else {
      setFeedback({ message: `Not quite. ${currentQ.problem} = ${currentQ.answer}. Try again!`, type: "incorrect" });
      setStrategiesUsed([...strategiesUsed, "incorrect"]);
    }

    setTimeout(() => {
      setCurrentProblem(currentProblem + 1);
      setUserAnswer("");
      setFeedback({ message: "", type: "" });
    }, 2000);
  };

  const handleComplete = () => {
    const uniqueStrategies = Array.from(new Set(strategiesUsed.filter(s => s !== "incorrect")));
    onComplete(score, accuracy, uniqueStrategies);
  };

  if (gameComplete) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl">🏁</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Race Complete!</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-blue-600">{score}</p>
            <p className="text-sm text-blue-700">Points Earned</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-green-600">{accuracy}%</p>
            <p className="text-sm text-green-700">Accuracy</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-purple-600">{correctAnswers}</p>
            <p className="text-sm text-purple-700">Correct Answers</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Strategies Practiced:</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from(new Set(strategiesUsed.filter(s => s !== "incorrect"))).map((strategy, index) => (
              <Badge key={index} variant="secondary" className="bg-primary-100 text-primary-800">
                {strategy.charAt(0).toUpperCase() + strategy.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex space-x-4 justify-center">
          <Button onClick={handleComplete} className="bg-primary-500 hover:bg-primary-600">
            Save Results
          </Button>
          <Button variant="outline" onClick={onExit}>
            Back to Games
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🐻</span>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Racing Bears</h2>
            <p className="text-sm text-gray-600">Practice +0, +1, +2 facts</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onExit}>
          Exit Game
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm text-gray-600">{currentProblem + 1} of {problems.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentProblem + 1) / problems.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="text-center mb-8">
        <div className="bg-gray-50 rounded-lg p-8 mb-6">
          <p className="text-3xl font-bold text-gray-800 mb-4">{currentQ?.problem || "Loading..."} = ?</p>
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="text-2xl text-center border-2 border-gray-300 rounded-lg p-3 w-32 focus:border-primary-500 focus:outline-none"
            placeholder="?"
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && userAnswer && handleSubmitAnswer()}
          />
        </div>

        {feedback.message && (
          <div className={`p-4 rounded-lg mb-4 ${
            feedback.type === "correct" ? "bg-green-50 border border-green-200 text-green-800" :
            "bg-red-50 border border-red-200 text-red-800"
          }`}>
            {feedback.message}
          </div>
        )}

        <Button 
          onClick={handleSubmitAnswer}
          disabled={!userAnswer || feedback.message !== ""}
          className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 text-lg"
        >
          Submit Answer
        </Button>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Score: {score}</span>
          <span>Accuracy: {accuracy}%</span>
        </div>
        <div className="text-xs text-gray-500">
          Foundational Facts Practice
        </div>
      </div>
    </div>
  );
}