import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SaluteProps {
  onComplete: (score: number, accuracy: number, strategies: string[]) => void;
  onExit: () => void;
}

export function Salute({ onComplete, onExit }: SaluteProps) {
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [playerCard, setPlayerCard] = useState<number | null>(null);
  const [hiddenCard, setHiddenCard] = useState<number | null>(null);
  const [sum, setSum] = useState<number | null>(null);
  const [userGuess, setUserGuess] = useState("");
  const [feedback, setFeedback] = useState("");
  const [correctGuesses, setCorrectGuesses] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [strategiesUsed, setStrategiesUsed] = useState<string[]>([]);
  const [gamePhase, setGamePhase] = useState<"showing" | "guessing" | "result">("showing");

  const maxRounds = 12;

  useEffect(() => {
    dealNewRound();
  }, []);

  const dealNewRound = () => {
    if (currentRound > maxRounds) {
      setGameComplete(true);
      return;
    }

    // Deal two cards (numbers 0-10)
    const card1 = Math.floor(Math.random() * 11);
    const card2 = Math.floor(Math.random() * 11);
    
    setPlayerCard(card1);
    setHiddenCard(card2);
    setSum(card1 + card2);
    setUserGuess("");
    setFeedback("");
    setGamePhase("showing");
    
    // Show cards briefly, then hide one
    setTimeout(() => {
      setGamePhase("guessing");
    }, 2000);
  };

  const handleGuessSubmit = () => {
    if (!hiddenCard || !sum || userGuess === "") return;

    const guess = parseInt(userGuess);
    setTotalRounds(totalRounds + 1);
    
    if (guess === hiddenCard) {
      setScore(score + 10);
      setCorrectGuesses(correctGuesses + 1);
      setFeedback(`Correct! The hidden card was ${hiddenCard}. Great job using fact families!`);
      
      // Determine strategy used
      let strategy = "fact families";
      if (sum && sum <= 10) {
        strategy = "combinations to 10";
      } else if (playerCard && (playerCard === hiddenCard)) {
        strategy = "doubles";
      } else if (playerCard && Math.abs(playerCard - hiddenCard) === 1) {
        strategy = "near doubles";
      }
      
      setStrategiesUsed([...strategiesUsed, strategy]);
    } else {
      setFeedback(`Not quite. The hidden card was ${hiddenCard}. Remember: ${playerCard} + ${hiddenCard} = ${sum}`);
    }
    
    setGamePhase("result");
    
    setTimeout(() => {
      setCurrentRound(currentRound + 1);
      dealNewRound();
    }, 3000);
  };

  const handleComplete = () => {
    const accuracy = totalRounds > 0 ? Math.round((correctGuesses / totalRounds) * 100) : 0;
    const uniqueStrategies = Array.from(new Set(strategiesUsed));
    onComplete(score, accuracy, uniqueStrategies);
  };

  if (gameComplete) {
    const accuracy = totalRounds > 0 ? Math.round((correctGuesses / totalRounds) * 100) : 0;

    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl">👋</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Salute Complete!</h2>
        
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
            <p className="text-2xl font-bold text-purple-600">{correctGuesses}</p>
            <p className="text-sm text-purple-700">Correct Guesses</p>
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
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">👋</span>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Salute!</h2>
            <p className="text-sm text-gray-600">Practice fact families and missing addends</p>
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
      </div>

      {gamePhase === "showing" && (
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Study the cards...</h3>
          <div className="flex justify-center items-center space-x-8">
            <div className="w-24 h-32 bg-blue-500 text-white rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg">
              {playerCard}
            </div>
            <span className="text-3xl text-gray-400">+</span>
            <div className="w-24 h-32 bg-blue-500 text-white rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg">
              {hiddenCard}
            </div>
            <span className="text-3xl text-gray-400">=</span>
            <div className="w-24 h-32 bg-green-500 text-white rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg">
              {sum}
            </div>
          </div>
        </div>
      )}

      {gamePhase === "guessing" && (
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">What's the hidden card?</h3>
          
          <div className="flex justify-center items-center space-x-8 mb-6">
            <div className="w-24 h-32 bg-blue-500 text-white rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg">
              {playerCard}
            </div>
            <span className="text-3xl text-gray-400">+</span>
            <div className="w-24 h-32 bg-gray-400 text-white rounded-lg flex items-center justify-center text-6xl shadow-lg">
              ?
            </div>
            <span className="text-3xl text-gray-400">=</span>
            <div className="w-24 h-32 bg-green-500 text-white rounded-lg flex items-center justify-center text-3xl font-bold shadow-lg">
              {sum}
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              {playerCard} + ? = {sum}
            </p>
            <input
              type="number"
              value={userGuess}
              onChange={(e) => setUserGuess(e.target.value)}
              className="text-2xl text-center border-2 border-gray-300 rounded-lg p-3 w-24 focus:border-primary-500 focus:outline-none"
              placeholder="?"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && userGuess && handleGuessSubmit()}
              min="0"
              max="10"
            />
          </div>

          <Button 
            onClick={handleGuessSubmit}
            disabled={userGuess === ""}
            className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3"
          >
            Submit Guess
          </Button>
        </div>
      )}

      {gamePhase === "result" && feedback && (
        <div className={`p-6 rounded-lg text-center mb-6 ${
          feedback.includes("Correct") ? "bg-green-50 border border-green-200 text-green-800" :
          "bg-red-50 border border-red-200 text-red-800"
        }`}>
          <p className="text-lg">{feedback}</p>
          {!feedback.includes("Correct") && (
            <div className="mt-4 flex justify-center items-center space-x-4">
              <div className="w-16 h-20 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xl font-bold">
                {playerCard}
              </div>
              <span className="text-xl text-gray-400">+</span>
              <div className="w-16 h-20 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xl font-bold">
                {hiddenCard}
              </div>
              <span className="text-xl text-gray-400">=</span>
              <div className="w-16 h-20 bg-green-500 text-white rounded-lg flex items-center justify-center text-xl font-bold">
                {sum}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-center text-xs text-gray-500 mt-6">
        Derived Strategies: Fact Families & Missing Addends
      </div>
    </div>
  );
}