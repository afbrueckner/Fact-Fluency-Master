import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TriosProps {
  onComplete: (score: number, accuracy: number, strategies: string[]) => void;
  onExit: () => void;
}

export function Trios({ onComplete, onExit }: TriosProps) {
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [availableCards, setAvailableCards] = useState<number[]>([]);
  const [targetProduct, setTargetProduct] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [correctTrios, setCorrectTrios] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [strategiesUsed, setStrategiesUsed] = useState<string[]>([]);

  const maxRounds = 8;

  useEffect(() => {
    startNewRound();
  }, []);

  const startNewRound = () => {
    if (currentRound > maxRounds) {
      setGameComplete(true);
      return;
    }

    // Generate multiplication problems focusing on 2s, 5s, and 10s
    const baseNumbers = [2, 5, 10];
    const multipliers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    const baseNum = baseNumbers[Math.floor(Math.random() * baseNumbers.length)];
    const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
    const product = baseNum * multiplier;
    
    setTargetProduct(product);
    
    // Create available cards: include correct factors and some distractors
    const cards = [baseNum, multiplier];
    
    // Add distractors
    while (cards.length < 8) {
      const distractor = Math.floor(Math.random() * 12) + 1;
      if (!cards.includes(distractor)) {
        cards.push(distractor);
      }
    }
    
    setAvailableCards(cards.sort(() => Math.random() - 0.5));
    setSelectedCards([]);
    setFeedback("");
  };

  const handleCardClick = (card: number) => {
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(c => c !== card));
    } else if (selectedCards.length < 3) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handleSubmitTrio = () => {
    if (selectedCards.length !== 3) return;

    setTotalAttempts(totalAttempts + 1);
    
    // Check if any two cards multiply to the target product
    const [a, b, c] = selectedCards.sort((x, y) => x - y);
    let isCorrect = false;
    let strategyUsed = "";
    
    if (a * b === targetProduct || a * c === targetProduct || b * c === targetProduct) {
      isCorrect = true;
      
      // Determine strategy used
      if (selectedCards.includes(2)) {
        strategyUsed = "doubling (×2)";
      } else if (selectedCards.includes(5)) {
        strategyUsed = "counting by 5s (×5)";
      } else if (selectedCards.includes(10)) {
        strategyUsed = "counting by 10s (×10)";
      } else {
        strategyUsed = "multiplication";
      }
      
      setStrategiesUsed([...strategiesUsed, strategyUsed]);
      setScore(score + 15);
      setCorrectTrios(correctTrios + 1);
      setFeedback(`Excellent! You found the trio that makes ${targetProduct}!`);
      
      setTimeout(() => {
        setCurrentRound(currentRound + 1);
        startNewRound();
      }, 2500);
    } else {
      setFeedback(`Not quite. Try finding three numbers where two multiply to ${targetProduct}.`);
      
      setTimeout(() => {
        setFeedback("");
      }, 2000);
    }
  };

  const handleComplete = () => {
    const accuracy = totalAttempts > 0 ? Math.round((correctTrios / totalAttempts) * 100) : 0;
    const uniqueStrategies = Array.from(new Set(strategiesUsed));
    onComplete(score, accuracy, uniqueStrategies);
  };

  if (gameComplete) {
    const accuracy = totalAttempts > 0 ? Math.round((correctTrios / totalAttempts) * 100) : 0;

    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl">🎲</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Trios Complete!</h2>
        
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
            <p className="text-2xl font-bold text-purple-600">{correctTrios}</p>
            <p className="text-sm text-purple-700">Correct Trios</p>
          </div>
        </div>

        {strategiesUsed.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Strategies Used:</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from(new Set(strategiesUsed)).map((strategy, index) => (
                <Badge key={index} variant="secondary" className="bg-primary-100 text-primary-800">
                  {strategy}
                </Badge>
              ))}
            </div>
          </div>
        )}

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
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🎲</span>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Trios</h2>
            <p className="text-sm text-gray-600">Find three numbers where two multiply to make the target</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onExit}>
          Exit Game
        </Button>
      </div>

      <div className="text-center mb-6">
        <div className="flex justify-center items-center space-x-4 mb-4">
          <span className="text-lg font-semibold text-gray-600">Round {currentRound} of {maxRounds}</span>
          <div className="w-px h-6 bg-gray-300"></div>
          <span className="text-lg font-semibold text-gray-600">Score: {score}</span>
        </div>
        
        {targetProduct && (
          <div className="bg-primary-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Target Product</h3>
            <div className="text-4xl font-bold text-primary-600">{targetProduct}</div>
            <p className="text-sm text-gray-600 mt-2">
              Find three numbers where two of them multiply to make {targetProduct}
            </p>
          </div>
        )}
      </div>

      {/* Available Cards */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-4 text-center">Available Numbers</h3>
        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
          {availableCards.map((card, index) => (
            <button
              key={index}
              onClick={() => handleCardClick(card)}
              className={`aspect-square text-2xl font-bold rounded-lg border-2 transition-all ${
                selectedCards.includes(card)
                  ? "bg-primary-500 text-white border-primary-600 transform scale-105"
                  : "bg-white text-gray-800 border-gray-300 hover:border-primary-500 hover:bg-primary-50"
              }`}
              disabled={feedback !== ""}
            >
              {card}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Cards */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-4 text-center">Your Trio</h3>
        <div className="flex justify-center space-x-4 mb-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className={`w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center text-2xl font-bold ${
                selectedCards[index]
                  ? "bg-primary-100 border-primary-300 text-primary-800"
                  : "bg-gray-50 border-gray-300 text-gray-400"
              }`}
            >
              {selectedCards[index] || "?"}
            </div>
          ))}
        </div>
      </div>

      {/* Feedback and Submit */}
      {feedback && (
        <div className={`p-4 rounded-lg text-center mb-6 ${
          feedback.includes("Excellent") ? "bg-green-50 border border-green-200 text-green-800" :
          "bg-red-50 border border-red-200 text-red-800"
        }`}>
          {feedback}
        </div>
      )}

      <div className="text-center">
        <Button 
          onClick={handleSubmitTrio}
          disabled={selectedCards.length !== 3 || feedback !== ""}
          className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3"
        >
          Check Trio
        </Button>
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        Multiplication Practice: ×2, ×5, ×10
      </div>
    </div>
  );
}